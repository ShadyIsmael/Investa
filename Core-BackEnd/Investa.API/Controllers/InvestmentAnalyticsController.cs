using Investa.Application.DTOs.Analytics;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/investments/analytics")]
[Authorize(Roles = "Client")]
public class InvestmentAnalyticsController : ControllerBase
{
    private readonly IInvestmentAnalyticsService _analyticsService;

    public InvestmentAnalyticsController(IInvestmentAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Records a view for an investment
    /// </summary>
    [HttpPost("{id:int}/view")]
    public async Task<IActionResult> RecordView(int id)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        await _analyticsService.RecordViewAsync(id, userId, userIp, userAgent);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Records a "Learn More" click for an investment
    /// </summary>
    [HttpPost("{id:int}/learn-more")]
    public async Task<IActionResult> RecordLearnMore(int id)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        await _analyticsService.RecordLearnMoreAsync(id, userId, userIp, userAgent);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Gets founder summary analytics
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetFounderSummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var summary = await _analyticsService.GetFounderSummaryAsync(userId, startDate, endDate);
        return Ok(new { success = true, data = summary });
    }

    /// <summary>
    /// Gets performance metrics for a specific investment
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetInvestmentMetrics(int id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var metrics = await _analyticsService.GetInvestmentMetricsAsync(id, startDate, endDate);
        return Ok(new { success = true, data = metrics });
    }

    /// <summary>
    /// Gets performance metrics for all opportunities of the founder
    /// </summary>
    [HttpGet("opportunities")]
    public async Task<IActionResult> GetOpportunitiesPerformance([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var opportunities = await _analyticsService.GetOpportunitiesPerformanceAsync(userId, startDate, endDate);
        return Ok(new { success = true, data = opportunities });
    }

    /// <summary>
    /// Gets top performing opportunities
    /// </summary>
    [HttpGet("top-performing")]
    public async Task<IActionResult> GetTopPerformingOpportunities([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] int limit = 5)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var topPerforming = await _analyticsService.GetTopPerformingOpportunitiesAsync(userId, limit, startDate, endDate);
        return Ok(new { success = true, data = topPerforming });
    }

    /// <summary>
    /// Gets low performing opportunities
    /// </summary>
    [HttpGet("low-performing")]
    public async Task<IActionResult> GetLowPerformingOpportunities([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] int limit = 5)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var lowPerforming = await _analyticsService.GetLowPerformingOpportunitiesAsync(userId, limit, startDate, endDate);
        return Ok(new { success = true, data = lowPerforming });
    }

    /// <summary>
    /// Gets conversion funnel metrics
    /// </summary>
    [HttpGet("conversion-funnel")]
    public async Task<IActionResult> GetConversionFunnel([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var funnel = await _analyticsService.GetConversionFunnelAsync(userId, startDate, endDate);
        return Ok(new { success = true, data = funnel });
    }
}
