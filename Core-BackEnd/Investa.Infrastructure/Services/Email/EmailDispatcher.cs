using System.Text.Json;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Email;

public sealed class EmailDispatcher : IEmailDispatcher
{
    private readonly IEmailQueue _queue;
    private readonly IEmailHistoryService _historyService;
    private readonly IEmailPreferenceService _preferenceService;
    private readonly IEnumerable<IEmailProvider> _providers;
    private readonly EmailOptions _options;
    private readonly ILogger<EmailDispatcher> _logger;

    public EmailDispatcher(
        IEmailQueue queue,
        IEmailHistoryService historyService,
        IEmailPreferenceService preferenceService,
        IEnumerable<IEmailProvider> providers,
        IOptions<EmailOptions> options,
        ILogger<EmailDispatcher> logger)
    {
        _queue = queue;
        _historyService = historyService;
        _preferenceService = preferenceService;
        _providers = providers;
        _options = options.Value;
        _logger = logger;
    }

    public async Task DispatchAsync(CancellationToken cancellationToken = default)
    {
        var batch = await _queue.DequeueBatchAsync(_options.Queue.BatchSize, cancellationToken);

        foreach (var outbox in batch)
        {
            if (cancellationToken.IsCancellationRequested) break;

            try
            {
                var category = Enum.TryParse<EmailCategory>(outbox.Category, out var parsed)
                    ? parsed
                    : EmailCategory.System;

                if (!string.IsNullOrWhiteSpace(outbox.UserId) && EmailCategoryMetadata.IsOptional(category))
                {
                    var enabled = await _preferenceService.IsCategoryEnabledAsync(outbox.UserId, category, cancellationToken);
                    if (!enabled)
                    {
                        _logger.LogInformation(
                            "Skipping email outboxId={OutboxId} user={UserId} category={Category} (disabled by user)",
                            outbox.Id, outbox.UserId, category);
                        await _queue.MarkFailedAsync(outbox.Id, "Skipped: user disabled this email category", false, cancellationToken);
                        await RecordHistory(outbox, EmailHistoryStatus.Skipped, cancellationToken, failureReason: "User disabled category");
                        continue;
                    }
                }

                await _queue.MarkProcessingAsync(outbox.Id, cancellationToken);
                await RecordHistory(outbox, EmailHistoryStatus.Processing, cancellationToken);

                var provider = ResolveProvider(outbox.Provider);
                if (provider == null)
                {
                    await FailAsync(outbox, $"No email provider found for '{outbox.Provider}'", false, cancellationToken);
                    continue;
                }

                var message = MapToMessage(outbox);
                var result = await provider.SendAsync(message, cancellationToken);

                if (result.Success)
                {
                    await _queue.MarkSentAsync(outbox.Id, result.ProviderMessageId, cancellationToken);
                    await RecordHistory(outbox, EmailHistoryStatus.Sent, cancellationToken, result.ProviderMessageId);
                }
                else
                {
                    await FailAsync(outbox, result.FailureReason ?? "Unknown provider error", result.IsRetryable, cancellationToken);
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Unexpected error dispatching email outboxId={OutboxId} recipient={Recipient}",
                    outbox.Id, outbox.Recipient);
                await FailAsync(outbox, $"Unexpected error: {ex.Message}", true, cancellationToken);
            }
        }
    }

    private IEmailProvider? ResolveProvider(string? providerName)
    {
        var name = providerName ?? _options.Provider;
        return _providers.FirstOrDefault(p =>
            p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    private static EmailMessage MapToMessage(EmailOutbox outbox)
    {
        var attachments = !string.IsNullOrWhiteSpace(outbox.AttachmentsJson)
            ? JsonSerializer.Deserialize<List<EmailAttachment>>(outbox.AttachmentsJson)
            : null;

        return new EmailMessage
        {
            Recipient = outbox.Recipient,
            Subject = outbox.Subject,
            HtmlBody = outbox.HtmlBody,
            PlainTextBody = outbox.PlainTextBody,
            SenderName = outbox.SenderName,
            SenderEmail = outbox.SenderEmail,
            CorrelationId = outbox.CorrelationId,
            Attachments = attachments?.AsReadOnly(),
            UserId = outbox.UserId,
            Category = Enum.TryParse<EmailCategory>(outbox.Category, out var cat) ? cat : EmailCategory.System,
            Priority = outbox.Priority
        };
    }

    private async Task RecordHistory(EmailOutbox outbox, string status, CancellationToken cancellationToken, string? providerMessageId = null, string? failureReason = null)
    {
        try
        {
            await _historyService.RecordAsync(new EmailHistory
            {
                EmailOutboxId = outbox.Id,
                CorrelationId = outbox.CorrelationId,
                Recipient = outbox.Recipient,
                Subject = outbox.Subject,
                Provider = outbox.Provider,
                ProviderMessageId = providerMessageId,
                Status = status,
                Priority = outbox.Priority,
                Category = outbox.Category,
                RetryCount = outbox.RetryCount,
                FailureReason = failureReason,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to record email history for outboxId={OutboxId}", outbox.Id);
        }
    }

    private async Task FailAsync(EmailOutbox outbox, string reason, bool retryable, CancellationToken cancellationToken)
    {
        var willExceedMaxRetries = !retryable || outbox.RetryCount + 1 > outbox.MaxRetries;
        await _queue.MarkFailedAsync(outbox.Id, reason, retryable, cancellationToken);
        var status = willExceedMaxRetries
            ? EmailHistoryStatus.Failed
            : EmailHistoryStatus.Queued;
        await RecordHistory(outbox, status, cancellationToken);
    }
}