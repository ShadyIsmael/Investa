using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/equity")]
public sealed class EquityPhase3Controller(IEquityPhase3Service service) : ControllerBase
{
    // ===== DIVIDENDS =====

    [HttpPost("dividend-declarations")]
    public async Task<IActionResult> CreateDividendDeclaration([FromBody] CreateDividendDeclarationRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return StatusCode(201, new { success = true, data = await service.CreateDividendDeclarationAsync(actor.Value, request, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("dividend-declarations/{declarationId:int}/entitlements")]
    public async Task<IActionResult> GenerateEntitlements(int declarationId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GenerateEntitlementsAsync(actor.Value, declarationId, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("opportunities/{opportunityId:int}/dividend-declarations")]
    public async Task<IActionResult> GetDividendDeclarations(int opportunityId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetDividendDeclarationsAsync(actor.Value, opportunityId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("dividend-entitlements/{entitlementId:int}")]
    public async Task<IActionResult> GetDividendEntitlement(int entitlementId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetDividendEntitlementAsync(actor.Value, entitlementId, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("dividend-distributions")]
    public async Task<IActionResult> DeclareDistribution([FromBody] DeclareExternalDistributionRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return StatusCode(201, new { success = true, data = await service.DeclareDistributionAsync(actor.Value, request, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("dividend-distributions/{distributionId:int}/confirm")]
    public async Task<IActionResult> ConfirmDistribution(int distributionId, [FromBody] ConfirmDistributionRequest body, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try
        {
            var request = new ConfirmDistributionRequest { DistributionId = distributionId, IsConfirmed = body.IsConfirmed, Reason = body.Reason };
            return Ok(new { success = true, data = await service.ConfirmDistributionAsync(actor.Value, request, cancellationToken) });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    // ===== TRANSFERS =====

    [HttpPost("transfers")]
    public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return StatusCode(201, new { success = true, data = await service.CreateTransferAsync(actor.Value, request, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("transfers/{transferId:int}/submit")]
    public async Task<IActionResult> SubmitTransfer(int transferId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.SubmitTransferAsync(actor.Value, transferId, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("transfers/{transferId:int}/acknowledge")]
    public async Task<IActionResult> AcknowledgeTransfer(int transferId, [FromBody] AcknowledgeTransferRequest body, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.AcknowledgeTransferAsync(actor.Value, transferId, body.Approve, body.Reason, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("transfers/{transferId:int}/apply")]
    public async Task<IActionResult> ApplyTransfer(int transferId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.ApplyTransferAsync(actor.Value, transferId, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("opportunities/{opportunityId:int}/transfers")]
    public async Task<IActionResult> GetTransfers(int opportunityId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetTransfersAsync(actor.Value, opportunityId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    // ===== CLOSURE =====

    [HttpGet("positions/{positionId:int}/closure")]
    public async Task<IActionResult> GetClosure(int positionId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetClosureSnapshotAsync(actor.Value, positionId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("positions/{positionId:int}/close")]
    public async Task<IActionResult> ClosePosition(int positionId, [FromBody] ClosePositionRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.ClosePositionAsync(actor.Value, positionId, request, CanOperateEquity(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private bool IsAdmin() => User.IsInRole("Admin") || User.IsInRole("Reviewer") || User.IsInRole("Operations");
    private bool CanOperateEquity() => User.IsInRole("Admin") || User.IsInRole("Operations");
    private Guid? Actor() { var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id"); return Guid.TryParse(value, out var id) ? id : null; }
    private IActionResult Error(BusinessValidationException ex) => StatusCode(ex.Code.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase) ? 403 : ex.Code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase) ? 404 : ex.Code.Contains("CONFLICT", StringComparison.OrdinalIgnoreCase) || ex.Code.Contains("STALE", StringComparison.OrdinalIgnoreCase) ? 409 : 400, new { success = false, code = ex.Code, message = ex.Message });
}

public sealed class AcknowledgeTransferRequest
{
    public bool Approve { get; init; }
    public string? Reason { get; init; }
}
