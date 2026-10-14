using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public sealed class ProfitSharingObligation
{
    public int Id { get; set; }
    public int ParticipationRequestId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int AcceptedOfferVersionNumber { get; set; }
    public int OfferLegId { get; set; }
    public int OfferLegNumber { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ContributionAmount { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    [Column(TypeName = "decimal(5,2)")]
    public decimal ProfitSharePercentage { get; set; }

    [Required, StringLength(30)]
    public string ReportingFrequency { get; set; } = string.Empty;

    public ProfitSharingCalculationBasis CalculationBasis { get; set; } = ProfitSharingCalculationBasis.Undefined;
    public DateTime ContractualStartDate { get; set; }
    public DateTime ContractualEndDate { get; set; }
    public ProfitSharingObligationStatus Status { get; set; } = ProfitSharingObligationStatus.PendingFunding;
    public DateTime? ActivatedAt { get; set; }
    public DateTime? MaturedAt { get; set; }
    public DateTime? SettledAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public Guid? ClosedByUserId { get; set; }
    [StringLength(2000)] public string? ClosureReason { get; set; }
    public string? ClosureSnapshotJson { get; set; }
    [StringLength(64)] public string? ClosureSnapshotHash { get; set; }
    [StringLength(30)] public string? ClosureSnapshotVersion { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public OpportunityJoinRequest? ParticipationRequest { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? ContractVersion { get; set; }
    public Chat.NegotiationOffer? AcceptedOffer { get; set; }
    public Chat.NegotiationOfferLeg? OfferLeg { get; set; }
    public AuthUser? FounderUser { get; set; }
    public AuthUser? InvestorUser { get; set; }
    public ICollection<ProfitSharingReportingPeriod> ReportingPeriods { get; set; } = new List<ProfitSharingReportingPeriod>();
    public ICollection<ProfitSharingDistributionDeclaration> DistributionDeclarations { get; set; } = new List<ProfitSharingDistributionDeclaration>();
    public ICollection<ProfitSharingDistributionAllocation> DistributionAllocations { get; set; } = new List<ProfitSharingDistributionAllocation>();
}

public sealed class ProfitSharingReportingPeriod
{
    public int Id { get; set; }
    public int ProfitSharingObligationId { get; set; }
    public int PeriodNumber { get; set; }
    public bool IsFinalPeriod { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? ReportingDueDate { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    public ProfitSharingReportingPeriodStatus Status { get; set; } = ProfitSharingReportingPeriodStatus.Upcoming;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ProfitSharingObligation? Obligation { get; set; }
    public ProfitSharingPeriodDeclaration? Declaration { get; set; }
    public ProfitSharingEntitlement? Entitlement { get; set; }
    public ICollection<ProfitSharingDistributionDeclaration> DistributionDeclarations { get; set; } = new List<ProfitSharingDistributionDeclaration>();
}

public sealed class ProfitSharingPeriodDeclaration
{
    public int Id { get; set; }
    public int ProfitSharingObligationId { get; set; }
    public int ReportingPeriodId { get; set; }
    public int ParticipationId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }
    public ProfitSharingCalculationBasis CalculationBasis { get; set; } = ProfitSharingCalculationBasis.Undefined;

    [Column(TypeName = "decimal(18,2)")]
    public decimal DeclaredBasisAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DeclaredResultAmount { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    public DateTime DeclarationDate { get; set; }
    [StringLength(200)] public string? ExternalReference { get; set; }
    [StringLength(2000)] public string? Notes { get; set; }
    [StringLength(64)] public string? SupportingEvidenceFileId { get; set; }
    public Guid DeclaredByUserId { get; set; }
    public DateTime DeclaredAt { get; set; } = DateTime.UtcNow;
    public ProfitSharingDeclarationStatus Status { get; set; } = ProfitSharingDeclarationStatus.Declared;
    [StringLength(200)] public string? IdempotencyKey { get; set; }
    [StringLength(500)] public string? CalculationError { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];

    public ProfitSharingObligation? Obligation { get; set; }
    public ProfitSharingReportingPeriod? ReportingPeriod { get; set; }
    public OpportunityJoinRequest? Participation { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? ContractVersion { get; set; }
    public StoredFile? SupportingEvidenceFile { get; set; }
    public ProfitSharingEntitlement? Entitlement { get; set; }
}

public sealed class ProfitSharingEntitlement
{
    public int Id { get; set; }
    public int ProfitSharingObligationId { get; set; }
    public int ReportingPeriodId { get; set; }
    public int DeclarationId { get; set; }
    public ProfitSharingCalculationBasis CalculationBasis { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BasisAmount { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal ProfitSharePercentage { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EntitlementAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DistributionOutstanding { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    [Required, StringLength(30)]
    public string CalculationVersion { get; set; } = "profit-share-v1";
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    [Column(TypeName = "decimal(18,2)")]
    public decimal PendingDistributionAmount { get; set; }
    public ProfitSharingObligation? Obligation { get; set; }
    public ProfitSharingReportingPeriod? ReportingPeriod { get; set; }
    public ProfitSharingPeriodDeclaration? Declaration { get; set; }
    public ICollection<ProfitSharingDistributionAllocation> DistributionAllocations { get; set; } = new List<ProfitSharingDistributionAllocation>();
}

public sealed class ProfitSharingDistributionDeclaration
{
    public int Id { get; set; }
    public int ProfitSharingObligationId { get; set; }
    public int ReportingPeriodId { get; set; }
    public int EntitlementId { get; set; }
    public int ParticipationId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int AcceptedOfferVersionNumber { get; set; }
    public int OfferLegId { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DeclaredAmount { get; set; }
    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;
    public DateTime DeclaredAt { get; set; } = DateTime.UtcNow;
    [StringLength(200)] public string? ExternalReference { get; set; }
    [StringLength(2000)] public string? Notes { get; set; }
    [StringLength(64)] public string? SupportingEvidenceFileId { get; set; }
    public Guid DeclaredByUserId { get; set; }
    public ProfitSharingDistributionDeclarationStatus Status { get; set; } = ProfitSharingDistributionDeclarationStatus.PendingConfirmation;
    public DateTime? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
    [StringLength(2000)] public string? ConfirmationComment { get; set; }
    [StringLength(2000)] public string? DisputeReason { get; set; }
    [StringLength(100)] public string? IdempotencyKey { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];

    public ProfitSharingObligation? Obligation { get; set; }
    public ProfitSharingReportingPeriod? ReportingPeriod { get; set; }
    public ProfitSharingEntitlement? Entitlement { get; set; }
    public OpportunityJoinRequest? Participation { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? ContractVersion { get; set; }
    public Chat.NegotiationOffer? AcceptedOffer { get; set; }
    public Chat.NegotiationOfferLeg? OfferLeg { get; set; }
    public AuthUser? FounderUser { get; set; }
    public AuthUser? InvestorUser { get; set; }
    public StoredFile? SupportingEvidenceFile { get; set; }
    public ProfitSharingDistributionAllocation? Allocation { get; set; }
}

public sealed class ProfitSharingDistributionAllocation
{
    public int Id { get; set; }
    public int ProfitSharingDistributionDeclarationId { get; set; }
    public int ProfitSharingObligationId { get; set; }
    public int ReportingPeriodId { get; set; }
    public int EntitlementId { get; set; }
    public Guid InvestorUserId { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;
    public DateTime ConfirmedAt { get; set; } = DateTime.UtcNow;
    public Guid DecisionActorId { get; set; }

    public ProfitSharingDistributionDeclaration? Declaration { get; set; }
    public ProfitSharingObligation? Obligation { get; set; }
    public ProfitSharingReportingPeriod? ReportingPeriod { get; set; }
    public ProfitSharingEntitlement? Entitlement { get; set; }
    public AuthUser? InvestorUser { get; set; }
}
