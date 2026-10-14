using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Canonical contractual Equity position. It is a private record of the accepted
/// contract and external funding acknowledgement; it is not custody or a share registry.
/// </summary>
public sealed class EquityPosition
{
    public int Id { get; set; }
    public int ParticipationRequestId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int AcceptedOfferVersionNumber { get; set; }
    public int OfferLegId { get; set; }
    public int OfferLegNumber { get; set; }
    public int OpportunityId { get; set; }
    public int? ProjectId { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal InvestmentAmount { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    public EquityOwnershipModel OwnershipModel { get; set; }

    [Column(TypeName = "decimal(9,6)")]
    public decimal? ContractualOwnershipPercentage { get; set; }

    [Column(TypeName = "decimal(18,6)")]
    public decimal? InvestorShareCount { get; set; }

    [Column(TypeName = "decimal(18,6)")]
    public decimal? TotalIssuedShares { get; set; }

    [StringLength(100)]
    public string? ShareClass { get; set; }

    [Column(TypeName = "decimal(18,6)")]
    public decimal? PricePerShare { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PreMoneyValuation { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PostMoneyValuation { get; set; }

    public DateTime? EffectiveOwnershipDate { get; set; }
    public EquityPositionStatus Status { get; set; } = EquityPositionStatus.PendingFunding;
    public DateTime? ActivatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public OpportunityJoinRequest? ParticipationRequest { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? ContractVersion { get; set; }
    public NegotiationOffer? AcceptedOffer { get; set; }
    public NegotiationOfferLeg? OfferLeg { get; set; }
    public Opportunity? Opportunity { get; set; }
    public Project? Project { get; set; }
    public AuthUser? FounderUser { get; set; }
    public AuthUser? InvestorUser { get; set; }
    public EquityHoldingSnapshot? InitialHoldingSnapshot { get; set; }
    public ICollection<EquityHoldingLedgerEntry> LedgerEntries { get; set; } = new List<EquityHoldingLedgerEntry>();
}

/// <summary>Immutable activation-time copy of the accepted Equity terms.</summary>
public sealed class EquityHoldingSnapshot
{
    public int Id { get; set; }
    public int EquityPositionId { get; set; }
    public EquityOwnershipModel OwnershipModel { get; set; }
    public DateTime EffectiveDate { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? ContractualOwnershipPercentage { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? InvestorShareCount { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? TotalIssuedShares { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? DerivedOwnershipPercentage { get; set; }
    [StringLength(100)] public string? ShareClass { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? PricePerShare { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? PreMoneyValuation { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? PostMoneyValuation { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int OfferLegId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public EquityPosition? EquityPosition { get; set; }
}

/// <summary>Append-only ownership history. Phase 1 creates only the initial credit.</summary>
public sealed class EquityHoldingLedgerEntry
{
    public long Id { get; set; }
    public int EquityPositionId { get; set; }
    public EquityHoldingLedgerEventType EventType { get; set; }
    public DateTime EffectiveDate { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? ShareDelta { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? ResultingInvestorShares { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? ResultingTotalIssuedShares { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? ResultingOwnershipPercentage { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? ContractualOwnershipPercentage { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int OfferLegId { get; set; }
    public int? CorporateEventId { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? PreviousInvestorShares { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? PreviousTotalIssuedShares { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? PreviousOwnershipPercentage { get; set; }
    [StringLength(100)] public string? ShareClass { get; set; }
    public Guid? ActorUserId { get; set; }
    [Required, StringLength(30)] public string ActorType { get; set; } = "System";
    [StringLength(100)] public string? CorrelationId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public EquityPosition? EquityPosition { get; set; }
    public EquityCorporateEvent? CorporateEvent { get; set; }
}

/// <summary>Auditable capitalization change. Applied events are immutable.</summary>
public sealed class EquityCorporateEvent
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int? OpportunityId { get; set; }
    public EquityCorporateEventType EventType { get; set; }
    public EquityCorporateEventStatus Status { get; set; } = EquityCorporateEventStatus.Draft;
    public DateTime EffectiveDate { get; set; }
    public Guid InitiatedByUserId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public Guid? AppliedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? AppliedAt { get; set; }
    [Required, StringLength(2000)] public string Reason { get; set; } = string.Empty;
    [StringLength(4000)] public string? Notes { get; set; }
    [StringLength(100)] public string? CorrelationId { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? SharesIssued { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? ResultingTotalIssuedShares { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? SplitNumerator { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? SplitDenominator { get; set; }
    [StringLength(100)] public string? ShareClass { get; set; }
    [StringLength(10)] public string? Currency { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? PreMoneyValuation { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? PostMoneyValuation { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? PricePerShare { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? ExpectedTotalIssuedShares { get; set; }
    public int? ExpectedLatestAppliedEventId { get; set; }
    public string? BeforeCapitalizationSnapshotJson { get; set; }
    public string? AfterCapitalizationSnapshotJson { get; set; }
    [StringLength(128)] public string? BeforeSnapshotHash { get; set; }
    [StringLength(128)] public string? AfterSnapshotHash { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    public Project? Project { get; set; }
    public Opportunity? Opportunity { get; set; }
    public ICollection<EquityCorporateEventPosition> Positions { get; set; } = new List<EquityCorporateEventPosition>();
    public ICollection<EquityCapitalizationSnapshot> CapitalizationSnapshots { get; set; } = new List<EquityCapitalizationSnapshot>();
    public ICollection<EquityHoldingLedgerEntry> LedgerEntries { get; set; } = new List<EquityHoldingLedgerEntry>();
}

public sealed class EquityCorporateEventPosition
{
    public int EquityCorporateEventId { get; set; }
    public int EquityPositionId { get; set; }
    public bool IsNewPosition { get; set; }
    public EquityCorporateEvent? CorporateEvent { get; set; }
    public EquityPosition? EquityPosition { get; set; }
}

public sealed class EquityCapitalizationSnapshot
{
    public int Id { get; set; }
    public int EquityCorporateEventId { get; set; }
    public bool IsBefore { get; set; }
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
    [Column(TypeName = "decimal(18,6)")] public decimal TotalIssuedShares { get; set; }
    [StringLength(10)] public string? Currency { get; set; }
    [StringLength(128)] public string? SnapshotHash { get; set; }
    public EquityCorporateEvent? CorporateEvent { get; set; }
    public ICollection<EquityCapitalizationSnapshotHolder> Holders { get; set; } = new List<EquityCapitalizationSnapshotHolder>();
}

public sealed class EquityCapitalizationSnapshotHolder
{
    public long Id { get; set; }
    public int EquityCapitalizationSnapshotId { get; set; }
    public int EquityPositionId { get; set; }
    public Guid InvestorUserId { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal InvestorShares { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal OwnershipPercentage { get; set; }
    [StringLength(100)] public string? ShareClass { get; set; }
    public EquityCapitalizationSnapshot? Snapshot { get; set; }
    public EquityPosition? EquityPosition { get; set; }
}

// ===== PHASE 3: DIVIDENDS =====

public sealed class EquityDividendDeclaration
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int OpportunityId { get; set; }
    public EquityDividendStatus Status { get; set; } = EquityDividendStatus.Declared;
    public DateTime DeclarationDate { get; set; }
    public DateTime RecordDate { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    [Required, StringLength(10)] public string Currency { get; set; } = string.Empty;
    [StringLength(200)] public string DistributionBasis { get; set; } = "PerShare";
    [Column(TypeName = "decimal(18,6)")] public decimal? DividendPerShare { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? TotalDeclaredAmount { get; set; }
    [Required, StringLength(2000)] public string Reason { get; set; } = string.Empty;
    [StringLength(4000)] public string? Notes { get; set; }
    public Guid DeclaredByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    public Project? Project { get; set; }
    public Opportunity? Opportunity { get; set; }
    public AuthUser? DeclaredByUser { get; set; }
    public ICollection<EquityDividendEntitlement> Entitlements { get; set; } = new List<EquityDividendEntitlement>();
    public ICollection<EquityDividendDistributionDeclaration> Distributions { get; set; } = new List<EquityDividendDistributionDeclaration>();
}

public sealed class EquityDividendEntitlement
{
    public int Id { get; set; }
    public int DividendDeclarationId { get; set; }
    public int EquityPositionId { get; set; }
    public Guid InvestorUserId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int OfferLegId { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal EligibleShares { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal EligibleOwnershipPercentage { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal TotalIssuedSharesAtRecordDate { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal EntitlementAmount { get; set; }
    [Required, StringLength(10)] public string Currency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public EquityDividendDeclaration? DividendDeclaration { get; set; }
    public EquityPosition? EquityPosition { get; set; }
    public AuthUser? InvestorUser { get; set; }
    public ICollection<EquityDividendDistributionDeclaration> Distributions { get; set; } = new List<EquityDividendDistributionDeclaration>();
}

public sealed class EquityDividendDistributionDeclaration
{
    public int Id { get; set; }
    public int DividendDeclarationId { get; set; }
    public int DividendEntitlementId { get; set; }
    public Guid DeclaredByUserId { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Amount { get; set; }
    [Required, StringLength(10)] public string Currency { get; set; } = string.Empty;
    [StringLength(2000)] public string? Notes { get; set; }
    public EquityDividendDistributionStatus Status { get; set; } = EquityDividendDistributionStatus.PendingConfirmation;
    public DateTime DeclaredAt { get; set; } = DateTime.UtcNow;
    public EquityDividendDeclaration? DividendDeclaration { get; set; }
    public EquityDividendEntitlement? DividendEntitlement { get; set; }
    public AuthUser? DeclaredByUser { get; set; }
    public ICollection<EquityDividendDistributionConfirmation> Confirmations { get; set; } = new List<EquityDividendDistributionConfirmation>();
}

public sealed class EquityDividendDistributionConfirmation
{
    public int Id { get; set; }
    public int DistributionDeclarationId { get; set; }
    public Guid ConfirmedByUserId { get; set; }
    public bool IsConfirmed { get; set; }
    [StringLength(2000)] public string? Reason { get; set; }
    public DateTime ConfirmedAt { get; set; } = DateTime.UtcNow;
    public EquityDividendDistributionDeclaration? DistributionDeclaration { get; set; }
    public AuthUser? ConfirmedByUser { get; set; }
}

// ===== PHASE 3: TRANSFERS =====

public sealed class EquityTransfer
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int OpportunityId { get; set; }
    public int SourcePositionId { get; set; }
    public Guid SourceInvestorUserId { get; set; }
    public int? DestinationPositionId { get; set; }
    public Guid? DestinationInvestorUserId { get; set; }
    public EquityTransferType TransferType { get; set; }
    public EquityTransferStatus Status { get; set; } = EquityTransferStatus.Draft;
    [Column(TypeName = "decimal(18,6)")] public decimal Quantity { get; set; }
    public DateTime EffectiveDate { get; set; }
    public Guid InitiatedByUserId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public Guid? AppliedByUserId { get; set; }
    [StringLength(2000)] public string Reason { get; set; } = string.Empty;
    [StringLength(4000)] public string? Notes { get; set; }
    [StringLength(200)] public string? ExternalReference { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? SourceSharesBefore { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? SourceSharesAfter { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? DestinationSharesAfter { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? SourceOwnershipBefore { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? SourceOwnershipAfter { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? DestinationOwnershipAfter { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AppliedAt { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    public Project? Project { get; set; }
    public Opportunity? Opportunity { get; set; }
    public EquityPosition? SourcePosition { get; set; }
    public EquityPosition? DestinationPosition { get; set; }
    public AuthUser? SourceInvestor { get; set; }
    public AuthUser? DestinationInvestor { get; set; }
}

// ===== PHASE 3: CLOSURE =====

public sealed class EquityClosureSnapshot
{
    public int Id { get; set; }
    public int EquityPositionId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public Guid InvestorUserId { get; set; }
    public int ProjectId { get; set; }
    public int OpportunityId { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? InitialOwnershipPercentage { get; set; }
    [Column(TypeName = "decimal(9,6)")] public decimal? FinalOwnershipPercentage { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? InitialInvestorShares { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? FinalInvestorShares { get; set; }
    [Column(TypeName = "decimal(18,6)")] public decimal? TotalIssuedSharesAtClosure { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? TotalDistributionsConfirmed { get; set; }
    public DateTime FullyExitedAt { get; set; }
    public DateTime ClosedAt { get; set; } = DateTime.UtcNow;
    public Guid ClosedByUserId { get; set; }
    [Required, StringLength(2000)] public string ClosureReason { get; set; } = string.Empty;
    [StringLength(128)] public string? SnapshotHash { get; set; }
    public EquityPosition? EquityPosition { get; set; }
    public AuthUser? ClosedByUser { get; set; }
}
