using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Investment Opportunity - A fundraising campaign created by a founder
/// Supports multiple investment types: Founding, Equity, Revenue Sharing, and Loan/Debt
/// Includes exit strategy support for full investment lifecycle management
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
    /// Supports: Founding, Equity, Revenue Sharing, Loan/Debt
    /// </summary>
    [Required]
    public InvestmentType InvestmentTypeId { get; set; } = InvestmentType.Founding;

    /// <summary>
    /// Status of the investment opportunity (generic string for backward compatibility)
    /// Model-specific status enums are recommended for new implementations
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

    // ==================== Equity Exit Strategy Fields ====================
    
    /// <summary>
    /// Current company valuation (Equity type only)
    /// Used to track ownership value over time
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? CurrentValuation { get; set; }

    /// <summary>
    /// Estimated future company valuation at exit (Equity type only)
    /// Based on growth projections and market conditions
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? EstimatedFutureValuation { get; set; }

    /// <summary>
    /// Planned exit strategy type (Equity type only)
    /// Acquisition, IPO, Secondary Sale, Buyback, etc.
    /// </summary>
    public EquityExitType? EquityExitType { get; set; }

    /// <summary>
    /// Target date for planned exit event (Equity type only)
    /// Typically 3-7 years from investment
    /// </summary>
    public DateTime? ExitTargetDate { get; set; }

    /// <summary>
    /// Detailed description of expected exit strategy (Equity type only)
    /// Free text field for founders to explain exit plans
    /// </summary>
    [StringLength(1000)]
    public string? ExpectedExitStrategy { get; set; }

    // ==================== Revenue Sharing Exit Strategy Fields ====================
    
    /// <summary>
    /// Start date of revenue sharing contract (Revenue Sharing type only)
    /// When revenue distributions begin
    /// </summary>
    public DateTime? ContractStartDate { get; set; }

    /// <summary>
    /// End date of revenue sharing contract (Revenue Sharing type only)
    /// When the agreement expires
    /// </summary>
    public DateTime? ContractEndDate { get; set; }

    /// <summary>
    /// Total expected payout amount to investors over contract life (Revenue Sharing type only)
    /// Sum of all planned revenue distributions
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TotalExpectedPayout { get; set; }

    /// <summary>
    /// Remaining payout amount to be distributed (Revenue Sharing type only)
    /// Decreases as payouts are made
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? RemainingPayoutAmount { get; set; }

    /// <summary>
    /// Frequency of revenue distribution (Revenue Sharing type only)
    /// Monthly, Quarterly, Semi-Annually, Annually
    /// </summary>
    [StringLength(50)]
    public string? RevenueDistributionFrequency { get; set; }

    /// <summary>
    /// Contract completion status (Revenue Sharing type only)
    /// Tracks progress of payout schedule
    /// </summary>
    [StringLength(50)]
    public string? ContractCompletionStatus { get; set; }

    // ==================== Loan/Debt Exit Strategy Fields ====================
    
    /// <summary>
    /// Start date of loan repayment schedule (Loan type only)
    /// When repayments begin
    /// </summary>
    public DateTime? RepaymentStartDate { get; set; }

    /// <summary>
    /// Final repayment date when loan is fully matured (Loan type only)
    /// End of repayment schedule
    /// </summary>
    public DateTime? FinalRepaymentDate { get; set; }

    /// <summary>
    /// Remaining principal balance to be repaid (Loan type only)
    /// Decreases as repayments are made
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? RemainingBalance { get; set; }

    /// <summary>
    /// Total amount paid so far (principal + interest) (Loan type only)
    /// Tracks cumulative repayments
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TotalPaidAmount { get; set; }

    /// <summary>
    /// Date of next scheduled installment payment (Loan type only)
    /// Updated after each payment
    /// </summary>
    public DateTime? NextInstallmentDate { get; set; }

    /// <summary>
    /// Default risk level assessment (Loan type only)
    /// Low, Medium, High based on creditworthiness
    /// </summary>
    [StringLength(20)]
    public string? DefaultRiskLevel { get; set; }

    /// <summary>
    /// Loan completion status (Loan type only)
    /// Tracks progress of repayment schedule
    /// </summary>
    [StringLength(50)]
    public string? LoanCompletionStatus { get; set; }

    // ==================== Navigation Properties ====================
    
    /// <summary>
    /// The founder/creator of this investment opportunity
    /// </summary>
    [ForeignKey(nameof(FounderId))]
    public AuthUser Founder { get; set; } = null!;

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
