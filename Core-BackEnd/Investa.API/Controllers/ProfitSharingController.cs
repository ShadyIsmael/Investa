using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/profit-sharing")]
public sealed class ProfitSharingController(IProfitSharingObligationService service, IProfitSharingLifecycleService lifecycle) : ControllerBase
{
    [HttpGet("opportunities/{opportunityId:int}/participations/{participationId:int}")]
    public async Task<IActionResult> Get(int opportunityId, int participationId, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try { return Ok(new { success = true, data = await service.GetForParticipationAsync(actor.Value, opportunityId, participationId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("opportunities/{opportunityId:int}/obligations/{obligationId:int}/periods/{periodId:int}/declarations")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> Declare(int opportunityId, int obligationId, int periodId, [FromForm] CreateProfitSharingDeclarationRequest request, [FromForm] IFormFile? evidenceFile, [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid || !request.DeclarationDate.HasValue) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try
        {
            if (evidenceFile is null)
            {
                var result = await service.DeclareAsync(actor.Value, opportunityId, obligationId, periodId, new ProfitSharingDeclarationCreateCommand(request.DeclaredBasisAmount, request.DeclaredResultAmount, request.Currency, request.DeclarationDate.Value, request.ExternalReference, request.Notes, Normalize(idempotencyKey)), cancellationToken);
                return StatusCode(StatusCodes.Status201Created, new { success = true, data = result });
            }
            await using var stream = evidenceFile.OpenReadStream();
            var withEvidence = new ProfitSharingDeclarationCreateCommand(request.DeclaredBasisAmount, request.DeclaredResultAmount, request.Currency, request.DeclarationDate.Value, request.ExternalReference, request.Notes, Normalize(idempotencyKey), stream, evidenceFile.FileName, evidenceFile.ContentType, evidenceFile.Length);
            var created = await service.DeclareAsync(actor.Value, opportunityId, obligationId, periodId, withEvidence, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, new { success = true, data = created });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("declarations/{declarationId:int}/evidence")]
    public async Task<IActionResult> DownloadEvidence(int declarationId, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try { var file = await service.DownloadEvidenceAsync(actor.Value, declarationId, IsAdmin(), cancellationToken); return File(file.Content, file.ContentType, file.FileName, enableRangeProcessing: true); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("opportunities/{opportunityId:int}/obligations/{obligationId:int}/periods/{periodId:int}/distributions")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> DeclareDistribution(int opportunityId, int obligationId, int periodId, [FromForm] CreateProfitSharingDistributionRequest request, [FromForm] IFormFile? evidenceFile, [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try
        {
            if (evidenceFile is null)
            {
                var result = await service.DeclareDistributionAsync(actor.Value, opportunityId, obligationId, periodId, new ProfitSharingDistributionCreateCommand(request.DeclaredAmount, request.Currency, request.ExternalReference, request.Notes, Normalize(idempotencyKey)), cancellationToken);
                return StatusCode(StatusCodes.Status201Created, new { success = true, data = result });
            }
            await using var stream = evidenceFile.OpenReadStream();
            var withEvidence = new ProfitSharingDistributionCreateCommand(request.DeclaredAmount, request.Currency, request.ExternalReference, request.Notes, Normalize(idempotencyKey), stream, evidenceFile.FileName, evidenceFile.ContentType, evidenceFile.Length);
            var created = await service.DeclareDistributionAsync(actor.Value, opportunityId, obligationId, periodId, withEvidence, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, new { success = true, data = created });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("distributions/{declarationId:int}/evidence")]
    public async Task<IActionResult> DownloadDistributionEvidence(int declarationId, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try { var file = await service.DownloadDistributionEvidenceAsync(actor.Value, declarationId, IsAdmin(), cancellationToken); return File(file.Content, file.ContentType, file.FileName, enableRangeProcessing: true); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("distributions/{declarationId:int}/confirm")]
    public async Task<IActionResult> ConfirmDistribution(int declarationId, [FromBody] ConfirmProfitSharingDistributionRequest? request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (request is not null && !ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try { return Ok(new { success = true, data = await service.ConfirmDistributionAsync(actor.Value, declarationId, request?.Comment, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("distributions/{declarationId:int}/dispute")]
    public async Task<IActionResult> DisputeDistribution(int declarationId, [FromBody] DisputeProfitSharingDistributionRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try { return Ok(new { success = true, data = await service.DisputeDistributionAsync(actor.Value, declarationId, request.Reason, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("obligations/{obligationId:int}/close")]
    public async Task<IActionResult> Close(int obligationId, [FromBody] ProfitSharingClosureRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try { return Ok(new { success = true, data = await lifecycle.CloseAsync(actor.Value, obligationId, request.Reason, IsLifecycleOperator(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private bool IsAdmin() => User.IsInRole("Admin") || User.IsInRole("Reviewer") || User.IsInRole("Operations");
    private bool IsLifecycleOperator() => User.IsInRole("Admin") || User.IsInRole("Operations");
    private Guid? Actor() { var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id"); return Guid.TryParse(value, out var id) ? id : null; }
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private IActionResult Error(BusinessValidationException ex)
    {
        var status = ex.Code.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase) ? 403 : ex.Code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase) ? 404 : ex.Code.Contains("UPLOAD_UNAVAILABLE", StringComparison.OrdinalIgnoreCase) ? 503 : ex.Code.Contains("ALREADY", StringComparison.OrdinalIgnoreCase) || ex.Code.Contains("CONCURRENCY", StringComparison.OrdinalIgnoreCase) ? 409 : 400;
        return StatusCode(status, new { success = false, code = ex.Code, message = ex.Message });
    }
}
