using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/groups")]
[Route("api/admin/groups")]
[Authorize(Policy = "RequirePermission:RBAC.View")]
public class GroupsAdminController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsAdminController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    // ──────────────────────────────── CRUD ────────────────────────────────

    /// <summary>Get all active groups with their permissions (full detail).</summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var groups = await _groupService.GetAllAsync();
        var totalCount = groups.Count();
        var items = groups.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Ok(new { items, totalCount, page, pageSize, totalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
    }

    /// <summary>Get all active groups without permissions (lightweight list).</summary>
    [HttpGet("list")]
    public async Task<IActionResult> GetList([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var groups = await _groupService.GetAllWithoutPermissionsAsync();
        var totalCount = groups.Count();
        var items = groups.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Ok(new { items, totalCount, page, pageSize, totalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
    }

    /// <summary>Get a single group by ID (includes permissions).</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var g = await _groupService.GetByIdAsync(id);
        if (g == null) return NotFound();
        return Ok(g);
    }

    /// <summary>Create a new group.</summary>
    [HttpPost]
    [Authorize(Policy = "RequirePermission:Group.Manage")]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Group name is required.");

        var g = await _groupService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = g.Id }, g);
    }

    /// <summary>Update group name / description.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "RequirePermission:Group.Manage")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGroupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Group name is required.");

        var updated = await _groupService.UpdateAsync(id, request);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    /// <summary>Soft-delete a group.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "RequirePermission:Group.Manage")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _groupService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // ──────────────────────────── Permissions ─────────────────────────────

    /// <summary>Get all permissions assigned to a group.</summary>
    [HttpGet("{id:int}/permissions")]
    public async Task<IActionResult> GetPermissions(int id)
    {
        var perms = await _groupService.GetPermissionsAsync(id);
        return Ok(perms);
    }

    /// <summary>
    /// Bulk-replace all permissions for a group.
    /// Sends the complete desired permission list; unlisted permissions are removed.
    /// </summary>
    [HttpPost("{id:int}/permissions")]
    [Authorize(Policy = "RequirePermission:Group.Manage")]
    public async Task<IActionResult> UpdatePermissions(int id, [FromBody] UpdateGroupPermissionsRequest req)
    {
        var group = await _groupService.GetByIdAsync(id);
        if (group == null) return NotFound();

        await _groupService.UpdatePermissionsAsync(id, req.PermissionIds);
        return NoContent();
    }

    // ──────────────────────────────── Users ───────────────────────────────

    /// <summary>Add a user to a group.</summary>
    [HttpPost("{id:int}/users/{userId:guid}")]
    [Authorize(Policy = "RequirePermission:Group.Manage")]
    public async Task<IActionResult> AssignUser(int id, Guid userId)
    {
        await _groupService.AssignUserAsync(id, userId);
        return NoContent();
    }

    /// <summary>Remove a user from a group.</summary>
    [HttpDelete("{id:int}/users/{userId:guid}")]
    [Authorize(Policy = "RequirePermission:Group.Manage")]
    public async Task<IActionResult> RemoveUser(int id, Guid userId)
    {
        await _groupService.RemoveUserAsync(id, userId);
        return NoContent();
    }
}
