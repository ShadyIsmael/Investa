using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<UsersController> _logger;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public UsersController(
            INotificationService notificationService,
            ILogger<UsersController> logger,
            IStringLocalizer<SharedResource> localizer)
        {
            _notificationService = notificationService;
            _logger = logger;
            _localizer = localizer;
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
                    return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);
                }

                if (string.IsNullOrEmpty(request.FcmToken))
                {
                    return BadRequest(_localizer["FcmTokenRequired"].Value);
                }

                // Default to "Mobile" if not specified, or infer from User-Agent if needed
                string deviceType = "Mobile"; 

                var success = await _notificationService.RegisterTokenAsync(userId, request.FcmToken, deviceType);

                if (success)
                {
                    return Ok(new { message = _localizer["TokenSyncedSuccessfully"].Value });
                }
                
                return BadRequest(_localizer["FailedToSyncToken"].Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing FCM token");
                return StatusCode(500, _localizer["InternalServerError"].Value);
            }
        }
    }

    public class FcmTokenRequest
    {
        public string FcmToken { get; set; } = string.Empty;
    }
}
