using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/groups")]
[Authorize(Roles = "OrgUser")]
public class GroupsAdminController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsAdminController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var groups = await _groupService.GetAllAsync();
        return Ok(groups);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
    {
        var g = await _groupService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = g.Id }, g);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var g = await _groupService.GetByIdAsync(id);
        if (g == null) return NotFound();
        return Ok(g);
    }

    [HttpPost("{id}/permissions")]
    public async Task<IActionResult> AssignPermission(int id, [FromBody] AssignPermissionRequest req)
    {
        if (id != req.GroupId) return BadRequest();
        await _groupService.AssignPermissionAsync(req.GroupId, req.PermissionId);
        return NoContent();
    }

    [HttpPost("{id}/users/{userId}")]
    public async Task<IActionResult> AssignUser(int id, Guid userId)
    {
        await _groupService.AssignUserAsync(id, userId);
        return NoContent();
    }

    [HttpDelete("{id}/users/{userId}")]
    public async Task<IActionResult> RemoveUser(int id, Guid userId)
    {
        await _groupService.RemoveUserAsync(id, userId);
        return NoContent();
    }
}
