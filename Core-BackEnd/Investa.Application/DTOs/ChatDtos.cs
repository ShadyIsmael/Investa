using System;

namespace Investa.Application.DTOs
{
    public class CreateSupportRequestDto
    {
        public string UserMobile { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Message { get; set; }
    }

    public class SendMessageDto
    {
        public string Message { get; set; } = string.Empty;
        public string UserMobile { get; set; } = string.Empty;
        public Guid? ConversationId { get; set; }
    }
}
