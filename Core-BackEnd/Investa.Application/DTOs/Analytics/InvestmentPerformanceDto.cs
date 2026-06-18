namespace Investa.Application.DTOs.Analytics;

/// <summary>
/// Performance metrics for a single investment opportunity
/// </summary>
public class InvestmentPerformanceDto
{
    public int InvestmentId { get; set; }
    public string InvestmentName { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string InvestmentType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public int TotalViews { get; set; }
    public int UniqueViews { get; set; }
    public int LearnMoreOpens { get; set; }
    public int UniqueLearnMoreOpens { get; set; }
    public int RequestsReceived { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public int ActiveChats { get; set; }
}
