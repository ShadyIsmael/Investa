using Investa.Domain.Entities.Enums;
namespace Investa.Application.DTOs;
public enum ExpectedPaymentStatus { Upcoming, Due, Paid, PartiallyPaid, Overdue, Cancelled }
public sealed class ExpectedPaymentScheduleItemDto { public int InstallmentNumber { get; set; } public DateTime DueDate { get; set; } public decimal ExpectedInterest { get; set; } public decimal ExpectedPrincipal { get; set; } public decimal ExpectedTotal { get; set; } public decimal? ActualPaid { get; set; } public decimal RemainingAmount { get; set; } public DateTime? PaymentDate { get; set; } public string? PaymentReference { get; set; } public ExpectedPaymentStatus Status { get; set; } }
public sealed class ParticipationPaymentScheduleDto { public int ParticipationRequestId { get; set; } public int OpportunityId { get; set; } public string OpportunityTitle { get; set; } = string.Empty; public string? Currency { get; set; } public decimal Principal { get; set; } public decimal AnnualInterestRate { get; set; } public int DurationMonths { get; set; } public string RepaymentFrequency { get; set; } = string.Empty; public LoanPrincipalRepaymentMethod PrincipalRepaymentMethod { get; set; } public DateTime StartDate { get; set; } public DateTime FinalRepaymentDate { get; set; } public decimal TotalExpectedInterest { get; set; } public decimal AverageExpectedMonthlyIncome { get; set; } public decimal? ReceivedToDate { get; set; } public decimal? RemainingPrincipal { get; set; } public List<ExpectedPaymentScheduleItemDto> Payments { get; set; } = []; public List<ParticipationLegDto> Legs { get; set; } = []; }
public sealed class ParticipationLegDto
{
    /// <summary>Authoritative accepted OfferLeg id used for mixed funding allocation.</summary>
    public int OfferLegId { get; set; }
    public int LegNumber { get; set; }
    public string LegType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal DeclaredAmount { get; set; }
    public decimal ConfirmedAmount { get; set; }
    public decimal PendingConfirmationAmount { get; set; }
    public decimal DisputedAmount { get; set; }
    public decimal OutstandingAmount { get; set; }
    public string FundingStatus { get; set; } = "PendingFunding";
    public string? Currency { get; set; }
    public decimal? EquityPercentage { get; set; }
    public EquityOwnershipModel? EquityOwnershipModel { get; set; }
    public decimal? InvestorShareCount { get; set; }
    public decimal? TotalIssuedShares { get; set; }
    public decimal? CurrentInvestorShares { get; set; }
    public decimal? CurrentTotalIssuedShares { get; set; }
    public decimal? CurrentOwnershipPercentage { get; set; }
    public string? ShareClass { get; set; }
    public decimal? PricePerShare { get; set; }
    public decimal? PreMoneyValuation { get; set; }
    public decimal? PostMoneyValuation { get; set; }
    public DateTime? EffectiveOwnershipDate { get; set; }
    public int? EquityPositionId { get; set; }
    public string? EquityPositionStatus { get; set; }
    public bool HasInitialEquityHolding { get; set; }
    public decimal? EquityInitialOwnershipPercentage { get; set; }
    public decimal? EquityDilutionPercentagePoints { get; set; }
    public decimal? EquityDilutionRelativeReductionPercentage { get; set; }
    public IReadOnlyList<EquityCorporateEventSummaryDto> EquityCorporateEvents { get; set; } = [];
    public string? SharesTerms { get; set; }
    public decimal? ReturnRate { get; set; }
    public int? TermMonths { get; set; }
    public string? RepaymentModel { get; set; }
    public decimal? ProfitSharePercentage { get; set; }
    public string? ExitTerms { get; set; }
    public string Status { get; set; } = "Active";
    public int? LoanObligationId { get; set; }
    public string? LoanObligationStatus { get; set; }
    public bool IsPersistedSchedule { get; set; }
    public int? ProfitSharingObligationId { get; set; }
    public string? ProfitSharingObligationStatus { get; set; }
    public DateTime? ProfitSharingMaturedAt { get; set; }
    public DateTime? ProfitSharingSettledAt { get; set; }
    public DateTime? ProfitSharingClosedAt { get; set; }
    public string? ProfitSharingClosureReason { get; set; }
    public string? ProfitSharingClosureSnapshotHash { get; set; }
    public bool IsPersistedReportingPeriods { get; set; }
    public string? ProfitSharingReportingFrequency { get; set; }
    public string? ProfitSharingCalculationBasis { get; set; }
    public decimal? ProfitSharingTotalEntitlement { get; set; }
    public decimal? ProfitSharingTotalConfirmedDistributed { get; set; }
    public decimal? ProfitSharingTotalPendingConfirmation { get; set; }
    public decimal? ProfitSharingTotalDisputed { get; set; }
    public decimal? ProfitSharingTotalDistributionOutstanding { get; set; }
    public decimal? ProfitSharingTotalDeclaredResult { get; set; }
    public int? ProfitSharingCompletedPeriods { get; set; }
    public int? ProfitSharingTotalPeriods { get; set; }
    public IReadOnlyList<ProfitSharingReportingPeriodDto> ProfitSharingReportingPeriods { get; set; } = [];
    public DateTime? ContractualStartDate { get; set; }
    public DateTime? ContractualMaturityDate { get; set; }
    public List<ExpectedPaymentScheduleItemDto> CashFlows { get; set; } = [];
    public List<ParticipationObligationDto> Obligations { get; set; } = [];
    public LoanRepaymentSummaryDto? Repayment { get; set; }
}
public sealed class EquityCorporateEventSummaryDto
{
    public int EventId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime EffectiveDate { get; set; }
    public decimal? PreviousOwnershipPercentage { get; set; }
    public decimal? NewOwnershipPercentage { get; set; }
    public decimal? DilutionPercentagePoints { get; set; }
    public decimal? PreviousInvestorShares { get; set; }
    public decimal? NewInvestorShares { get; set; }
    public decimal? PreviousTotalIssuedShares { get; set; }
    public decimal? NewTotalIssuedShares { get; set; }
}
public sealed class ParticipationObligationDto
{
    public string Party { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
}
public sealed class MonthlyCashFlowDto { public DateTime Month { get; set; } public decimal ExpectedInterest { get; set; } public decimal ExpectedPrincipal { get; set; } public decimal? ActualReceived { get; set; } }
public sealed class InvestorCashFlowSummaryDto { public string? Currency { get; set; } public decimal TotalInvestedAmount { get; set; } public decimal ExpectedIncomeThisMonth { get; set; } public decimal? NextPaymentAmount { get; set; } public DateTime? NextPaymentDate { get; set; } public decimal NextTwelveMonths { get; set; } public decimal TotalExpectedInterest { get; set; } public decimal? ReceivedToDate { get; set; } public decimal? RemainingPrincipal { get; set; } public decimal? OverdueAmount { get; set; } public List<MonthlyCashFlowDto> MonthlyCashFlow { get; set; } = []; }
public sealed class InvestorPaymentSummaryDto { public Guid InvestorId { get; set; } public string DisplayName { get; set; } = string.Empty; public string? AvatarUrl { get; set; } public decimal TotalApprovedContribution { get; set; } public decimal TotalCommittedAmount { get; set; } public decimal ConfirmedReceivedAmount { get; set; } public decimal OutstandingAmount { get; set; } public decimal TotalPaid { get; set; } public decimal TotalOutstanding { get; set; } public decimal OverdueAmount { get; set; } public DateTime? NextDueDate { get; set; } public int UnpaidInstallmentCount { get; set; } public string Status { get; set; } = string.Empty; public string? Currency { get; set; } public string InvestmentModelLabel { get; set; } = string.Empty; public List<string> LegTypes { get; set; } = []; }
public sealed class InvestorPaymentDetailDto { public Guid InvestorId { get; set; } public string DisplayName { get; set; } = string.Empty; public string? AvatarUrl { get; set; } public string InvestmentModel { get; set; } = string.Empty; public string? Currency { get; set; } public string? FundingCurrency { get; set; } public List<ParticipationPaymentScheduleDto> Participations { get; set; } = []; public List<PaymentTransactionDetailDto> PaymentTransactions { get; set; } = []; }
public sealed class RecordPaymentRequest { public int ParticipationRequestId { get; set; } public decimal Amount { get; set; } public DateTime PaymentDate { get; set; } public string? Reference { get; set; } public string? Notes { get; set; } public string? IdempotencyKey { get; set; } }
public sealed class ReversePaymentRequest { public int PaymentTransactionId { get; set; } public string Reason { get; set; } = string.Empty; }
public sealed class PaymentAllocationDetailDto { public int InstallmentNumber { get; set; } public decimal AllocatedAmount { get; set; } }
public sealed class PaymentTransactionDetailDto { public int Id { get; set; } public int ParticipationRequestId { get; set; } public decimal Amount { get; set; } public DateTime PaymentDate { get; set; } public string? Reference { get; set; } public string? Notes { get; set; } public bool IsReversed { get; set; } public string? ReversalReason { get; set; } public DateTime? ReversedAt { get; set; } public string? CreatedByName { get; set; } public DateTime CreatedAt { get; set; } public List<PaymentAllocationDetailDto> Allocations { get; set; } = []; }
public sealed class LoanRepaymentRecordDto
{
    public int Id { get; init; }
    public int LoanObligationId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public DateTime ExternalPaymentDate { get; init; }
    public string? ExternalReference { get; init; }
    public bool ProofAvailable { get; init; }
    public string? ProofFileName { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime DeclaredAt { get; init; }
    public Guid DeclaredByUserId { get; init; }
    public DateTime? DecidedAt { get; init; }
    public Guid? DecidedByUserId { get; init; }
    public string? ConfirmationComment { get; init; }
    public string? DisputeReason { get; init; }
    public IReadOnlyList<LoanRepaymentAllocationDto> Allocations { get; init; } = [];
    public IReadOnlyList<int> TargetInstallmentNumbers { get; init; } = [];
}

public sealed class LoanRepaymentAllocationDto
{
    public int InstallmentNumber { get; init; }
    public decimal InterestAllocated { get; init; }
    public decimal PrincipalAllocated { get; init; }
    public decimal TotalAllocated { get; init; }
}

public sealed class LoanRepaymentSummaryDto
{
    public int LoanObligationId { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal PrincipalOutstanding { get; init; }
    public decimal InterestOutstanding { get; init; }
    public decimal TotalOutstanding { get; init; }
    public decimal ConfirmedRepaidAmount { get; init; }
    public decimal PendingConfirmationAmount { get; init; }
    public decimal DisputedAmount { get; init; }
    public decimal? NextDueAmount { get; init; }
    public DateTime? NextDueDate { get; init; }
    public string LoanLifecycleStatus { get; init; } = string.Empty;
    public DateTime? MaturityDate { get; init; }
    public decimal OverdueAmount { get; init; }
    public DateTime? FullyRepaidAt { get; init; }
    public DateTime? DefaultedAt { get; init; }
    public Guid? DefaultedByUserId { get; init; }
    public string? DefaultReason { get; init; }
    public decimal? DefaultOutstandingPrincipal { get; init; }
    public decimal? DefaultOutstandingInterest { get; init; }
    public decimal? DefaultOutstandingTotal { get; init; }
    public DateTime? ClosedAt { get; init; }
    public Guid? ClosedByUserId { get; init; }
    public string? ClosureReason { get; init; }
    public decimal? ClosedFinalPrincipalOutstanding { get; init; }
    public decimal? ClosedFinalInterestOutstanding { get; init; }
    public decimal? ClosedFinalTotalOutstanding { get; init; }
    public IReadOnlyList<LoanRepaymentRecordDto> Records { get; init; } = [];
}

public sealed class LoanLifecycleActionRequest
{
    [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(2000, MinimumLength = 1)]
    public string Reason { get; set; } = string.Empty;
}

public sealed class LoanLifecycleProcessResultDto
{
    public int ObligationsEvaluated { get; init; }
    public int InstallmentsUpdated { get; init; }
    public int LifecycleTransitions { get; init; }
    public int NotificationsRequested { get; init; }
}

public sealed class LoanLifecycleSnapshotDto
{
    public int LoanObligationId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? MaturityDate { get; init; }
    public decimal OverdueAmount { get; init; }
    public DateTime? NextDueDate { get; init; }
    public decimal? NextDueAmount { get; init; }
    public DateTime? FullyRepaidAt { get; init; }
    public DateTime? DefaultedAt { get; init; }
    public Guid? DefaultedByUserId { get; init; }
    public string? DefaultReason { get; init; }
    public decimal? DefaultOutstandingPrincipal { get; init; }
    public decimal? DefaultOutstandingInterest { get; init; }
    public decimal? DefaultOutstandingTotal { get; init; }
    public DateTime? ClosedAt { get; init; }
    public Guid? ClosedByUserId { get; init; }
    public string? ClosureReason { get; init; }
    public decimal? ClosedFinalPrincipalOutstanding { get; init; }
    public decimal? ClosedFinalInterestOutstanding { get; init; }
    public decimal? ClosedFinalTotalOutstanding { get; init; }
}

public sealed class LoanLifecycleOptions
{
    public bool Enabled { get; set; } = true;
    public int PollingIntervalSeconds { get; set; } = 3600;
    public int UpcomingReminderDays { get; set; } = 7;
}

public sealed class CreateLoanRepaymentDeclarationRequest
{
    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }
    [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(10, MinimumLength = 3)]
    public string Currency { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    public DateTime? ExternalPaymentDate { get; set; }
    [System.ComponentModel.DataAnnotations.StringLength(200)]
    public string? ExternalReference { get; set; }
    public IReadOnlyList<int>? InstallmentIds { get; set; }
}

public sealed class ConfirmLoanRepaymentRequest
{
    [System.ComponentModel.DataAnnotations.StringLength(2000)]
    public string? Comment { get; set; }
}

public sealed class DisputeLoanRepaymentRequest
{
    [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(2000, MinimumLength = 1)]
    public string Reason { get; set; } = string.Empty;
}
public sealed class MonthlyUnpaidInstallmentItemDto { public int ParticipationRequestId { get; set; } public Guid InvestorId { get; set; } public string InvestorDisplayName { get; set; } = string.Empty; public int InstallmentNumber { get; set; } public DateTime DueDate { get; set; } public decimal ExpectedTotal { get; set; } public decimal AlreadyPaid { get; set; } public decimal RemainingAmount { get; set; } }
public sealed class MonthlyBulkConfirmPreviewDto { public int Year { get; set; } public int Month { get; set; } public int InvestorCount { get; set; } public int InstallmentCount { get; set; } public decimal TotalRemainingAmount { get; set; } public List<MonthlyUnpaidInstallmentItemDto> Installments { get; set; } = []; }
public sealed class BulkConfirmMonthlyRequest { public int? Year { get; set; } public int? Month { get; set; } }
public sealed class BulkConfirmMonthlyResultDto { public int ConfirmedCount { get; set; } public decimal TotalAmount { get; set; } public int ReputationPointsAwarded { get; set; } public int FounderNotificationId { get; set; } public List<int> InvestorNotificationIds { get; set; } = []; }
