namespace Investa.Application.DTOs.Analytics;

/// <summary>
/// Summary metrics for a founder's analytics dashboard
/// </summary>
public class FounderSummaryDto
{
    public int TotalOpportunities { get; set; }
    public int PublishedOpportunities { get; set; }
    public int TotalViews { get; set; }
    public int UniqueViews { get; set; }
    public int LearnMoreOpens { get; set; }
    public int UniqueLearnMoreOpens { get; set; }
    public int RequestsReceived { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public double ApprovalRate { get; set; }
    public int ActiveConversations { get; set; }
}
