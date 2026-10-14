using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/loan-lifecycle")]
public sealed class LoanLifecycleController(ILoanLifecycleService lifecycle) : ControllerBase
{
    [HttpPost("{loanObligationId:int}/default")]
    public async Task<IActionResult> MarkDefault(int loanObligationId, [FromBody] LoanLifecycleActionRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try
        {
            var result = await lifecycle.MarkDefaultAsync(actor.Value, loanObligationId, request.Reason, IsLifecycleOperator(), cancellationToken);
            return Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{loanObligationId:int}/close")]
    public async Task<IActionResult> Close(int loanObligationId, [FromBody] LoanLifecycleActionRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try
        {
            var result = await lifecycle.CloseAsync(actor.Value, loanObligationId, request.Reason, IsLifecycleOperator(), cancellationToken);
            return Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private bool IsLifecycleOperator() => User.IsInRole("Admin") || User.IsInRole("Operations");

    private Guid? Actor()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private IActionResult Error(BusinessValidationException ex)
    {
        var status = ex.Code.EndsWith("FORBIDDEN", StringComparison.OrdinalIgnoreCase)
            ? StatusCodes.Status403Forbidden
            : ex.Code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase)
                ? StatusCodes.Status404NotFound
                : ex.Code.Contains("ALREADY", StringComparison.OrdinalIgnoreCase)
                    ? StatusCodes.Status409Conflict
                    : StatusCodes.Status400BadRequest;
        return StatusCode(status, new { success = false, code = ex.Code, message = ex.Message });
    }
}
