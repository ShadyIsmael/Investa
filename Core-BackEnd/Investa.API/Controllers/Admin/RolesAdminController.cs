using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;
using System.ComponentModel.DataAnnotations;

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

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static RoleResponseDto ToDto(Role role, string groupName) => new()
    {
        Id = role.Id,
        RoleCode = role.RoleCode,
        NameEn = role.NameEn,
        NameAr = role.NameAr,
        DescriptionEn = role.DescriptionEn,
        DescriptionAr = role.DescriptionAr,
        GroupId = role.GroupId,
        GroupName = groupName,
        IsActive = role.IsActive,
        CreatedAt = role.CreatedAt
    };

    // ──────────────────────────────── Roles ───────────────────────────────

    /// <summary>Get all roles with their group names.</summary>
    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _unitOfWork.Repository<Role>().GetAllAsync();
            var groupIds = roles.Select(r => r.GroupId).Distinct().ToList();

            var allGroups = await _unitOfWork.Repository<Group>().GetAllAsync();
            var groupDict = allGroups.Where(g => groupIds.Contains(g.Id)).ToDictionary(g => g.Id);

            var dtos = roles.Select(r => ToDto(r, groupDict.TryGetValue(r.GroupId, out var grp) ? grp.Name : "Unknown")).ToList();

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all roles");
            return StatusCode(500, "Error fetching roles");
        }
    }

    /// <summary>Get all roles belonging to a specific group.</summary>
    [HttpGet("groups/{groupId:int}/roles")]
    public async Task<IActionResult> GetRolesByGroup(int groupId)
    {
        try
        {
            var roles = await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == groupId);

            var group = (await _unitOfWork.Repository<Group>().FindAsync(g => g.Id == groupId)).FirstOrDefault();

            var dtos = roles.Select(r => ToDto(r, group?.Name ?? "Unknown")).ToList();

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

            return Ok(ToDto(role, group?.Name ?? "Unknown"));
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
            if (string.IsNullOrWhiteSpace(dto.NameEn) || string.IsNullOrWhiteSpace(dto.NameAr))
                return BadRequest(new { code = "ROLE_NAMES_REQUIRED", message = "English and Arabic role names are required." });

            if (dto.GroupId <= 0)
                return BadRequest(_localizer["GroupIdRequired"].Value);

            var group = (await _unitOfWork.Repository<Group>()
                .FindAsync(g => g.Id == dto.GroupId && g.IsActive))
                .FirstOrDefault();

            if (group == null)
                return BadRequest(string.Format(_localizer["GroupNotFoundOrInactive"].Value, dto.GroupId));

            var duplicate = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == dto.GroupId && r.NormalizedName == dto.NameEn.Trim().ToUpperInvariant()))
                .FirstOrDefault();

            if (duplicate != null)
                return BadRequest(string.Format(_localizer["RoleAlreadyExistsInGroup"].Value, dto.NameEn));

            var role = new Role
            {
                Id = Guid.NewGuid(),
                NameEn = dto.NameEn.Trim(),
                NameAr = dto.NameAr.Trim(),
                DescriptionEn = NormalizeOptional(dto.DescriptionEn),
                DescriptionAr = NormalizeOptional(dto.DescriptionAr),
                Name = dto.NameEn.Trim(),
                NormalizedName = dto.NameEn.Trim().ToUpperInvariant(),
                Description = NormalizeOptional(dto.DescriptionEn),
                GroupId = dto.GroupId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Role>().AddAsync(role);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoleById), new { roleId = role.Id }, ToDto(role, group.Name));
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
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId))
                .FirstOrDefault();

            if (role == null) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.NameEn) || string.IsNullOrWhiteSpace(dto.NameAr))
                return BadRequest(new { code = "ROLE_NAMES_REQUIRED", message = "English and Arabic role names are required." });

            var newGroupId = dto.GroupId > 0 ? dto.GroupId : role.GroupId;
            var duplicate = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == newGroupId
                             && r.NormalizedName == dto.NameEn.Trim().ToUpperInvariant()
                             && r.Id != roleId))
                .FirstOrDefault();

            if (duplicate != null)
                return BadRequest(string.Format(_localizer["RoleAlreadyExistsInGroup"].Value, dto.NameEn));

            role.NameEn = dto.NameEn.Trim();
            role.NameAr = dto.NameAr.Trim();
            role.DescriptionEn = NormalizeOptional(dto.DescriptionEn);
            role.DescriptionAr = NormalizeOptional(dto.DescriptionAr);
            role.Name = role.NameEn;
            role.NormalizedName = role.NameEn.ToUpperInvariant();
            role.Description = role.DescriptionEn;
            role.IsActive = dto.IsActive;

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

            var responseGroup = (await _unitOfWork.Repository<Group>().FindAsync(g => g.Id == role.GroupId)).First();
            return Ok(ToDto(role, responseGroup.Name));
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
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId && r.IsActive)).FirstOrDefault();
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

public class RoleResponseDto
{
    public Guid Id { get; set; }
    public string RoleCode { get; set; } = null!;
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public int GroupId { get; set; }
    public string GroupName { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRoleDto
{
    [Required, StringLength(256)]
    public string NameEn { get; set; } = null!;
    [Required, StringLength(256)]
    public string NameAr { get; set; } = null!;
    [StringLength(500)]
    public string? DescriptionEn { get; set; }
    [StringLength(500)]
    public string? DescriptionAr { get; set; }
    public int GroupId { get; set; }
}

public class UpdateRoleDto
{
    [Required, StringLength(256)]
    public string NameEn { get; set; } = null!;
    [Required, StringLength(256)]
    public string NameAr { get; set; } = null!;
    [StringLength(500)]
    public string? DescriptionEn { get; set; }
    [StringLength(500)]
    public string? DescriptionAr { get; set; }
    public bool IsActive { get; set; } = true;
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
