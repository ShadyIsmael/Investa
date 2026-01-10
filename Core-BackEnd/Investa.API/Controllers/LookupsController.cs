using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Investa.Application.DTOs;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/lookups")]
[Authorize]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpPost("seed-random")]
    [Authorize(Roles = "OrgUser")]
    public async Task<IActionResult> SeedRandom([FromQuery] Investa.Domain.Entities.Enums.LookupType type = Investa.Domain.Entities.Enums.LookupType.BusinessCategory, [FromQuery] int count = 5)
    {
        var rnd = new Random();
        var created = new List<LookupDto>();
        for (int i = 0; i < Math.Max(1, count); i++)
        {
            var key = $"Random-{type}-{Guid.NewGuid().ToString().Substring(0, 8)}";
            var dto = new CreateLookupDto
            {
                Type = type,
                Key = key,
                Value = key,
                ValueAr = key,
                SortOrder = 1000 + i
            };

            var result = await _lookupService.CreateAsync(dto);
            created.Add(result);
        }

        return Ok(new { success = true, createdCount = created.Count, items = created });
    }

    [HttpGet("business-stages")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBusinessStages()
    {
        var items = await _lookupService.GetByTypeAsync(LookupType.BusinessStage);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("project-phases")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProjectPhases()
    {
        var items = await _lookupService.GetByTypeAsync(LookupType.ProjectPhase);
        return Ok(new { success = true, data = items });
    }

    [HttpPost("normalize-and-verify")]
    [Authorize(Roles = "OrgUser")]
    public async Task<IActionResult> NormalizeAndVerify()
    {
        var result = await _lookupService.NormalizeAndVerifyAsync();
        return Ok(new { success = true, data = result });
    }

    [HttpGet]
    [AllowAnonymous]
    public Task<IActionResult> GetAll()
    {
        return Task.FromResult<IActionResult>(NotFound(new { message = "This endpoint is disabled." }));
    }
}
