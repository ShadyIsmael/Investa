using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/project-categories")]
[Route("api/admin/project-categories")]
[Authorize(Roles = "Admin")]
public sealed class ProjectCategoriesController(IProjectCategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search = null, [FromQuery] bool? isActive = null)
        => Ok(new { success = true, data = await categories.GetAllAsync(includeInactive: true, search, isActive) });

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await categories.GetByIdAsync(id);
        return item == null ? NotFound(new { success = false, code = "CATEGORY_NOT_FOUND" }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectCategoryRequest request)
    {
        try
        {
            var item = await categories.CreateAsync(request, CurrentUserId());
            return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { success = false, code = ex.Code, message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectCategoryRequest request)
    {
        try
        {
            var item = await categories.UpdateAsync(id, request, CurrentUserId());
            return item == null ? NotFound(new { success = false, code = "CATEGORY_NOT_FOUND" }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { success = false, code = ex.Code, message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] SetProjectCategoryStatusRequest request)
    {
        var item = await categories.SetStatusAsync(id, request.IsActive, CurrentUserId());
        return item == null ? NotFound(new { success = false, code = "CATEGORY_NOT_FOUND" }) : Ok(new { success = true, data = item });
    }

    private Guid? CurrentUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
}
