using System;

namespace Investa.Domain.Entities.Chat
{
    public class MessageReaction
    {
        public Guid MessageId { get; set; }
        public ChatMessage? Message { get; set; }

        public Guid UserId { get; set; }
        public string Reaction { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}