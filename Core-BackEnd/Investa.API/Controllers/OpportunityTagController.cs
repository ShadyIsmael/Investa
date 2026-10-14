using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/opportunity-tags")]
[AllowAnonymous]
public sealed class OpportunityTagController : ControllerBase
{
    private readonly IOpportunityTagAdminService _tagService;

    public OpportunityTagController(IOpportunityTagAdminService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var items = await _tagService.GetAllAsync(isActive: includeInactive ? null : true, cancellationToken: cancellationToken);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await _tagService.GetByIdAsync(id, cancellationToken);
        if (item == null) return NotFound(new { success = false, message = "Opportunity tag not found" });
        return Ok(new { success = true, data = item });
    }
}
