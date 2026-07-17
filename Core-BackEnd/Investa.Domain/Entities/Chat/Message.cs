using System;

namespace Investa.Domain.Entities.Chat
{
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public Guid? ConversationId { get; set; }
        public Conversation? Conversation { get; set; }
        public string SenderId { get; set; } = string.Empty; // Mobile or Email
        public Guid? SenderUserId { get; set; }
        public AuthUser? Sender { get; set; }
        public string MessageText { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public bool IsEdited { get; set; }
        public DateTime? EditedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? AttachmentsJson { get; set; }
        public Guid? SupportSessionId { get; set; } // Nullable to allow safe migration and gradual backfill
    }
}
