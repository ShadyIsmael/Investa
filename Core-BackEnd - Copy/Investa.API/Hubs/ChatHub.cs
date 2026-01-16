using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Investa.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly Investa.Application.Interfaces.IAdminAvailabilityService _adminAvailability;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(IChatService chatService, Investa.Application.Interfaces.IAdminAvailabilityService adminAvailability, ILogger<ChatHub> logger)
        {
            _chatService = chatService;
            _adminAvailability = adminAvailability;
            _logger = logger;
        }

        public async Task RequestSupport()
        {
            try
            {
                // Get user mobile from JWT claim (Identity.Name contains mobile)
                var userMobile = Context.User?.Identity?.Name;
                Console.WriteLine($"[DEBUG] SignalR: RequestSupport called. ConnectionId={Context.ConnectionId}, User={userMobile}");

                if (string.IsNullOrEmpty(userMobile))
                {
                    await Clients.Caller.SendAsync("Error", "User mobile not found in token");
                    return;
                }

                // Find or create active conversation
                var conversation = await _chatService.RequestSupportAsync(userMobile);

                // Log the created/fetched conversation
                Console.WriteLine($"[DEBUG] SignalR: Conversation {conversation?.Id} created/loaded for user {userMobile}");

                // Add user to conversation group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation:{conversation.Id}");

                // Broadcast the incoming support request to frontends for visibility/debugging
                var payload = new { ConvId = conversation.Id, UserMobile = userMobile, AdminAssigned = !string.IsNullOrEmpty(conversation.AdminEmail) };
                await Clients.All.SendAsync("ReceiveSupportRequest", payload);
                Console.WriteLine("[DEBUG] SignalR: Broadcasted ReceiveSupportRequest to all clients.");

                // If admin was assigned, notify them (and log)
                if (!string.IsNullOrEmpty(conversation.AdminEmail))
                {
                    var assignedDetails = new AssignedNewUserDto
                    {
                        ConvId = conversation.Id,
                        UserMobile = userMobile,
                        Status = "online"
                    };

                    //await Clients.User(conversation.AdminEmail).SendAsync("AssignedNewUser", assignedDetails);
                    await Clients.All.SendAsync("AssignedNewUser", assignedDetails);
                    _logger.LogInformation("Assigned admin {Admin} to conversation {Conv} for user {User}",
                        conversation.AdminEmail, conversation.Id, userMobile);
                    Console.WriteLine($"[DEBUG] SignalR: Assigned admin {conversation.AdminEmail} to conversation {conversation.Id}");
                }

                _logger.LogInformation("User {User} requested support, conversation {Conv}",
                    userMobile, conversation.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RequestSupport");
                Console.WriteLine($"[ERROR] SignalR: Error in RequestSupport - {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Failed to request support");
            }
        }

        public async Task SendMessage(Guid conversationId, string text)
        {
            try
            {
                // Get sender ID from JWT claim (could be mobile or email)
                var senderId = Context.User?.Identity?.Name;
                if (string.IsNullOrEmpty(senderId))
                {
                    await Clients.Caller.SendAsync("Error", "Sender identity not found");
                    return;
                }

                // Persist the message
                var message = await _chatService.SendChatMessageAsync(conversationId, senderId, text);

                // Create message DTO for clients
                var messageDto = new ReceiveMessageDto
                {
                    Id = message.Id,
                    ConvId = message.ConversationId,
                    Sender = message.SenderId,
                    Text = message.MessageText,
                    Time = message.Timestamp
                };

                // Send to all participants in the conversation
                await Clients.Group($"Conversation:{conversationId}").SendAsync("ReceiveMessage", messageDto);

                _logger.LogInformation("Message sent in conversation {Conv} by {Sender}",
                    conversationId, senderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendMessage");
                await Clients.Caller.SendAsync("Error", "Failed to send message");
            }
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        // Silent fix: placeholder method called by frontend during reconnection to avoid "Method Not Found" errors
        public async Task RequestAssignments()
        {
            await Task.CompletedTask;
        }


    }
}