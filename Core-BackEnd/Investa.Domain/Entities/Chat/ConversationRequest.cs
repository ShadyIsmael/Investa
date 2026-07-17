using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities.Chat;

public class ConversationRequest
{
    public Guid Id { get; set; }

    public int OpportunityId { get; set; }

    public Opportunity? Opportunity { get; set; }

    public Guid RequesterUserId { get; set; }

    public AuthUser? Requester { get; set; }

    public Guid RecipientUserId { get; set; }

    public AuthUser? Recipient { get; set; }

    public ConversationRequestStatus Status { get; set; } = ConversationRequestStatus.Pending;

    public string? Message { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? AcceptedConversationId { get; set; }

    public Conversation? AcceptedConversation { get; set; }
}
