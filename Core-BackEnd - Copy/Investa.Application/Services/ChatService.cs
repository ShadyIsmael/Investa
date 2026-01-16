using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Chat;

namespace Investa.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IUnitOfWork _uow;
        private readonly Investa.Application.Interfaces.IAdminAvailabilityService _adminAvailability;

        public ChatService(IUnitOfWork uow, Investa.Application.Interfaces.IAdminAvailabilityService adminAvailability)
        {
            _uow = uow;
            _adminAvailability = adminAvailability;
        }

        // New SignalR Chat Methods
        public async Task<Conversation> RequestSupportAsync(string userMobile)
        {
            // Check if there's already an active conversation for this user
            var existingConversation = await _uow.Repository<Conversation>()
                .FindAsync(c => c.UserMobile == userMobile && c.IsActive);

            if (existingConversation.Any())
            {
                return existingConversation.First();
            }

            // Find available admin
            var availableAdminEmail = await _adminAvailability.GetNextAvailableAdminAsync();

            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                UserMobile = userMobile,
                AdminEmail = availableAdminEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _uow.Repository<Conversation>().AddAsync(conversation);
            await _uow.SaveChangesAsync();

            // If admin was assigned, increment their chat count
            if (!string.IsNullOrEmpty(availableAdminEmail))
            {
                await _adminAvailability.IncrementAdminChatCountAsync(availableAdminEmail);
            }

            return conversation;
        }

        public async Task<ChatMessage> SendChatMessageAsync(Guid conversationId, string senderId, string text)
        {
            var conversation = await _uow.Repository<Conversation>().GetByIdAsync(conversationId);
            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            var message = new ChatMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderId = senderId,
                MessageText = text,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            await _uow.Repository<ChatMessage>().AddAsync(message);
            await _uow.SaveChangesAsync();

            return message;
        }

        // Legacy methods - keeping for compatibility but simplified
        public async Task<Guid> CreateConversationAsync(Guid createdBy, IEnumerable<Guid> participantIds, byte type, string? title = null)
        {
            // Simplified implementation for legacy compatibility
            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                UserMobile = "legacy", // Placeholder
                AdminEmail = null,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _uow.Repository<Conversation>().AddAsync(conversation);
            await _uow.SaveChangesAsync();

            return conversation.Id;
        }

        public async Task<Guid> SendMessageAsync(Guid conversationId, Guid senderId, string plaintext)
        {
            var message = await SendChatMessageAsync(conversationId, senderId.ToString(), plaintext);
            return message.Id;
        }

        public async Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid conversationId, int page = 1, int pageSize = 50)
        {
            var messages = await _uow.Repository<ChatMessage>()
                .FindAsync(m => m.ConversationId == conversationId);

            return messages
                .OrderByDescending(m => m.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderId = Guid.Parse(m.SenderId), // Assuming legacy compatibility
                    Content = m.MessageText,
                    CreatedAt = m.Timestamp
                });
        }

        // Support Chat Methods - keeping for compatibility
        public async Task<SupportChatResponse> StartSupportChatAsync(Guid userId, SupportChatRequest request)
        {
            // Simplified implementation
            var response = new SupportChatResponse
            {
                Success = false,
                Message = "Support chat functionality moved to SignalR RequestSupport method"
            };
            return response;
        }

        public async Task<bool> AssignAdminToSupportChatAsync(Guid conversationId, string adminId)
        {
            // Simplified implementation
            return true;
        }

        public async Task<bool> EndSupportChatAsync(Guid conversationId)
        {
            var conversation = await _uow.Repository<Conversation>().GetByIdAsync(conversationId);
            if (conversation != null)
            {
                conversation.IsActive = false;
                await _uow.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<ChatQueueItem>> GetQueuedSupportRequestsAsync()
        {
            return new List<ChatQueueItem>();
        }
    }
}