using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Email;

public sealed class EmailService : IEmailService
{
    private readonly IEmailQueue _queue;
    private readonly IEmailTemplateRenderer _renderer;
    private readonly IEmailAttachmentProvider _attachmentProvider;
    private readonly EmailOptions _options;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IEmailQueue queue,
        IEmailTemplateRenderer renderer,
        IEmailAttachmentProvider attachmentProvider,
        IOptions<EmailOptions> options,
        ILogger<EmailService> logger)
    {
        _queue = queue;
        _renderer = renderer;
        _attachmentProvider = attachmentProvider;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(SendEmailRequest request, CancellationToken cancellationToken = default)
    {
        var outbox = new EmailOutbox
        {
            CorrelationId = Guid.NewGuid(),
            Recipient = request.To,
            Subject = request.Subject,
            HtmlBody = request.HtmlBody,
            SenderName = _options.Sender.Name,
            SenderEmail = _options.Sender.Email,
            Provider = _options.Provider,
            MaxRetries = _options.Retry.MaxRetries,
            Status = EmailOutboxStatus.Queued,
            CreatedAt = DateTime.UtcNow,
            Priority = request.Priority,
            Category = request.Category.ToString(),
            UserId = request.UserId
        };

        await _queue.EnqueueAsync(outbox, cancellationToken);

        _logger.LogInformation(
            "Email queued via EmailService outboxId={OutboxId} recipient={Recipient} subject={Subject} category={Category} priority={Priority}",
            outbox.Id, request.To, request.Subject, request.Category, request.Priority);
    }

    public async Task<long> SendTemplatedEmailAsync(SendTemplatedEmailRequest request, CancellationToken cancellationToken = default)
    {
        var renderResult = await _renderer.RenderAsync(request.TemplateName, request.Model, cancellationToken);
        var attachments = await _attachmentProvider.GetAttachmentsAsync(request.TemplateName, string.Empty, cancellationToken);

        var outbox = new EmailOutbox
        {
            CorrelationId = request.CorrelationId ?? Guid.NewGuid(),
            Recipient = request.Recipient,
            Subject = renderResult.Subject,
            HtmlBody = renderResult.HtmlBody,
            PlainTextBody = renderResult.PlainTextBody,
            SenderName = _options.Sender.Name,
            SenderEmail = _options.Sender.Email,
            Provider = request.Provider ?? _options.Provider,
            MaxRetries = _options.Retry.MaxRetries,
            Status = EmailOutboxStatus.Queued,
            CreatedAt = DateTime.UtcNow,
            Priority = request.Priority,
            Category = request.Category.ToString(),
            UserId = request.UserId
        };

        var allAttachments = request.Attachments ?? attachments;
        if (allAttachments.Count > 0)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(allAttachments);
            outbox.AttachmentsJson = json;
        }

        await _queue.EnqueueAsync(outbox, cancellationToken);

        _logger.LogInformation(
            "Templated email queued outboxId={OutboxId} template={Template} recipient={Recipient} category={Category} priority={Priority}",
            outbox.Id, request.TemplateName, request.Recipient, request.Category, request.Priority);
        return outbox.Id;
    }

    public Task<bool> VerifyConnectionAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("EmailService.VerifyConnectionAsync called (always returns true for queue-based system)");
        return Task.FromResult(true);
    }
}
