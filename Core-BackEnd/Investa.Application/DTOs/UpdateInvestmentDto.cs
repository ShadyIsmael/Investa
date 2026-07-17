using System;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

/// <summary>
/// DTO for updating investment opportunities with exit strategy support
/// </summary>
public class UpdateInvestmentDto
{
    public decimal? InitialCapital { get; set; }

    // Opportunity fields
    public string? BusinessName { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? UseOfFunds { get; set; }
    public DateTime? StartDate { get; set; }
    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }
    public int? ProjectPhaseId { get; set; }
    public int? FundingGoalId { get; set; }
    public IReadOnlyList<int>? TagIds { get; set; }
    public decimal? TargetFund { get; set; }

    public string? Milestone { get; set; }
    public string? RiskLevel { get; set; }
    public string? Currency { get; set; }

    // Equity crowdfunding fields
    public decimal? SharePrice { get; set; }
    public int? TotalShares { get; set; }
    public decimal? MinInvestment { get; set; }
    public decimal? MaxInvestment { get; set; }
    public decimal? ValuationCap { get; set; }
    public decimal? EquityOfferedPercentage { get; set; }
    public decimal? ExpectedROI { get; set; }
    public InvestmentType? InvestmentTypeId { get; set; }
    public string? Status { get; set; } // Draft, Active, Funded, Closed, or model-specific statuses
    public DateTime? EndDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }

    // Founding-specific fields
    public int? DurationMonths { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public string? PayoutFrequency { get; set; }

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
