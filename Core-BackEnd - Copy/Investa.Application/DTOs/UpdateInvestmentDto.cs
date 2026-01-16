using System;

namespace Investa.Application.DTOs;

public class UpdateInvestmentDto
{
    public decimal? Amount { get; set; }

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
}
