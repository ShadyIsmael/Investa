using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/file-categories")]
[AllowAnonymous]
public sealed class FileCategoriesController(IFileCategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default) => Ok(new { success = true, data = await categories.GetAllAsync(isActive: includeInactive ? null : true, cancellationToken: cancellationToken) });
}
