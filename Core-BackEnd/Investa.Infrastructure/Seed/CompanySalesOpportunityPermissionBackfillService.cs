using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

public sealed class CompanySalesOpportunityPermissionBackfillService(ApplicationDbContext context)
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    [
        (SystemPermissions.CompanySalesOpportunitiesView, "View Company Sales Opportunities", "View Company Core sales opportunities."),
        (SystemPermissions.CompanySalesOpportunitiesCreate, "Create Company Sales Opportunities", "Create Company Core sales opportunities."),
        (SystemPermissions.CompanySalesOpportunitiesEdit, "Edit Company Sales Opportunities", "Edit open Company Core sales opportunities."),
        (SystemPermissions.CompanySalesOpportunitiesManage, "Manage Company Sales Opportunities", "Move Company Core sales opportunities to Won or Lost.")
    ];

    public async Task<IReadOnlyCollection<string>> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var existing = (await context.Permissions.Select(x => x.Key).ToListAsync(cancellationToken)).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var added = new List<string>();
        foreach (var definition in Definitions)
        {
            if (existing.Contains(definition.Key)) continue;
            context.Permissions.Add(new Permission { Key = definition.Key, Name = definition.Name, Description = definition.Description, CreatedAt = DateTime.UtcNow });
            existing.Add(definition.Key); added.Add(definition.Key);
        }
        if (added.Count > 0) await context.SaveChangesAsync(cancellationToken);
        return added;
    }
}
