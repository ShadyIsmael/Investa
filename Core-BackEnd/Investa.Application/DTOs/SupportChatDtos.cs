using System;

namespace Investa.Application.DTOs
{
    public class SupportChatRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string InitialMessage { get; set; } = string.Empty;
        public string? Category { get; set; } // e.g., "General", "Technical", "Billing"
        public int Priority { get; set; } = 1; // 1=Low, 2=Medium, 3=High
    }

    public class SupportChatResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? ConversationId { get; set; }
        public string? AssignedAdminId { get; set; }
        public string? AssignedAdminName { get; set; }
        public bool IsQueued { get; set; }
        public int QueuePosition { get; set; }
        public DateTimeOffset? EstimatedWaitTime { get; set; }
    }

    public class NewChatRequestNotification
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string InitialMessage { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int Priority { get; set; }
        public DateTimeOffset RequestedAt { get; set; }
    }

    public class ChatQueueItem
    {
        public Guid RequestId { get; set; }
        public Guid UserId { get; set; }
        public SupportChatRequest Request { get; set; } = new();
        public DateTimeOffset QueuedAt { get; set; }
        public int Priority { get; set; }
        public int QueuePosition { get; set; }
    }
}