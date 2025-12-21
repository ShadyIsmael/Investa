using Investa.Application.DTOs.Profile;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.API.Utilities;

namespace Investa.API.Controllers;

/// <summary>
/// API controller for user profile operations.
/// Handles profile retrieval, updates, and IP tracking for user sessions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(IProfileService profileService, ILogger<ProfileController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the complete profile of the currently authenticated user.
    /// Returns all 4 sections: Basic Info, Contact Info, Identity & Compliance, and Audit & Usage.
    /// Also updates the last login timestamp and IP address.
    /// </summary>
    /// <returns>
    /// 200 OK: Complete UserProfileDto with all sections
    /// 401 Unauthorized: User not authenticated
    /// 404 Not Found: User profile not found (first-time users get empty sections)
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to extract user ID from claims");
                return Unauthorized("Unable to identify user from token");
            }

            // Get client IP and device info
            var clientIp = IpAddressUtility.GetClientIpAddress(HttpContext);
            var deviceInfo = IpAddressUtility.GetDeviceInfo(HttpContext);

            // Update last login info (IP and device)
            var profileDto = await _profileService.UpdateLastLoginAsync(userId, clientIp, deviceInfo);

            _logger.LogInformation($"User {userId} retrieved profile from IP: {clientIp}");

            return Ok(profileDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"User profile operation failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while retrieving the profile" });
        }
    }

    /// <summary>
    /// Updates the user's profile information.
    /// Allows updating Basic Info, Contact Info, and Identity & Compliance sections.
    /// </summary>
    /// <param name="profileDto">The profile data to update</param>
    /// <returns>
    /// 200 OK: Updated UserProfileDto
    /// 401 Unauthorized: User not authenticated
    /// 400 Bad Request: Invalid profile data
    /// 404 Not Found: User not found
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UserProfileDto profileDto)
    {
        try
        {
            if (profileDto == null)
                return BadRequest("Profile data is required");

            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Unable to identify user from token");

            var updatedProfile = await _profileService.UpdateUserProfileAsync(userId, profileDto);

            _logger.LogInformation($"User {userId} updated their profile");

            return Ok(updatedProfile);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Profile update failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while updating the profile" });
        }
    }

    /// <summary>
    /// Gets or creates a user profile if it doesn't exist.
    /// Useful for first-time login or profile initialization.
    /// </summary>
    /// <returns>
    /// 200 OK: UserProfileDto (newly created or existing)
    /// 401 Unauthorized: User not authenticated
    /// 404 Not Found: User not found
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpPost("me/initialize")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> InitializeProfile()
    {
        try
        {
            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Unable to identify user from token");

            // Get client IP for registration tracking
            var clientIp = IpAddressUtility.GetClientIpAddress(HttpContext);

            // Get or create profile
            var profileDto = await _profileService.GetOrCreateUserProfileAsync(userId);

            // Set registration IP if this is the first time
            if (string.IsNullOrWhiteSpace(profileDto.AuditUsage?.RegistrationIP))
            {
                profileDto = await _profileService.SetRegistrationIpAsync(userId, clientIp);
            }

            _logger.LogInformation($"User {userId} profile initialized with registration IP: {clientIp}");

            return Ok(profileDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Profile initialization failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error initializing user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while initializing the profile" });
        }
    }
}
