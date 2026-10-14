using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/files")]
[Authorize]
public sealed class FilesController(IFileUploadService uploads) : ControllerBase
{
    [HttpPost("upload")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string categoryCode, [FromForm] int? projectId, [FromForm] string? entityType, [FromForm] string? entityId, CancellationToken cancellationToken)
    {
        if (file is null) return BadRequest(new { success = false, code = "FILE_REQUIRED", message = "A file is required." });
        if (string.IsNullOrWhiteSpace(categoryCode))
            return BadRequest(new { success = false, code = "CATEGORY_REQUIRED", message = "A file category is required." });
        if (string.Equals(categoryCode.Trim(), "FUNDING_PROOF", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { success = false, code = "FUNDING_PROOF_UPLOAD_REQUIRES_DECLARATION", message = "Funding proof must be uploaded together with a Funding Declaration." });
        var userId = ResolveUserId();
        if (!userId.HasValue) return Unauthorized(new { success = false, code = "USER_REQUIRED" });
        try
        {
            await using var stream = file.OpenReadStream();
            var result = await uploads.UploadAsync(new FileUploadCommand(categoryCode, stream, file.FileName, file.ContentType, file.Length, userId.Value, projectId, entityType, entityId, User.IsInRole("Admin")), cancellationToken);
            return Ok(new { success = true, data = result });
        }
        catch (BusinessValidationException ex) { return BadRequest(new { success = false, code = ex.Code, message = ex.Message }); }
    }
    private Guid? ResolveUserId() { var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("id"); return Guid.TryParse(value, out var id) ? id : null; }
}
