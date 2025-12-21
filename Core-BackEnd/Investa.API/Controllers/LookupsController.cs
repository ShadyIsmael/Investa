using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/lookups")]
[Authorize]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _service;

    public LookupsController(ILookupService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<LookupDto>>.Success(items));
    }

    [HttpGet("by-type/{type}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByType(string type)
    {
        if (!Enum.TryParse<LookupType>(type, true, out var lt))
            return BadRequest(ApiResponse<object>.Fail(new[] { new ErrorDto("InvalidType", "Lookup type is invalid. Use BusinessStage or BusinessCategory") }));

        var items = await _service.GetByTypeAsync(lt);
        return Ok(ApiResponse<IEnumerable<LookupDto>>.Success(items));
    }

    [HttpGet("grouped")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGrouped()
    {
        var stages = await _service.GetByTypeAsync(LookupType.BusinessStage);
        var categories = await _service.GetByTypeAsync(LookupType.BusinessCategory);

        var result = new
        {
            BusinessStage = stages,
            BusinessCategory = categories
        };

        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("business-stages")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBusinessStages()
    {
        var stages = await _service.GetByTypeAsync(LookupType.BusinessStage);
        return Ok(ApiResponse<IEnumerable<LookupDto>>.Success(stages));
    }

    [HttpGet("business-categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBusinessCategories()
    {
        var categories = await _service.GetByTypeAsync(LookupType.BusinessCategory);
        return Ok(ApiResponse<IEnumerable<LookupDto>>.Success(categories));
    }
}
