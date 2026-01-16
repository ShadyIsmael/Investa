using System;
using System.Collections.Generic;

namespace Investa.Domain.Entities
{
    public enum SupportSessionStatus
    {
        Open,
        Closed
    }

    public class SupportSession
    {
        public Guid Id { get; set; }
        public string UserMobile { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public SupportSessionStatus Status { get; set; } = SupportSessionStatus.Open;
        public int UnreadCount { get; set; } = 0;

        // Navigation property
        public ICollection<Message>? Messages { get; set; }
    }
}
