using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class SendTemplatedEmailRequest
{
    public string Recipient { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public object? Model { get; set; }
    public string? Provider { get; set; }
    public Guid? CorrelationId { get; set; }
    public IReadOnlyList<EmailAttachment>? Attachments { get; set; }

    public EmailCategory Category { get; set; } = EmailCategory.System;

    public EmailPriority Priority { get; set; } = EmailPriority.Normal;

    public string? UserId { get; set; }
}
