using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Email;

public sealed class NoopEmailTemplateRenderer : IEmailTemplateRenderer
{
    private readonly ILogger<NoopEmailTemplateRenderer> _logger;

    public NoopEmailTemplateRenderer(ILogger<NoopEmailTemplateRenderer> logger)
    {
        _logger = logger;
    }

    public Task<EmailTemplateResult> RenderAsync(string templateName, object model, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("NoopEmailTemplateRenderer: template rendering not implemented yet for {Template}", templateName);
        return Task.FromResult(new EmailTemplateResult
        {
            Subject = templateName,
            HtmlBody = $"<p>Template '{templateName}' not rendered yet.</p>",
            PlainTextBody = $"Template '{templateName}' not rendered yet."
        });
    }
}

public sealed class NullEmailAttachmentProvider : IEmailAttachmentProvider
{
    public Task<IReadOnlyList<EmailAttachment>> GetAttachmentsAsync(string referenceType, string referenceId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<EmailAttachment>>(Array.Empty<EmailAttachment>());
    }
}
