using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class EmailMessage
{
    public string Recipient { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public IReadOnlyList<EmailAttachment>? Attachments { get; set; }
    public Guid? CorrelationId { get; set; }
    public string? Provider { get; set; }
    public string? UserId { get; set; }
    public EmailCategory Category { get; set; } = EmailCategory.System;
    public EmailPriority Priority { get; set; } = EmailPriority.Normal;
}

public class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string? ContentId { get; set; }
}

public class EmailProviderResult
{
    public bool Success { get; set; }
    public string? ProviderMessageId { get; set; }
    public string? FailureReason { get; set; }
    public bool IsRetryable { get; set; }
}
