using Investa.Domain;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Opportunity
{
    public int Id { get; set; }

    [Required]
    public int ProjectId { get; set; }

    /// <summary>Stable one-based ordering of opportunities within their Project.</summary>
    public int SequenceNumber { get; set; }

    /// <summary>Founder-facing reason for this distinct opportunity.</summary>
    [Required]
    [StringLength(200)]
    public string Purpose { get; set; } = "General funding";

    /// <summary>Opportunity classification; independent from its investment instrument.</summary>
    [Required]
    [StringLength(80)]
    public string Type { get; set; } = "Opportunity";

    [Required]
    public Guid FounderId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(300)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string UseOfFunds { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal FundingTarget { get; set; }

    public int? FundingGoalId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinimumInvestmentAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaximumInvestmentAmount { get; set; }

    public int? ExpectedDurationMonths { get; set; }

    /// <summary>Authoritative currency for all project calculations and settlement.</summary>
    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;

    /// <summary>Backward-compatible alias. New code must use FundingCurrency.</summary>
    [NotMapped]
    public string? Currency
    {
        get => FundingCurrency;
        set => FundingCurrency = string.IsNullOrWhiteSpace(value) ? "EGP" : value.Trim().ToUpperInvariant();
    }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? SharePrice { get; set; }

    public int? TotalShares { get; set; }

    public int? OfferedShares { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? EquityOfferedPercentage { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitSharePercentage { get; set; }

    [StringLength(50)]
    public string? ProfitSharingPayoutFrequency { get; set; }

    public DateTime? ProfitSharingContractStartDate { get; set; }

    public DateTime? ProfitSharingContractEndDate { get; set; }

    // Loan Model Fields
    [Column(TypeName = "decimal(5,2)")]
    public decimal? InterestRate { get; set; }

    [StringLength(50)]
    public string? RepaymentFrequency { get; set; }

    public DateTime? FinalRepaymentDate { get; set; }

    [Required]
    public InvestmentModel InvestmentModel { get; set; } = InvestmentModel.Unspecified;

    [Required]
    public ProjectStage ProjectStage { get; set; }

    /// <summary>
    /// Founder-supplied lifecycle milestone label when <see cref="ProjectStage"/> is Other.
    /// This is project context and is never an investment instrument or OfferLeg term.
    /// </summary>
    [StringLength(120)]
    public string? ProjectStageCustomName { get; set; }

    /// <summary>
    /// Persisted canonical form used exclusively for the project-scoped unique constraint.
    /// </summary>
    [StringLength(120)]
    public string? ProjectStageCustomNameNormalized { get; set; }

    [Required]
    public OpportunityStatus Status { get; set; } = OpportunityStatus.Draft;

    public OpportunityModerationStatus ModerationStatus { get; set; } = OpportunityModerationStatus.Draft;

    public OpportunityFundingStatus FundingStatus { get; set; } = OpportunityFundingStatus.NotScheduled;

    public DateTime? FundingOpensAt { get; set; }

    public DateTime? FundingClosesAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public OpportunityClosureReason? ClosureReason { get; set; }

    public ObligationCompletionStatus ObligationCompletionStatus { get; set; } = ObligationCompletionStatus.NotStarted;

    [StringLength(1000)]
    public string? CoverImageUrl { get; set; }

    public bool IsLockedForEditing { get; set; }

    public DateTime? FirstInvestorJoinedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OpportunityMedia> Media { get; set; } = new List<OpportunityMedia>();

    public ICollection<OpportunityDocument> Documents { get; set; } = new List<OpportunityDocument>();

    public ICollection<OpportunityEvent> Events { get; set; } = new List<OpportunityEvent>();

    public ICollection<OpportunityJoinRequest> JoinRequests { get; set; } = new List<OpportunityJoinRequest>();

    public FundingGoal? FundingGoal { get; set; }

    public Project? Project { get; set; }

    public ICollection<OpportunityTagAssignment> OpportunityTags { get; set; } = new List<OpportunityTagAssignment>();

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];
}
