using System;

namespace Investa.Domain.Entities
{
    public class ProfileChangeAudit
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string FieldName { get; set; } = null!;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? Reason { get; set; }
        public Guid? ChangedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}