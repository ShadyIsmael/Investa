using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public sealed class EquityPositionDto
{
    public int Id { get; init; }
    public int ParticipationId { get; init; }
    public int ContractId { get; init; }
    public int ContractVersionId { get; init; }
    public int OfferId { get; init; }
    public int OfferVersion { get; init; }
    public int OfferLegId { get; init; }
    public int OpportunityId { get; init; }
    public Guid InvestorId { get; init; }
    public decimal InvestmentAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public EquityOwnershipModel OwnershipModel { get; init; }
    public EquityPositionStatus Status { get; init; }
    public decimal? ContractualOwnershipPercentage { get; init; }
    public decimal? CurrentOwnershipPercentage { get; init; }
    public decimal? CurrentInvestorShares { get; init; }
    public decimal? CurrentTotalIssuedShares { get; init; }
    public decimal? InitialOwnershipPercentage { get; init; }
    public decimal? DilutionPercentagePoints { get; init; }
    public decimal? DilutionRelativeReductionPercentage { get; init; }
    public decimal? InvestorShareCount { get; init; }
    public decimal? TotalIssuedShares { get; init; }
    public string? ShareClass { get; init; }
    public decimal? PricePerShare { get; init; }
    public decimal? PreMoneyValuation { get; init; }
    public decimal? PostMoneyValuation { get; init; }
    public DateTime? EffectiveOwnershipDate { get; init; }
    public DateTime? ActivatedAt { get; init; }
    public bool HasInitialHolding { get; init; }
    public IReadOnlyList<EquityHoldingLedgerEntryDto> Ledger { get; init; } = [];
    public IReadOnlyList<EquityCorporateEventDto> CorporateEvents { get; init; } = [];
}

public sealed class EquityHoldingLedgerEntryDto
{
    public long Id { get; init; }
    public EquityHoldingLedgerEventType EventType { get; init; }
    public DateTime EffectiveDate { get; init; }
    public decimal? ShareDelta { get; init; }
    public decimal? ResultingInvestorShares { get; init; }
    public decimal? ResultingTotalIssuedShares { get; init; }
    public decimal? ResultingOwnershipPercentage { get; init; }
    public decimal? ContractualOwnershipPercentage { get; init; }
    public int ContractId { get; init; }
    public int ContractVersionId { get; init; }
    public int OfferId { get; init; }
    public int OfferLegId { get; init; }
    public int? CorporateEventId { get; init; }
    public decimal? PreviousInvestorShares { get; init; }
    public decimal? PreviousTotalIssuedShares { get; init; }
    public decimal? PreviousOwnershipPercentage { get; init; }
    public string? ShareClass { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class EquityOwnershipAtDateDto
{
    public int PositionId { get; init; }
    public DateTime AsOf { get; init; }
    public EquityOwnershipModel OwnershipModel { get; init; }
    public decimal? OwnershipPercentage { get; init; }
    public decimal? InvestorShares { get; init; }
    public decimal? TotalIssuedShares { get; init; }
    public DateTime? EffectiveDate { get; init; }
}

public sealed class CreateEquityCorporateEventRequest
{
    public int? OpportunityId { get; init; }
    public EquityCorporateEventType EventType { get; init; }
    public DateTime EffectiveDate { get; init; }
    public decimal? SharesIssued { get; init; }
    public decimal? SplitNumerator { get; init; }
    public decimal? SplitDenominator { get; init; }
    public string? ShareClass { get; init; }
    public string? Currency { get; init; }
    public decimal? PreMoneyValuation { get; init; }
    public decimal? PostMoneyValuation { get; init; }
    public decimal? PricePerShare { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public IReadOnlyList<int>? PositionIds { get; init; }
}

public sealed class EquityCorporateEventDecisionRequest
{
    public bool Approve { get; init; }
    public string? Reason { get; init; }
}

public sealed class EquityCorporateEventDto
{
    public int Id { get; init; }
    public int ProjectId { get; init; }
    public int? OpportunityId { get; init; }
    public EquityCorporateEventType EventType { get; init; }
    public EquityCorporateEventStatus Status { get; init; }
    public DateTime EffectiveDate { get; init; }
    public Guid InitiatedByUserId { get; init; }
    public Guid? ApprovedByUserId { get; init; }
    public Guid? AppliedByUserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? AppliedAt { get; init; }
    public string Reason { get; init; } = string.Empty;
    public decimal? SharesIssued { get; init; }
    public decimal? ResultingTotalIssuedShares { get; init; }
    public decimal? SplitNumerator { get; init; }
    public decimal? SplitDenominator { get; init; }
    public string? ShareClass { get; init; }
    public decimal? PreviousTotalIssuedShares { get; init; }
    public decimal? AfterTotalIssuedShares { get; init; }
    public decimal? ExpectedTotalIssuedShares { get; init; }
    public int? ExpectedLatestAppliedEventId { get; init; }
    public IReadOnlyList<EquityCorporateEventPositionDto> Positions { get; init; } = [];
}

public sealed class EquityCorporateEventPositionDto
{
    public int PositionId { get; init; }
    public bool IsNewPosition { get; init; }
    public decimal? PreviousOwnershipPercentage { get; init; }
    public decimal? NewOwnershipPercentage { get; init; }
    public decimal? DilutionPercentagePoints { get; init; }
    public decimal? PreviousInvestorShares { get; init; }
    public decimal? NewInvestorShares { get; init; }
    public decimal? PreviousTotalIssuedShares { get; init; }
    public decimal? NewTotalIssuedShares { get; init; }
}
