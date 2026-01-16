using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/lookups")]
[Authorize(Roles = "OrgUser")]
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
