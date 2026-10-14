using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

public sealed class CompanyCatalogPermissionBackfillService(ApplicationDbContext context)
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    [
        (SystemPermissions.CompanyProductsView, "View Company Products and Services", "View the Company commercial catalog."),
        (SystemPermissions.CompanyProductsCreate, "Create Company Products and Services", "Create Company commercial catalog items."),
        (SystemPermissions.CompanyProductsEdit, "Edit Company Products and Services", "Edit Company commercial catalog definitions."),
        (SystemPermissions.CompanyProductsManage, "Manage Company Products and Services", "Activate or deactivate Company commercial catalog items.")
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
