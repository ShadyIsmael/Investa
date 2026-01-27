using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class CreateInvestmentDto
{
    // Founder creating the opportunity
    public Guid FounderId { get; set; }
    public decimal InitialCapital { get; set; }

    // Opportunity basic fields
    public string BusinessName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public int BusinessStageId { get; set; }
    public int BusinessCategoryId { get; set; }
    public int? ProjectPhaseId { get; set; }
    public string Milestone { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public decimal TargetFund { get; set; }
    public string Currency { get; set; } = string.Empty;

    // Equity crowdfunding fields
    public decimal SharePrice { get; set; }
    public int TotalShares { get; set; }
    public decimal? MinInvestment { get; set; }
    public decimal? MaxInvestment { get; set; }
    public decimal? ValuationCap { get; set; }
    public decimal? ExpectedROI { get; set; }
    public InvestmentType? InvestmentTypeId { get; set; } // Founding or Equity
    public DateTime? EndDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
}