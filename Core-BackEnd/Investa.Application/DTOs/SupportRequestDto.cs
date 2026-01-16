using System.Text.Json.Serialization;

namespace Investa.Application.DTOs
{
    /// <summary>
    /// DTO for support request from client to hub (inbound)
    /// Matches Flutter mobile contract exactly
    /// </summary>
    public class SupportRequestDto
    {
        [JsonPropertyName("userMobile")]
        public string UserMobile { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = "Request"; // "Request", "Inquire", "Problem"

        [JsonPropertyName("conversationId")]
        public string? ConversationId { get; set; }
    }

    /// <summary>
    /// DTO for broadcasting support request to admins (outbound)
    /// </summary>
    public class SupportRequestNotificationDto
    {
        [JsonPropertyName("convId")]
        public Guid ConvId { get; set; }

        [JsonPropertyName("userMobile")]
        public string UserMobile { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("category")]
        public string Category { get; set; } = string.Empty; // Mapped from Mobile 'type'

        [JsonPropertyName("adminAssigned")]
        public bool AdminAssigned { get; set; }

        [JsonPropertyName("adminEmail")]
        public string? AdminEmail { get; set; }

        [JsonPropertyName("requestedAt")]
        public DateTime RequestedAt { get; set; }

        [JsonPropertyName("serverName")]
        public string ServerName { get; set; } = string.Empty;
    }
}
