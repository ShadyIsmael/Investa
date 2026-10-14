using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Company;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/customers")]
[Route("api/admin/customers")]
[Authorize(Policy = "RequirePermission:Company.Customers.View")]
public sealed class CompanyCustomersController(ICompanyCustomerService customers) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] CompanyCustomerListQuery query, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await customers.ListAsync(query, cancellationToken) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var customer = await customers.GetAsync(id, cancellationToken);
        return customer is null ? NotFound(new { success = false, code = "CUSTOMER_NOT_FOUND", message = "Customer was not found." }) : Ok(new { success = true, data = customer });
    }

    [HttpPost]
    [Authorize(Policy = "RequirePermission:Company.Customers.Create")]
    public async Task<IActionResult> Create(CompanyCustomerUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var customer = await customers.CreateAsync(request, cancellationToken, ActorId());
            return CreatedAtAction(nameof(Get), new { id = customer.Id }, new { success = true, data = customer });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Customers.Edit")]
    public async Task<IActionResult> Update(Guid id, CompanyCustomerUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var customer = await customers.UpdateAsync(id, request, cancellationToken, ActorId());
            return customer is null ? NotFound(new { success = false, code = "CUSTOMER_NOT_FOUND", message = "Customer was not found." }) : Ok(new { success = true, data = customer });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "RequirePermission:Company.Customers.Manage")]
    public async Task<IActionResult> SetStatus(Guid id, SetCompanyCustomerStatusRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var customer = await customers.SetStatusAsync(id, request.Status, cancellationToken, ActorId());
            return customer is null ? NotFound(new { success = false, code = "CUSTOMER_NOT_FOUND", message = "Customer was not found." }) : Ok(new { success = true, data = customer });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPost("{id:guid}/contacts")]
    [Authorize(Policy = "RequirePermission:Company.Customers.Edit")]
    public async Task<IActionResult> AddContact(Guid id, CompanyCustomerContactRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var contact = await customers.AddContactAsync(id, request, cancellationToken, ActorId());
            return contact is null ? NotFound(new { success = false, code = "CUSTOMER_NOT_FOUND", message = "Customer was not found." }) : Ok(new { success = true, data = contact });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:guid}/contacts/{contactId:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Customers.Edit")]
    public async Task<IActionResult> UpdateContact(Guid id, Guid contactId, CompanyCustomerContactRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var contact = await customers.UpdateContactAsync(id, contactId, request, cancellationToken, ActorId());
            return contact is null ? NotFound(new { success = false, code = "CUSTOMER_CONTACT_NOT_FOUND", message = "Customer contact was not found." }) : Ok(new { success = true, data = contact });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:guid}/contacts/{contactId:guid}/status")]
    [Authorize(Policy = "RequirePermission:Company.Customers.Edit")]
    public async Task<IActionResult> SetContactStatus(Guid id, Guid contactId, CompanyCustomerContactStatusRequest request, CancellationToken cancellationToken)
    {
        var contact = await customers.SetContactStatusAsync(id, contactId, request.IsActive, cancellationToken, ActorId());
        return contact is null ? NotFound(new { success = false, code = "CUSTOMER_CONTACT_NOT_FOUND", message = "Customer contact was not found." }) : Ok(new { success = true, data = contact });
    }

    [HttpPatch("{id:guid}/contacts/{contactId:guid}/primary")]
    [Authorize(Policy = "RequirePermission:Company.Customers.Edit")]
    public async Task<IActionResult> SetPrimary(Guid id, Guid contactId, CancellationToken cancellationToken)
    {
        try
        {
            var contact = await customers.SetPrimaryContactAsync(id, contactId, cancellationToken, ActorId());
            return contact is null ? NotFound(new { success = false, code = "CUSTOMER_CONTACT_NOT_FOUND", message = "Customer contact was not found." }) : Ok(new { success = true, data = contact });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private static IActionResult Error(BusinessValidationException ex) =>
        new ObjectResult(new { success = false, code = ex.Code, message = ex.Message }) { StatusCode = ex.Code.Contains("DUPLICATE", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status409Conflict : StatusCodes.Status400BadRequest };

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
