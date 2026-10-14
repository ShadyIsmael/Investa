using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/file-storage-policy")]
[AllowAnonymous]
public sealed class FileStoragePolicyController(IFileStoragePolicyService policy) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken) => Ok(new { success = true, data = await policy.GetAsync(cancellationToken) });
}
