namespace Investa.Application.Interfaces;

public interface IEmailTemplateRenderer
{
    Task<EmailTemplateResult> RenderAsync(string templateName, object model, CancellationToken cancellationToken = default);
}

public class EmailTemplateResult
{
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
}
