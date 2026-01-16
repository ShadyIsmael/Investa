using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Investa.Domain.Entities;

namespace Investa.API.Hubs
{
    /// <summary>
    /// SignalR Hub for Support Chat - Implements Clean Architecture with strict naming conventions
    /// Hub Route: /hubs/chat
    /// Inbound: RequestSupport(SupportRequestDto)
    /// Outbound: "ReceiveSupportRequest"
    /// </summary>
    [Authorize]
    public class ChatHub : Hub, ISupportHub
    {
        private readonly IChatService _chatService;
        private readonly IAdminAvailabilityService _adminAvailability;
        private readonly ILogger<ChatHub> _logger;
        private readonly ApplicationDbContext _db;

        public ChatHub(
            IChatService chatService, 
            IAdminAvailabilityService adminAvailability, 
            ILogger<ChatHub> logger,
            ApplicationDbContext db)
        {
            _chatService = chatService;
            _adminAvailability = adminAvailability;
            _logger = logger;
            _db = db;
        }


        /// <summary>
        /// Inbound Method: Client requests support (aligned to Flutter contract)
        /// Mobile must call: RequestSupport(SupportRequestDto)
        /// BE-105: Implements real-time support request handling with persistence and broadcasting
        /// </summary>
        public async Task RequestSupport(string category, string metadataJson)
        {
            var serverName = Environment.MachineName;
            try
            {
                // Parse metadata JSON into DTO if provided and resolve identity
                SupportRequestDto? metadata = null;
                if (!string.IsNullOrEmpty(metadataJson))
                {
                    try
                    {
                        metadata = System.Text.Json.JsonSerializer.Deserialize<SupportRequestDto>(metadataJson);
                    }
                    catch (System.Text.Json.JsonException jex)
                    {
                        _logger.LogWarning(jex, "[{Server}] Failed to deserialize RequestSupport metadata JSON", serverName);
                        await Clients.Caller.SendAsync("Error", "Invalid metadata format");
                        return;
                    }
                }

                // Resolve identity (metadata first, then JWT fallback)
                var userMobile = metadata?.UserMobile ?? Context.User?.Identity?.Name;
                
                // Step A: Parse metadataJson to extract the initial user message
                var initialMessage = metadata?.Message ?? string.Empty;
                var categoryToUse = string.IsNullOrEmpty(category) ? (metadata?.Type ?? "General") : category;

                _logger.LogInformation("[{Server}] SignalR.RequestSupport called. ConnectionId={ConnectionId}, User={User}, Category={Category}",
                    serverName, Context.ConnectionId, userMobile, categoryToUse);

                if (string.IsNullOrEmpty(userMobile))
                {
                    _logger.LogWarning("[{Server}] RequestSupport failed: User mobile not found", serverName);
                    await Clients.Caller.SendAsync("Error", "User mobile not found");
                    return;
                }

                // Step B: Create and save a new SupportSession to the database (Status = Open)
                var supportSession = new Investa.Domain.Entities.SupportSession
                {
                    Id = Guid.NewGuid(),
                    UserMobile = userMobile,
                    Category = categoryToUse,
                    CreatedAt = DateTime.UtcNow,
                    Status = Investa.Domain.Entities.SupportSessionStatus.Open,
                    UnreadCount = 1
                };

                await _db.SupportSessions.AddAsync(supportSession);
                await _db.SaveChangesAsync();

                _logger.LogInformation("[{Server}] Created SupportSession {SessionId} for user {User}",
                    serverName, supportSession.Id, userMobile);

                // Step C: Save the initial message to the Messages table
                if (!string.IsNullOrEmpty(initialMessage))
                {
                    var message = new Investa.Domain.Entities.Message
                    {
                        Id = Guid.NewGuid(),
                        SupportSessionId = supportSession.Id,
                        SenderId = userMobile,
                        MessageText = initialMessage,
                        Timestamp = DateTime.UtcNow,
                        IsRead = false
                    };

                    await _db.Messages.AddAsync(message);
                    await _db.SaveChangesAsync();

                    _logger.LogInformation("[{Server}] Saved initial message {MessageId} for SupportSession {SessionId}",
                        serverName, message.Id, supportSession.Id);
                }

                // Add user to session group for real-time updates
                await Groups.AddToGroupAsync(Context.ConnectionId, $"SupportSession:{supportSession.Id}");

                // Step D (Crucial): Broadcast to Admin group with event name "NewSupportRequest"
                await Clients.Group("Admins").SendAsync("NewSupportRequest", new
                {
                    ConversationId = supportSession.Id,
                    CustomerName = "Unknown", // Or fetch from User profile if available
                    Phone = supportSession.UserMobile,
                    Category = supportSession.Category,
                    Timestamp = supportSession.CreatedAt,
                    UnreadCount = supportSession.UnreadCount,
                    InitialMessage = initialMessage
                });

                _logger.LogInformation("[{Server}] Broadcasted NewSupportRequest to Admins for session {SessionId}",
                    serverName, supportSession.Id);

                // Send confirmation to caller
                await Clients.Caller.SendAsync("RequestAccepted", new 
                { 
                    sessionId = supportSession.Id, 
                    status = "Created",
                    message = "Support request received and admins have been notified"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Server}] Error in RequestSupport", serverName);
                await Clients.Caller.SendAsync("Error", "Server failed to process your request");
            }
        }

