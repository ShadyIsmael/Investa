using System.Collections.Concurrent;
using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services;

public sealed class ConversationPresenceService : IConversationPresenceService
{
    private static readonly TimeSpan Expiry = TimeSpan.FromSeconds(75);
    private readonly ConcurrentDictionary<(Guid UserId, Guid ConversationId), DateTime> _heartbeats = new();

    public void SetActive(Guid userId, Guid conversationId) =>
        _heartbeats[(userId, conversationId)] = DateTime.UtcNow;

    public void Clear(Guid userId, Guid conversationId) =>
        _heartbeats.TryRemove((userId, conversationId), out _);

    public bool IsActive(Guid userId, Guid conversationId)
    {
        var key = (userId, conversationId);
        if (!_heartbeats.TryGetValue(key, out var heartbeat))
            return false;
        if (DateTime.UtcNow - heartbeat <= Expiry)
            return true;
        _heartbeats.TryRemove(key, out _);
        return false;
    }
}
