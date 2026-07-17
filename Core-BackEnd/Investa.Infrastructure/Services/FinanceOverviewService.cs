using Investa.Application.DTOs.Finance;
using Investa.Application.Services.Finance;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Services;

public sealed class FinanceOverviewService : IFinanceOverviewService
{
    private static readonly FinanceTransactionStatus[] PendingStatuses =
    [
        FinanceTransactionStatus.Draft,
        FinanceTransactionStatus.NeedsDocuments,
        FinanceTransactionStatus.ReadyForReview,
        FinanceTransactionStatus.Rejected
    ];

    private readonly ApplicationDbContext _context;

    public FinanceOverviewService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FinanceOverviewDto> GetOverviewAsync(FinanceOverviewQuery query, CancellationToken cancellationToken = default)
    {
        var dateFrom = query.DateFrom.ToDateTime(TimeOnly.MinValue);
        var dateToExclusive = query.DateTo.AddDays(1).ToDateTime(TimeOnly.MinValue);
        var currency = NormalizeCurrency(query.Currency);

        var periodTransactions = ApplyScope(
            _context.FinanceTransactions.AsNoTracking()
                .Where(x => x.TransactionDate >= dateFrom && x.TransactionDate < dateToExclusive),
            query.AccountId,
            currency);

        var confirmedTransactions = periodTransactions.Where(x => x.Status == FinanceTransactionStatus.Confirmed);
        var confirmedMoneyIn = confirmedTransactions.Where(IsCompanyMoneyInExpression());
        var confirmedMoneyOut = confirmedTransactions.Where(IsCompanyMoneyOutExpression());

        var totalMoneyIn = await SumCashInAsync(confirmedMoneyIn, cancellationToken);
        var totalMoneyOut = await SumAmountInBaseAsync(confirmedMoneyOut, cancellationToken);

        var previousComparison = await BuildPreviousPeriodComparisonAsync(query, currency, cancellationToken);
        var pending = await BuildPendingSummaryAsync(periodTransactions, cancellationToken);
        var accounts = await BuildAccountBalancesAsync(query, currency, dateFrom, dateToExclusive, cancellationToken);
        var moneyInBreakdown = await BuildMoneyInBreakdownAsync(confirmedMoneyIn, totalMoneyIn, cancellationToken);
        var moneyOutBreakdown = await BuildMoneyOutBreakdownAsync(confirmedMoneyOut, totalMoneyOut, cancellationToken);
        var documentation = await BuildDocumentationSummaryAsync(confirmedTransactions, cancellationToken);
        var recentActivity = await BuildRecentActivityAsync(periodTransactions, cancellationToken);

        return new FinanceOverviewDto
        {
            DateFrom = query.DateFrom,
            DateTo = query.DateTo,
            AccountId = query.AccountId,
            Currency = currency,
            TotalMoneyIn = totalMoneyIn,
            TotalMoneyOut = totalMoneyOut,
            NetCashFlow = totalMoneyIn - totalMoneyOut,
            Pending = pending,
            Accounts = accounts,
            MoneyInBreakdown = moneyInBreakdown,
            MoneyOutBreakdown = moneyOutBreakdown,
            Documentation = documentation,
            PeriodComparison = previousComparison,
            RecentActivity = recentActivity
        };
    }

