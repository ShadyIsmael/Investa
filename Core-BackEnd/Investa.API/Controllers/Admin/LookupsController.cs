using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/lookups")]
[Route("api/admin/lookups")]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(IgnoreApi = true)]
[Obsolete("This controller is disabled and removed from API surface.")]
public class LookupsController : ControllerBase
{
    [HttpGet]
    public Task<IActionResult> GetAll()
    {
        return Task.FromResult<IActionResult>(NotFound(new { message = "This endpoint is disabled." }));
    }
} 
