using System;
using System.Collections.Generic;

namespace Investa.Domain.Entities.Chat
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Conversation? Conversation { get; set; }
        public Guid SenderId { get; set; }

        // Encrypted payload
        public byte[] CipherText { get; set; } = Array.Empty<byte>();
        public byte[] Nonce { get; set; } = Array.Empty<byte>();
        public byte[] Tag { get; set; } = Array.Empty<byte>();
        public string? KeyId { get; set; }
        public string Algorithm { get; set; } = "AES-GCM";

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? EditedAt { get; set; }

        public Guid? ReplyToMessageId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? Metadata { get; set; }

        public ICollection<MessageAttachment>? Attachments { get; set; }
        public ICollection<MessageReaction>? Reactions { get; set; }
    }
}