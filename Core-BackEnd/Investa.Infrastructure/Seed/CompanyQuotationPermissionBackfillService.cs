using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

public sealed class CompanyQuotationPermissionBackfillService(ApplicationDbContext context)
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    [
        (SystemPermissions.CompanySalesQuotationsView, "View Company Quotations", "View Company commercial quotations."),
        (SystemPermissions.CompanySalesQuotationsCreate, "Create Company Quotations", "Create Draft Company commercial quotations."),
        (SystemPermissions.CompanySalesQuotationsEdit, "Edit Company Quotations", "Edit Draft Company commercial quotations."),
        (SystemPermissions.CompanySalesQuotationsManage, "Manage Company Quotations", "Send, accept, or reject Company commercial quotations.")
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
