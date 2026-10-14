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
public sealed class EquityController(IEquityPositionService service) : ControllerBase
{
    [HttpGet("opportunities/{opportunityId:int}/participations/{participationId:int}")]
    public async Task<IActionResult> Get(int opportunityId, int participationId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetForParticipationAsync(actor.Value, opportunityId, participationId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("positions/{positionId:int}/history")]
    public async Task<IActionResult> History(int positionId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetHistoryAsync(actor.Value, positionId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("positions/{positionId:int}/ownership")]
    public async Task<IActionResult> OwnershipAtDate(int positionId, [FromQuery] DateTime? asOf, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try
        {
            var effectiveAsOf = asOf ?? DateTime.UtcNow;
            return Ok(new { success = true, data = await service.GetOwnershipAtDateAsync(actor.Value, positionId, effectiveAsOf, IsAdmin(), cancellationToken) });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("opportunities/{opportunityId:int}/capitalization")]
    public async Task<IActionResult> Capitalization(int opportunityId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetCapitalizationAsync(actor.Value, opportunityId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("opportunities/{opportunityId:int}/corporate-events")]
    public async Task<IActionResult> CorporateEvents(int opportunityId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.GetCorporateEventsAsync(actor.Value, opportunityId, IsAdmin(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("corporate-events")]
    public async Task<IActionResult> CreateCorporateEvent([FromBody] CreateEquityCorporateEventRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return StatusCode(201, new { success = true, data = await service.CreateCorporateEventAsync(actor.Value, request, CanOperateCorporateEvents(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("corporate-events/{eventId:int}/submit")]
    public async Task<IActionResult> SubmitCorporateEvent(int eventId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.SubmitCorporateEventAsync(actor.Value, eventId, CanOperateCorporateEvents(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("corporate-events/{eventId:int}/decision")]
    public async Task<IActionResult> DecideCorporateEvent(int eventId, [FromBody] EquityCorporateEventDecisionRequest request, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.ApproveCorporateEventAsync(actor.Value, eventId, CanOperateCorporateEvents(), request.Approve, request.Reason, cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("corporate-events/{eventId:int}/apply")]
    public async Task<IActionResult> ApplyCorporateEvent(int eventId, CancellationToken cancellationToken)
    {
        var actor = Actor(); if (!actor.HasValue) return Unauthorized();
        try { return Ok(new { success = true, data = await service.ApplyCorporateEventAsync(actor.Value, eventId, CanOperateCorporateEvents(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private bool IsAdmin() => User.IsInRole("Admin") || User.IsInRole("Reviewer") || User.IsInRole("Operations");
    private bool CanOperateCorporateEvents() => User.IsInRole("Admin") || User.IsInRole("Operations");
    private Guid? Actor() { var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id"); return Guid.TryParse(value, out var id) ? id : null; }
    private IActionResult Error(BusinessValidationException ex) => StatusCode(ex.Code.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase) ? 403 : ex.Code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase) ? 404 : ex.Code.Contains("CONFLICT", StringComparison.OrdinalIgnoreCase) || ex.Code.Contains("STALE", StringComparison.OrdinalIgnoreCase) ? 409 : 400, new { success = false, code = ex.Code, message = ex.Message });
}
