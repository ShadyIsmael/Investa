using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Chat;

namespace Investa.Application.Interfaces
{
    public interface IChatService
    {
        // New SignalR Chat Methods
        Task<Conversation> RequestSupportAsync(string userMobile);
        Task<ChatMessage> SendChatMessageAsync(Guid conversationId, string senderId, string text);

        // Legacy methods (keeping for compatibility)
        Task<Guid> CreateConversationAsync(Guid createdBy, IEnumerable<Guid> participantIds, byte type, string? title = null);
        Task<Guid> SendMessageAsync(Guid conversationId, Guid senderId, string plaintext);
        Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid conversationId, int page = 1, int pageSize = 50);

        // Support Chat Methods
        Task<SupportChatResponse> StartSupportChatAsync(Guid userId, SupportChatRequest request);
        Task<bool> AssignAdminToSupportChatAsync(Guid conversationId, string adminId);
        Task<bool> EndSupportChatAsync(Guid conversationId);
        Task<IEnumerable<ChatQueueItem>> GetQueuedSupportRequestsAsync();
    }
}