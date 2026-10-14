using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/project-stages")]
[AllowAnonymous]
public sealed class ProjectStagesController(IProjectStageMetadataService stages) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(new { success = true, data = stages.GetAll() });
}
