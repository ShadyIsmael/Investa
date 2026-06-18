namespace Investa.Application.DTOs.Analytics;

/// <summary>
/// Top performing opportunity metrics
/// </summary>
public class TopPerformingOpportunityDto
{
    public int InvestmentId { get; set; }
    public string InvestmentName { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public int Views { get; set; }
    public int UniqueViews { get; set; }
    public int Requests { get; set; }
    public double ApprovalRate { get; set; }
    public double LearnMoreConversion { get; set; }
}
