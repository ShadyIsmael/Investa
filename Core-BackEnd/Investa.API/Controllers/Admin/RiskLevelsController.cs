using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/risk-levels")]
[Route("api/admin/risk-levels")]
[Authorize(Roles = "Admin")]
public sealed class RiskLevelsController(IRiskLevelService levels) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await levels.GetAllAsync(search, isActive, cancellationToken) });

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var item = await levels.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "RISK_LEVEL_NOT_FOUND", message = "Risk level was not found." }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateRiskLevelRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await levels.CreateAsync(request, ActorId(), cancellationToken);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateRiskLevelRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await levels.UpdateAsync(id, request, ActorId(), cancellationToken);
            return item is null ? NotFound(new { success = false, code = "RISK_LEVEL_NOT_FOUND", message = "Risk level was not found." }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, SetRiskLevelStatusRequest request, CancellationToken cancellationToken)
    {
        var item = await levels.SetStatusAsync(id, request.IsActive, ActorId(), cancellationToken);
        return item is null ? NotFound(new { success = false, code = "RISK_LEVEL_NOT_FOUND", message = "Risk level was not found." }) : Ok(new { success = true, data = item });
    }

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private IActionResult Error(BusinessValidationException ex) => BadRequest(new { success = false, code = ex.Code, message = ex.Message });
}
