using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public sealed class ProfitSharingObligationDto
{
    public int Id { get; init; }
    public int ParticipationId { get; init; }
    public int ContractId { get; init; }
    public int ContractVersionId { get; init; }
    public int AcceptedOfferId { get; init; }
    public int OfferLegId { get; init; }
    public Guid FounderUserId { get; init; }
    public Guid InvestorUserId { get; init; }
    public decimal ContributionAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal ProfitSharePercentage { get; init; }
    public string ReportingFrequency { get; init; } = string.Empty;
    public string CalculationBasis { get; init; } = ProfitSharingCalculationBasis.Undefined.ToString();
    public DateTime ContractualStartDate { get; init; }
    public DateTime ContractualEndDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? ActivatedAt { get; init; }
    public DateTime? MaturedAt { get; init; }
    public DateTime? SettledAt { get; init; }
    public DateTime? ClosedAt { get; init; }
    public Guid? ClosedByUserId { get; init; }
    public string? ClosureReason { get; init; }
    public string? ClosureSnapshotHash { get; init; }
    public string? ClosureSnapshotVersion { get; init; }
    public decimal TotalDeclaredResult { get; init; }
    public decimal TotalEntitlement { get; init; }
    public decimal TotalConfirmedDistributed { get; init; }
    public decimal TotalPendingConfirmation { get; init; }
    public decimal TotalDisputed { get; init; }
    public decimal TotalDistributionOutstanding { get; init; }
    public int CompletedPeriods { get; init; }
    public int TotalPeriods { get; init; }
    public IReadOnlyList<ProfitSharingReportingPeriodDto> ReportingPeriods { get; init; } = [];
}

