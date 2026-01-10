using System;

namespace Investa.Domain.Entities.Chat
{
    public class MessageAttachment
    {
        public Guid Id { get; set; }
        public Guid MessageId { get; set; }
        public Message? Message { get; set; }

        public string StoragePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string? ContentType { get; set; }
        public long SizeBytes { get; set; }
    }
}