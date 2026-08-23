using Investa.Domain.Entities.Enums;
namespace Investa.Application.DTOs;
public enum ExpectedPaymentStatus { Upcoming, Due, Paid, PartiallyPaid, Overdue, Cancelled }
public sealed class ExpectedPaymentScheduleItemDto { public DateTime DueDate { get; set; } public decimal ExpectedInterest { get; set; } public decimal ExpectedPrincipal { get; set; } public decimal ExpectedTotal { get; set; } public decimal? ActualPaid { get; set; } public decimal RemainingAmount { get; set; } public DateTime? PaymentDate { get; set; } public string? PaymentReference { get; set; } public ExpectedPaymentStatus Status { get; set; } }
public sealed class ParticipationPaymentScheduleDto { public int ParticipationRequestId { get; set; } public int OpportunityId { get; set; } public string OpportunityTitle { get; set; } = string.Empty; public string? Currency { get; set; } public decimal Principal { get; set; } public decimal AnnualInterestRate { get; set; } public int DurationMonths { get; set; } public string RepaymentFrequency { get; set; } = string.Empty; public LoanPrincipalRepaymentMethod PrincipalRepaymentMethod { get; set; } public DateTime StartDate { get; set; } public DateTime FinalRepaymentDate { get; set; } public decimal TotalExpectedInterest { get; set; } public decimal AverageExpectedMonthlyIncome { get; set; } public decimal? ReceivedToDate { get; set; } public decimal? RemainingPrincipal { get; set; } public List<ExpectedPaymentScheduleItemDto> Payments { get; set; } = []; public List<ParticipationLegDto> Legs { get; set; } = []; }
public sealed class ParticipationLegDto
{
    public int LegNumber { get; set; }
    public string LegType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public decimal? EquityPercentage { get; set; }
    public string? SharesTerms { get; set; }
    public decimal? ReturnRate { get; set; }
    public int? TermMonths { get; set; }
    public string? RepaymentModel { get; set; }
    public decimal? ProfitSharePercentage { get; set; }
    public string? ExitTerms { get; set; }
    public string Status { get; set; } = "Active";
    public List<ExpectedPaymentScheduleItemDto> CashFlows { get; set; } = [];
    public List<ParticipationObligationDto> Obligations { get; set; } = [];
}
public sealed class ParticipationObligationDto
{
    public string Party { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
}
public sealed class MonthlyCashFlowDto { public DateTime Month { get; set; } public decimal ExpectedInterest { get; set; } public decimal ExpectedPrincipal { get; set; } public decimal? ActualReceived { get; set; } }
public sealed class InvestorCashFlowSummaryDto { public string? Currency { get; set; } public decimal TotalInvestedAmount { get; set; } public decimal ExpectedIncomeThisMonth { get; set; } public decimal? NextPaymentAmount { get; set; } public DateTime? NextPaymentDate { get; set; } public decimal NextTwelveMonths { get; set; } public decimal TotalExpectedInterest { get; set; } public decimal? ReceivedToDate { get; set; } public decimal? RemainingPrincipal { get; set; } public decimal? OverdueAmount { get; set; } public List<MonthlyCashFlowDto> MonthlyCashFlow { get; set; } = []; }
public sealed class InvestorPaymentSummaryDto { public Guid InvestorId { get; set; } public string DisplayName { get; set; } = string.Empty; public string? AvatarUrl { get; set; } public decimal TotalApprovedContribution { get; set; } public decimal TotalPaid { get; set; } public decimal TotalOutstanding { get; set; } public decimal OverdueAmount { get; set; } public DateTime? NextDueDate { get; set; } public int UnpaidInstallmentCount { get; set; } public string Status { get; set; } = string.Empty; public string? Currency { get; set; } public string InvestmentModelLabel { get; set; } = string.Empty; public List<string> LegTypes { get; set; } = []; }
public sealed class InvestorPaymentDetailDto { public Guid InvestorId { get; set; } public string DisplayName { get; set; } = string.Empty; public string? AvatarUrl { get; set; } public string InvestmentModel { get; set; } = string.Empty; public string? Currency { get; set; } public string? FundingCurrency { get; set; } public List<ParticipationPaymentScheduleDto> Participations { get; set; } = []; public List<PaymentTransactionDetailDto> PaymentTransactions { get; set; } = []; }
public sealed class RecordPaymentRequest { public int ParticipationRequestId { get; set; } public decimal Amount { get; set; } public DateTime PaymentDate { get; set; } public string? Reference { get; set; } public string? Notes { get; set; } public string? IdempotencyKey { get; set; } }
public sealed class ReversePaymentRequest { public int PaymentTransactionId { get; set; } public string Reason { get; set; } = string.Empty; }
public sealed class PaymentAllocationDetailDto { public int InstallmentNumber { get; set; } public decimal AllocatedAmount { get; set; } }
public sealed class PaymentTransactionDetailDto { public int Id { get; set; } public int ParticipationRequestId { get; set; } public decimal Amount { get; set; } public DateTime PaymentDate { get; set; } public string? Reference { get; set; } public string? Notes { get; set; } public bool IsReversed { get; set; } public string? ReversalReason { get; set; } public DateTime? ReversedAt { get; set; } public string? CreatedByName { get; set; } public DateTime CreatedAt { get; set; } public List<PaymentAllocationDetailDto> Allocations { get; set; } = []; }
public sealed class MonthlyUnpaidInstallmentItemDto { public int ParticipationRequestId { get; set; } public Guid InvestorId { get; set; } public string InvestorDisplayName { get; set; } = string.Empty; public int InstallmentNumber { get; set; } public DateTime DueDate { get; set; } public decimal ExpectedTotal { get; set; } public decimal AlreadyPaid { get; set; } public decimal RemainingAmount { get; set; } }
public sealed class MonthlyBulkConfirmPreviewDto { public int Year { get; set; } public int Month { get; set; } public int InvestorCount { get; set; } public int InstallmentCount { get; set; } public decimal TotalRemainingAmount { get; set; } public List<MonthlyUnpaidInstallmentItemDto> Installments { get; set; } = []; }
public sealed class BulkConfirmMonthlyRequest { public int? Year { get; set; } public int? Month { get; set; } }
public sealed class BulkConfirmMonthlyResultDto { public int ConfirmedCount { get; set; } public decimal TotalAmount { get; set; } public int ReputationPointsAwarded { get; set; } public int FounderNotificationId { get; set; } public List<int> InvestorNotificationIds { get; set; } = []; }
