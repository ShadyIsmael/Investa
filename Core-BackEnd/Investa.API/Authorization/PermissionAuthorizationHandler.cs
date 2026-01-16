using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using System;

namespace Investa.API.Authorization;

/// <summary>
/// Handles permission-based authorization by validating JWT claims and, when absent,
/// resolving permissions from the database via roles and group permissions.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IUnitOfWork _unitOfWork;

    public PermissionAuthorizationHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1) Try permission claims from token first (fast path)
        var userPermissions = context.User
            .FindAll(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (PermissionMatches(userPermissions, requirement.Permission))
        {
            context.Succeed(requirement);
            return;
        }

        // 2) Fallback: resolve permissions from DB using user's id
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? context.User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            // No user id available to query DB -> cannot resolve further
            return;
        }

        try
        {
            // Get user roles
            var userRoles = await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                .FindAsync(ur => ur.UserId == userId);

            var roleIds = userRoles.Select(ur => ur.RoleId).Distinct().ToList();

            if (roleIds.Count == 0)
            {
                return;
            }

            // Role-based permissions
            var rolePerms = await _unitOfWork.Repository<Investa.Domain.Entities.Security.RolePermission>()
                .FindAsync(rp => roleIds.Contains(rp.RoleId));

            var permIds = rolePerms.Select(rp => rp.PermissionId).Distinct().ToList();

            // Group-level permissions (via roles' groups)
            var roles = await _unitOfWork.Repository<Investa.Domain.Entities.Security.Role>()
                .FindAsync(r => roleIds.Contains(r.Id));

            var groupIds = roles.Select(r => r.GroupId).Distinct().ToList();
            var groupPermIds = new List<int>();
            if (groupIds.Count > 0)
            {
                var gps = await _unitOfWork.Repository<Investa.Domain.Entities.GroupPermission>()
                    .FindAsync(gp => groupIds.Contains(gp.GroupId));
                groupPermIds.AddRange(gps.Select(gp => gp.PermissionId));
            }

            var allPermIds = permIds.Union(groupPermIds).Distinct().ToList();

            var permissions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (allPermIds.Count > 0)
            {
                var perms = await _unitOfWork.Repository<Investa.Domain.Entities.Permission>()
                    .FindAsync(p => allPermIds.Contains(p.Id));
                foreach (var p in perms)
                {
                    if (!string.IsNullOrWhiteSpace(p.Key)) permissions.Add(p.Key);
                }
            }

            if (PermissionMatches(permissions, requirement.Permission))
            {
                context.Succeed(requirement);
            }
        }
        catch
        {
            // Swallow DB errors - authorization will simply fail
        }
    }

    private bool PermissionMatches(ISet<string> userPermissions, string required)
    {
        if (userPermissions.Contains(required)) return true;

        var parts = required.Split('.');
        if (parts.Length == 2)
        {
            var wildcard = $"{parts[0]}.*";
            if (userPermissions.Contains(wildcard)) return true;
        }

        if (userPermissions.Contains("*.*") || userPermissions.Contains("admin.*")) return true;

        return false;
    }
}
