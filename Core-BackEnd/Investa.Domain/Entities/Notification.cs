using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Notification
{
    public long Id { get; set; }

    [Required]
    [StringLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Body { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Type { get; set; } = "info";

    [StringLength(100)]
    public string? Icon { get; set; }

    [StringLength(500)]
    public string? ActionUrl { get; set; }

    public NotificationAudience Audience { get; set; } = NotificationAudience.All;

    public Guid? SpecificUserId { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
}
