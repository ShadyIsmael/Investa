namespace Investa.Application.DTOs;

public class CreateInvestmentDto
{
    public Guid InvestorId { get; set; }
    public decimal Amount { get; set; }

    // Opportunity fields (required for creation)
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
}