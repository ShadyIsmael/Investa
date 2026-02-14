using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Investment Opportunity - A fundraising campaign created by a founder
/// Supports equity crowdfunding with share-based investments
/// </summary>
public class Investment
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// The user who created this investment opportunity (founder/business owner)
    /// </summary>
    [Required]
    public Guid FounderId { get; set; }

    /// <summary>
    /// Founder's initial capital contribution to the business
    /// </summary>
    [Required]
    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal InitialCapital { get; set; }

    [Required]
    public DateTime Date { get; set; }

    // ==================== Financial Structure (Equity Crowdfunding) ====================
    
    /// <summary>
    /// Price per share in the investment opportunity
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? SharePrice { get; set; }

    /// <summary>
    /// Total number of shares available for this investment round
    /// </summary>
    public int? TotalShares { get; set; }

    /// <summary>
    /// Number of shares still available for purchase
    /// </summary>
    public int? AvailableShares { get; set; }

    /// <summary>
    /// Minimum investment amount per investor
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinInvestment { get; set; }

    /// <summary>
    /// Maximum investment amount per investor (regulatory compliance)
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxInvestment { get; set; }

    /// <summary>
    /// Company valuation cap for this investment round
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? ValuationCap { get; set; }

    /// <summary>
    /// Expected return on investment (percentage)
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal? ExpectedROI { get; set; }

    /// <summary>
    /// Type of investment using strongly-typed enum.
    /// Default is Founding (initial capital by founder).
    /// Supports extensible type system for future investment types.
    /// </summary>
    [Required]
    public InvestmentType InvestmentTypeId { get; set; } = InvestmentType.Founding;

    /// <summary>
    /// Status of the investment opportunity: Draft, Active, Funded, Closed
    /// </summary>
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // ==================== Opportunity Details ====================
    
    [StringLength(200)]
    public string? BusinessName { get; set; }

    public string? Description { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? VideoUrl { get; set; }

    // ==================== Classification ====================
    
    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }
    public int? ProjectPhaseId { get; set; }

    /// <summary>
    /// Total fundraising target
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TargetFund { get; set; }

    [StringLength(200)]
    public string? Milestone { get; set; }

    [StringLength(50)]
    public string? RiskLevel { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    // ==================== Timeline ====================
    
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// End date for the investment opportunity
    /// </summary>
    public DateTime? EndDate { get; set; }

    // ==================== Founding-Specific Fields ====================
    
    /// <summary>
    /// Duration of the investment in months (Founding type only)
    /// </summary>
    public int? DurationMonths { get; set; }

    /// <summary>
    /// Profit percentage for investors (Founding type only)
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitPercentage { get; set; }

    /// <summary>
    /// Payout frequency: Monthly, Quarterly, Semi-Annually, Annually, At Maturity (Founding type only)
    /// </summary>
    [StringLength(50)]
    public string? PayoutFrequency { get; set; }

    // ==================== Navigation Properties ====================
    
    /// <summary>
    /// The founder/creator of this investment opportunity
    /// </summary>
    [ForeignKey(nameof(FounderId))]
    public User Founder { get; set; } = null!;

    /// <summary>
    /// List of investors who have invested in this opportunity
    /// </summary>
    public ICollection<InvestmentParticipant> Participants { get; set; } = new List<InvestmentParticipant>();

    /// <summary>
    /// Team members/founders associated with this investment opportunity
    /// </summary>
    public ICollection<InvestmentTeamMember> TeamMembers { get; set; } = new List<InvestmentTeamMember>();

    /// <summary>
    /// Images associated with this investment opportunity (gallery)
    /// </summary>
    public ICollection<InvestmentImage> Images { get; set; } = new List<InvestmentImage>();
}