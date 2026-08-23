using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/opportunities/{opportunityId:int}/obligations")]
public sealed class OpportunityObligationCompletionController(IOpportunityObligationCompletionService service) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> Get(int opportunityId, CancellationToken token)
    {
        var actor=Actor(); if(actor==null) return ErrorResponse("Unable to resolve authenticated user",401);
        try { return SuccessResponse(await service.GetAsync(actor.Value,opportunityId,User.IsInRole("Admin")||User.IsInRole("Reviewer"),token)); }
        catch(BusinessValidationException ex){return Error(ex);}
    }

    [HttpPost("initiate")]
    public async Task<IActionResult> Initiate(int opportunityId, CancellationToken token)
    {
        var actor=Actor(); if(actor==null) return ErrorResponse("Unable to resolve authenticated user",401);
        try { return SuccessResponse(await service.InitiateAsync(actor.Value,opportunityId,User.IsInRole("Admin")||User.IsInRole("Reviewer"),token)); }
        catch(BusinessValidationException ex){return Error(ex);}
    }

    [HttpPost("participations/{participationRequestId:int}/confirm")]
    public async Task<IActionResult> Confirm(int opportunityId,int participationRequestId,[FromBody] ConfirmObligationCompletionRequest request,CancellationToken token)
    {
        if(!ModelState.IsValid)return ErrorResponse("Invalid request",400,ModelState);
        var actor=Actor(); if(actor==null) return ErrorResponse("Unable to resolve authenticated user",401);
        try { return SuccessResponse(await service.ConfirmAsync(actor.Value,opportunityId,participationRequestId,request,token)); }
        catch(BusinessValidationException ex){return Error(ex);}
    }

    private Guid? Actor()
    {
        var value=User.FindFirst("sub")?.Value??User.FindFirst("id")?.Value??User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(value,out var id)?id:null;
    }
    private IActionResult Error(BusinessValidationException ex)=>ErrorResponse(ex.Message,ex.Code=="OPPORTUNITY_NOT_FOUND"?404:ex.Code.EndsWith("DENIED")||ex.Code.EndsWith("AUTHORIZED")?403:409);
}
