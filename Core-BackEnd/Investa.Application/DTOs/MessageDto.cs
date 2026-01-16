using System;

namespace Investa.Application.DTOs
{
    public class MessageDto
    {
        public Guid Id { get; set; }=Guid.NewGuid();
        public string SenderId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}