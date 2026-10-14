using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/file-storage-policy")]
[Authorize(Roles = "Admin")]
public sealed class FileStoragePolicyController(IFileStoragePolicyService policy) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> Get(CancellationToken cancellationToken) => Ok(new { success = true, data = await policy.GetAsync(cancellationToken) });
    [HttpPut] public async Task<IActionResult> Update(UpdateFileStoragePolicyRequest request, CancellationToken cancellationToken)
    {
        try { return Ok(new { success = true, data = await policy.UpdateAsync(request, ActorId(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return BadRequest(new { success = false, code = ex.Code, message = ex.Message }); }
    }
    private Guid? ActorId() { var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub"); return Guid.TryParse(value, out var id) ? id : null; }
}
