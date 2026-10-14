using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/opportunity-tags")]
[Route("api/admin/opportunity-tags")]
[Authorize(Roles = "Admin")]
public sealed class OpportunityTagsController(IOpportunityTagAdminService tags) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await tags.GetAllAsync(search, isActive, cancellationToken) });

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var item = await tags.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "OPPORTUNITY_TAG_NOT_FOUND", message = "Opportunity tag was not found." }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOpportunityTagRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await tags.CreateAsync(request, ActorId(), cancellationToken);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateOpportunityTagRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await tags.UpdateAsync(id, request, ActorId(), cancellationToken);
            return item is null ? NotFound(new { success = false, code = "OPPORTUNITY_TAG_NOT_FOUND", message = "Opportunity tag was not found." }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, SetOpportunityTagStatusRequest request, CancellationToken cancellationToken)
    {
        var item = await tags.SetStatusAsync(id, request.IsActive, ActorId(), cancellationToken);
        return item is null ? NotFound(new { success = false, code = "OPPORTUNITY_TAG_NOT_FOUND", message = "Opportunity tag was not found." }) : Ok(new { success = true, data = item });
    }

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private IActionResult Error(BusinessValidationException ex) =>
        ex.Code == "OPPORTUNITY_TAG_NOT_FOUND"
            ? NotFound(new { success = false, code = ex.Code, message = ex.Message })
            : BadRequest(new { success = false, code = ex.Code, message = ex.Message });
}
