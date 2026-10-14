using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Company;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/sales/opportunities")]
[Route("api/admin/sales/opportunities")]
[Authorize(Policy = "RequirePermission:Company.Sales.Opportunities.View")]
public sealed class CompanySalesOpportunitiesController(ICompanySalesOpportunityService opportunities) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] CompanySalesOpportunityListQuery query, CancellationToken cancellationToken) => Ok(new { success = true, data = await opportunities.ListAsync(query, cancellationToken) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var opportunity = await opportunities.GetAsync(id, cancellationToken);
        return opportunity is null ? NotFound(new { success = false, code = "SALES_OPPORTUNITY_NOT_FOUND", message = "Sales opportunity was not found." }) : Ok(new { success = true, data = opportunity });
    }

    [HttpPost]
    [Authorize(Policy = "RequirePermission:Company.Sales.Opportunities.Create")]
    public async Task<IActionResult> Create(CompanySalesOpportunityUpsertRequest request, CancellationToken cancellationToken)
    {
        try { var result = await opportunities.CreateAsync(request, cancellationToken, ActorId()); return CreatedAtAction(nameof(Get), new { id = result.Id }, new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Opportunities.Edit")]
    public async Task<IActionResult> Update(Guid id, CompanySalesOpportunityUpsertRequest request, CancellationToken cancellationToken)
    {
        try { var result = await opportunities.UpdateAsync(id, request, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "SALES_OPPORTUNITY_NOT_FOUND", message = "Sales opportunity was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:guid}/stage")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Opportunities.Edit")]
    public async Task<IActionResult> SetStage(Guid id, SetCompanySalesOpportunityStageRequest request, CancellationToken cancellationToken)
    {
        try { var result = await opportunities.SetStageAsync(id, request.Stage, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "SALES_OPPORTUNITY_NOT_FOUND", message = "Sales opportunity was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{id:guid}/won")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Opportunities.Manage")]
    public async Task<IActionResult> MarkWon(Guid id, CancellationToken cancellationToken)
    {
        try { var result = await opportunities.MarkWonAsync(id, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "SALES_OPPORTUNITY_NOT_FOUND", message = "Sales opportunity was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{id:guid}/lost")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Opportunities.Manage")]
    public async Task<IActionResult> MarkLost(Guid id, MarkCompanySalesOpportunityLostRequest request, CancellationToken cancellationToken)
    {
        try { var result = await opportunities.MarkLostAsync(id, request.LostReason, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "SALES_OPPORTUNITY_NOT_FOUND", message = "Sales opportunity was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("lookup/customers")]
    public async Task<IActionResult> CustomerLookup([FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await opportunities.CustomerLookupAsync(search, cancellationToken) });

    [HttpGet("lookup/customers/{customerId:guid}/contacts")]
    public async Task<IActionResult> ContactLookup(Guid customerId, [FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await opportunities.ContactLookupAsync(customerId, search, cancellationToken) });

    [HttpGet("lookup/catalog-items")]
    public async Task<IActionResult> CatalogLookup([FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await opportunities.CatalogLookupAsync(search, cancellationToken) });

    [HttpGet("lookup/owners")]
    public async Task<IActionResult> OwnerLookup([FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await opportunities.OwnerLookupAsync(search, cancellationToken) });

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private static IActionResult Error(BusinessValidationException ex) => new ObjectResult(new { success = false, code = ex.Code, message = ex.Message }) { StatusCode = StatusCodes.Status400BadRequest };
}
