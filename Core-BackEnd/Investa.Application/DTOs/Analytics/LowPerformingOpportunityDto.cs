namespace Investa.Application.DTOs.Analytics;

/// <summary>
/// Low performing opportunity metrics
/// </summary>
public class LowPerformingOpportunityDto
{
    public int InvestmentId { get; set; }
    public string InvestmentName { get; set; } = string.Empty;
    public int Views { get; set; }
    public int UniqueViews { get; set; }
    public int LearnMore { get; set; }
    public int UniqueLearnMore { get; set; }
    public int Requests { get; set; }
}
