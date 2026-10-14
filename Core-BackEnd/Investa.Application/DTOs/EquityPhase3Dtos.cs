using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

// ===== DIVIDEND DTOs =====

public sealed class CreateDividendDeclarationRequest
{
    public int OpportunityId { get; init; }
    public DateTime DeclarationDate { get; init; }
    public DateTime RecordDate { get; init; }
    public DateTime? PaymentDueDate { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal? DividendPerShare { get; init; }
    public decimal? TotalDeclaredAmount { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? Notes { get; init; }
}

public sealed class EquityDividendDeclarationDto
{
    public int Id { get; init; }
    public int ProjectId { get; init; }
    public int OpportunityId { get; init; }
    public EquityDividendStatus Status { get; init; }
    public DateTime DeclarationDate { get; init; }
    public DateTime RecordDate { get; init; }
    public DateTime? PaymentDueDate { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string DistributionBasis { get; init; } = "PerShare";
    public decimal? DividendPerShare { get; init; }
    public decimal? TotalDeclaredAmount { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public Guid DeclaredByUserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public IReadOnlyList<EquityDividendEntitlementDto> Entitlements { get; init; } = [];
}

public sealed class EquityDividendEntitlementDto
{
    public int Id { get; init; }
    public int DividendDeclarationId { get; init; }
    public int EquityPositionId { get; init; }
    public Guid InvestorUserId { get; init; }
    public decimal EligibleShares { get; init; }
    public decimal EligibleOwnershipPercentage { get; init; }
    public decimal TotalIssuedSharesAtRecordDate { get; init; }
    public decimal EntitlementAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal ConfirmedDistributed { get; init; }
    public decimal PendingConfirmation { get; init; }
    public decimal DisputedAmount { get; init; }
    public decimal Outstanding { get; init; }
    public IReadOnlyList<EquityDividendDistributionDto> Distributions { get; init; } = [];
}

public sealed class EquityDividendDistributionDto
{
    public int Id { get; init; }
    public int DividendDeclarationId { get; init; }
    public int DividendEntitlementId { get; init; }
    public Guid DeclaredByUserId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public EquityDividendDistributionStatus Status { get; init; }
    public DateTime DeclaredAt { get; init; }
    public bool IsConfirmed { get; init; }
    public string? ConfirmationReason { get; init; }
}

public sealed class DeclareExternalDistributionRequest
{
    public int EntitlementId { get; init; }
    public decimal Amount { get; init; }
    public string? Notes { get; init; }
}

public sealed class ConfirmDistributionRequest
{
    public int DistributionId { get; init; }
    public bool IsConfirmed { get; init; }
    public string? Reason { get; init; }
}

// ===== TRANSFER DTOs =====

public sealed class CreateTransferRequest
{
    public int OpportunityId { get; init; }
    public int SourcePositionId { get; init; }
    public Guid? DestinationInvestorUserId { get; init; }
    public EquityTransferType TransferType { get; init; }
    public decimal Quantity { get; init; }
    public DateTime EffectiveDate { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public string? ExternalReference { get; init; }
}

public sealed class EquityTransferDto
{
    public int Id { get; init; }
    public int ProjectId { get; init; }
    public int OpportunityId { get; init; }
    public int SourcePositionId { get; init; }
    public Guid SourceInvestorUserId { get; init; }
    public int? DestinationPositionId { get; init; }
    public Guid? DestinationInvestorUserId { get; init; }
    public EquityTransferType TransferType { get; init; }
    public EquityTransferStatus Status { get; init; }
    public decimal Quantity { get; init; }
    public DateTime EffectiveDate { get; init; }
    public Guid InitiatedByUserId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public string? ExternalReference { get; init; }
    public decimal? SourceSharesBefore { get; init; }
    public decimal? SourceSharesAfter { get; init; }
    public decimal? DestinationSharesAfter { get; init; }
    public decimal? SourceOwnershipBefore { get; init; }
    public decimal? SourceOwnershipAfter { get; init; }
    public decimal? DestinationOwnershipAfter { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? AppliedAt { get; init; }
}

// ===== CLOSURE DTOs =====

public sealed class ClosePositionRequest
{
    public string Reason { get; init; } = string.Empty;
}

public sealed class EquityClosureSnapshotDto
{
    public int Id { get; init; }
    public int EquityPositionId { get; init; }
    public int ContractId { get; init; }
    public Guid InvestorUserId { get; init; }
    public int ProjectId { get; init; }
    public decimal? InitialOwnershipPercentage { get; init; }
    public decimal? FinalOwnershipPercentage { get; init; }
    public decimal? InitialInvestorShares { get; init; }
    public decimal? FinalInvestorShares { get; init; }
    public decimal? TotalIssuedSharesAtClosure { get; init; }
    public decimal? TotalDistributionsConfirmed { get; init; }
    public DateTime FullyExitedAt { get; init; }
    public DateTime ClosedAt { get; init; }
    public Guid ClosedByUserId { get; init; }
    public string ClosureReason { get; init; } = string.Empty;
}
