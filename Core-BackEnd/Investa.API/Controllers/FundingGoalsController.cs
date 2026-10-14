using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/funding-goals")]
[AllowAnonymous]
public sealed class FundingGoalsController(IFundingGoalAdminService goals) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var items = await goals.GetAllAsync(isActive: includeInactive ? null : true, cancellationToken: cancellationToken);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await goals.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "FUNDING_GOAL_NOT_FOUND", message = "Funding goal was not found." }) : Ok(new { success = true, data = item });
    }
}
