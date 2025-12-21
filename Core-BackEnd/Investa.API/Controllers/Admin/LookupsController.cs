using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/lookups")]
[Authorize(Roles = "OrgAdmin")]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _service;

    public LookupsController(ILookupService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<LookupDto>>.Success(items));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var items = await _service.GetAllAsync();
        var item = items.FirstOrDefault(i => i.Id == id);
        if (item == null) return NotFound(ApiResponse<object>.Fail(new[] { new ErrorDto("NotFound", "Lookup not found") }));
        return Ok(ApiResponse<LookupDto>.Success(item));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateLookupDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, ApiResponse<LookupDto>.Success(created, "Created"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateLookupDto dto)
    {
        var ok = await _service.UpdateAsync(id, dto);
        if (!ok) return NotFound(ApiResponse<object>.Fail(new[] { new ErrorDto("NotFound", "Lookup not found") }));
        return Ok(ApiResponse<object>.Success(null, "Updated"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound(ApiResponse<object>.Fail(new[] { new ErrorDto("NotFound", "Lookup not found") }));
        return Ok(ApiResponse<object>.Success(null, "Deleted"));
    }
}
