using Investa.Application.DTOs.Finance;
using Investa.Application.Services.Finance;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Finance;

[ApiController]
[Route("api/v1/admin/company-finance/overview")]
[Authorize]
[Produces("application/json")]
public sealed class FinanceOverviewController : ControllerBase
{
    private readonly IFinanceOverviewService _overviewService;
    private readonly ILogger<FinanceOverviewController> _logger;

    public FinanceOverviewController(
        IFinanceOverviewService overviewService,
        ILogger<FinanceOverviewController> logger)
    {
        _overviewService = overviewService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Permissions = SystemPermissions.FinanceView)]
    [ProducesResponseType(typeof(FinanceOverviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FinanceOverviewDto>> GetOverview(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int? accountId,
        [FromQuery] string? currency,
        CancellationToken cancellationToken)
    {
        var today = DateTime.Today;
        var from = dateFrom.HasValue
            ? DateOnly.FromDateTime(dateFrom.Value.Date)
            : new DateOnly(today.Year, today.Month, 1);
        var to = dateTo.HasValue
            ? DateOnly.FromDateTime(dateTo.Value.Date)
            : DateOnly.FromDateTime(today);

        if (from > to)
        {
            return BadRequest("dateFrom must be earlier than or equal to dateTo.");
        }

        try
        {
            var overview = await _overviewService.GetOverviewAsync(new FinanceOverviewQuery
            {
                DateFrom = from,
                DateTo = to,
                AccountId = accountId,
                Currency = currency
            }, cancellationToken);

            return Ok(overview);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving company finance overview");
            return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
        }
    }
}
