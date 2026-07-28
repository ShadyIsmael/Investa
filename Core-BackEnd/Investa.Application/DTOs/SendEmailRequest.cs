using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class SendEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;

    public string HtmlBody { get; set; } = string.Empty;

    public EmailCategory Category { get; set; } = EmailCategory.System;

    public EmailPriority Priority { get; set; } = EmailPriority.Normal;

    public string? UserId { get; set; }
}

