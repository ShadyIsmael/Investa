using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs
{
    /// <summary>
    /// DTO for registering or updating a user's FCM device token
    /// </summary>
    public class RegisterTokenRequestDto
    {
        /// <summary>
        /// Firebase Cloud Messaging registration token
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string FcmToken { get; set; } = string.Empty;

        /// <summary>
        /// Device type: Web, Android, or iOS
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string DeviceType { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for sending a test push notification
    /// </summary>
    public class SendTestNotificationRequestDto
    {
        /// <summary>
        /// User ID to send the notification to
        /// </summary>
        [Required]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Notification title
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Notification body/message
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string Body { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response DTO for token registration
    /// </summary>
    public class RegisterTokenResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response DTO for notification sending
    /// </summary>
    public class SendNotificationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TokensFound { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
    }
}
