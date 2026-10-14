using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/funding-declarations")]
public sealed class FundingDeclarationsController(IFundingDeclarationService service) : ControllerBase
{
    [HttpPost("opportunities/{opportunityId:int}/participations/{participationId:int}")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> Create(
        int opportunityId,
        int participationId,
        [FromForm] CreateFundingDeclarationRequest request,
        [FromForm] IFormFile? proofFile,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (!userId.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        if (!request.ReceivedDate.HasValue) return BadRequest(new { success = false, code = "FUNDING_DECLARATION_DATE_REQUIRED", message = "Received date is required." });

        try
        {
            if (proofFile is null)
            {
                var result = await service.CreateAsync(
                    userId.Value,
                    opportunityId,
                    participationId,
                    ToCommand(request, idempotencyKey),
                    cancellationToken);
                return StatusCode(StatusCodes.Status201Created, new { success = true, data = result });
            }

            await using var stream = proofFile.OpenReadStream();
            var withProof = ToCommand(request, idempotencyKey) with
            {
                ProofContent = stream,
                ProofOriginalFileName = proofFile.FileName,
                ProofContentType = proofFile.ContentType,
                ProofFileSize = proofFile.Length
            };
            var created = await service.CreateAsync(userId.Value, opportunityId, participationId, withProof, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, new { success = true, data = created });
        }
        catch (BusinessValidationException ex)
        {
            return Error(ex);
        }
    }

    [HttpGet("opportunities/{opportunityId:int}/participations/{participationId:int}")]
    public async Task<IActionResult> GetForParticipation(int opportunityId, int participationId, CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (!userId.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try
        {
            var result = await service.GetForParticipationAsync(userId.Value, opportunityId, participationId, IsOperationsUser(), cancellationToken);
            return Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex)
        {
            return Error(ex);
        }
    }

    [HttpGet("{declarationId:int}/proof")]
    public async Task<IActionResult> DownloadProof(int declarationId, CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (!userId.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try
        {
            var proof = await service.DownloadProofAsync(userId.Value, declarationId, IsOperationsUser(), cancellationToken);
            return File(proof.Content, proof.ContentType, proof.FileName, enableRangeProcessing: true);
        }
        catch (BusinessValidationException ex)
        {
            return Error(ex);
        }
    }

    [HttpPost("{declarationId:int}/confirm")]
    public async Task<IActionResult> Confirm(
        int declarationId,
        [FromBody] ConfirmFundingDeclarationRequest? request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (!userId.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (request is not null && !ModelState.IsValid)
            return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });

        try
        {
            var result = await service.ConfirmAsync(userId.Value, declarationId, request?.Comment, cancellationToken);
            return Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex)
        {
            return Error(ex);
        }
    }

    [HttpPost("{declarationId:int}/dispute")]
    public async Task<IActionResult> Dispute(
        int declarationId,
        [FromBody] DisputeFundingDeclarationRequest request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (!userId.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });

        try
        {
            var result = await service.DisputeAsync(userId.Value, declarationId, request.Reason, cancellationToken);
            return Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex)
        {
            return Error(ex);
        }
    }

    private FundingDeclarationCreateCommand ToCommand(CreateFundingDeclarationRequest request, string? idempotencyKey) =>
        new(
            request.Amount,
            request.CurrencyCode,
            request.ReceivedDate!.Value,
            request.PaymentMethod,
            request.ExternalReference,
            request.Notes,
            string.IsNullOrWhiteSpace(idempotencyKey) ? null : idempotencyKey.Trim(),
            LegAllocations: request.LegAllocations);

    private bool IsOperationsUser() => User.IsInRole("Admin") || User.IsInRole("Reviewer") || User.IsInRole("Operations");

    private Guid? ResolveUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private IActionResult Error(BusinessValidationException ex)
    {
        var status = ex.Code.Equals("FUNDING_PROOF_UPLOAD_UNAVAILABLE", StringComparison.OrdinalIgnoreCase)
            ? StatusCodes.Status503ServiceUnavailable
            : ex.Code.EndsWith("FORBIDDEN", StringComparison.OrdinalIgnoreCase)
            ? StatusCodes.Status403Forbidden
            : ex.Code.Contains("ALREADY", StringComparison.OrdinalIgnoreCase)
                || ex.Code.Contains("CONFLICT", StringComparison.OrdinalIgnoreCase)
                || ex.Code.Contains("CONCURRENCY", StringComparison.OrdinalIgnoreCase)
                ? StatusCodes.Status409Conflict
                : StatusCodes.Status400BadRequest;
        return StatusCode(status, new { success = false, code = ex.Code, message = ex.Message });
    }
}
