using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Email;

public sealed class EmailHistoryService : IEmailHistoryService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<EmailHistoryService> _logger;

    public EmailHistoryService(ApplicationDbContext db, ILogger<EmailHistoryService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<EmailHistory> RecordAsync(EmailHistory history, CancellationToken cancellationToken = default)
    {
        _db.EmailHistory.Add(history);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Email history recorded id={HistoryId} status={Status} recipient={Recipient}",
            history.Id, history.Status, history.Recipient);
        return history;
    }

    public async Task UpdateStatusAsync(long id, string status, string? providerMessageId = null, string? failureReason = null, CancellationToken cancellationToken = default)
    {
        var item = await _db.EmailHistory.FindAsync(new object[] { id }, cancellationToken);
        if (item != null)
        {
            item.Status = status;
            if (providerMessageId != null) item.ProviderMessageId = providerMessageId;
            if (failureReason != null) item.FailureReason = failureReason;
            if (status == EmailHistoryStatus.Sent) item.SentAt = DateTime.UtcNow;
            if (status is EmailHistoryStatus.Failed or EmailHistoryStatus.HardBounce or EmailHistoryStatus.Delivered)
                item.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<IReadOnlyList<EmailHistory>> GetByCorrelationIdAsync(Guid correlationId, CancellationToken cancellationToken = default)
    {
        return await _db.EmailHistory
            .Where(h => h.CorrelationId == correlationId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmailHistory>> GetByRecipientAsync(string recipient, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        return await _db.EmailHistory
            .Where(h => h.Recipient == recipient)
            .OrderByDescending(h => h.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }
}
