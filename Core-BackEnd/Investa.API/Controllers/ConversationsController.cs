using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Chat;
using System.Security.Claims;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConversationsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ConversationsController> _logger;

        public ConversationsController(
            IChatService chatService,
            IUnitOfWork unitOfWork,
            ILogger<ConversationsController> logger)
        {
            _chatService = chatService;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Get all conversations for the authenticated user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyConversations()
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Unable to identify user from token");
                }

                // Get all conversations where the user is a participant
                var participantConversations = await _unitOfWork.Repository<ConversationParticipant>()
                    .FindAsync(p => p.UserId == userId);

                var conversationIds = participantConversations.Select(p => p.ConversationId).Distinct().ToList();

                // Use join-based query to avoid EF Core .Contains() SQL translation bug with Guid lists
                var conversations = (await _unitOfWork.Repository<Conversation>()
                    .GetAllAsync())
                    .Where(c => conversationIds.Contains(c.Id))
                    .ToList();

                // Get participants for each conversation
                var result = new List<object>();
                foreach (var conversation in conversations)
                {
                    var participants = await _unitOfWork.Repository<ConversationParticipant>()
                        .FindAsync(p => p.ConversationId == conversation.Id);

                    var otherParticipant = participants.FirstOrDefault(p => p.UserId != userId);
                    var otherUserId = otherParticipant?.UserId;

                    // Get other user's name
                    string otherUserName = "Unknown";
                    if (otherUserId.HasValue)
                    {
                        var otherUser = await _unitOfWork.Repository<Domain.Entities.AuthUser>()
                            .GetByIdAsync(otherUserId.Value);
                        otherUserName = otherUser?.Profile?.FullName ?? otherUser?.Name ?? "Unknown";
                    }

                    result.Add(new
                    {
                        id = conversation.Id,
                        title = conversation.Category,
                        status = conversation.Status.ToString(),
                        isActive = conversation.IsActive,
                        createdAt = conversation.CreatedAt,
                        otherUserId = otherUserId,
                        otherUserName = otherUserName
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching conversations for user");
                return StatusCode(500, "Error fetching conversations");
            }
        }

        /// <summary>
        /// Get messages for a specific conversation
        /// </summary>
        [HttpGet("{conversationId}/messages")]
        public async Task<IActionResult> GetMessages(Guid conversationId)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Unable to identify user from token");
                }

                // Verify user is a participant in this conversation
                var participant = await _unitOfWork.Repository<ConversationParticipant>()
                    .FindAsync(p => p.ConversationId == conversationId && p.UserId == userId);

                if (!participant.Any())
                {
                    return Forbid("You are not a participant in this conversation");
                }

                // Get messages for this conversation
                var messages = await _unitOfWork.Repository<ChatMessage>()
                    .FindAsync(m => m.SupportSessionId == conversationId);

                return Ok(messages.Select(m => new
                {
                    id = m.Id,
                    senderId = m.SenderId,
                    text = m.MessageText,
                    timestamp = m.Timestamp,
                    isRead = m.IsRead
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching messages for conversation {ConversationId}", conversationId);
                return StatusCode(500, "Error fetching messages");
            }
        }

        /// <summary>
        /// Send a message to a conversation
        /// </summary>
        [HttpPost("{conversationId}/messages")]
        public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Unable to identify user from token");
                }

                // Verify user is a participant in this conversation
                var participant = await _unitOfWork.Repository<ConversationParticipant>()
                    .FindAsync(p => p.ConversationId == conversationId && p.UserId == userId);

                if (!participant.Any())
                {
                    return Forbid("You are not a participant in this conversation");
                }

                // Create message
                var message = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SupportSessionId = conversationId,
                    SenderId = userId.ToString(),
                    MessageText = request.Text,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };

                await _unitOfWork.Repository<ChatMessage>().AddAsync(message);
                await _unitOfWork.SaveChangesAsync();

                return Ok(new
                {
                    id = message.Id,
                    senderId = message.SenderId,
                    text = message.MessageText,
                    timestamp = message.Timestamp,
                    isRead = message.IsRead
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message to conversation {ConversationId}", conversationId);
                return StatusCode(500, "Error sending message");
            }
        }

        public class SendMessageRequest
        {
            public string Text { get; set; } = string.Empty;
        }
    }
}
