using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Security;
using Microsoft.Extensions.Logging;

namespace Investa.API.Controllers.Admin
{
    /// <summary>
    /// Admin controller for managing organizational users (internal staff).
    /// Provides CRUD operations and user profile management for OrgUser type accounts.
    /// </summary>
    [ApiController]
    [Route("api/v1/admin/users")]
    [Authorize(Roles = nameof(UserRoles.Admin))]
    public class UsersAdminController : ControllerBase
    {
        private readonly IOrgUserService _orgUserService;
        private readonly IProfileService _profileService;
        private readonly ILogger<UsersAdminController> _logger;

        public UsersAdminController(
            IOrgUserService orgUserService,
            IProfileService profileService,
            ILogger<UsersAdminController> logger)
        {
            _orgUserService = orgUserService;
            _profileService = profileService;
            _logger = logger;
        }

        /// <summary>
        /// Gets a basic paginated list of organizational users.
        /// </summary>
        /// <param name="page">Page number (1-based)</param>
        /// <param name="pageSize">Number of items per page</param>
        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllOrgUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            try
            {
                var (total, items) = await _orgUserService.GetOrgUsersAsync(page, pageSize);
                return Ok(new { items, total, page, pageSize });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving organizational users");
                return StatusCode(500, new { message = "Error retrieving users" });
            }
        }

        /// <summary>
        /// Gets a detailed paginated list of organizational users with advanced filtering.
        /// </summary>
        /// <param name="page">Page number (1-based)</param>
        /// <param name="pageSize">Number of items per page</param>
        /// <param name="search">Search term for name or email</param>
        /// <param name="roleId">Filter by role ID</param>
        /// <param name="groupId">Filter by group ID</param>
        /// <param name="status">Filter by status (active/inactive)</param>
        [HttpGet("list")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsersList(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25,
            [FromQuery] string? search = null,
            [FromQuery] Guid? roleId = null,
            [FromQuery] int? groupId = null,
            [FromQuery] string? status = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 25;

            try
            {
                var (total, items) = await _orgUserService.GetOrgUsersDetailedAsync(
                    page, pageSize, search, roleId, groupId, status);
                
                return Ok(new { items, total, page, pageSize });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving detailed user list");
                return StatusCode(500, new { message = "Error retrieving users" });
            }
        }

        /// <summary>
        /// Gets or creates the current authenticated user's profile.
        /// </summary>
        /// <param name="createIfNotExists">Whether to create profile if it doesn't exist</param>
        [HttpGet("myprofile")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrCreateOrgUserProfile([FromQuery] bool createIfNotExists = true)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            try
            {
                var profile = await _profileService.GetUserProfileAsync(userId);
                var (roleName, groupName) = await _orgUserService.GetUserRoleInfoAsync(userId);

                if (profile != null)
                {
                    return Ok(new
                    {
                        FirstName = profile.BasicInfo?.FirstName,
                        LastName = profile.BasicInfo?.LastName,
                        Mobile = profile.ContactInfo?.Phone1,
                        Image = profile.BasicInfo?.AvatarUrl,
                        RoleName = roleName,
                        GroupName = groupName
                    });
                }

                if (!createIfNotExists)
                {
                    return NotFound(new { message = "Profile not found" });
                }

                profile = await _profileService.GetOrCreateUserProfileAsync(userId);
                return Ok(new
                {
                    FirstName = profile.BasicInfo?.FirstName,
                    LastName = profile.BasicInfo?.LastName,
                    Mobile = profile.ContactInfo?.Phone1,
                    Image = profile.BasicInfo?.AvatarUrl,
                    RoleName = roleName,
                    GroupName = groupName,
                    created = true
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Profile operation failed for user {UserId}", userId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving profile for user {UserId}", userId);
                return StatusCode(500, new { message = "Error retrieving profile" });
            }
        }

        /// <summary>
        /// Creates a new organizational user.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(OrgUserAdminDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrgUser([FromBody] CreateOrgUserDto dto)
        {
            try
            {
                var user = await _orgUserService.CreateOrgUserAsync(dto);
                if (user == null)
                    return BadRequest(new { message = "Failed to create user" });

                return CreatedAtAction(nameof(GetUsersList), new { id = user.Id }, user);
            }
            catch (NotImplementedException)
            {
                return StatusCode(501, new { message = "Feature not yet implemented" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organizational user");
                return StatusCode(500, new { message = "Error creating user" });
            }
        }

        /// <summary>
        /// Updates an organizational user.
        /// </summary>
        [HttpPut("{userId:guid}")]
        [ProducesResponseType(typeof(OrgUserAdminDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrgUser([FromRoute] Guid userId, [FromBody] UpdateOrgUserDto dto)
        {
            try
            {
                var user = await _orgUserService.UpdateOrgUserAsync(userId, dto);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (NotImplementedException)
            {
                return StatusCode(501, new { message = "Feature not yet implemented" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", userId);
                return StatusCode(500, new { message = "Error updating user" });
            }
        }

        /// <summary>
        /// Deletes an organizational user.
        /// </summary>
        [HttpDelete("{userId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOrgUser([FromRoute] Guid userId)
        {
            try
            {
                var success = await _orgUserService.DeleteOrgUserAsync(userId);
                if (!success)
                    return NotFound(new { message = "User not found" });

                return NoContent();
            }
            catch (NotImplementedException)
            {
                return StatusCode(501, new { message = "Feature not yet implemented" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", userId);
                return StatusCode(500, new { message = "Error deleting user" });
            }
        }

        /// <summary>
        /// Bulk updates the status of multiple organizational users.
        /// </summary>
        [HttpPost("bulk-update-status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> BulkUpdateStatus([FromBody] BulkUpdateStatusRequest request)
        {
            if (request.Ids == null || !request.Ids.Any())
                return BadRequest(new { message = "No user IDs provided" });

            try
            {
                var isActive = request.Status?.ToLowerInvariant() == "active";
                var success = await _orgUserService.BulkUpdateStatusAsync(request.Ids, isActive);
                
                if (!success)
                    return BadRequest(new { message = "Failed to update users" });

                return Ok(new { message = $"Successfully updated {request.Ids.Count} users" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk updating user status");
                return StatusCode(500, new { message = "Error updating users" });
            }
        }
    }

    /// <summary>
    /// Request model for bulk status updates.
    /// </summary>
    public class BulkUpdateStatusRequest
    {
        public List<Guid> Ids { get; set; } = new();
        public string? Status { get; set; }
    }
}

