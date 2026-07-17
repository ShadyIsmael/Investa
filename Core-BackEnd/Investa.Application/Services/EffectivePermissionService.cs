using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;

namespace Investa.Application.Services;

/// <summary>
/// Resolves the authoritative permission union for an AuthUser.
/// This is shared by JWT issuance and database-backed authorization.
/// </summary>
public sealed class EffectivePermissionService : IEffectivePermissionService
{
    private readonly IUnitOfWork _unitOfWork;

    public EffectivePermissionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<EffectivePermissionSet> ResolveAsync(Guid userId)
    {
        var userGroups = (await _unitOfWork.Repository<UserGroup>()
            .FindAsync(x => x.UserId == userId)).ToList();
        var userRoles = (await _unitOfWork.Repository<UserRole>()
            .FindAsync(x => x.UserId == userId)).ToList();

        var roleIds = userRoles.Select(x => x.RoleId).Distinct().ToList();
        var roles = roleIds.Count == 0
            ? new List<Role>()
            : (await _unitOfWork.Repository<Role>()
                .FindAsync(x => roleIds.Contains(x.Id) && x.IsActive)).ToList();

        var explicitGroupIds = userGroups.Select(x => x.GroupId);
        var roleOwnerGroupIds = roles.Select(x => x.GroupId);
        var candidateGroupIds = explicitGroupIds.Union(roleOwnerGroupIds).Distinct().ToList();
        var groups = candidateGroupIds.Count == 0
            ? new List<Group>()
            : (await _unitOfWork.Repository<Group>()
                .FindAsync(x => candidateGroupIds.Contains(x.Id) && x.IsActive)).ToList();
        var activeGroupIds = groups.Select(x => x.Id).ToList();

        var activeRoleIds = roles.Select(x => x.Id).ToList();
        var rolePermissionIds = activeRoleIds.Count == 0
            ? Enumerable.Empty<int>()
            : (await _unitOfWork.Repository<RolePermission>()
                .FindAsync(x => activeRoleIds.Contains(x.RoleId)))
                .Select(x => x.PermissionId);
        var groupPermissionIds = activeGroupIds.Count == 0
            ? Enumerable.Empty<int>()
            : (await _unitOfWork.Repository<GroupPermission>()
                .FindAsync(x => activeGroupIds.Contains(x.GroupId)))
                .Select(x => x.PermissionId);

        var permissionIds = rolePermissionIds.Union(groupPermissionIds).Distinct().ToList();
        var permissionKeys = permissionIds.Count == 0
            ? new List<string>()
            : (await _unitOfWork.Repository<Permission>()
                .FindAsync(x => permissionIds.Contains(x.Id)))
                .Select(x => x.Key)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

        return new EffectivePermissionSet(
            permissionKeys,
            roles.Select(x => x.Name).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
            activeGroupIds,
            groups.Select(x => x.Name).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).ToList());
    }
}
