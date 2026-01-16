using System;
using System.Text.Json.Serialization;

namespace Investa.Application.DTOs
{
    public class ActiveConversationDto
    {
        [JsonPropertyName("conversationId")]
        public Guid ConversationId { get; set; }

        [JsonPropertyName("userMobile")]
        public string UserMobile { get; set; } = string.Empty;

        [JsonPropertyName("category")]
        public string? Category { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("lastMessage")]
        public string? LastMessage { get; set; }
    }

    public class AdminPostMessageDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
    }
}