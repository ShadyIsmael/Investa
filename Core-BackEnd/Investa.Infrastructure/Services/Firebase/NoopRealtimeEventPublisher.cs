using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class NoopRealtimeEventPublisher : IRealtimeEventPublisher
{
    public Task PublishToUserAsync(Guid userId, string eventType, Guid entityId, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task PublishToUserAsync(
        Guid userId,
        string eventType,
        Guid entityId,
        IReadOnlyDictionary<string, object?> data,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
