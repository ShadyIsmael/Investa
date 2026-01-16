using System;
using System.Text.Json.Serialization;

namespace Investa.Application.DTOs
{
    public class ReceiveMessageDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("convId")]
        public Guid ConvId { get; set; }

        [JsonPropertyName("sender")]
        public string Sender { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("time")]
        public DateTime Time { get; set; }
    }

    public class AssignedNewUserDto
    {
        [JsonPropertyName("convId")]
        public Guid ConvId { get; set; }

        [JsonPropertyName("userMobile")]
        public string UserMobile { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = "online";
    }
}