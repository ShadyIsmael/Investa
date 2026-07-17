using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Seed;

/// <summary>
/// Idempotently adds Company Finance permissions to the active RBAC Permissions table.
/// Existing permission rows and assignments are never changed.
/// </summary>
public sealed class FinancePermissionBackfillService
{
    private static readonly (string Key, string Name, string Description)[] Definitions =
    {
        (SystemPermissions.FinanceView, "View Company Finance", "View Company Finance transactions, balances, and overview"),
        (SystemPermissions.FinanceCreate, "Create Finance Transactions", "Create Money In and Money Out transaction drafts"),
        (SystemPermissions.FinanceEditDraft, "Edit Finance Drafts", "Edit eligible Company Finance transaction drafts"),
        (SystemPermissions.FinanceSubmit, "Submit Finance Transactions", "Submit Company Finance transactions for review"),
        (SystemPermissions.FinanceReview, "Review Finance Transactions", "Review and reject Company Finance transactions"),
        (SystemPermissions.FinanceConfirm, "Confirm Finance Transactions", "Approve and confirm Company Finance transactions"),
        (SystemPermissions.FinanceReverse, "Reverse Finance Transactions", "Reverse confirmed Company Finance transactions"),
        (SystemPermissions.FinanceManageMasterData, "Manage Finance Master Data", "Manage Company Finance accounts, suppliers, and categories")
    };

    private readonly ApplicationDbContext _context;

    public FinancePermissionBackfillService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<string>> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var existingKeys = (await _context.Permissions
                .Select(x => x.Key)
                .ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var addedKeys = new List<string>();
        var now = DateTime.UtcNow;

        foreach (var definition in Definitions)
        {
            if (existingKeys.Contains(definition.Key))
                continue;

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

        return addedKeys;
    }
}
