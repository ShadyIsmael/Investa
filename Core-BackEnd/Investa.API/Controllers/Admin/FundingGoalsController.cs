using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/funding-goals")]
[Route("api/admin/funding-goals")]
[Authorize(Roles = "Admin")]
public sealed class FundingGoalsController(IFundingGoalAdminService goals) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await goals.GetAllAsync(search, isActive, cancellationToken) });

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var item = await goals.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "FUNDING_GOAL_NOT_FOUND", message = "Funding goal was not found." }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFundingGoalRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await goals.CreateAsync(request, ActorId(), cancellationToken);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateFundingGoalRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await goals.UpdateAsync(id, request, ActorId(), cancellationToken);
            return item is null ? NotFound(new { success = false, code = "FUNDING_GOAL_NOT_FOUND", message = "Funding goal was not found." }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, SetFundingGoalStatusRequest request, CancellationToken cancellationToken)
    {
        var item = await goals.SetStatusAsync(id, request.IsActive, ActorId(), cancellationToken);
        return item is null ? NotFound(new { success = false, code = "FUNDING_GOAL_NOT_FOUND", message = "Funding goal was not found." }) : Ok(new { success = true, data = item });
    }

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private IActionResult Error(BusinessValidationException ex) => BadRequest(new { success = false, code = ex.Code, message = ex.Message });
}
