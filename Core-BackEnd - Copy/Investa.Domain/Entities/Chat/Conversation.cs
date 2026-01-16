using System;

namespace Investa.Domain.Entities.Chat
{
    public class Conversation
    {
        public Guid Id { get; set; }
        public string UserMobile { get; set; } = string.Empty;
        public string? AdminEmail { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public ICollection<ChatMessage>? Messages { get; set; }
    }
}
