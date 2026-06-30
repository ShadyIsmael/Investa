using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

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

    // ──────────────────────────────────────────────────────────────────────────
    // In-app notification DTOs
    // ──────────────────────────────────────────────────────────────────────────

    public class UserNotificationDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public string? Icon { get; set; }
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    public class UserNotificationsPageDto
    {
        public List<UserNotificationDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
    }

    public class MarkReadRequestDto
    {
        public List<long>? Ids { get; set; }  // null = mark all
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Notification template DTOs (admin-portal facing)
    // ──────────────────────────────────────────────────────────────────────────

    public class NotificationTemplateDto
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string TitleTemplate { get; set; } = string.Empty;
        public string BodyTemplate { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public string? Icon { get; set; }
        public string? Category { get; set; }
        public bool IsActive { get; set; }
        public string? PlaceholderDocs { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateNotificationTemplateDto
    {
        [Required] [MaxLength(100)] public string Key { get; set; } = string.Empty;
        [Required] [MaxLength(200)] public string Name { get; set; } = string.Empty;
        [Required] [MaxLength(500)] public string TitleTemplate { get; set; } = string.Empty;
        [Required] [MaxLength(2000)] public string BodyTemplate { get; set; } = string.Empty;
        [MaxLength(20)] public string Type { get; set; } = "info";
        [MaxLength(100)] public string? Icon { get; set; }
        [MaxLength(100)] public string? Category { get; set; }
        public bool IsActive { get; set; } = true;
        [MaxLength(500)] public string? PlaceholderDocs { get; set; }
    }

    public class UpdateNotificationTemplateDto : CreateNotificationTemplateDto { }

    public class SendFromTemplateRequestDto
    {
        [Required] public string UserId { get; set; } = string.Empty;
        [Required] public string TemplateKey { get; set; } = string.Empty;
        public Dictionary<string, string>? Variables { get; set; }
        public string? ActionUrl { get; set; }
    }

    public class BroadcastNotificationRequestDto
    {
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Body { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Type { get; set; } = "info";

        [MaxLength(100)]
        public string? Icon { get; set; }

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        [Required]
        public NotificationAudience Audience { get; set; } = NotificationAudience.All;

        public Guid? SpecificUserId { get; set; }
    }

    public class NotificationDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public string? Icon { get; set; }
        public string? ActionUrl { get; set; }
        public NotificationAudience Audience { get; set; }
        public Guid? SpecificUserId { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public int RecipientCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BroadcastNotificationResponseDto
    {
        public NotificationDto Notification { get; set; } = new();
        public int RecipientCount { get; set; }
    }
}

