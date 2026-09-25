using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/founder/dashboard")]
public sealed class FounderDashboardController(IFounderDashboardService dashboard) : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<FounderDashboardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] DateTime? fromUtc = null, [FromQuery] DateTime? toUtc = null, CancellationToken cancellationToken = default)
    {
        var claim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(claim, out var founderId)) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await dashboard.GetAsync(founderId, fromUtc, toUtc, cancellationToken)); }
        catch (BusinessValidationException ex) when (ex.Code == "FOUNDER_ACCESS_REQUIRED") { return ErrorResponse(ex.Message, 403); }
    }
}
