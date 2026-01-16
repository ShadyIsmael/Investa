using System;

namespace Investa.Application.DTOs
{
    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }
}