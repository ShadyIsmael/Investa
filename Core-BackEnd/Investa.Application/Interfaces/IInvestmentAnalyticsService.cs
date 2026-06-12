using Investa.Application.DTOs.Analytics;

namespace Investa.Application.Interfaces;

/// <summary>
/// Service for investment analytics and metrics
/// </summary>
public interface IInvestmentAnalyticsService
{
    /// <summary>
    /// Records a view for an investment
    /// </summary>
    Task RecordViewAsync(int investmentId, Guid? userId, string? userIp, string? userAgent);

    /// <summary>
    /// Records a "Learn More" click for an investment
    /// </summary>
    Task RecordLearnMoreAsync(int investmentId, Guid? userId, string? userIp, string? userAgent);

    /// <summary>
    /// Gets summary analytics for a founder
    /// </summary>
    Task<FounderSummaryDto> GetFounderSummaryAsync(Guid founderId, DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Gets performance metrics for a specific investment
    /// </summary>
    Task<InvestmentPerformanceDto> GetInvestmentMetricsAsync(int investmentId, DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Gets performance metrics for all opportunities of a founder
    /// </summary>
    Task<IEnumerable<InvestmentPerformanceDto>> GetOpportunitiesPerformanceAsync(Guid founderId, DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Gets top performing opportunities for a founder
    /// </summary>
    Task<IEnumerable<TopPerformingOpportunityDto>> GetTopPerformingOpportunitiesAsync(Guid founderId, int limit, DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Gets low performing opportunities for a founder
    /// </summary>
    Task<IEnumerable<LowPerformingOpportunityDto>> GetLowPerformingOpportunitiesAsync(Guid founderId, int limit, DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Gets conversion funnel metrics for a founder
    /// </summary>
    Task<ConversionFunnelDto> GetConversionFunnelAsync(Guid founderId, DateTime? startDate, DateTime? endDate);
}
