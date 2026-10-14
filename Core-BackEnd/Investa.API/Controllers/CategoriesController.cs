using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IProjectCategoryService _categoryService;

    public CategoriesController(IProjectCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, [FromQuery] string? search = null)
    {
        var items = await _categoryService.GetAllAsync(includeInactive, search);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _categoryService.GetByIdAsync(id, includeInactive: true);
        if (item == null) return NotFound(new { success = false, message = "Category not found" });
        return Ok(new { success = true, data = item });
    }
}
