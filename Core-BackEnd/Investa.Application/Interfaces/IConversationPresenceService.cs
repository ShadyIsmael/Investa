namespace Investa.Application.Interfaces;

public interface IConversationPresenceService
{
    void SetActive(Guid userId, Guid conversationId);
    void Clear(Guid userId, Guid conversationId);
    bool IsActive(Guid userId, Guid conversationId);
}
