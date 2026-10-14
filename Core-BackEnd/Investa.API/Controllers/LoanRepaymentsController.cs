using System.Security.Claims;
using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/loan-repayments")]
public sealed class LoanRepaymentsController(ILoanRepaymentService service) : ControllerBase
{
    [HttpPost("opportunities/{opportunityId:int}/obligations/{loanObligationId:int}")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> Declare(
        int opportunityId,
        int loanObligationId,
        [FromForm] CreateLoanRepaymentDeclarationRequest request,
        [FromForm] IFormFile? proofFile,
        [FromForm] string? installmentIdsJson,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        if (!request.ExternalPaymentDate.HasValue) return BadRequest(new { success = false, code = "LOAN_REPAYMENT_DATE_REQUIRED", message = "External payment date is required." });
        try
        {
            IReadOnlyList<int>? installmentIds = null;
            if (request.InstallmentIds is not null && request.InstallmentIds.Count > 0)
                installmentIds = request.InstallmentIds;
            else if (!string.IsNullOrWhiteSpace(installmentIdsJson))
                installmentIds = ParseInstallmentIds(installmentIdsJson);
            if (proofFile is null)
            {
                var result = await service.CreateAsync(actor.Value, opportunityId, loanObligationId, new CreateLoanRepaymentDeclarationCommand(request.Amount, request.Currency, request.ExternalPaymentDate.Value, request.ExternalReference, installmentIds, Normalize(idempotencyKey)), cancellationToken);
                return StatusCode(StatusCodes.Status201Created, new { success = true, data = result });
            }
            await using var stream = proofFile.OpenReadStream();
            var withProof = new CreateLoanRepaymentDeclarationCommand(request.Amount, request.Currency, request.ExternalPaymentDate.Value, request.ExternalReference, installmentIds, Normalize(idempotencyKey), stream, proofFile.FileName, proofFile.ContentType, proofFile.Length);
            var created = await service.CreateAsync(actor.Value, opportunityId, loanObligationId, withProof, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, new { success = true, data = created });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, code = "LOAN_REPAYMENT_DECLARATION_FAILED", message = "An unexpected error occurred while processing the repayment declaration." });
        }
    }

    [HttpGet("opportunities/{opportunityId:int}/participations/{participationId:int}")]
    public async Task<IActionResult> GetForParticipation(int opportunityId, int participationId, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try { return Ok(new { success = true, data = await service.GetForParticipationAsync(actor.Value, opportunityId, participationId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("{declarationId:int}/proof")]
    public async Task<IActionResult> DownloadProof(int declarationId, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try
        {
            var proof = await service.DownloadProofAsync(actor.Value, declarationId, IsAdmin(), cancellationToken);
            return File(proof.Content, proof.ContentType, proof.FileName, enableRangeProcessing: true);
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{declarationId:int}/confirm")]
    public async Task<IActionResult> Confirm(int declarationId, [FromBody] ConfirmLoanRepaymentRequest? request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (request is not null && !ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try { return Ok(new { success = true, data = await service.ConfirmAsync(actor.Value, declarationId, request?.Comment, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{declarationId:int}/dispute")]
    public async Task<IActionResult> Dispute(int declarationId, [FromBody] DisputeLoanRepaymentRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor();
        if (!actor.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        if (!ModelState.IsValid) return BadRequest(new { success = false, code = "INVALID_REQUEST", errors = ModelState });
        try { return Ok(new { success = true, data = await service.DisputeAsync(actor.Value, declarationId, request.Reason, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private bool IsAdmin() => User.IsInRole("Admin") || User.IsInRole("Reviewer") || User.IsInRole("Operations");
    private Guid? Actor()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id");
        return Guid.TryParse(value, out var id) ? id : null;
    }
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static IReadOnlyList<int>? ParseInstallmentIds(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        var trimmed = json.Trim();
        if (trimmed == "[]" || trimmed == "null") return null;
        try
        {
            var result = JsonSerializer.Deserialize<List<int>>(trimmed);
            if (result is null || result.Count == 0) return null;
            if (result.Distinct().Count() != result.Count)
                throw new BusinessValidationException("LOAN_REPAYMENT_INSTALLMENT_INVALID", "An installment cannot be selected more than once.");
            return result;
        }
        catch (JsonException) { throw new BusinessValidationException("LOAN_REPAYMENT_INSTALLMENT_INVALID", "Installment selection is invalid JSON."); }
    }
    private IActionResult Error(BusinessValidationException ex)
    {
        var status = ex.Code.EndsWith("FORBIDDEN", StringComparison.OrdinalIgnoreCase) ? 403 : ex.Code.Contains("CONCURRENCY", StringComparison.OrdinalIgnoreCase) || ex.Code.Contains("ALREADY", StringComparison.OrdinalIgnoreCase) ? 409 : ex.Code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase) ? 404 : ex.Code.Contains("UPLOAD_UNAVAILABLE", StringComparison.OrdinalIgnoreCase) ? 503 : 400;
        return StatusCode(status, new { success = false, code = ex.Code, message = ex.Message });
    }
}
