using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces
{
    public interface IChatService
    {
        Task<Guid> CreateConversationAsync(Guid createdBy, IEnumerable<Guid> participantIds, byte type, string? title = null);
        Task<Guid> SendMessageAsync(Guid conversationId, Guid senderId, string plaintext);
        Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid conversationId, int page = 1, int pageSize = 50);
    }
}