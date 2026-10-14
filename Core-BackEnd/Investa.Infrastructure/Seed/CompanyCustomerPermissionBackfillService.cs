using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

public sealed class CompanyCustomerPermissionBackfillService(ApplicationDbContext context)
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    [
        (SystemPermissions.CompanyCustomersView, "View Company Customers", "View Company Customer lists and details."),
        (SystemPermissions.CompanyCustomersCreate, "Create Company Customers", "Create Company Customer records."),
        (SystemPermissions.CompanyCustomersEdit, "Edit Company Customers", "Edit Company Customer profiles and contacts."),
        (SystemPermissions.CompanyCustomersManage, "Manage Company Customers", "Activate or deactivate Company Customers.")
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
