using System;
using System.Collections.Generic;
using System.Linq;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

/// <summary>
/// Investment Opportunity DTO with exit strategy support
/// Supports Founding, Equity, Revenue Sharing, and Loan/Debt investment types
/// </summary>
public class InvestmentDto
{
    public int Id { get; set; }
    public Guid FounderId { get; set; }
    public string? FounderDisplay { get; set; }
    public string? BusinessRole { get; set; }
    
    // Financial Structure
    public decimal? SharePrice { get; set; }
    public int? TotalShares { get; set; }
    public int? AvailableShares { get; set; }
    public int? SoldShares => TotalShares.HasValue && AvailableShares.HasValue 
        ? TotalShares.Value - AvailableShares.Value 
        : null;
    
    public decimal? MinInvestment { get; set; }
    public decimal? MaxInvestment { get; set; }
    public decimal? ValuationCap { get; set; }
    public decimal? ExpectedROI { get; set; }
    public InvestmentType InvestmentTypeId { get; set; }
    public string Status { get; set; } = "Draft";
    
    // Amounts
    public decimal InitialCapital { get; set; }
    public decimal CurrentFunding => Participants?.Sum(p => p.AmountInvested) ?? 0;
    public decimal? TargetFund { get; set; }
    public decimal FundingPercentage => TargetFund.HasValue && TargetFund.Value > 0 
        ? (CurrentFunding / TargetFund.Value) * 100 
        : 0;
    
    // Dates
    public DateTime Date { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Opportunity details
    public string? BusinessName { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }
    public string? BusinessCategoryName { get; set; }
    // Arabic value for BusinessCategory (optional)
    public string? BusinessCategoryNameAr { get; set; }
    public int? ProjectPhaseId { get; set; }
    public string? Milestone { get; set; }
    public string? RiskLevel { get; set; }
    public string? Currency { get; set; }
    public int MomentumScore { get; set; }
    public string MomentumLabel => MomentumScore switch
    {
        >= 8000 => "Strong Momentum",
        >= 6500 => "Trending Opportunity",
        >= 4500 => "Highly Active",
        >= 2500 => "Recently Updated",
        _ => "Building Momentum"
    };
    public DateTime? LastActivityAt { get; set; }
    public int PublicActivityCount { get; set; }
    public int ParticipantOnlyActivityCount { get; set; }
    public string VisibilityLabel => ParticipantOnlyActivityCount > 0
        ? "Participant Updates Available"
        : "Public Overview";
    
    // Founding-specific fields
    public int? DurationMonths { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public string? PayoutFrequency { get; set; }
    
    // Social Proof
    public int CredibilityScore { get; set; }
    
    /// <summary>
    /// Team members/founders associated with this investment opportunity
    /// </summary>
    public List<TeamMemberDto>? TeamMembers { get; set; }
    public int InvestorCount => Participants?.Count ?? 0;

    /// <summary>
    /// The total amount invested by the current (requesting) user in this investment.
    /// Set by the API controller during DTO enrichment when user context is available.
    /// </summary>
    public decimal? InvestedAmount { get; set; }

    public List<InvestorParticipationDto>? Participants { get; set; }

    /// <summary>
    /// Whether the current user has favorited this investment.
    /// </summary>
    public bool Favorited { get; set; }

    /// <summary>
    /// Image gallery associated with the investment opportunity
    /// </summary>
    public List<InvestmentImageDto>? Images { get; set; }

    // ==================== Equity Exit Strategy Fields ====================
    
    /// <summary>
    /// Current company valuation (Equity type only)
    /// </summary>
    public decimal? CurrentValuation { get; set; }

    /// <summary>
    /// Estimated future company valuation at exit (Equity type only)
    /// </summary>
    public decimal? EstimatedFutureValuation { get; set; }

    /// <summary>
    /// Planned exit strategy type (Equity type only)
    /// </summary>
    public EquityExitType? EquityExitType { get; set; }

    /// <summary>
    /// Target date for planned exit event (Equity type only)
    /// </summary>
    public DateTime? ExitTargetDate { get; set; }

    /// <summary>
    /// Detailed description of expected exit strategy (Equity type only)
    /// </summary>
    public string? ExpectedExitStrategy { get; set; }

    // ==================== Revenue Sharing Exit Strategy Fields ====================
    
    /// <summary>
    /// Start date of revenue sharing contract (Revenue Sharing type only)
    /// </summary>
    public DateTime? ContractStartDate { get; set; }

    /// <summary>
    /// End date of revenue sharing contract (Revenue Sharing type only)
    /// </summary>
    public DateTime? ContractEndDate { get; set; }

    /// <summary>
    /// Total expected payout amount (Revenue Sharing type only)
    /// </summary>
    public decimal? TotalExpectedPayout { get; set; }

    /// <summary>
    /// Remaining payout amount to be distributed (Revenue Sharing type only)
    /// </summary>
    public decimal? RemainingPayoutAmount { get; set; }

    /// <summary>
    /// Frequency of revenue distribution (Revenue Sharing type only)
    /// </summary>
    public string? RevenueDistributionFrequency { get; set; }

    /// <summary>
    /// Contract completion status (Revenue Sharing type only)
    /// </summary>
    public string? ContractCompletionStatus { get; set; }

    // ==================== Loan/Debt Exit Strategy Fields ====================
    
    /// <summary>
    /// Start date of loan repayment schedule (Loan type only)
    /// </summary>
    public DateTime? RepaymentStartDate { get; set; }

    /// <summary>
    /// Final repayment date when loan is fully matured (Loan type only)
    /// </summary>
    public DateTime? FinalRepaymentDate { get; set; }

    /// <summary>
    /// Remaining principal balance to be repaid (Loan type only)
    /// </summary>
    public decimal? RemainingBalance { get; set; }

    /// <summary>
    /// Total amount paid so far (principal + interest) (Loan type only)
    /// </summary>
    public decimal? TotalPaidAmount { get; set; }

    /// <summary>
    /// Date of next scheduled installment payment (Loan type only)
    /// </summary>
    public DateTime? NextInstallmentDate { get; set; }

    /// <summary>
    /// Default risk level assessment (Loan type only)
    /// </summary>
    public string? DefaultRiskLevel { get; set; }

    /// <summary>
    /// Loan completion status (Loan type only)
    /// </summary>
    public string? LoanCompletionStatus { get; set; }
}
