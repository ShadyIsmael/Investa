using System;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class UpdateInvestmentDto
{
    public decimal? InitialCapital { get; set; }

    // Opportunity fields
    public string? BusinessName { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }
    public int? ProjectPhaseId { get; set; }
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
    public decimal? ExpectedROI { get; set; }
    public InvestmentType? InvestmentTypeId { get; set; }
    public string? Status { get; set; } // Draft, Active, Funded, Closed
    public DateTime? EndDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }

    // Founding-specific fields
    public int? DurationMonths { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public string? PayoutFrequency { get; set; }
}
