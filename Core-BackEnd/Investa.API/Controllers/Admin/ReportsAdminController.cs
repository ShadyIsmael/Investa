using System.Security.Claims;
using Investa.API.Controllers;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[Authorize(Roles = "Admin,Reviewer")]
[Route("api/v1/admin/reports")]
public class ReportsAdminController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsAdminController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ReportDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] AdminReportQuery query, CancellationToken cancellationToken)
    {
        var reports = await _reportService.GetAdminReportsAsync(query, cancellationToken);
        return SuccessResponse(reports);
    }

    [HttpPost("{id:int}/confirm")]
    [ProducesResponseType(typeof(ApiResponse<ReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Confirm(int id, [FromBody] ResolveReportRequest request, CancellationToken cancellationToken)
    {
        return await Resolve(id, request, (reportId, reviewerId, body, token) =>
            _reportService.ConfirmAsync(reportId, reviewerId, body, token), "Report confirmed successfully", cancellationToken);
    }

    [HttpPost("{id:int}/reject")]
    [ProducesResponseType(typeof(ApiResponse<ReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] ResolveReportRequest request, CancellationToken cancellationToken)
    {
        return await Resolve(id, request, (reportId, reviewerId, body, token) =>
            _reportService.RejectAsync(reportId, reviewerId, body, token), "Report rejected successfully", cancellationToken);
    }

    [HttpPost("{id:int}/dismiss")]
    [ProducesResponseType(typeof(ApiResponse<ReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Dismiss(int id, [FromBody] ResolveReportRequest request, CancellationToken cancellationToken)
    {
        return await Resolve(id, request, (reportId, reviewerId, body, token) =>
            _reportService.DismissAsync(reportId, reviewerId, body, token), "Report dismissed successfully", cancellationToken);
    }

    private async Task<IActionResult> Resolve(
        int id,
        ResolveReportRequest request,
        Func<int, Guid, ResolveReportRequest, CancellationToken, Task<ReportDto>> action,
        string successMessage,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var reviewerId = ResolveUserIdFromClaims();
        if (reviewerId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var report = await action(id, reviewerId.Value, request, cancellationToken);
            return SuccessResponse(report, successMessage);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
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
        var statusCode = ex.Code == "REPORT_NOT_FOUND" ? 404 : 400;
        return ErrorResponse(ex.Message, statusCode);
    }
}
