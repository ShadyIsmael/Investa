using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

[Table("EmailHistory")]
public class EmailHistory
{
    [Key]
    public long Id { get; set; }

    public long? EmailOutboxId { get; set; }

    [ForeignKey(nameof(EmailOutboxId))]
    public EmailOutbox? EmailOutbox { get; set; }

    public Guid CorrelationId { get; set; }

    [Required]
    [MaxLength(450)]
    public string Recipient { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Subject { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Template { get; set; }

    [MaxLength(100)]
    public string Provider { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ProviderMessageId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = EmailHistoryStatus.Queued;

    public EmailPriority Priority { get; set; } = EmailPriority.Normal;

    [MaxLength(50)]
    public string? Category { get; set; }

    public int RetryCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? SentAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? FailureReason { get; set; }
}

public static class EmailHistoryStatus
{
    public const string Queued = "Queued";
    public const string Processing = "Processing";
    public const string Sent = "Sent";
    public const string Delivered = "Delivered";
    public const string Opened = "Opened";
    public const string Clicked = "Clicked";
    public const string SoftBounce = "SoftBounce";
    public const string HardBounce = "HardBounce";
    public const string Failed = "Failed";
    public const string Skipped = "Skipped";
}
