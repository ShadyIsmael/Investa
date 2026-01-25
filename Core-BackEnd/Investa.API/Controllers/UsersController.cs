using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            INotificationService notificationService,
            ILogger<UsersController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Syncs the FCM token for the current user.
        /// Compatible with Flutter app implementation.
        /// </summary>
        [HttpPost("fcm-token")]
        public async Task<IActionResult> SyncFcmToken([FromBody] FcmTokenRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                if (string.IsNullOrEmpty(request.FcmToken))
                {
                    return BadRequest("FCM Token is required");
                }

                // Default to "Mobile" if not specified, or infer from User-Agent if needed
                string deviceType = "Mobile"; 

                var success = await _notificationService.RegisterTokenAsync(userId, request.FcmToken, deviceType);

                if (success)
                {
                    return Ok(new { message = "Token synced successfully" });
                }
                
                return BadRequest("Failed to sync token");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing FCM token");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    public class FcmTokenRequest
    {
        public string FcmToken { get; set; } = string.Empty;
    }
}