    private async Task<FinancePeriodComparisonDto> BuildPreviousPeriodComparisonAsync(
        FinanceOverviewQuery query,
        string? currency,
        CancellationToken cancellationToken)
    {
        var days = query.DateTo.DayNumber - query.DateFrom.DayNumber + 1;
        var previousTo = query.DateFrom.AddDays(-1);
        var previousFrom = previousTo.AddDays(-(days - 1));

        var from = previousFrom.ToDateTime(TimeOnly.MinValue);
        var toExclusive = previousTo.AddDays(1).ToDateTime(TimeOnly.MinValue);

        var previousTransactions = ApplyScope(
            _context.FinanceTransactions.AsNoTracking()
                .Where(x => x.TransactionDate >= from && x.TransactionDate < toExclusive)
                .Where(x => x.Status == FinanceTransactionStatus.Confirmed),
            query.AccountId,
            currency);

        var moneyIn = await SumCashInAsync(previousTransactions.Where(IsCompanyMoneyInExpression()), cancellationToken);
        var moneyOut = await SumAmountInBaseAsync(previousTransactions.Where(IsCompanyMoneyOutExpression()), cancellationToken);
        var net = moneyIn - moneyOut;

        var currentTransactions = ApplyScope(
            _context.FinanceTransactions.AsNoTracking()
                .Where(x => x.TransactionDate >= query.DateFrom.ToDateTime(TimeOnly.MinValue)
                    && x.TransactionDate < query.DateTo.AddDays(1).ToDateTime(TimeOnly.MinValue))
                .Where(x => x.Status == FinanceTransactionStatus.Confirmed),
            query.AccountId,
            currency);

        var currentMoneyIn = await SumCashInAsync(currentTransactions.Where(IsCompanyMoneyInExpression()), cancellationToken);
        var currentMoneyOut = await SumAmountInBaseAsync(currentTransactions.Where(IsCompanyMoneyOutExpression()), cancellationToken);
        var currentNet = currentMoneyIn - currentMoneyOut;

        return new FinancePeriodComparisonDto
        {
            PreviousPeriodMoneyIn = moneyIn,
            PreviousPeriodMoneyOut = moneyOut,
            PreviousPeriodNetCashFlow = net,
            MoneyInChangePercentage = CalculateChangePercentage(currentMoneyIn, moneyIn),
            MoneyOutChangePercentage = CalculateChangePercentage(currentMoneyOut, moneyOut),
            NetCashFlowChangePercentage = CalculateChangePercentage(currentNet, net)
        };
    }

    private async Task<FinancePendingSummaryDto> BuildPendingSummaryAsync(
        IQueryable<FinanceTransaction> periodTransactions,
        CancellationToken cancellationToken)
    {
        var pendingTransactions = periodTransactions.Where(x => PendingStatuses.Contains(x.Status));

        return new FinancePendingSummaryDto
        {
            DraftCount = await periodTransactions.CountAsync(x => x.Status == FinanceTransactionStatus.Draft, cancellationToken),
            PendingReviewCount = await periodTransactions.CountAsync(x =>
                x.Status == FinanceTransactionStatus.NeedsDocuments
                || x.Status == FinanceTransactionStatus.ReadyForReview, cancellationToken),
            ApprovedNotConfirmedCount = 0,
            RejectedCount = await periodTransactions.CountAsync(x => x.Status == FinanceTransactionStatus.Rejected, cancellationToken),
            PendingMoneyInAmount = await SumCashInAsync(pendingTransactions.Where(IsCompanyMoneyInExpression()), cancellationToken),
            PendingMoneyOutAmount = await SumAmountInBaseAsync(pendingTransactions.Where(IsCompanyMoneyOutExpression()), cancellationToken)
        };
    }

