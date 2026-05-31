using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;

namespace Investa.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing Roles in the Group-Bound Role Architecture.
/// Every role must belong to a group.
/// </summary>
[ApiController]
[Route("api/v1/admin")]
[Route("api/admin")]
[Authorize]
public class RolesAdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RolesAdminController> _logger;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public RolesAdminController(
        IUnitOfWork unitOfWork,
        ILogger<RolesAdminController> logger,
        IStringLocalizer<SharedResource> localizer)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _localizer = localizer;
    }

    // ──────────────────────────────── Roles ───────────────────────────────

    /// <summary>Get all active roles with their group names.</summary>
    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _unitOfWork.Repository<Role>().FindAsync(r => r.IsActive);
            var groupIds = roles.Select(r => r.GroupId).Distinct().ToList();

            var allGroups = await _unitOfWork.Repository<Group>().FindAsync(g => g.IsActive);
            var groupDict = allGroups.Where(g => groupIds.Contains(g.Id)).ToDictionary(g => g.Id);

            var dtos = roles.Select(r => new RoleWithGroupDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                GroupId = r.GroupId,
                GroupName = groupDict.TryGetValue(r.GroupId, out var grp) ? grp.Name : "Unknown",
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all roles");
            return StatusCode(500, "Error fetching roles");
        }
    }

    /// <summary>Get all active roles belonging to a specific group.</summary>
    [HttpGet("groups/{groupId:int}/roles")]
    public async Task<IActionResult> GetRolesByGroup(int groupId)
    {
        try
        {
            var roles = await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == groupId && r.IsActive);

            var dtos = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                GroupId = r.GroupId,
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching roles for group {GroupId}", groupId);
            return StatusCode(500, "Error fetching roles");
        }
    }

    /// <summary>Get a single role by ID.</summary>
    [HttpGet("roles/{roleId:guid}")]
    public async Task<IActionResult> GetRoleById(Guid roleId)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId))
                .FirstOrDefault();

            if (role == null) return NotFound();

            var group = (await _unitOfWork.Repository<Group>().FindAsync(g => g.Id == role.GroupId))
                .FirstOrDefault();

            return Ok(new RoleWithGroupDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                GroupId = role.GroupId,
                GroupName = group?.Name ?? "Unknown",
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching role {RoleId}", roleId);
            return StatusCode(500, "Error fetching role");
        }
    }

    /// <summary>Create a new role — groupId is mandatory.</summary>
    [HttpPost("roles")]
    [Authorize(Policy = "RequirePermission:Role.Manage")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(_localizer["RoleNameRequired"].Value);

            if (dto.GroupId <= 0)
                return BadRequest(_localizer["GroupIdRequired"].Value);

            var group = (await _unitOfWork.Repository<Group>()
                .FindAsync(g => g.Id == dto.GroupId && g.IsActive))
                .FirstOrDefault();

            if (group == null)
                return BadRequest(string.Format(_localizer["GroupNotFoundOrInactive"].Value, dto.GroupId));

            var duplicate = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == dto.GroupId && r.NormalizedName == dto.Name.ToUpperInvariant()))
                .FirstOrDefault();

            if (duplicate != null)
                return BadRequest(string.Format(_localizer["RoleAlreadyExistsInGroup"].Value, dto.Name));

            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                NormalizedName = dto.Name.ToUpperInvariant(),
                Description = dto.Description,
                GroupId = dto.GroupId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Role>().AddAsync(role);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoleById), new { roleId = role.Id }, new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                GroupId = role.GroupId,
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, "Error creating role");
        }
    }

    /// <summary>Update a role's name, description, or group.</summary>
    [HttpPut("roles/{roleId:guid}")]
    [Authorize(Policy = "RequirePermission:Role.Manage")]
    public async Task<IActionResult> UpdateRole(Guid roleId, [FromBody] UpdateRoleDto dto)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId && r.IsActive))
                .FirstOrDefault();

            if (role == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                // Check for duplicate name in same group (excluding current role)
                var newGroupId = dto.GroupId > 0 ? dto.GroupId : role.GroupId;
                var duplicate = (await _unitOfWork.Repository<Role>()
                    .FindAsync(r => r.GroupId == newGroupId
                                 && r.NormalizedName == dto.Name.ToUpperInvariant()
                                 && r.Id != roleId))
                    .FirstOrDefault();

                if (duplicate != null)
                    return BadRequest(string.Format(_localizer["RoleAlreadyExistsInGroup"].Value, dto.Name));

                role.Name = dto.Name;
                role.NormalizedName = dto.Name.ToUpperInvariant();
            }

            if (dto.Description != null)
                role.Description = dto.Description;

            if (dto.GroupId > 0)
            {
                var group = (await _unitOfWork.Repository<Group>()
                    .FindAsync(g => g.Id == dto.GroupId && g.IsActive))
                    .FirstOrDefault();

                if (group == null)
                    return BadRequest(string.Format(_localizer["GroupNotFoundOrInactive"].Value, dto.GroupId));

                role.GroupId = dto.GroupId;
            }

            role.ModifiedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();

            return Ok(new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                GroupId = role.GroupId,
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role {RoleId}", roleId);
            return StatusCode(500, "Error updating role");
        }
    }

    /// <summary>Soft-delete a role.</summary>
    [HttpDelete("roles/{roleId:guid}")]
    [Authorize(Policy = "RequirePermission:Role.Manage")]
    public async Task<IActionResult> DeleteRole(Guid roleId)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId && r.IsActive))
                .FirstOrDefault();

            if (role == null) return NotFound();

            role.IsActive = false;
            role.ModifiedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role {RoleId}", roleId);
            return StatusCode(500, "Error deleting role");
        }
    }

    // ──────────────────────────── Permissions ─────────────────────────────

    /// <summary>Get permissions assigned to a role.</summary>
    [HttpGet("roles/{roleId:guid}/permissions")]
    public async Task<IActionResult> GetRolePermissions(Guid roleId)
    {
        try
        {
            var rolePerms = await _unitOfWork.Repository<RolePermission>()
                .FindAsync(rp => rp.RoleId == roleId);

            var permIds = rolePerms.Select(rp => rp.PermissionId).ToList();

            if (!permIds.Any())
                return Ok(Array.Empty<PermissionDto>());

            var allPerms = await _unitOfWork.Repository<Investa.Domain.Entities.Permission>()
                .FindAsync(p => permIds.Contains(p.Id));

            var dtos = allPerms.Select(p => new PermissionDto
            {
                Id = p.Id,
                Key = p.Key,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            });

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching permissions for role {RoleId}", roleId);
            return StatusCode(500, "Error fetching role permissions");
        }
    }

    /// <summary>
    /// Bulk-replace permissions on a role.
    /// Existing permissions not in the supplied list are removed.
    /// </summary>
    [HttpPost("roles/{roleId:guid}/permissions")]
    [Authorize(Policy = "RequirePermission:Role.Manage")]
    public async Task<IActionResult> AssignPermissionsToRole(Guid roleId, [FromBody] AssignPermissionsDto dto)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId && r.IsActive))
                .FirstOrDefault();

            if (role == null) return NotFound("Role not found");

            var existing = await _unitOfWork.Repository<RolePermission>().FindAsync(rp => rp.RoleId == roleId);

            // Remove permissions not in incoming list
            foreach (var perm in existing.Where(p => !dto.PermissionIds.Contains(p.PermissionId)).ToList())
                await _unitOfWork.Repository<RolePermission>().DeleteAsync(perm);

            // Add new permissions
            var existingIds = existing.Select(p => p.PermissionId).ToHashSet();
            foreach (var permId in dto.PermissionIds.Where(id => !existingIds.Contains(id)))
            {
                await _unitOfWork.Repository<RolePermission>().AddAsync(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await _unitOfWork.SaveChangesAsync();
            return Ok(new { message = "Permissions updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning permissions to role {RoleId}", roleId);
            return StatusCode(500, "Error assigning permissions");
        }
    }

    // ──────────────────────────────── Users ───────────────────────────────

    /// <summary>Get all users assigned to a role.</summary>
    [HttpGet("roles/{roleId:guid}/users")]
    public async Task<IActionResult> GetRoleUsers(Guid roleId)
    {
        try
        {
            var userRoles = await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                .FindAsync(ur => ur.RoleId == roleId);

            var userIds = userRoles.Select(ur => ur.UserId).ToList();

            if (!userIds.Any())
                return Ok(Array.Empty<object>());

            var users = await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>()
                .FindAsync(u => userIds.Contains(u.Id));

            var dtos = users.Select(u => new
            {
                id = u.Id,
                email = u.Email,
                name = u.Name ?? u.Email
            });

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users for role {RoleId}", roleId);
            return StatusCode(500, "Error fetching role users");
        }
    }

    /// <summary>Assign one or more users to a role. Only OrgUsers may be assigned.</summary>
    [HttpPost("roles/{roleId:guid}/users")]
    [Authorize(Policy = "RequirePermission:Role.Manage")]
    public async Task<IActionResult> AssignUsersToRole(Guid roleId, [FromBody] AssignUsersDto dto)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId)).FirstOrDefault();
            if (role == null) return NotFound(_localizer["RoleNotFound"].Value);

            foreach (var uid in dto.UserIds.Distinct())
            {
                var user = await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>().GetByIdAsync(uid);
                if (user == null || user.UserType != Investa.Domain.Entities.Enums.UserType.OrgUser)
                {
                    _logger.LogWarning("Skipping non-OrgUser {UserId} for role {RoleId}", uid, roleId);
                    continue;
                }

                var exists = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                    .FindAsync(ur => ur.RoleId == roleId && ur.UserId == uid)).FirstOrDefault();

                if (exists == null)
                {
                    await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>().AddAsync(
                        new Investa.Domain.Entities.Security.UserRole
                        {
                            UserId = uid,
                            RoleId = roleId,
                            AssignedAt = DateTime.UtcNow
                        });
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return Ok(new { message = "Users assigned to role" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning users to role {RoleId}", roleId);
            return StatusCode(500, "Error assigning users to role");
        }
    }

    /// <summary>Remove a single user from a role.</summary>
    [HttpDelete("roles/{roleId:guid}/users/{userId:guid}")]
    [Authorize(Policy = "RequirePermission:Role.Manage")]
    public async Task<IActionResult> RemoveUserFromRole(Guid roleId, Guid userId)
    {
        try
        {
            var existing = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                .FindAsync(ur => ur.RoleId == roleId && ur.UserId == userId)).FirstOrDefault();

            if (existing == null) return NotFound();

            await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>().DeleteAsync(existing);
            await _unitOfWork.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {UserId} from role {RoleId}", userId, roleId);
            return StatusCode(500, "Error removing user from role");
        }
    }
}

// ─────────────────────────────────── DTOs ────────────────────────────────────

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int GroupId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RoleWithGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int GroupId { get; set; }
    public string GroupName { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRoleDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int GroupId { get; set; }
}

public class UpdateRoleDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    /// <summary>Set to a valid GroupId to move role to a different group; 0 = keep current group.</summary>
    public int GroupId { get; set; }
}

public class AssignPermissionsDto
{
    public List<int> PermissionIds { get; set; } = new();
}

public class AssignUsersDto
{
    public List<Guid> UserIds { get; set; } = new();
}
