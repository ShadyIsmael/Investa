namespace Investa.Application.DTOs;

public class SendEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;

    /// <summary>
    /// Raw HTML body.
    /// </summary>
    public string HtmlBody { get; set; } = string.Empty;
}

