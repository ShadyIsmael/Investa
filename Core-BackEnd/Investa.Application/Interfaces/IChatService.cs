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
        // SignalR Chat Methods
        Task<SupportSession> RequestSupportAsync(string userMobile);
        Task<SupportSession> RequestSupportAsync(string userMobile, string? type, string? message);
        Task<ChatMessage> SendChatMessageAsync(Guid supportSessionId, string senderId, string text);
        Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid supportSessionId, int page = 1, int pageSize = 50);
        Task<bool> EndSupportChatAsync(Guid supportSessionId);

        // Founder-Investor Chat Methods
        Task<Conversation> CreateConversationAsync(Guid userId1, Guid userId2, string? title = null);
        Task<Conversation?> GetConversationBetweenUsersAsync(Guid userId1, Guid userId2);
    }
}