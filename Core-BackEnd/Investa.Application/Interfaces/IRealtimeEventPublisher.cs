namespace Investa.Application.Interfaces;

public interface IRealtimeEventPublisher
{
    Task PublishToUserAsync(Guid userId, string eventType, Guid entityId, CancellationToken cancellationToken = default);

    Task PublishToUserAsync(
        Guid userId,
        string eventType,
        Guid entityId,
        IReadOnlyDictionary<string, object?> data,
        CancellationToken cancellationToken = default);
}
