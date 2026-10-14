using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/sales/quotations")]
[Route("api/admin/sales/quotations")]
[Authorize(Policy = "RequirePermission:Company.Sales.Quotations.View")]
public sealed class CompanyQuotationsController(ICompanyQuotationService quotations) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] CompanyQuotationListQuery query, CancellationToken cancellationToken) => Ok(new { success = true, data = await quotations.ListAsync(query, cancellationToken) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var quotation = await quotations.GetAsync(id, cancellationToken);
        return quotation is null ? NotFound(new { success = false, code = "QUOTATION_NOT_FOUND", message = "Quotation was not found." }) : Ok(new { success = true, data = quotation });
    }

    [HttpGet("{id:guid}/print")]
    public async Task<IActionResult> Print(Guid id, CancellationToken cancellationToken)
    {
        var quotation = await quotations.GetAsync(id, cancellationToken);
        return quotation is null ? NotFound(new { success = false, code = "QUOTATION_NOT_FOUND", message = "Quotation was not found." }) : Ok(new { success = true, data = quotation });
    }

    [HttpPost]
    [Authorize(Policy = "RequirePermission:Company.Sales.Quotations.Create")]
    public async Task<IActionResult> Create(CompanyQuotationUpsertRequest request, CancellationToken cancellationToken)
    {
        try { var result = await quotations.CreateAsync(request, cancellationToken, ActorId()); return CreatedAtAction(nameof(Get), new { id = result.Id }, new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Quotations.Edit")]
    public async Task<IActionResult> Update(Guid id, CompanyQuotationUpsertRequest request, CancellationToken cancellationToken)
    {
        try { var result = await quotations.UpdateAsync(id, request, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "QUOTATION_NOT_FOUND", message = "Quotation was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{id:guid}/send")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Quotations.Manage")]
    public Task<IActionResult> Send(Guid id, CancellationToken cancellationToken) => Transition(id, quotations.MarkSentAsync, cancellationToken);

    [HttpPost("{id:guid}/accept")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Quotations.Manage")]
    public Task<IActionResult> Accept(Guid id, CancellationToken cancellationToken) => Transition(id, quotations.MarkAcceptedAsync, cancellationToken);

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Quotations.Manage")]
    public async Task<IActionResult> Reject(Guid id, CompanyQuotationRejectRequest request, CancellationToken cancellationToken)
    {
        try { var result = await quotations.MarkRejectedAsync(id, request.RejectionReason, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "QUOTATION_NOT_FOUND", message = "Quotation was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpGet("lookup/customers")]
    public async Task<IActionResult> CustomerLookup([FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await quotations.CustomerLookupAsync(search, cancellationToken) });

    [HttpGet("lookup/customers/{customerId:guid}/contacts")]
    public async Task<IActionResult> ContactLookup(Guid customerId, [FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await quotations.ContactLookupAsync(customerId, search, cancellationToken) });

    [HttpGet("lookup/opportunities")]
    public async Task<IActionResult> OpportunityLookup([FromQuery] Guid? customerId, [FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await quotations.OpportunityLookupAsync(customerId, search, cancellationToken) });

    [HttpGet("lookup/catalog-items")]
    public async Task<IActionResult> CatalogLookup([FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await quotations.CatalogLookupAsync(search, cancellationToken) });

    [HttpGet("lookup/currencies")]
    public async Task<IActionResult> CurrencyLookup([FromQuery] string? search, CancellationToken cancellationToken) => Ok(new { success = true, data = await quotations.CurrencyLookupAsync(search, cancellationToken) });

    private async Task<IActionResult> Transition(Guid id, Func<Guid, CancellationToken, Guid?, Task<CompanyQuotationDetailDto?>> action, CancellationToken cancellationToken)
    {
        try { var result = await action(id, cancellationToken, ActorId()); return result is null ? NotFound(new { success = false, code = "QUOTATION_NOT_FOUND", message = "Quotation was not found." }) : Ok(new { success = true, data = result }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private static IActionResult Error(BusinessValidationException ex) => new ObjectResult(new { success = false, code = ex.Code, message = ex.Message }) { StatusCode = StatusCodes.Status400BadRequest };
}
