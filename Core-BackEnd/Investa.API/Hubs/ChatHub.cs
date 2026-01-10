using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Investa.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        private Guid GetUserIdFromContext()
        {
            var sub = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Context.User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(sub)) throw new InvalidOperationException("Cannot determine user id from claims");
            if (Guid.TryParse(sub, out var gu)) return gu;
            // If ID is numeric or not guid, try parse as GUID of domain user mapping may differ
            throw new InvalidOperationException("User id claim is not a GUID");
        }

        public async Task JoinConversation(Guid conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation:{conversationId}");
            _logger.LogInformation("Connection {Conn} joined Conversation:{Conv}", Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Conversation:{conversationId}");
            _logger.LogInformation("Connection {Conn} left Conversation:{Conv}", Context.ConnectionId, conversationId);
        }

        public async Task SendMessage(Guid conversationId, string content)
        {
            var senderId = GetUserIdFromContext();
            var messageId = await _chatService.SendMessageAsync(conversationId, senderId, content);

            var msgDto = new ChatMessageDto
            {
                Id = messageId,
                ConversationId = conversationId,
                SenderId = senderId,
                Content = content,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await Clients.Group($"Conversation:{conversationId}").SendAsync("NewMessage", msgDto);
        }
    }
}