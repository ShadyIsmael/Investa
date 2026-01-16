using System;

namespace Investa.Domain.Entities.Chat
{
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Conversation? Conversation { get; set; }
        public string SenderId { get; set; } = string.Empty; // Mobile or Email
        public string MessageText { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
    }
}