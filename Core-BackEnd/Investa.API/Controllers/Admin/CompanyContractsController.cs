using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/sales/contracts")]
[Route("api/admin/sales/contracts")]
[Authorize(Policy = "RequirePermission:Company.Sales.Contracts.View")]
public sealed class CompanyContractsController(ICompanyContractService contracts) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] CompanyContractListQuery query, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await contracts.ListAsync(query, cancellationToken) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var contract = await contracts.GetAsync(id, cancellationToken);
        return contract is null
            ? NotFound(new { success = false, code = "CONTRACT_NOT_FOUND", message = "Contract was not found." })
            : Ok(new { success = true, data = contract });
    }

    [HttpGet("by-quotation/{quotationId:guid}")]
    public async Task<IActionResult> GetByQuotation(Guid quotationId, CancellationToken cancellationToken)
    {
        var contract = await contracts.GetBySourceQuotationAsync(quotationId, cancellationToken);
        return contract is null
            ? NotFound(new { success = false, code = "CONTRACT_NOT_FOUND", message = "Contract was not found for this quotation." })
            : Ok(new { success = true, data = contract });
    }

    [HttpGet("{id:guid}/print")]
    public async Task<IActionResult> Print(Guid id, CancellationToken cancellationToken)
    {
        var contract = await contracts.GetAsync(id, cancellationToken);
        return contract is null
            ? NotFound(new { success = false, code = "CONTRACT_NOT_FOUND", message = "Contract was not found." })
            : Ok(new { success = true, data = contract });
    }

    [HttpPost("from-quotation/{quotationId:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Contracts.Create")]
    public async Task<IActionResult> CreateFromQuotation(Guid quotationId, CompanyContractFromQuotationRequest request, CancellationToken cancellationToken)
    {
        if (request.SourceQuotationId != Guid.Empty && request.SourceQuotationId != quotationId)
            return BadRequest(new { success = false, code = "CONTRACT_SOURCE_QUOTATION_MISMATCH", message = "The route and body quotation identifiers must match." });
        request.SourceQuotationId = quotationId;
        try
        {
            var result = await contracts.CreateFromQuotationAsync(request, cancellationToken, ActorId());
            return CreatedAtAction(nameof(Get), new { id = result.Id }, new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Contracts.Edit")]
    public async Task<IActionResult> Update(Guid id, CompanyContractMetadataUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await contracts.UpdateDraftAsync(id, request, cancellationToken, ActorId());
            return result is null
                ? NotFound(new { success = false, code = "CONTRACT_NOT_FOUND", message = "Contract was not found." })
                : Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Contracts.Manage")]
    public Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken) =>
        Transition(id, contracts.ActivateAsync, cancellationToken);

    [HttpPost("{id:guid}/complete")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Contracts.Manage")]
    public Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken) =>
        Transition(id, contracts.CompleteAsync, cancellationToken);

    [HttpPost("{id:guid}/terminate")]
    [Authorize(Policy = "RequirePermission:Company.Sales.Contracts.Manage")]
    public async Task<IActionResult> Terminate(Guid id, CompanyContractTerminateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await contracts.TerminateAsync(id, request.TerminationReason, cancellationToken, ActorId());
            return result is null
                ? NotFound(new { success = false, code = "CONTRACT_NOT_FOUND", message = "Contract was not found." })
                : Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private async Task<IActionResult> Transition(Guid id, Func<Guid, CancellationToken, Guid?, Task<CompanyContractDetailDto?>> action, CancellationToken cancellationToken)
    {
        try
        {
            var result = await action(id, cancellationToken, ActorId());
            return result is null
                ? NotFound(new { success = false, code = "CONTRACT_NOT_FOUND", message = "Contract was not found." })
                : Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private static IActionResult Error(BusinessValidationException ex) =>
        new ObjectResult(new { success = false, code = ex.Code, message = ex.Message }) { StatusCode = StatusCodes.Status400BadRequest };
}
