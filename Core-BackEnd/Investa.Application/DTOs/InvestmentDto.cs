using System;

namespace Investa.Application.DTOs;

public class InvestmentDto
{
    public int Id { get; set; }
    public Guid InvestorId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }

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
    // Combined founder display: "First Last - BusinessRole" or fallback to User.Name
    public string? FounderDisplay { get; set; }

    // Credibility score for the investor (based on User or Client data)
    public int CredibilityScore { get; set; }
}
