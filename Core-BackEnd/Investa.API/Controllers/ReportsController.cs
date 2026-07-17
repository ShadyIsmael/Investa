using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/reports")]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ReportDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateReportRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var report = await _reportService.CreateAsync(userId.Value, request, cancellationToken);
            return SuccessResponse(report, "Report submitted successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("my")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ReportDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var reports = await _reportService.GetMineAsync(userId.Value, cancellationToken);
        return SuccessResponse(reports);
    }

    private Guid? ResolveUserIdFromClaims()
    {
        var claimValue = User.FindFirst("sub")?.Value
                         ?? User.FindFirst("id")?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(claimValue, out var userId) ? userId : null;
    }

    private IActionResult ToBusinessError(BusinessValidationException ex)
    {
        var statusCode = ex.Code == "TARGET_NOT_FOUND" ? 404 : 400;
        return ErrorResponse(ex.Message, statusCode);
    }
}
