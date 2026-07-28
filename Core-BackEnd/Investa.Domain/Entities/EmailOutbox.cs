using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

[Table("EmailOutbox")]
public class EmailOutbox
{
    [Key]
    public long Id { get; set; }

    public Guid CorrelationId { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(450)]
    public string Recipient { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Subject { get; set; } = string.Empty;

    public string HtmlBody { get; set; } = string.Empty;

    public string? PlainTextBody { get; set; }

    [MaxLength(200)]
    public string? SenderName { get; set; }

    [MaxLength(450)]
    public string? SenderEmail { get; set; }

    public string? AttachmentsJson { get; set; }

    [MaxLength(100)]
    public string Provider { get; set; } = "MailerSend";

    [MaxLength(450)]
    public string? UserId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = EmailOutboxStatus.Queued;

    public int RetryCount { get; set; }

    public int MaxRetries { get; set; } = 3;

    public EmailPriority Priority { get; set; } = EmailPriority.Normal;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = nameof(EmailCategory.System);

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? SentAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? FailureReason { get; set; }

    public string? LastError { get; set; }

    public DateTime? NextAttemptAfter { get; set; }
}

public static class EmailOutboxStatus
{
    public const string Queued = "Queued";
    public const string Processing = "Processing";
    public const string Sent = "Sent";
    public const string Failed = "Failed";
}
