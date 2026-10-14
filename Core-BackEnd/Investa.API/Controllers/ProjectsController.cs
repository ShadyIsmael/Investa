using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/projects")]
public sealed class ProjectsController(IProjectService projects) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await projects.GetMineAsync(userId.Value)); }
        catch (BusinessValidationException ex) { return BusinessError(ex); }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await projects.GetAsync(userId.Value, id, User.IsInRole("Admin"))); }
        catch (BusinessValidationException ex) { return BusinessError(ex); }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        if (!ModelState.IsValid) return ErrorResponse("Invalid request", 400, ModelState);
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await projects.CreateAsync(userId.Value, request), "Project created successfully", 201); }
        catch (BusinessValidationException ex) { return BusinessError(ex); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request)
    {
        if (!ModelState.IsValid) return ErrorResponse("Invalid request", 400, ModelState);
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await projects.UpdateAsync(userId.Value, id, request)); }
        catch (BusinessValidationException ex) { return BusinessError(ex); }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Archive(int id, [FromBody] ArchiveProjectRequest request)
    {
        if (!ModelState.IsValid) return ErrorResponse("Invalid request", 400, ModelState);
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await projects.ArchiveAsync(userId.Value, id, request), "Project archived successfully"); }
        catch (BusinessValidationException ex) { return BusinessError(ex); }
    }

    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> TransitionStatus(int id, [FromBody] TransitionProjectStatusRequest request)
    {
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await projects.TransitionStatusAsync(userId.Value, id, request, User.IsInRole("Admin"))); }
        catch (BusinessValidationException ex) { return BusinessError(ex); }
    }

    private Guid? ResolveUserId()
    {
        var claim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private IActionResult BusinessError(BusinessValidationException ex)
    {
        var status = ex.Code == "PROJECT_NOT_FOUND" ? 404
            : ex.Code is "FOUNDER_ACCESS_REQUIRED" or "PROJECT_VIEW_FORBIDDEN" ? 403
            : ex.Code == "PROJECT_ARCHIVED" ? 409
            : 400;
        object? fieldErrors = ex.Code switch
        {
            "INVALID_FOUNDED_DATE" => new Dictionary<string, string[]> { [nameof(CreateProjectRequest.FoundedOn)] = [ex.Message] },
            "INVALID_PROJECT_STAGE" => new Dictionary<string, string[]> { [nameof(CreateProjectRequest.ProjectStage)] = [ex.Message] },
            "INVALID_CATEGORY" => new Dictionary<string, string[]> { [nameof(CreateProjectRequest.CategoryId)] = [ex.Message] },
            "PROJECT_FIELDS_REQUIRED" => new Dictionary<string, string[]>
            {
                [nameof(CreateProjectRequest.DisplayName)] = [ex.Message],
                [nameof(CreateProjectRequest.Summary)] = [ex.Message],
                [nameof(CreateProjectRequest.Description)] = [ex.Message]
            },
            _ => null
        };
        return ErrorResponse(ex.Message, status, fieldErrors);
    }
}
