using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities
{
    /// <summary>
    /// Persisted in-app notification for a specific user.
    /// Created when the system sends a notification (from a template or ad-hoc).
    /// </summary>
    [Table("UserNotifications")]
    public class UserNotification
    {
        [Key]
        public long Id { get; set; }

        public long? NotificationId { get; set; }

        [ForeignKey(nameof(NotificationId))]
        public Notification? Notification { get; set; }

        /// <summary>Recipient user ID (references AspNetUsers.Id)</summary>
        [Required]
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        /// <summary>Optional reference to the template this notification was generated from</summary>
        public int? TemplateId { get; set; }

        [ForeignKey(nameof(TemplateId))]
        public NotificationTemplate? Template { get; set; }

        /// <summary>Resolved title (placeholders already substituted)</summary>
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        /// <summary>Resolved body/message (placeholders already substituted)</summary>
        [Required]
        [MaxLength(2000)]
        public string Body { get; set; } = string.Empty;

        /// <summary>Notification type: info | success | warning | error</summary>
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "info";

        /// <summary>Icon name or emoji inherited from template</summary>
        [MaxLength(100)]
        public string? Icon { get; set; }

        /// <summary>Whether the user has read/dismissed this notification</summary>
        public bool IsRead { get; set; } = false;

        /// <summary>Optional deep-link URL the notification should navigate to when clicked</summary>
        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>When the user read the notification (null if unread)</summary>
        public DateTime? ReadAt { get; set; }
    }
}
