using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Email;

public sealed class EmailQueue : IEmailQueue
{
    private readonly ApplicationDbContext _db;
    private readonly EmailOptions _options;
    private readonly ILogger<EmailQueue> _logger;

    public EmailQueue(
        ApplicationDbContext db,
        IOptions<EmailOptions> options,
        ILogger<EmailQueue> logger)
    {
        _db = db;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<EmailOutbox> EnqueueAsync(EmailOutbox outbox, CancellationToken cancellationToken = default)
    {
        _db.EmailOutbox.Add(outbox);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Email queued outboxId={OutboxId} recipient={Recipient} subject={Subject}",
            outbox.Id, outbox.Recipient, outbox.Subject);
        return outbox;
    }

    public async Task<IReadOnlyList<EmailOutbox>> DequeueBatchAsync(int batchSize = 10, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var batch = await _db.EmailOutbox
            .Where(e => e.Status == EmailOutboxStatus.Queued
                && e.RetryCount <= e.MaxRetries
                && (e.NextAttemptAfter == null || e.NextAttemptAfter <= now))
            .OrderByDescending(e => e.Priority)
            .ThenBy(e => e.CreatedAt)
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        return batch.AsReadOnly();
    }

    public async Task MarkProcessingAsync(long id, CancellationToken cancellationToken = default)
    {
        var item = await _db.EmailOutbox.FindAsync(new object[] { id }, cancellationToken);
        if (item != null)
        {
            item.Status = EmailOutboxStatus.Processing;
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task MarkSentAsync(long id, string? providerMessageId = null, CancellationToken cancellationToken = default)
    {
        var item = await _db.EmailOutbox.FindAsync(new object[] { id }, cancellationToken);
        if (item != null)
        {
            item.Status = EmailOutboxStatus.Sent;
            item.SentAt = DateTime.UtcNow;
            item.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task MarkFailedAsync(long id, string failureReason, bool retryable, CancellationToken cancellationToken = default)
    {
        var item = await _db.EmailOutbox.FindAsync(new object[] { id }, cancellationToken);
        if (item != null)
        {
            item.RetryCount++;
            item.LastError = failureReason;
            if (!retryable || item.RetryCount > item.MaxRetries)
            {
                item.Status = EmailOutboxStatus.Failed;
                item.FailureReason = failureReason;
                item.CompletedAt = DateTime.UtcNow;
                item.NextAttemptAfter = null;
            }
            else
            {
                item.Status = EmailOutboxStatus.Queued;
                item.NextAttemptAfter = CalculateNextAttempt(item.RetryCount);
            }
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    private DateTime CalculateNextAttempt(int retryCount)
    {
        var baseDelay = TimeSpan.FromSeconds(_options.Retry.BaseDelaySeconds);
        var delay = _options.Retry.ExponentialBackoff
            ? TimeSpan.FromSeconds(baseDelay.TotalSeconds * Math.Pow(2, retryCount - 1))
            : baseDelay;
        return DateTime.UtcNow.Add(delay);
    }

    public async Task<int> GetQueuedCountAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _db.EmailOutbox
            .CountAsync(e => e.Status == EmailOutboxStatus.Queued
                && e.RetryCount <= e.MaxRetries
                && (e.NextAttemptAfter == null || e.NextAttemptAfter <= now), cancellationToken);
    }
}
