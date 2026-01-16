using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing Roles in the Group-Bound Role Architecture
/// Every role must belong to a group
/// </summary>
[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = nameof(UserRoles.Admin))]
public class RolesAdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RolesAdminController> _logger;

    public RolesAdminController(IUnitOfWork unitOfWork, ILogger<RolesAdminController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get all roles belonging to a specific group
    /// </summary>
    [HttpGet("groups/{groupId}/roles")]
    [ProducesResponseType(typeof(IEnumerable<RoleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRolesByGroup(int groupId)
    {
        try
        {
            var roles = await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == groupId && r.IsActive);

            var roleDtos = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                GroupId = r.GroupId,
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(roleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching roles for group {GroupId}", groupId);
            return StatusCode(500, "Error fetching roles");
        }
    }

    /// <summary>
    /// Get all roles in the system with their group information
    /// </summary>
    [HttpGet("roles")]
    [ProducesResponseType(typeof(IEnumerable<RoleWithGroupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.IsActive);

            var groupIds = roles.Select(r => r.GroupId).Distinct().ToList();
            
            // Query groups directly without using Contains to avoid OPENJSON issues
            var groups = new List<Group>();
            if (groupIds.Any())
            {
                var allGroups = await _unitOfWork.Repository<Group>()
                    .FindAsync(g => g.IsActive);
                groups = allGroups.Where(g => groupIds.Contains(g.Id)).ToList();
            }

            var groupDict = groups.ToDictionary(g => g.Id);

            var roleDtos = roles.Select(r => new RoleWithGroupDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                GroupId = r.GroupId,
                GroupName = groupDict.ContainsKey(r.GroupId) ? groupDict[r.GroupId].Name : "Unknown",
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(roleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all roles");
            return StatusCode(500, "Error fetching roles");
        }
    }

    /// <summary>
    /// Create a new role (must specify groupId)
    /// </summary>
    [HttpPost("roles")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Role name is required");

            if (dto.GroupId <= 0)
                return BadRequest("GroupId is required (roles must belong to a group)");

            // Verify group exists
            var group = (await _unitOfWork.Repository<Group>()
                .FindAsync(g => g.Id == dto.GroupId && g.IsActive))
                .FirstOrDefault();

            if (group == null)
                return BadRequest($"Group with ID {dto.GroupId} not found or inactive");

            // Check for duplicate role name in the same group
            var existing = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.GroupId == dto.GroupId && r.NormalizedName == dto.Name.ToUpperInvariant()))
                .FirstOrDefault();

            if (existing != null)
                return BadRequest($"Role '{dto.Name}' already exists in this group");

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

            var roleDto = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                GroupId = role.GroupId,
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt
            };

            return CreatedAtAction(nameof(GetRoleById), new { roleId = role.Id }, roleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, "Error creating role");
        }
    }

    /// <summary>
    /// Get a specific role by ID
    /// </summary>
    [HttpGet("roles/{roleId}")]
    [ProducesResponseType(typeof(RoleWithGroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoleById(Guid roleId)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.Id == roleId))
                .FirstOrDefault();

            if (role == null)
                return NotFound();

            var group = (await _unitOfWork.Repository<Group>()
                .FindAsync(g => g.Id == role.GroupId))
                .FirstOrDefault();

            var dto = new RoleWithGroupDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                GroupId = role.GroupId,
                GroupName = group?.Name ?? "Unknown",
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching role {RoleId}", roleId);
            return StatusCode(500, "Error fetching role");
        }
    }

    /// <summary>
    /// Assign permissions to a role
    /// </summary>
    [HttpPost("roles/{roleId}/permissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignPermissionsToRole(Guid roleId, [FromBody] AssignPermissionsDto dto)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.Id == roleId && r.IsActive))
                .FirstOrDefault();

            if (role == null)
                return NotFound("Role not found");

            // Remove existing permissions
            var existingPerms = await _unitOfWork.Repository<RolePermission>()
                .FindAsync(rp => rp.RoleId == roleId);

            foreach (var perm in existingPerms.ToList())
            {
                await _unitOfWork.Repository<RolePermission>().DeleteAsync(perm);
            }

            // Add new permissions
            foreach (var permId in dto.PermissionIds)
            {
                await _unitOfWork.Repository<RolePermission>().AddAsync(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await _unitOfWork.SaveChangesAsync();

            return Ok(new { message = "Permissions assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning permissions to role {RoleId}", roleId);
            return StatusCode(500, "Error assigning permissions");
        }

    }

    /// <summary>
    /// Assign one or more users to a role
    /// </summary>
    [HttpPost("roles/{roleId}/users")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignUsersToRole(Guid roleId, [FromBody] AssignUsersDto dto)
    {
        try
        {
            var role = (await _unitOfWork.Repository<Role>().FindAsync(r => r.Id == roleId)).FirstOrDefault();
            if (role == null) return NotFound("Role not found");

            // Remove duplicates
            var userIds = dto.UserIds.Distinct().ToList();

            foreach (var uid in userIds)
            {
                var exists = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                    .FindAsync(ur => ur.RoleId == roleId && ur.UserId == uid)).FirstOrDefault();
                if (exists == null)
                {
                    await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>().AddAsync(new Investa.Domain.Entities.Security.UserRole
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

    /// <summary>
    /// Remove a user from a role
    /// </summary>
    [HttpDelete("roles/{roleId}/users/{userId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
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

// DTOs
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

public class AssignPermissionsDto
{
    public List<int> PermissionIds { get; set; } = new();
}

public class AssignUsersDto
{
    public List<Guid> UserIds { get; set; } = new();
}
