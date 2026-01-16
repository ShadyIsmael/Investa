using System;

namespace Investa.Domain.Entities.Chat
{
    public class ConversationParticipant
    {
        public Guid ConversationId { get; set; }
        public Conversation? Conversation { get; set; }

        public Guid UserId { get; set; }

        // Role (0=Member, 1=Admin)
        public byte Role { get; set; } = 0;

        // Read tracking
        public Guid? LastReadMessageId { get; set; }
        public DateTimeOffset? LastReadAt { get; set; }

        public bool IsMuted { get; set; } = false;
        public DateTimeOffset JoinedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}