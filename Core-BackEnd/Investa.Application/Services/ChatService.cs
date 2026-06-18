using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IUnitOfWork _uow;
        private readonly Investa.Application.Interfaces.IAdminAvailabilityService _adminAvailability;
        private readonly ILogger<ChatService> _logger;

        public ChatService(IUnitOfWork uow, Investa.Application.Interfaces.IAdminAvailabilityService adminAvailability, ILogger<ChatService> logger)
        {
            _uow = uow;
            _adminAvailability = adminAvailability;
            _logger = logger;
        }

        // New SignalR Chat Methods
        public async Task<SupportSession> RequestSupportAsync(string userMobile)
        {
            // Check if there's already an active support session for this user
            var existing = await _uow.Repository<SupportSession>()
                .FindAsync(s => s.UserMobile == userMobile && s.Status == SupportSessionStatus.Open);

            if (existing.Any())
            {
                return existing.First();
            }

            // Find available admin
            var availableAdminEmail = await _adminAvailability.GetNextAvailableAdminAsync();

            var session = new SupportSession
            {
                Id = Guid.NewGuid(),
                UserMobile = userMobile,
                Category = null,
                CreatedAt = DateTime.UtcNow,
                Status = SupportSessionStatus.Open,
                UnreadCount = 1
            };

            await _uow.Repository<SupportSession>().AddAsync(session);
            await _uow.SaveChangesAsync();

            // Auto-insert an initial assistant message for new sessions (as ChatMessage)
            var assistantMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SupportSessionId = session.Id,
                SenderId = "Investa Assistant",
                MessageText = "Hello! I'm the Investa Assistant. We've received your request and an agent will be with you shortly.",
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            await _uow.Repository<ChatMessage>().AddAsync(assistantMessage);
            await _uow.SaveChangesAsync();

            // If admin was assigned, increment their chat count
            if (!string.IsNullOrEmpty(availableAdminEmail))
            {
                await _adminAvailability.IncrementAdminChatCountAsync(availableAdminEmail);
            }

            return session;
        }

        // New overload: accept type and message from mobile client, store initial message
        public async Task<SupportSession> RequestSupportAsync(string userMobile, string? type, string? message)
        {
            var session = await RequestSupportAsync(userMobile);

            // If a type (category) is provided, persist it on the support session and save as the first user message for admin context
            if (!string.IsNullOrEmpty(type))
            {
                session.Category = type;
                await _uow.SaveChangesAsync();

                var categoryMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SupportSessionId = session.Id,
                    SenderId = userMobile,
                    MessageText = type,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };

                await _uow.Repository<ChatMessage>().AddAsync(categoryMessage);
                await _uow.SaveChangesAsync();
            }

            // If an initial message is provided, save it as the first chat message (after category when present)
            if (!string.IsNullOrEmpty(message))
            {
                await SendChatMessageAsync(session.Id, userMobile, message);
            }

            return session;
        }

        public async Task<ChatMessage> SendChatMessageAsync(Guid supportSessionId, string senderId, string text)
        {
            var session = await _uow.Repository<SupportSession>().GetByIdAsync(supportSessionId);
            if (session == null)
                throw new InvalidOperationException("Support session not found");

            var message = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SupportSessionId = supportSessionId,
                SenderId = senderId,
                MessageText = text,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            await _uow.Repository<ChatMessage>().AddAsync(message);
            await _uow.SaveChangesAsync();

            return message;
        }

        public async Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid supportSessionId, int page = 1, int pageSize = 50)
        {
            var messages = await _uow.Repository<ChatMessage>()
                .FindAsync(m => m.SupportSessionId == supportSessionId);

            return messages
                .OrderByDescending(m => m.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    ConversationId = m.SupportSessionId ?? Guid.Empty,
                    SenderId = Guid.Parse(m.SenderId),
                    Content = m.MessageText,
                    CreatedAt = m.Timestamp
                });
        }

        public async Task<bool> EndSupportChatAsync(Guid supportSessionId)
        {
            var session = await _uow.Repository<SupportSession>().GetByIdAsync(supportSessionId);
            if (session != null)
            {
                session.Status = SupportSessionStatus.Closed;
                await _uow.SaveChangesAsync();
                return true;
            }
            return false;
        }

        // Founder-Investor Chat Methods
        public async Task<Conversation> CreateConversationAsync(Guid userId1, Guid userId2, string? title = null)
        {
            _logger.LogInformation("Creating conversation between user {UserId1} and user {UserId2}", userId1, userId2);

            // Check if conversation already exists between these users
            var existingConversation = await GetConversationBetweenUsersAsync(userId1, userId2);
            if (existingConversation != null)
            {
                _logger.LogInformation("Conversation already exists between user {UserId1} and user {UserId2}", userId1, userId2);
                return existingConversation;
            }

            // Create new conversation
            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                UserMobile = $"{userId1}_{userId2}", // Using combined IDs as identifier
                Category = title ?? "Investment Discussion",
                CreatedAt = DateTime.UtcNow,
                Status = ConversationStatus.Pending,
                IsActive = true
            };

            await _uow.Repository<Conversation>().AddAsync(conversation);

            // Add both users as participants
            var participant1 = new ConversationParticipant
            {
                ConversationId = conversation.Id,
                UserId = userId1,
                Role = 0, // Member
                JoinedAt = DateTimeOffset.UtcNow
            };

            var participant2 = new ConversationParticipant
            {
                ConversationId = conversation.Id,
                UserId = userId2,
                Role = 0, // Member
                JoinedAt = DateTimeOffset.UtcNow
            };

            await _uow.Repository<ConversationParticipant>().AddAsync(participant1);
            await _uow.Repository<ConversationParticipant>().AddAsync(participant2);

            await _uow.SaveChangesAsync();

            _logger.LogInformation("Conversation {ConversationId} created successfully between user {UserId1} and user {UserId2}", conversation.Id, userId1, userId2);

            return conversation;
        }

        public async Task<Conversation?> GetConversationBetweenUsersAsync(Guid userId1, Guid userId2)
        {
            // Check if a conversation exists between these two users
            var participant1Conversations = await _uow.Repository<ConversationParticipant>()
                .FindAsync(p => p.UserId == userId1);

            var participant2Conversations = await _uow.Repository<ConversationParticipant>()
                .FindAsync(p => p.UserId == userId2);

            // Find common conversation
            var commonConversationId = participant1Conversations
                .Select(p => p.ConversationId)
                .Intersect(participant2Conversations.Select(p => p.ConversationId))
                .FirstOrDefault();

            if (commonConversationId != Guid.Empty)
            {
                return await _uow.Repository<Conversation>().GetByIdAsync(commonConversationId);
            }

            return null;
        }
    }
}