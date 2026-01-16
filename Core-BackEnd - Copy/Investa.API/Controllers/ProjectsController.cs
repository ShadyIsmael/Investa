using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[ApiExplorerSettings(IgnoreApi = true)]
[Obsolete("This controller is disabled and removed from API surface.")]
public class ProjectsController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public Task<IActionResult> GetProjects()
    {
        return Task.FromResult<IActionResult>(NotFound(new { message = "This endpoint is disabled." }));
    }
} 