using System;

namespace Investa.Domain.Entities
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid SupportSessionId { get; set; }
        public SupportSession? SupportSession { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
    }
}