        /// <summary>
        /// Inbound Method: Send a message in a conversation (conversationId as string for SignalR compatibility)
        /// </summary>
        public async Task SendMessage(string conversationId, string messageText)
        {
            var serverName = Environment.MachineName;
            
            try
            {
                // Get sender ID from JWT claim (could be mobile or email)
                var senderId = Context.User?.Identity?.Name;
                
                _logger.LogInformation(
                    "[{Server}] SignalR.SendMessage called. ConnectionId={ConnectionId}, Sender={Sender}, ConvId={ConvId}",
                    serverName, Context.ConnectionId, senderId, conversationId);

                if (string.IsNullOrEmpty(senderId))
                {
                    _logger.LogWarning("[{Server}] SendMessage failed: Sender identity not found", serverName);
                    await Clients.Caller.SendAsync("Error", "Sender identity not found");
                    return;
                }

                if (!Guid.TryParse(conversationId, out var convGuid))
                {
                    _logger.LogWarning("[{Server}] SendMessage failed: invalid conversation id", serverName);
                    await Clients.Caller.SendAsync("Error", "Invalid conversation id");
                    return;
                }

                // Persist the message (supportSessionId is passed as the conversationId param)
                var message = await _chatService.SendChatMessageAsync(convGuid, senderId, messageText);

                // Create message DTO for clients (use SupportSessionId as convId)
                var messageDto = new ReceiveMessageDto
                {
                    Id = message.Id,
                    ConvId = message.SupportSessionId ?? convGuid,
                    Sender = message.SenderId,
                    Text = message.MessageText,
                    Time = message.Timestamp
                };

                // Send to all participants in the support session group
                await Clients.Group($"SupportSession:{conversationId}").SendAsync("ReceiveMessage", messageDto);

                _logger.LogInformation(
                    "[{Server}] Message sent in support session {ConvId} by {Sender}",
                    serverName, conversationId, senderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Server}] Error in SendMessage for conversation {ConvId}", 
                    serverName, conversationId);
                await Clients.Caller.SendAsync("Error", "Failed to send message");
            }
        }

        /// <summary>
        /// Inbound method: Close a conversation by id. Sets IsActive=false and notifies Admins group.
        /// </summary>
        public async Task JoinConversation(string conversationId)
        {
            var serverName = Environment.MachineName;
            _logger.LogInformation("[{Server}] SignalR.JoinConversation called. ConnectionId={ConnectionId}, ConvId={ConvId}", serverName, Context.ConnectionId, conversationId);

            // Add caller to group using string id
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation:{conversationId}");
            _logger.LogInformation("Connection {Conn} joined Conversation:{Conv}", Context.ConnectionId, conversationId);

            // Check if the caller is an admin and notify the conversation
            var sub = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Context.User?.FindFirst("sub")?.Value;
            if (Guid.TryParse(sub, out var userId) && await IsUserAdminAsync(userId))
            {
                var adminName = "Support Agent";

                await Clients.Group($"Conversation:{conversationId}")
                    .SendAsync("AdminJoined", new {
                        conversationId = conversationId,
                        adminId = userId.ToString(),
                        adminName = adminName
                    });

                _logger.LogInformation("Admin {AdminId} joined conversation {Conv}", userId, conversationId);
            }
        }

        [HubMethodName("JoinGroup")]
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"[SIGNALR DEBUG] Connection {Context.ConnectionId} joined group: {groupName}");
        }

        public async Task CloseConversation(string conversationId)
        {
            var serverName = Environment.MachineName;

            try
            {
                _logger.LogInformation("[{Server}] SignalR.CloseConversation called. ConvId={ConvId}", serverName, conversationId);

                if (!Guid.TryParse(conversationId, out var convGuid))
                {
                    _logger.LogWarning("[{Server}] CloseConversation failed: invalid conversation id. ConvId={ConvId}", serverName, conversationId);
                    await Clients.Caller.SendAsync("Error", "Invalid conversation id");
                    return;
                }

                var conversation = await _db.Conversations.FirstOrDefaultAsync(c => c.Id == convGuid);
                if (conversation == null)
                {
                    _logger.LogWarning("[{Server}] CloseConversation failed: Conversation not found. ConvId={ConvId}", serverName, conversationId);
                    await Clients.Caller.SendAsync("Error", "Conversation not found");
                    return;
                }

                if (!conversation.IsActive)
                {
                    _logger.LogInformation("[{Server}] Conversation {ConvId} is already closed", serverName, conversationId);
                    await Clients.Caller.SendAsync("ConversationAlreadyClosed", new { convId = conversationId });
                    return;
                }

                conversation.IsActive = false;
                _db.Conversations.Update(conversation);
                await _db.SaveChangesAsync();

                // Notify admins to update their UI (e.g., disable reply box)
                await Clients.Group("Admins").SendAsync("ConversationClosed", new { ConversationId = conversationId });

                _logger.LogInformation("[{Server}] Conversation {ConvId} closed and admins notified", serverName, conversationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Server}] Error in CloseConversation for conversation {ConvId}", serverName, conversationId);
                await Clients.Caller.SendAsync("Error", "Failed to close conversation");
            }
        }

        /// <summary>
        /// Inbound method: Client leaves a conversation. Accepts string id (clients may send strings), parses to Guid, marks closed, notifies admins, and removes caller from group.
        /// </summary>
        public async Task LeaveConversation(string conversationId)
        {
            var serverName = Environment.MachineName;

            try
            {
                _logger.LogInformation("[{Server}] SignalR.LeaveConversation called. ConvId={ConvId}, ConnectionId={ConnectionId}", serverName, conversationId, Context.ConnectionId);

                if (Guid.TryParse(conversationId, out Guid convGuid))
                {
                    var conversation = await _db.Conversations.FindAsync(convGuid);
                    if (conversation != null)
                    {
                        conversation.IsActive = false;
                        conversation.Status = ConversationStatus.Closed;
                        _db.Conversations.Update(conversation);
                        await _db.SaveChangesAsync();

                        // Notify admins with Guid payload for compatibility
                        await Clients.Group("Admins").SendAsync("ConversationClosed", new { ConversationId = convGuid });
                    }

                    // Remove the caller from the conversation group as cleanup (use string id for group)
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Conversation:{conversationId}");

                    _logger.LogInformation("[{Server}] Connection {ConnectionId} left conversation {ConvId}", serverName, Context.ConnectionId, convGuid);
                }
                else
                {
                    _logger.LogError("Invalid Guid received: {Received}", conversationId);
                    await Clients.Caller.SendAsync("Error", "Invalid conversation id");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Server}] Error in LeaveConversation for conversation {ConvId}", serverName, conversationId);
                await Clients.Caller.SendAsync("Error", "Failed to leave conversation");
            }
        }

        public override async Task OnConnectedAsync()
        {
            var serverName = Environment.MachineName;
            var userId = Context.User?.Identity?.Name;
            
            _logger.LogInformation(
                "[{Server}] Client connected: ConnectionId={ConnectionId}, User={User}",
                serverName, Context.ConnectionId, userId);
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var serverName = Environment.MachineName;
            var userId = Context.User?.Identity?.Name;
            
            _logger.LogInformation(
                "[{Server}] Client disconnected: ConnectionId={ConnectionId}, User={User}, Reason={Reason}",
                serverName, Context.ConnectionId, userId, exception?.Message ?? "Normal");
            
            await base.OnDisconnectedAsync(exception);
        }

        // Silent fix: placeholder method called by frontend during reconnection to avoid "Method Not Found" errors
        public async Task RequestAssignments()
        {
            await Task.CompletedTask;
        }

        /// <summary>
        /// New: Save user's chosen category as a ChatMessage and conditionally notify admins.
        /// - If no active conversation exists for the user mobile, create one.
        /// - Persist a ChatMessage with SenderId (user's GUID) and MessageText = category
        /// - If category == "Complaint" broadcast to Admins group, otherwise send ReceiveSystemAck to caller.
        /// </summary>
        public async Task SendSupportRequest(string category)
        {
            var serverName = Environment.MachineName;

            try
            {
                // Resolve user mobile and user id
                var userMobile = Context.User?.Identity?.Name;
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Context.User?.FindFirst("sub")?.Value;

                _logger.LogInformation("[{Server}] SignalR.SendSupportRequest called. ConnectionId={ConnectionId}, User={User}, Category={Category}",
                    serverName, Context.ConnectionId, userMobile, category);

                if (string.IsNullOrEmpty(userMobile) || string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("[{Server}] SendSupportRequest failed: missing identity (mobile or id)", serverName);
                    await Clients.Caller.SendAsync("Error", "User identity not found");
                    return;
                }

                // Step A: find or create active conversation for this mobile
                var conversation = await _db.Conversations
                    .FirstOrDefaultAsync(c => c.UserMobile == userMobile && c.IsActive);

                if (conversation == null)
                {
                    // Create a SupportSession instead of Conversation
                    var session = new SupportSession
                    {
                        Id = Guid.NewGuid(),
                        UserMobile = userMobile,
                        CreatedAt = DateTime.UtcNow,
                        Category = category,
                        Status = SupportSessionStatus.Open,
                        UnreadCount = 1
                    };

                    await _db.SupportSessions.AddAsync(session);
                    await _db.SaveChangesAsync();

                    // Auto-insert assistant welcome message for newly created sessions
                    var assistantMessage = new ChatMessage
                    {
                        Id = Guid.NewGuid(),
                        SupportSessionId = session.Id,
                        SenderId = "Investa Assistant",
                        MessageText = "Hello! I'm the Investa Assistant. We've received your request and an agent will be with you shortly.",
                        Timestamp = DateTime.UtcNow,
                        IsRead = false
                    };
                    await _db.ChatMessages.AddAsync(assistantMessage);
                    await _db.SaveChangesAsync();

                    _logger.LogInformation("[{Server}] Created new support session {SessionId} for user {User}", serverName, session.Id, userMobile);

                    conversation = null; // keep variable name unused below
                    // continue with session variable
                }
                else
                {
                    // If category provided on subsequent calls, update conversation's category
                    if (!string.IsNullOrEmpty(category) && conversation.Category != category)
                    {
                        conversation.Category = category;
                        _db.Conversations.Update(conversation);
                        await _db.SaveChangesAsync();
                        _logger.LogInformation("[{Server}] Updated category for conversation {ConvId} to {Category}", serverName, conversation.Id, category);
                    }
                }

                // Step B: save the user's category as a chat message linked to the support session (if created above)
                var chatMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SupportSessionId = conversation?.Id ?? Guid.NewGuid(),
                    SenderId = userId,
                    MessageText = category ?? string.Empty,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };

                await _db.ChatMessages.AddAsync(chatMessage);
                await _db.SaveChangesAsync();

                _logger.LogInformation("[{Server}] Persisted ChatMessage {MsgId} in support context for user {User}",
                    serverName, chatMessage.Id, userMobile);

                // Step C: Conditional broadcast / Live escalation
                var isLive = string.Equals(category, "LiveSupport", StringComparison.OrdinalIgnoreCase);

                if (isLive)
                {
                    // Ensure conversation is marked active for live escalation (if conversation exists)
                    if (conversation != null && !conversation.IsActive)
                    {
                        conversation.IsActive = true;
                        _db.Conversations.Update(conversation);
                        await _db.SaveChangesAsync();
                        _logger.LogInformation("[{Server}] Marked conversation {ConvId} active for LiveSupport", serverName, conversation.Id);
                    }
                }

                if (string.Equals(category, "Complaint", StringComparison.OrdinalIgnoreCase) || isLive)
                {
                    var payload = new
                    {
                        ConversationId = conversation?.Id ?? chatMessage.SupportSessionId,
                        Phone = userMobile,
                        Message = category,
                        Category = category,
                        AdminAssigned = conversation != null ? !string.IsNullOrEmpty(conversation.AdminEmail) : false,
                        AdminEmail = conversation?.AdminEmail,
                        RequestedAt = DateTime.UtcNow,
                        ServerName = serverName,
                        IsLive = isLive
                    };

                    await Clients.Group("Admins").SendAsync("ReceiveSupportRequest", payload);
                    _logger.LogInformation("[{Server}] Broadcasted admin ReceiveSupportRequest for support item (isLive={IsLive})", serverName, isLive);
                }
                else
                {
                    // For other categories, only ack the mobile client
                    await Clients.Caller.SendAsync("ReceiveSystemAck", new { convId = conversation.Id, status = "Saved" });
                    _logger.LogInformation("[{Server}] Sent ReceiveSystemAck to caller for conversation {ConvId}", serverName, conversation.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendSupportRequest for category {Category}", category);
                await Clients.Caller.SendAsync("Error", "Failed to process support category");
            }
        }

        /// <summary>
        /// Refactored PostMessage method to align with SupportSessions table.
        /// </summary>
        public async Task PostMessage(Guid id, string messageText)
        {
            var serverName = Environment.MachineName;

            try
            {
                // Fetch the SupportSession by ID
                var supportSession = await _db.SupportSessions.FirstOrDefaultAsync(s => s.Id == id);

                if (supportSession == null)
                {
                    _logger.LogWarning("[{Server}] PostMessage failed: SupportSession not found. Id={Id}", serverName, id);
                    await Clients.Caller.SendAsync("Error", "Support session not found");
                    return;
                }

                // Update the status of the SupportSession to InProgress
                supportSession.Status = SupportSessionStatus.Open;
                _db.SupportSessions.Update(supportSession);
                await _db.SaveChangesAsync();

                // Save the message linked to the SupportSession
                var chatMessage = new Message
                {
                    Id = Guid.NewGuid(),
                    SupportSessionId = id,
                    SenderId = Context.User?.Identity?.Name ?? "Unknown",
                    MessageText = messageText,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };

                await _db.Messages.AddAsync(chatMessage);
                await _db.SaveChangesAsync();

                _logger.LogInformation("[{Server}] Message saved for SupportSession {SessionId} by {Sender}",
                    serverName, id, chatMessage.SenderId);

                // Broadcast the message to the SignalR group
                await Clients.Group($"SupportSession:{id}").SendAsync("ReceiveMessage", new
                {
                    MessageId = chatMessage.Id,
                    SupportSessionId = id,
                    Sender = chatMessage.SenderId,
                    Text = chatMessage.MessageText,
                    Time = chatMessage.Timestamp
                });

                _logger.LogInformation("[{Server}] Message broadcasted to SupportSession group {GroupId}", serverName, id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Server}] Error in PostMessage for SupportSession {SessionId}", serverName, id);
                await Clients.Caller.SendAsync("Error", "Failed to post message");
            }
        }

        private async Task<bool> IsUserAdminAsync(Guid userId)
        {
            // Simplified admin presence check through admin availability service
            return await _adminAvailability.IsAdminOnlineAsync(userId.ToString());
        }

    }
}