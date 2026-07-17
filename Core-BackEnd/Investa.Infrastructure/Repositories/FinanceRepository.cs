using Investa.Application.Services.Finance;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Investa.Infrastructure.Repositories;

public sealed class FinanceRepository : IFinanceRepository
{
    private readonly ApplicationDbContext _context;
    public FinanceRepository(ApplicationDbContext context) => _context = context;
    public Task<FinanceAccount?> GetAccountByIdAsync(int id) => _context.FinanceAccounts.SingleOrDefaultAsync(x => x.Id == id);
    public Task<Supplier?> GetSupplierByIdAsync(int id) => _context.Suppliers.SingleOrDefaultAsync(x => x.Id == id);
    public Task<bool> CheckDuplicateInvoiceAsync(int supplierId, string invoiceNumber, int? excludeTransactionId = null) => _context.FinanceTransactions.AnyAsync(x => x.SupplierId == supplierId && x.InvoiceNumber == invoiceNumber && (!excludeTransactionId.HasValue || x.Id != excludeTransactionId));
    public Task<bool> ReferenceExistsAsync(string referenceNumber) => _context.FinanceTransactions.AnyAsync(x => x.ReferenceNumber == referenceNumber);
    public Task AddTransactionAsync(FinanceTransaction transaction) => _context.FinanceTransactions.AddAsync(transaction).AsTask();
    public Task AddAuditEventAsync(FinanceAuditEvent auditEvent) => _context.FinanceAuditEvents.AddAsync(auditEvent).AsTask();
    public async Task ReplaceTransactionLinesAsync(
        FinanceTransaction transaction,
        IReadOnlyCollection<FinanceTransactionLine> replacementLines,
        FinanceAuditEvent auditEvent)
    {
        var strategy = _context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            IDbContextTransaction? databaseTransaction = null;
            try
            {
                if (_context.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
                    databaseTransaction = await _context.Database.BeginTransactionAsync();

                // Existing lines are required dependents. Mark them deleted explicitly and
                // persist that deletion before reusing their unique line sequence values.
                var existingLines = transaction.TransactionLines.ToList();
                _context.FinanceTransactionLines.RemoveRange(existingLines);
                await _context.SaveChangesAsync();

                var newLines = replacementLines.ToList();
                foreach (var line in newLines)
                {
                    line.Id = 0;
                    line.TransactionId = transaction.Id;
                    line.Transaction = transaction;
                }

                transaction.TransactionLines = newLines;
                await _context.FinanceTransactionLines.AddRangeAsync(newLines);
                await _context.FinanceAuditEvents.AddAsync(auditEvent);
                await _context.SaveChangesAsync();

                if (databaseTransaction != null)
                    await databaseTransaction.CommitAsync();
            }
            catch
            {
                if (databaseTransaction != null)
                    await databaseTransaction.RollbackAsync();
                throw;
            }
            finally
            {
                if (databaseTransaction != null)
                    await databaseTransaction.DisposeAsync();
            }
        });
    }
    public Task DeleteTransactionAsync(FinanceTransaction transaction) { _context.FinanceTransactions.Remove(transaction); return Task.CompletedTask; }
    public Task AddAttachmentAsync(FinanceAttachment attachment) => _context.FinanceAttachments.AddAsync(attachment).AsTask();
    public Task<FinanceAttachment?> GetAttachmentAsync(int attachmentId) => _context.FinanceAttachments.Include(x => x.Transaction).SingleOrDefaultAsync(x => x.Id == attachmentId);
    public async Task<IReadOnlyList<FinanceAttachment>> GetAttachmentsAsync(int transactionId) => await _context.FinanceAttachments.Where(x => x.TransactionId == transactionId).OrderBy(x => x.CreatedAt).ToListAsync();
    public Task DeleteAttachmentAsync(FinanceAttachment attachment) { _context.FinanceAttachments.Remove(attachment); return Task.CompletedTask; }
    public Task SaveAsync() => _context.SaveChangesAsync();
    public Task<string?> GetUserDisplayNameAsync(Guid userId) => _context.AuthUsers.Where(x => x.Id == userId).Select(x => x.Name).SingleOrDefaultAsync();
    public async Task<Dictionary<Guid, string?>> GetUserDisplayNamesAsync(IEnumerable<Guid> userIds)
    {
        var ids = userIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<Guid, string?>();
        var pairs = await _context.AuthUsers.Where(x => ids.Contains(x.Id)).Select(x => new { x.Id, x.Name }).ToListAsync();
        return pairs.ToDictionary(x => x.Id, x => (string?)x.Name);
    }
    public Task<FinanceTransaction?> GetTransactionByIdAsync(int id) => QueryTransactions().SingleOrDefaultAsync(x => x.Id == id);
    public async Task<IReadOnlyList<FinanceTransaction>> GetTransactionsAsync(DateTime? fromDate = null, DateTime? toDate = null, string? status = null, int? accountId = null, Guid? makerId = null, Guid? excludeMakerId = null, int pageNumber = 1, int pageSize = 20)
    {
        var query = QueryTransactions();
        if (fromDate.HasValue) query = query.Where(x => x.TransactionDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(x => x.TransactionDate <= toDate.Value);
        if (Enum.TryParse<Investa.Domain.Entities.Enums.FinanceTransactionStatus>(status, true, out var parsed)) query = query.Where(x => x.Status == parsed);
        if (accountId.HasValue) query = query.Where(x => x.SourceAccountId == accountId || x.DestinationAccountId == accountId);
        if (makerId.HasValue) query = query.Where(x => x.MakerId == makerId || (x.MakerId == null && x.CreatedBy == makerId));
        if (excludeMakerId.HasValue) query = query.Where(x => x.MakerId != excludeMakerId && x.CreatedBy != excludeMakerId);
        return await query.OrderByDescending(x => x.TransactionDate).ThenByDescending(x => x.Id).Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 100)).Take(Math.Clamp(pageSize, 1, 100)).ToListAsync();
    }
    public async Task<IReadOnlyList<FinanceAuditEvent>> GetAuditEventsAsync(int transactionId) => await _context.FinanceAuditEvents.Where(x => x.TransactionId == transactionId).OrderBy(x => x.CreatedAt).ToListAsync();
    public Task<FinanceReconciliation?> GetReconciliationByIdAsync(int id) => _context.FinanceReconciliations.Include(x => x.FinanceAccount).SingleOrDefaultAsync(x => x.Id == id);
    public async Task<IReadOnlyList<FinanceReconciliation>> GetReconciliationsAsync(int? accountId = null, DateTime? fromDate = null, DateTime? toDate = null, FinanceReconciliationStatus? status = null, int pageNumber = 1, int pageSize = 20, string? search = null, bool? onlyWithDifference = null)
    {
        var query = _context.FinanceReconciliations.Include(x => x.FinanceAccount).AsNoTracking().AsQueryable();
        if (accountId.HasValue) query = query.Where(x => x.FinanceAccountId == accountId.Value);
        if (fromDate.HasValue) query = query.Where(x => x.PeriodEndDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(x => x.PeriodEndDate <= toDate.Value);
        if (status.HasValue) query = query.Where(x => x.Status == status.Value);
        if (onlyWithDifference == true) query = query.Where(x => x.Difference != 0);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x => x.FinanceAccount != null && (x.FinanceAccount.Code.ToLower().Contains(term) || x.FinanceAccount.Name.ToLower().Contains(term)));
        }
        return await query.OrderByDescending(x => x.ReconciliationDate).ThenByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 100)).Take(Math.Clamp(pageSize, 1, 100)).ToListAsync();
    }
    public Task AddReconciliationAsync(FinanceReconciliation reconciliation) => _context.FinanceReconciliations.AddAsync(reconciliation).AsTask();
    public void DeleteReconciliation(FinanceReconciliation reconciliation) => _context.FinanceReconciliations.Remove(reconciliation);
    public async Task<int> GetReconciliationCountAsync(int? accountId = null, DateTime? fromDate = null, DateTime? toDate = null, FinanceReconciliationStatus? status = null, string? search = null, bool? onlyWithDifference = null)
    {
        var query = _context.FinanceReconciliations.Include(x => x.FinanceAccount).AsNoTracking().AsQueryable();
        if (accountId.HasValue) query = query.Where(x => x.FinanceAccountId == accountId.Value);
        if (fromDate.HasValue) query = query.Where(x => x.PeriodEndDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(x => x.PeriodEndDate <= toDate.Value);
        if (status.HasValue) query = query.Where(x => x.Status == status.Value);
        if (onlyWithDifference == true) query = query.Where(x => x.Difference != 0);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x => x.FinanceAccount != null && (x.FinanceAccount.Code.ToLower().Contains(term) || x.FinanceAccount.Name.ToLower().Contains(term)));
        }
        return await query.CountAsync();
    }
    public async Task<IReadOnlyList<FinanceTransaction>> GetConfirmedTransactionsForPeriodAsync(int accountId, DateTime periodEnd)
    {
        return await _context.FinanceTransactions
            .Where(t => t.Status == FinanceTransactionStatus.Confirmed
                && t.TransactionDate <= periodEnd
                && (t.SourceAccountId == accountId || t.DestinationAccountId == accountId))
            .OrderBy(t => t.TransactionDate)
            .ToListAsync();
    }
    public async Task<IReadOnlyList<FinanceAccount>> GetAccountsAsync() => await _context.FinanceAccounts.Where(x => x.IsActive).OrderBy(x => x.Code).ToListAsync();
    private IQueryable<FinanceTransaction> QueryTransactions() => _context.FinanceTransactions.Include(x => x.SourceAccount).Include(x => x.DestinationAccount).Include(x => x.IncomeCategory).Include(x => x.ExpenseCategory).Include(x => x.Supplier).Include(x => x.Attachments).Include(x => x.TransactionLines);
}