public sealed class ProfitSharingReportingPeriodDto
{
    public int Id { get; init; }
    public int ObligationId { get; init; }
    public int PeriodNumber { get; init; }
    public bool IsFinalPeriod { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public DateTime? ReportingDueDate { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public bool HasDeclaration { get; init; }
    public decimal? DeclaredBasisAmount { get; init; }
    public decimal? DeclaredResultAmount { get; init; }
    public string? DeclarationStatus { get; init; }
    public ProfitSharingDeclarationDto? Declaration { get; init; }
    public decimal? InvestorEntitlement { get; init; }
    public decimal? DistributionOutstanding { get; init; }
    public decimal? ConfirmedDistributed { get; init; }
    public decimal? PendingConfirmation { get; init; }
    public decimal? Disputed { get; init; }
    public IReadOnlyList<ProfitSharingDistributionDeclarationDto> DistributionDeclarations { get; init; } = [];
}

public sealed class ProfitSharingDeclarationDto
{
    public int Id { get; init; }
    public int ObligationId { get; init; }
    public int ReportingPeriodId { get; init; }
    public int PeriodNumber { get; init; }
    public Guid FounderUserId { get; init; }
    public Guid InvestorUserId { get; init; }
    public string CalculationBasis { get; init; } = string.Empty;
    public decimal DeclaredBasisAmount { get; init; }
    public decimal DeclaredResultAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public DateTime DeclarationDate { get; init; }
    public string? ExternalReference { get; init; }
    public string? Notes { get; init; }
    public bool EvidenceAvailable { get; init; }
    public string? EvidenceFileName { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime DeclaredAt { get; init; }
    public Guid DeclaredByUserId { get; init; }
    public string? CalculationError { get; init; }
    public ProfitSharingEntitlementDto? Entitlement { get; init; }
}

public sealed class ProfitSharingEntitlementDto
{
    public decimal BasisAmount { get; init; }
    public decimal ProfitSharePercentage { get; init; }
    public decimal EntitlementAmount { get; init; }
    public decimal DistributionOutstanding { get; init; }
    public decimal ConfirmedDistributed { get; init; }
    public decimal PendingConfirmation { get; init; }
    public decimal Disputed { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string CalculationBasis { get; init; } = string.Empty;
    public string CalculationVersion { get; init; } = string.Empty;
    public DateTime CalculatedAt { get; init; }
}

public sealed class ProfitSharingSummaryDto
{
    public int ParticipationId { get; init; }
    public IReadOnlyList<ProfitSharingObligationDto> Obligations { get; init; } = [];
    public decimal TotalEntitlement { get; init; }
    public decimal TotalConfirmedDistributed { get; init; }
    public decimal TotalPendingConfirmation { get; init; }
    public decimal TotalDisputed { get; init; }
    public decimal TotalDistributionOutstanding { get; init; }
    public decimal TotalDeclaredResult { get; init; }
    public int CompletedPeriods { get; init; }
    public int TotalPeriods { get; init; }
}

public sealed class ProfitSharingClosureRequest
{
    [Required, StringLength(2000, MinimumLength = 1)]
    public string Reason { get; set; } = string.Empty;
}

public sealed class ProfitSharingLifecycleProcessResultDto
{
    public int ObligationsEvaluated { get; init; }
    public int Matured { get; init; }
    public int Settled { get; init; }
    public int NotificationsRequested { get; init; }
}

public sealed class ProfitSharingLifecycleOptions
{
    public bool Enabled { get; set; } = true;
    public int PollingIntervalSeconds { get; set; } = 3600;
}

public sealed class CreateProfitSharingDeclarationRequest
{
    public decimal DeclaredBasisAmount { get; set; }
    public decimal DeclaredResultAmount { get; set; }
    [Required, StringLength(10, MinimumLength = 3)] public string Currency { get; set; } = string.Empty;
    [Required] public DateTime? DeclarationDate { get; set; }
    [StringLength(200)] public string? ExternalReference { get; set; }
    [StringLength(2000)] public string? Notes { get; set; }
}

public sealed record ProfitSharingDeclarationCreateCommand(
    decimal DeclaredBasisAmount,
    decimal DeclaredResultAmount,
    string Currency,
    DateTime DeclarationDate,
    string? ExternalReference,
    string? Notes,
    string? IdempotencyKey = null,
    Stream? EvidenceContent = null,
    string? EvidenceOriginalFileName = null,
    string? EvidenceContentType = null,
    long EvidenceFileSize = 0);

public sealed record ProfitSharingEvidenceDownload(byte[] Content, string FileName, string ContentType);

public sealed class CreateProfitSharingDistributionRequest
{
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal DeclaredAmount { get; set; }
    [Required, StringLength(10, MinimumLength = 3)] public string Currency { get; set; } = string.Empty;
    [StringLength(200)] public string? ExternalReference { get; set; }
    [StringLength(2000)] public string? Notes { get; set; }
}

public sealed record ProfitSharingDistributionCreateCommand(
    decimal DeclaredAmount,
    string Currency,
    string? ExternalReference,
    string? Notes,
    string? IdempotencyKey = null,
    Stream? EvidenceContent = null,
    string? EvidenceOriginalFileName = null,
    string? EvidenceContentType = null,
    long EvidenceFileSize = 0);

public sealed class ConfirmProfitSharingDistributionRequest
{
    [StringLength(2000)] public string? Comment { get; set; }
}

public sealed class DisputeProfitSharingDistributionRequest
{
    [Required, StringLength(2000, MinimumLength = 1)] public string Reason { get; set; } = string.Empty;
}

public sealed class ProfitSharingDistributionDeclarationDto
{
    public int Id { get; init; }
    public int ObligationId { get; init; }
    public int ReportingPeriodId { get; init; }
    public int EntitlementId { get; init; }
    public int ParticipationId { get; init; }
    public int ContractId { get; init; }
    public int ContractVersionId { get; init; }
    public int AcceptedOfferId { get; init; }
    public int OfferLegId { get; init; }
    public Guid FounderUserId { get; init; }
    public Guid InvestorUserId { get; init; }
    public decimal DeclaredAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public DateTime DeclaredAt { get; init; }
    public string? ExternalReference { get; init; }
    public string? Notes { get; init; }
    public bool EvidenceAvailable { get; init; }
    public string? EvidenceFileName { get; init; }
    public Guid DeclaredByUserId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? DecidedAt { get; init; }
    public Guid? DecidedByUserId { get; init; }
    public string? ConfirmationComment { get; init; }
    public string? DisputeReason { get; init; }
    public ProfitSharingDistributionAllocationDto? Allocation { get; init; }
}

public sealed class ProfitSharingDistributionAllocationDto
{
    public int Id { get; init; }
    public int DeclarationId { get; init; }
    public int ReportingPeriodId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public DateTime ConfirmedAt { get; init; }
    public Guid DecisionActorId { get; init; }
}
