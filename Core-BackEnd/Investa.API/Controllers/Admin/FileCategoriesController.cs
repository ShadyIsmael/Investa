using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/file-categories")]
[Authorize(Roles = "Admin")]
public sealed class FileCategoriesController(IFileCategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken) => Ok(new { success = true, data = await categories.GetAllAsync(search, isActive, cancellationToken) });
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken) { var item = await categories.GetByIdAsync(id, cancellationToken); return item is null ? NotFound(new { success = false, code = "FILE_CATEGORY_NOT_FOUND" }) : Ok(new { success = true, data = item }); }
    [HttpPost]
    public async Task<IActionResult> Create(CreateFileCategoryRequest request, CancellationToken cancellationToken) { try { var item = await categories.CreateAsync(request, ActorId(), cancellationToken); return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item }); } catch (BusinessValidationException ex) { return BadRequest(new { success = false, code = ex.Code, message = ex.Message }); } }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateFileCategoryRequest request, CancellationToken cancellationToken) { try { var item = await categories.UpdateAsync(id, request, ActorId(), cancellationToken); return item is null ? NotFound(new { success = false, code = "FILE_CATEGORY_NOT_FOUND" }) : Ok(new { success = true, data = item }); } catch (BusinessValidationException ex) { return BadRequest(new { success = false, code = ex.Code, message = ex.Message }); } }
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, SetFileCategoryStatusRequest request, CancellationToken cancellationToken) { var item = await categories.SetStatusAsync(id, request.IsActive, ActorId(), cancellationToken); return item is null ? NotFound(new { success = false, code = "FILE_CATEGORY_NOT_FOUND" }) : Ok(new { success = true, data = item }); }
    private Guid? ActorId() { var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub"); return Guid.TryParse(value, out var id) ? id : null; }
}
