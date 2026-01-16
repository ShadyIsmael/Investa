using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities;

namespace Investa.Application.Interfaces
{
    public interface IChatService
    {
        // New SignalR Chat Methods
        Task<SupportSession> RequestSupportAsync(string userMobile);
        // Overload that accepts type and message for mobile contract
        Task<SupportSession> RequestSupportAsync(string userMobile, string? type, string? message);
        Task<ChatMessage> SendChatMessageAsync(Guid supportSessionId, string senderId, string text);

        // Legacy methods (keeping for compatibility)
        Task<Guid> CreateConversationAsync(Guid createdBy, IEnumerable<Guid> participantIds, byte type, string? title = null);
        Task<Guid> SendMessageAsync(Guid conversationId, Guid senderId, string plaintext);
        Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid supportSessionId, int page = 1, int pageSize = 50);

        // Support Chat Methods
        Task<SupportChatResponse> StartSupportChatAsync(Guid userId, SupportChatRequest request);
        Task<bool> AssignAdminToSupportChatAsync(Guid supportSessionId, string adminId);
        Task<bool> EndSupportChatAsync(Guid supportSessionId);
        Task<IEnumerable<ChatQueueItem>> GetQueuedSupportRequestsAsync();
    }
}