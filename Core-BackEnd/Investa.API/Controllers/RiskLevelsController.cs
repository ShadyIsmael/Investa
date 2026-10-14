using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/risk-levels")]
[AllowAnonymous]
public sealed class RiskLevelsController(IRiskLevelService levels) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var items = await levels.GetAllAsync(isActive: includeInactive ? null : true, cancellationToken: cancellationToken);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await levels.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "RISK_LEVEL_NOT_FOUND", message = "Risk level was not found." }) : Ok(new { success = true, data = item });
    }
}
