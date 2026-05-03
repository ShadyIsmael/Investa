using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.API.Authorization;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers
{
    /// <summary>
    /// API controller for managing Firebase Cloud Messaging notifications
    /// Provides endpoints for token registration and notification delivery
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Registers or updates the current user's FCM device token
        /// </summary>
        /// <param name="request">Token registration details</param>
        /// <returns>Success status and message</returns>
        [HttpPost("register-token")]
        [ProducesResponseType(typeof(RegisterTokenResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<RegisterTokenResponseDto>> RegisterToken([FromBody] RegisterTokenRequestDto request)
        {
            try
            {
                // Use "sub" claim which holds the user GUID (ClaimTypes.NameIdentifier holds the username)
                var userId = User.FindFirstValue("sub") ?? User.FindFirstValue("id");
                
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("RegisterToken called without valid user ID in claims");
                    return Unauthorized(new RegisterTokenResponseDto 
                    { 
                        Success = false, 
                        Message = "User not authenticated" 
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new RegisterTokenResponseDto 
                    { 
                        Success = false, 
                        Message = "Invalid request data" 
                    });
                }

                // Validate device type
                var validDeviceTypes = new[] { "Web", "Android", "iOS" };
                if (!Array.Exists(validDeviceTypes, dt => dt.Equals(request.DeviceType, StringComparison.OrdinalIgnoreCase)))
                {
                    return BadRequest(new RegisterTokenResponseDto
                    {
                        Success = false,
                        Message = "Invalid device type. Must be Web, Android, or iOS"
                    });
                }

                var success = await _notificationService.RegisterTokenAsync(
                    userId, 
                    request.FcmToken, 
                    request.DeviceType);

                if (success)
                {
                    _logger.LogInformation("User {UserId} registered FCM token for {DeviceType}", userId, request.DeviceType);
                    return Ok(new RegisterTokenResponseDto
                    {
                        Success = true,
                        Message = "Device token registered successfully"
                    });
                }
                else
                {
                    return BadRequest(new RegisterTokenResponseDto
                    {
                        Success = false,
                        Message = "Failed to register device token"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RegisterToken endpoint");
                return StatusCode(500, new RegisterTokenResponseDto
                {
                    Success = false,
                    Message = "An error occurred while registering the token"
                });
            }
        }

        /// <summary>
        /// Sends a test push notification to a specific user (Admin only)
        /// </summary>
        /// <param name="request">Notification details including target user, title, and body</param>
        /// <returns>Notification delivery statistics</returns>
        [HttpPost("send-test")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(SendNotificationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<SendNotificationResponseDto>> SendTestNotification([FromBody] SendTestNotificationRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new SendNotificationResponseDto
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation("Admin {AdminId} sending test notification to user {UserId}", currentUserId, request.UserId);

                var result = await _notificationService.SendNotificationAsync(
                    request.UserId,
                    request.Title,
                    request.Body);

                return Ok(new SendNotificationResponseDto
                {
                    Success = result.Success,
                    Message = result.Message,
                    TokensFound = result.TokensFound,
                    SuccessCount = result.SuccessCount,
                    FailureCount = result.FailureCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendTestNotification endpoint");
                return StatusCode(500, new SendNotificationResponseDto
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Cleans up expired/invalid tokens for the current user
        /// </summary>
        /// <returns>Number of tokens removed</returns>
        [HttpDelete("cleanup-tokens")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> CleanupTokens()
        {
            try
            {
                var userId = User.FindFirstValue("sub") ?? User.FindFirstValue("id");
                
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var removedCount = await _notificationService.CleanupExpiredTokensAsync(userId);

                return Ok(new 
                { 
                    success = true, 
                    message = $"Cleaned up {removedCount} invalid token(s)",
                    removedCount 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CleanupTokens endpoint");
                return StatusCode(500, new { success = false, message = "An error occurred during cleanup" });
            }
        }
    }
}
