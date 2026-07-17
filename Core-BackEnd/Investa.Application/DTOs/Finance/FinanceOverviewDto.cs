using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs.Finance;

public sealed class FinanceOverviewQuery
{
    public DateOnly DateFrom { get; set; }
    public DateOnly DateTo { get; set; }
    public int? AccountId { get; set; }
    public string? Currency { get; set; }
}

public sealed class FinanceOverviewDto
{
    public DateOnly DateFrom { get; set; }
    public DateOnly DateTo { get; set; }
    public int? AccountId { get; set; }
    public string? Currency { get; set; }
    public decimal TotalMoneyIn { get; set; }
    public decimal TotalMoneyOut { get; set; }
    public decimal NetCashFlow { get; set; }
    public FinancePendingSummaryDto Pending { get; set; } = new();
    public List<FinanceAccountBalanceDto> Accounts { get; set; } = new();
    public List<FinanceMoneyInBreakdownDto> MoneyInBreakdown { get; set; } = new();
    public List<FinanceMoneyOutBreakdownDto> MoneyOutBreakdown { get; set; } = new();
    public FinanceDocumentationSummaryDto Documentation { get; set; } = new();
    public FinancePeriodComparisonDto PeriodComparison { get; set; } = new();
    public List<FinanceRecentActivityDto> RecentActivity { get; set; } = new();
}

public sealed class FinancePendingSummaryDto
{
    public int DraftCount { get; set; }
    public int PendingReviewCount { get; set; }
    public int ApprovedNotConfirmedCount { get; set; }
    public int RejectedCount { get; set; }
    public decimal PendingMoneyInAmount { get; set; }
    public decimal PendingMoneyOutAmount { get; set; }
}

public sealed class FinanceAccountBalanceDto
{
    public int AccountId { get; set; }
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; }
    public decimal ConfirmedMoneyIn { get; set; }
    public decimal ConfirmedMoneyOut { get; set; }
    public decimal InternalTransfersIn { get; set; }
    public decimal InternalTransfersOut { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal PendingIn { get; set; }
    public decimal PendingOut { get; set; }
}

public sealed class FinanceMoneyInBreakdownDto
{
    public IncomingMoneyType Type { get; set; }
    public int TransactionCount { get; set; }
    public decimal Amount { get; set; }
    public decimal PercentageOfTotalMoneyIn { get; set; }
}

public sealed class FinanceMoneyOutBreakdownDto
{
    public int? CategoryId { get; set; }
    public string? CategoryCode { get; set; }
    public string? CategoryNameEn { get; set; }
    public string? CategoryNameAr { get; set; }
    public int TransactionCount { get; set; }
    public decimal Amount { get; set; }
    public decimal PercentageOfTotalMoneyOut { get; set; }
}

public sealed class FinanceDocumentationSummaryDto
{
    public int DocumentedCount { get; set; }
    public int PartiallyDocumentedCount { get; set; }
    public int UndocumentedCount { get; set; }
    public decimal UndocumentedAmount { get; set; }
}

public sealed class FinancePeriodComparisonDto
{
    public decimal PreviousPeriodMoneyIn { get; set; }
    public decimal PreviousPeriodMoneyOut { get; set; }
    public decimal PreviousPeriodNetCashFlow { get; set; }
    public decimal MoneyInChangePercentage { get; set; }
    public decimal MoneyOutChangePercentage { get; set; }
    public decimal NetCashFlowChangePercentage { get; set; }
}

public sealed class FinanceRecentActivityDto
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public FinanceTransactionType TransactionType { get; set; }
    public IncomingMoneyType? IncomingMoneyType { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public FinanceTransactionStatus Status { get; set; }
    public string? SourceAccountName { get; set; }
    public string? DestinationAccountName { get; set; }
    public string? CreatedByDisplayName { get; set; }
}
