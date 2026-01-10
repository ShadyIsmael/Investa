using Investa.Application.DTOs;
using Investa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/categories")]
[Authorize(Roles = "OrgUser")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _categoryService.GetAllAsync();
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _categoryService.GetByIdAsync(id);
        if (item == null) return NotFound(new { success = false, message = "Category not found" });
        return Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = "Invalid payload" });
        var created = await _categoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, new { success = true, data = created });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = "Invalid payload" });
        var ok = await _categoryService.UpdateAsync(id, dto);
        if (!ok) return NotFound(new { success = false, message = "Category not found" });
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _categoryService.DeleteAsync(id);
        if (!ok) return NotFound(new { success = false, message = "Category not found" });
        return NoContent();
    }
}
