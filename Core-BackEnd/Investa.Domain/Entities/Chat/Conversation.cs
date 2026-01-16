using System;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities.Chat
{
    public class Conversation
    {
        public Guid Id { get; set; }
        public string UserMobile { get; set; } = string.Empty;
        public string? AdminEmail { get; set; }
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // New status field tracking lifecycle of the conversation (Pending, InProgress, Closed)
        public ConversationStatus Status { get; set; } = ConversationStatus.Pending;

        public ICollection<ChatMessage>? Messages { get; set; }
    }
}