    private async Task<List<FinanceAccountBalanceDto>> BuildAccountBalancesAsync(
        FinanceOverviewQuery query,
        string? currency,
        DateTime dateFrom,
        DateTime dateToExclusive,
        CancellationToken cancellationToken)
    {
        var accountQuery = _context.FinanceAccounts.AsNoTracking().Where(x => x.IsActive);

        if (query.AccountId.HasValue)
        {
            accountQuery = accountQuery.Where(x => x.Id == query.AccountId.Value);
        }

        if (!string.IsNullOrWhiteSpace(currency))
        {
            accountQuery = accountQuery.Where(x => x.Currency == currency);
        }

        var accounts = await accountQuery
            .OrderBy(x => x.Code)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.AccountType,
                x.Currency,
                x.CurrentBalance
            })
            .ToListAsync(cancellationToken);

        var accountIds = accounts.Select(x => x.Id).ToArray();

        var periodConfirmed = ApplyScope(
            _context.FinanceTransactions.AsNoTracking()
                .Where(x => x.TransactionDate >= dateFrom
                    && x.TransactionDate < dateToExclusive
                    && x.Status == FinanceTransactionStatus.Confirmed),
            query.AccountId,
            currency);

        var beforeConfirmed = ApplyScope(
            _context.FinanceTransactions.AsNoTracking()
                .Where(x => x.TransactionDate < dateFrom
                    && x.Status == FinanceTransactionStatus.Confirmed),
            query.AccountId,
            currency);

        var periodPending = ApplyScope(
            _context.FinanceTransactions.AsNoTracking()
                .Where(x => x.TransactionDate >= dateFrom
                    && x.TransactionDate < dateToExclusive
                    && PendingStatuses.Contains(x.Status)),
            query.AccountId,
            currency);

        var confirmedIn = await SumCashInByDestinationAsync(periodConfirmed.Where(IsCompanyMoneyInExpression()), accountIds, cancellationToken);
        var confirmedOut = await SumCashOutByAccountAsync(periodConfirmed.Where(IsCompanyMoneyOutExpression()), accountIds, cancellationToken);
        var transfersIn = await SumAmountByDestinationAsync(periodConfirmed.Where(IsInternalTransferExpression()), accountIds, cancellationToken);
        var transfersOut = await SumAmountBySourceAsync(periodConfirmed.Where(IsInternalTransferExpression()), accountIds, cancellationToken);

        var beforeIn = await SumCashInByDestinationAsync(beforeConfirmed.Where(IsCompanyMoneyInExpression()), accountIds, cancellationToken);
        var beforeOut = await SumCashOutByAccountAsync(beforeConfirmed.Where(IsCompanyMoneyOutExpression()), accountIds, cancellationToken);
        var beforeTransfersIn = await SumAmountByDestinationAsync(beforeConfirmed.Where(IsInternalTransferExpression()), accountIds, cancellationToken);
        var beforeTransfersOut = await SumAmountBySourceAsync(beforeConfirmed.Where(IsInternalTransferExpression()), accountIds, cancellationToken);

        var pendingIn = await SumCashInByDestinationAsync(periodPending.Where(IsCompanyMoneyInExpression()), accountIds, cancellationToken);
        var pendingOut = await SumCashOutByAccountAsync(periodPending.Where(IsCompanyMoneyOutExpression()), accountIds, cancellationToken);

        return accounts.Select(account =>
        {
            var openingBalance = account.CurrentBalance
                + Get(beforeIn, account.Id)
                - Get(beforeOut, account.Id)
                + Get(beforeTransfersIn, account.Id)
                - Get(beforeTransfersOut, account.Id);

            var currentBalance = openingBalance
                + Get(confirmedIn, account.Id)
                - Get(confirmedOut, account.Id)
                + Get(transfersIn, account.Id)
                - Get(transfersOut, account.Id);

            return new FinanceAccountBalanceDto
            {
                AccountId = account.Id,
                AccountCode = account.Code,
                AccountName = account.Name,
                AccountType = account.AccountType,
                Currency = account.Currency,
                OpeningBalance = openingBalance,
                ConfirmedMoneyIn = Get(confirmedIn, account.Id),
                ConfirmedMoneyOut = Get(confirmedOut, account.Id),
                InternalTransfersIn = Get(transfersIn, account.Id),
                InternalTransfersOut = Get(transfersOut, account.Id),
                CurrentBalance = currentBalance,
                PendingIn = Get(pendingIn, account.Id),
                PendingOut = Get(pendingOut, account.Id)
            };
        }).ToList();
    }

    private async Task<List<FinanceMoneyInBreakdownDto>> BuildMoneyInBreakdownAsync(
        IQueryable<FinanceTransaction> confirmedMoneyIn,
        decimal totalMoneyIn,
        CancellationToken cancellationToken)
    {
        var rows = await confirmedMoneyIn
            .GroupBy(x => x.IncomingMoneyType ?? IncomingMoneyType.CompanyRevenue)
            .Select(g => new
            {
                Type = g.Key,
                Count = g.Count(),
                Amount = g.Sum(x => x.NetAmountReceived > 0
                    ? x.NetAmountReceived * x.ExchangeRate
                    : x.AmountInBaseCurrency)
            })
            .ToListAsync(cancellationToken);

        var supportedTypes = new[]
        {
            IncomingMoneyType.CompanyRevenue,
            IncomingMoneyType.CapitalContribution,
            IncomingMoneyType.FounderLoan,
            IncomingMoneyType.SupplierRefund
        };

        return rows
            .Where(row => supportedTypes.Contains(row.Type))
            .OrderBy(row => Array.IndexOf(supportedTypes, row.Type))
            .Select(row => new FinanceMoneyInBreakdownDto
            {
                Type = row.Type,
                TransactionCount = row.Count,
                Amount = row.Amount,
                PercentageOfTotalMoneyIn = CalculatePercentage(row.Amount, totalMoneyIn)
            })
            .ToList();
    }

    private async Task<List<FinanceMoneyOutBreakdownDto>> BuildMoneyOutBreakdownAsync(
        IQueryable<FinanceTransaction> confirmedMoneyOut,
        decimal totalMoneyOut,
        CancellationToken cancellationToken)
    {
        var rows = await confirmedMoneyOut
            .GroupBy(x => new
            {
                x.ExpenseCategoryId,
                CategoryCode = x.ExpenseCategory != null ? x.ExpenseCategory.Code : null,
                CategoryName = x.ExpenseCategory != null ? x.ExpenseCategory.Name : null
            })
            .Select(g => new
            {
                g.Key.ExpenseCategoryId,
                g.Key.CategoryCode,
                g.Key.CategoryName,
                Count = g.Count(),
                Amount = g.Sum(x => x.AmountInBaseCurrency)
            })
            .OrderByDescending(x => x.Amount)
            .ToListAsync(cancellationToken);

        return rows.Select(row => new FinanceMoneyOutBreakdownDto
        {
            CategoryId = row.ExpenseCategoryId,
            CategoryCode = row.CategoryCode,
            CategoryNameEn = row.CategoryName,
            CategoryNameAr = row.CategoryName,
            TransactionCount = row.Count,
            Amount = row.Amount,
            PercentageOfTotalMoneyOut = CalculatePercentage(row.Amount, totalMoneyOut)
        }).ToList();
    }

    private async Task<FinanceDocumentationSummaryDto> BuildDocumentationSummaryAsync(
        IQueryable<FinanceTransaction> confirmedTransactions,
        CancellationToken cancellationToken)
    {
        var documentedCount = await confirmedTransactions.CountAsync(
            x => x.DocumentationStatus == FinanceDocumentationStatus.FullyDocumented,
            cancellationToken);

        var partiallyDocumentedCount = await confirmedTransactions.CountAsync(
            x => x.DocumentationStatus == FinanceDocumentationStatus.PartiallyDocumented
                || x.DocumentationStatus == FinanceDocumentationStatus.NeedsReview,
            cancellationToken);

        var undocumentedTransactions = confirmedTransactions.Where(x =>
            x.DocumentationStatus == FinanceDocumentationStatus.MissingDocuments
            || x.DocumentationStatus == FinanceDocumentationStatus.NoDocuments);

        return new FinanceDocumentationSummaryDto
        {
            DocumentedCount = documentedCount,
            PartiallyDocumentedCount = partiallyDocumentedCount,
            UndocumentedCount = await undocumentedTransactions.CountAsync(cancellationToken),
            UndocumentedAmount = await SumCashMovementAsync(undocumentedTransactions, cancellationToken)
        };
    }

    private async Task<List<FinanceRecentActivityDto>> BuildRecentActivityAsync(
        IQueryable<FinanceTransaction> periodTransactions,
        CancellationToken cancellationToken)
    {
        var recent = await periodTransactions
            .OrderByDescending(x => x.TransactionDate)
            .ThenByDescending(x => x.Id)
            .Take(10)
            .Select(x => new
            {
                x.Id,
                x.ReferenceNumber,
                x.TransactionDate,
                x.TransactionType,
                x.IncomingMoneyType,
                x.Description,
                x.Amount,
                x.Currency,
                x.Status,
                SourceAccountName = x.SourceAccount != null ? x.SourceAccount.Name : null,
                DestinationAccountName = x.DestinationAccount != null ? x.DestinationAccount.Name : null,
                UserId = x.CreatedBy ?? x.MakerId
            })
            .ToListAsync(cancellationToken);

        var userIds = recent.Where(x => x.UserId.HasValue).Select(x => x.UserId!.Value).Distinct().ToArray();
        var users = await _context.AuthUsers.AsNoTracking()
            .Where(x => userIds.Contains(x.Id))
            .Select(x => new { x.Id, x.Name })
            .ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);

        return recent.Select(x => new FinanceRecentActivityDto
        {
            Id = x.Id,
            Reference = x.ReferenceNumber,
            TransactionDate = x.TransactionDate,
            TransactionType = x.TransactionType,
            IncomingMoneyType = x.IncomingMoneyType,
            Description = x.Description,
            Amount = x.Amount,
            Currency = x.Currency,
            Status = x.Status,
            SourceAccountName = x.SourceAccountName,
            DestinationAccountName = x.DestinationAccountName,
            CreatedByDisplayName = x.UserId.HasValue && users.TryGetValue(x.UserId.Value, out var name) ? name : null
        }).ToList();
    }

    private static IQueryable<FinanceTransaction> ApplyScope(
        IQueryable<FinanceTransaction> query,
        int? accountId,
        string? currency)
    {
        if (accountId.HasValue)
        {
            query = query.Where(x => x.SourceAccountId == accountId.Value || x.DestinationAccountId == accountId.Value);
        }

        if (!string.IsNullOrWhiteSpace(currency))
        {
            query = query.Where(x => x.Currency == currency);
        }

        return query;
    }

    private static System.Linq.Expressions.Expression<Func<FinanceTransaction, bool>> IsCompanyMoneyInExpression()
    {
        return x => x.TransactionType == FinanceTransactionType.MoneyIn
            && x.IncomingMoneyType != IncomingMoneyType.InternalTransfer;
    }

    private static System.Linq.Expressions.Expression<Func<FinanceTransaction, bool>> IsCompanyMoneyOutExpression()
    {
        return x => x.TransactionType == FinanceTransactionType.MoneyOut
            || x.TransactionType == FinanceTransactionType.FounderReimbursement
            || x.TransactionType == FinanceTransactionType.CashAdvance
            || x.TransactionType == FinanceTransactionType.AssetPurchase;
    }

    private static System.Linq.Expressions.Expression<Func<FinanceTransaction, bool>> IsInternalTransferExpression()
    {
        return x => x.TransactionType == FinanceTransactionType.InternalTransfer
            || x.IncomingMoneyType == IncomingMoneyType.InternalTransfer;
    }

    private static Task<decimal> SumCashInAsync(IQueryable<FinanceTransaction> query, CancellationToken cancellationToken)
    {
        return query.SumAsync(x => (decimal?)(x.NetAmountReceived > 0
            ? x.NetAmountReceived * x.ExchangeRate
            : x.AmountInBaseCurrency), cancellationToken)
            .ContinueWith(x => x.Result ?? 0m, cancellationToken);
    }

    private static Task<decimal> SumAmountInBaseAsync(IQueryable<FinanceTransaction> query, CancellationToken cancellationToken)
    {
        return query.SumAsync(x => (decimal?)x.AmountInBaseCurrency, cancellationToken)
            .ContinueWith(x => x.Result ?? 0m, cancellationToken);
    }

    private static Task<decimal> SumCashMovementAsync(IQueryable<FinanceTransaction> query, CancellationToken cancellationToken)
    {
        return query
            .Where(x => x.TransactionType != FinanceTransactionType.InternalTransfer
                && x.IncomingMoneyType != IncomingMoneyType.InternalTransfer)
            .SumAsync(x => (decimal?)(x.TransactionType == FinanceTransactionType.MoneyIn
                ? (x.NetAmountReceived > 0 ? x.NetAmountReceived * x.ExchangeRate : x.AmountInBaseCurrency)
                : x.AmountInBaseCurrency), cancellationToken)
            .ContinueWith(x => x.Result ?? 0m, cancellationToken);
    }

    private static async Task<Dictionary<int, decimal>> SumCashInByDestinationAsync(
        IQueryable<FinanceTransaction> query,
        int[] accountIds,
        CancellationToken cancellationToken)
    {
        return await query
            .Where(x => x.DestinationAccountId.HasValue && accountIds.Contains(x.DestinationAccountId.Value))
            .GroupBy(x => x.DestinationAccountId!.Value)
            .Select(g => new
            {
                AccountId = g.Key,
                Amount = g.Sum(x => x.NetAmountReceived > 0
                    ? x.NetAmountReceived * x.ExchangeRate
                    : x.AmountInBaseCurrency)
            })
            .ToDictionaryAsync(x => x.AccountId, x => x.Amount, cancellationToken);
    }

    private static async Task<Dictionary<int, decimal>> SumCashOutByAccountAsync(
        IQueryable<FinanceTransaction> query,
        int[] accountIds,
        CancellationToken cancellationToken)
    {
        return await query
            .Where(x => (x.SourceAccountId.HasValue && accountIds.Contains(x.SourceAccountId.Value))
                || (!x.SourceAccountId.HasValue && x.DestinationAccountId.HasValue && accountIds.Contains(x.DestinationAccountId.Value)))
            .GroupBy(x => x.SourceAccountId ?? x.DestinationAccountId!.Value)
            .Select(g => new
            {
                AccountId = g.Key,
                Amount = g.Sum(x => x.AmountInBaseCurrency)
            })
            .ToDictionaryAsync(x => x.AccountId, x => x.Amount, cancellationToken);
    }

    private static async Task<Dictionary<int, decimal>> SumAmountByDestinationAsync(
        IQueryable<FinanceTransaction> query,
        int[] accountIds,
        CancellationToken cancellationToken)
    {
        return await query
            .Where(x => x.DestinationAccountId.HasValue && accountIds.Contains(x.DestinationAccountId.Value))
            .GroupBy(x => x.DestinationAccountId!.Value)
            .Select(g => new
            {
                AccountId = g.Key,
                Amount = g.Sum(x => x.AmountInBaseCurrency)
            })
            .ToDictionaryAsync(x => x.AccountId, x => x.Amount, cancellationToken);
    }

    private static async Task<Dictionary<int, decimal>> SumAmountBySourceAsync(
        IQueryable<FinanceTransaction> query,
        int[] accountIds,
        CancellationToken cancellationToken)
    {
        return await query
            .Where(x => x.SourceAccountId.HasValue && accountIds.Contains(x.SourceAccountId.Value))
            .GroupBy(x => x.SourceAccountId!.Value)
            .Select(g => new
            {
                AccountId = g.Key,
                Amount = g.Sum(x => x.AmountInBaseCurrency)
            })
            .ToDictionaryAsync(x => x.AccountId, x => x.Amount, cancellationToken);
    }

    private static decimal Get(IReadOnlyDictionary<int, decimal> values, int accountId)
    {
        return values.TryGetValue(accountId, out var value) ? value : 0m;
    }

    private static string? NormalizeCurrency(string? currency)
    {
        return string.IsNullOrWhiteSpace(currency)
            ? null
            : currency.Trim().ToUpperInvariant();
    }

    private static decimal CalculatePercentage(decimal amount, decimal total)
    {
        return total == 0m ? 0m : Math.Round(amount / total * 100m, 2);
    }

    private static decimal CalculateChangePercentage(decimal current, decimal previous)
    {
        if (previous == 0m)
        {
            return current == 0m ? 0m : 100m;
        }

        return Math.Round((current - previous) / Math.Abs(previous) * 100m, 2);
    }
}
