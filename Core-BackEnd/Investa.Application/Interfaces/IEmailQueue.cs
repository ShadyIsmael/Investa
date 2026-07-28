using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IEmailQueue
{
    Task<EmailOutbox> EnqueueAsync(EmailOutbox outbox, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EmailOutbox>> DequeueBatchAsync(int batchSize = 10, CancellationToken cancellationToken = default);

    Task MarkProcessingAsync(long id, CancellationToken cancellationToken = default);

    Task MarkSentAsync(long id, string? providerMessageId = null, CancellationToken cancellationToken = default);

    Task MarkFailedAsync(long id, string failureReason, bool retryable, CancellationToken cancellationToken = default);

    Task<int> GetQueuedCountAsync(CancellationToken cancellationToken = default);
}
