using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/users/approval")]
[Route("api/admin/users/approval")]
public class AdminUserApprovalController : ControllerBase
{
    private readonly IAdminUserApprovalService _approvalService;
    private readonly ILogger<AdminUserApprovalController> _logger;

    public AdminUserApprovalController(
        IAdminUserApprovalService approvalService,
        ILogger<AdminUserApprovalController> logger)
    {
        _approvalService = approvalService;
        _logger = logger;
    }

    private Guid? ResolveUserId()
    {
        var claim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (Guid.TryParse(claim, out var id)) return id;
        return null;
    }

    private string? ResolveIpAddress() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();

    [HttpGet("pending")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> GetPendingChanges([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var items = await _approvalService.GetPendingChangesAsync(page, pageSize);
        return Ok(new { items });
    }

    [HttpGet("my-submissions")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> GetMySubmissions([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = ResolveUserId();
        if (userId == null) return Unauthorized();
        var items = await _approvalService.GetMySubmittedChangesAsync(userId.Value, page, pageSize);
        return Ok(new { items });
    }

    [HttpGet("{id:long}")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> GetChangeById([FromRoute] long id)
    {
        var userId = ResolveUserId();
        if (userId == null) return Unauthorized();
        var item = await _approvalService.GetChangeByIdAsync(id, userId.Value);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("submit")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> SubmitChange([FromBody] SubmitAdminChangeDto dto)
    {
        var userId = ResolveUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var result = await _approvalService.SubmitChangeAsync(dto, userId.Value, ResolveIpAddress());
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting admin change");
            return StatusCode(500, new { message = "Error submitting change for approval" });
        }
    }

    [HttpPost("{id:long}/approve")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> ApproveChange([FromRoute] long id, [FromBody] ApproveAdminChangeDto dto)
    {
        var userId = ResolveUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var result = await _approvalService.ApproveChangeAsync(id, dto, userId.Value, ResolveIpAddress());
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving admin change {ChangeId}", id);
            return StatusCode(500, new { message = "Error approving change" });
        }
    }

    [HttpPost("{id:long}/reject")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> RejectChange([FromRoute] long id, [FromBody] RejectAdminChangeDto dto)
    {
        var userId = ResolveUserId();
        if (userId == null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(dto.RejectionReason))
            return BadRequest(new { message = "Rejection reason is required" });
        try
        {
            var result = await _approvalService.RejectChangeAsync(id, dto, userId.Value, ResolveIpAddress());
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting admin change {ChangeId}", id);
            return StatusCode(500, new { message = "Error rejecting change" });
        }
    }

    [HttpPost("{id:long}/cancel")]
    [Authorize(Policy = "RequirePermission:AdminUsers.ApproveChanges")]
    public async Task<IActionResult> CancelChange([FromRoute] long id)
    {
        var userId = ResolveUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var result = await _approvalService.CancelChangeAsync(id, userId.Value);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling admin change {ChangeId}", id);
            return StatusCode(500, new { message = "Error cancelling change" });
        }
    }
}
