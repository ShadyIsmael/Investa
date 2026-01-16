using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/groups")]
// [Authorize(Roles = nameof(UserRoles.Admin))]
public class GroupsAdminController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsAdminController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var groups = await _groupService.GetAllAsync();
        
        var totalCount = groups.Count();
        var pagedGroups = groups
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
            
        return Ok(new
        {
            items = pagedGroups,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetAllWithoutPermissions([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var groups = await _groupService.GetAllWithoutPermissionsAsync();
        
        var totalCount = groups.Count();
        var pagedGroups = groups
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
            
        return Ok(new
        {
            items = pagedGroups,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
    {
        var g = await _groupService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = g.Id }, g);
    }

    [HttpGet("{id:int}")]
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
