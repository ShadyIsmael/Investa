using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IEmailHistoryService
{
    Task<EmailHistory> RecordAsync(EmailHistory history, CancellationToken cancellationToken = default);

    Task UpdateStatusAsync(long id, string status, string? providerMessageId = null, string? failureReason = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EmailHistory>> GetByCorrelationIdAsync(Guid correlationId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EmailHistory>> GetByRecipientAsync(string recipient, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
}
