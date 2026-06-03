using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities
{
    /// <summary>
    /// Admin-configurable notification template.
    /// Templates define the structure and default content of notifications sent to users.
    /// Placeholders use the format {{variable}} and are substituted at send time.
    /// </summary>
    [Table("NotificationTemplates")]
    public class NotificationTemplate
    {
        [Key]
        public int Id { get; set; }

        /// <summary>Machine-readable key used to reference the template in code (e.g. "verification.approved")</summary>
        [Required]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty;

        /// <summary>Human-readable name shown in the admin portal</summary>
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        /// <summary>Notification title (supports {{placeholders}})</summary>
        [Required]
        [MaxLength(500)]
        public string TitleTemplate { get; set; } = string.Empty;

        /// <summary>Notification body/message (supports {{placeholders}})</summary>
        [Required]
        [MaxLength(2000)]
        public string BodyTemplate { get; set; } = string.Empty;

        /// <summary>Notification type: info | success | warning | error</summary>
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "info";

        /// <summary>Optional icon name or emoji to display with the notification</summary>
        [MaxLength(100)]
        public string? Icon { get; set; }

        /// <summary>Category label for grouping in the admin portal (e.g. "Verification", "Investment")</summary>
        [MaxLength(100)]
        public string? Category { get; set; }

        /// <summary>Whether this template is active and can be used to send notifications</summary>
        public bool IsActive { get; set; } = true;

        /// <summary>Comma-separated list of placeholder variable names for documentation (e.g. "userName,amount")</summary>
        [MaxLength(500)]
        public string? PlaceholderDocs { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(450)]
        public string? CreatedByUserId { get; set; }
    }
}
