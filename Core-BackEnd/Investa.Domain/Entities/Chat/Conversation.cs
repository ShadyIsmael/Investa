using System;
using System.Collections.Generic;

namespace Investa.Domain.Entities.Chat
{
    public enum ConversationType : byte
    {
        Direct = 1,
        Group = 2,
        Channel = 3
    }

    public class Conversation
    {
        public Guid Id { get; set; }
        public ConversationType Type { get; set; }
        public string? Title { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public bool IsArchived { get; set; } = false;

        // Envelope encryption fields
        public byte[]? WrappedDek { get; set; }
        public byte[]? DekNonce { get; set; }
        public byte[]? DekTag { get; set; }
        public string? DekKeyId { get; set; }
        public int? DekVersion { get; set; }

        public string? Metadata { get; set; }

        public ICollection<ConversationParticipant>? Participants { get; set; }
        public ICollection<Message>? Messages { get; set; }
    }
}
