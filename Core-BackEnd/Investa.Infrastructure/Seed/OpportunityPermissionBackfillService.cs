using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

/// <summary>
/// Adds canonical FOPX Opportunity permission keys and migrates any existing
/// Reviewer roles to explicit View + Review permissions. The migration is
/// idempotent, preserves unrelated assignments, and removes only the legacy
/// Opportunity.Manage assignment from the Reviewer role because that key would
/// otherwise be translated into canonical Manage by the compatibility map.
/// </summary>
public sealed class OpportunityPermissionBackfillService
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    {
        (SystemPermissions.FopxOpportunitiesView, "View FOPX Opportunities", "View the FOPX Opportunity administration list and detail."),
        (SystemPermissions.FopxOpportunitiesReview, "Review FOPX Opportunities", "Approve or reject Opportunities in the review workflow."),
        (SystemPermissions.FopxOpportunitiesManage, "Manage FOPX Opportunities", "Manage supported Opportunity funding-status transitions.")
    };

    private const string LegacyOpportunityManage = "Opportunity.Manage";

    public sealed record Result(
        IReadOnlyCollection<string> AddedPermissionKeys,
        int ReviewerRolesProcessed,
        int ReviewerAssignmentsAdded,
        int LegacyManageAssignmentsRemoved);

    private readonly ApplicationDbContext _context;

    public OpportunityPermissionBackfillService(ApplicationDbContext context) => _context = context;

    public async Task<Result> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var existingKeys = (await _context.Permissions.Select(permission => permission.Key).ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var addedKeys = new List<string>();
        var now = DateTime.UtcNow;

        foreach (var definition in Definitions)
        {
            if (existingKeys.Contains(definition.Key)) continue;
            _context.Permissions.Add(new Permission
            {
                Key = definition.Key,
                Name = definition.Name,
                Description = definition.Description,
                CreatedAt = now
            });
            existingKeys.Add(definition.Key);
            addedKeys.Add(definition.Key);
        }

        if (addedKeys.Count > 0)
            await _context.SaveChangesAsync(cancellationToken);

        var reviewerRoles = await _context.Roles
            .Where(role => role.IsActive
                && (role.NormalizedName == "REVIEWER"
                    || role.Name == "Reviewer"
                    || role.NameEn == "Reviewer"))
            .ToListAsync(cancellationToken);

        if (reviewerRoles.Count == 0)
            return new Result(addedKeys, 0, 0, 0);

        var relevantKeys = Definitions
            .Select(definition => definition.Key)
            .Append(LegacyOpportunityManage)
            .ToArray();
        var permissionByKey = await _context.Permissions
            .Where(permission => relevantKeys.Contains(permission.Key))
            .ToDictionaryAsync(permission => permission.Key, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var reviewerRoleIds = reviewerRoles.Select(role => role.Id).ToArray();
        var existingAssignments = await _context.RolePermissions
            .Where(rolePermission => reviewerRoleIds.Contains(rolePermission.RoleId))
            .ToListAsync(cancellationToken);

        var assignmentsAdded = 0;
        var legacyManageAssignmentsRemoved = 0;
        var viewPermissionId = permissionByKey[SystemPermissions.FopxOpportunitiesView].Id;
        var reviewPermissionId = permissionByKey[SystemPermissions.FopxOpportunitiesReview].Id;
        var legacyManagePermissionId = permissionByKey.TryGetValue(LegacyOpportunityManage, out var legacyManagePermission)
            ? legacyManagePermission.Id
            : (int?)null;

        foreach (var reviewerRole in reviewerRoles)
        {
            foreach (var permissionId in new[] { viewPermissionId, reviewPermissionId })
            {
                if (existingAssignments.Any(assignment => assignment.RoleId == reviewerRole.Id && assignment.PermissionId == permissionId))
                    continue;

                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = reviewerRole.Id,
                    PermissionId = permissionId,
                    AssignedAt = DateTime.UtcNow
                });
                assignmentsAdded++;
            }

            if (legacyManagePermissionId.HasValue)
            {
                var legacyAssignments = existingAssignments
                    .Where(assignment => assignment.RoleId == reviewerRole.Id && assignment.PermissionId == legacyManagePermissionId.Value)
                    .ToList();
                if (legacyAssignments.Count > 0)
                {
                    _context.RolePermissions.RemoveRange(legacyAssignments);
                    legacyManageAssignmentsRemoved += legacyAssignments.Count;
                }
            }
        }

        if (assignmentsAdded > 0 || legacyManageAssignmentsRemoved > 0)
            await _context.SaveChangesAsync(cancellationToken);

        return new Result(addedKeys, reviewerRoles.Count, assignmentsAdded, legacyManageAssignmentsRemoved);
    }
}
