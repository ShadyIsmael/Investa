using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

public sealed class CompanyContractPermissionBackfillService(ApplicationDbContext context)
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    [
        (SystemPermissions.CompanySalesContractsView, "View Company Contracts", "View Company commercial contracts."),
        (SystemPermissions.CompanySalesContractsCreate, "Create Company Contracts", "Create Company contracts from Accepted quotations."),
        (SystemPermissions.CompanySalesContractsEdit, "Edit Company Contracts", "Edit Draft Company contract metadata."),
        (SystemPermissions.CompanySalesContractsManage, "Manage Company Contracts", "Activate, complete, or terminate Company contracts.")
    ];

    public async Task<IReadOnlyCollection<string>> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var existing = (await context.Permissions.Select(x => x.Key).ToListAsync(cancellationToken)).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var added = new List<string>();
        foreach (var definition in Definitions)
        {
            if (existing.Contains(definition.Key)) continue;
            context.Permissions.Add(new Permission { Key = definition.Key, Name = definition.Name, Description = definition.Description, CreatedAt = DateTime.UtcNow });
            existing.Add(definition.Key);
            added.Add(definition.Key);
        }
        if (added.Count > 0) await context.SaveChangesAsync(cancellationToken);
        return added;
    }
}
