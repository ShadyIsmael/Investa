using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Identity;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/support")]
    [Authorize]
    public class SupportController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IChatService _chatService;
        private readonly INotificationService _notificationService;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogger<SupportController> _logger;

        private const string AdminRole = nameof(UserRoles.Admin);

        public SupportController(
            ApplicationDbContext db,
            IChatService chatService,
            INotificationService notificationService,
            UserManager<IdentityUser> userManager,
            ILogger<SupportController> logger)
        {
            _db = db;
            _chatService = chatService;
            _notificationService = notificationService;
            _userManager = userManager;
            _logger = logger;
        }

        // GET: api/support/conversations/active
        [HttpGet("conversations/active")]
        [Authorize(Roles = nameof(UserRoles.OrgUser) + "," + nameof(UserRoles.Admin))]
        public async Task<IActionResult> GetActiveConversations()
        {
            // Using SupportSessions as the source of truth for active support conversations
            var sessions = await _db.SupportSessions
                .Where(s => s.Status == SupportSessionStatus.Open)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = await Task.WhenAll(sessions.Select(async s =>
            {
                var lastMessage = await _db.ChatMessages
                    .Where(m => m.SupportSessionId == s.Id)
                    .OrderByDescending(m => m.Timestamp)
                    .Select(m => m.MessageText)
                    .FirstOrDefaultAsync();

                return new ActiveConversationDto
                {
                    ConversationId = s.Id,
                    UserMobile = s.UserMobile,
                    Category = s.Category,
                    Status = s.Status.ToString(),
                    CreatedAt = s.CreatedAt,
                    LastMessage = lastMessage
                };
            }));

            return Ok(result);
        }

        // POST: api/support/sessions (Legacy)
        [HttpPost("sessions")]
        [Authorize(Roles = nameof(UserRoles.OrgUser) + "," + nameof(UserRoles.Admin))]
        public async Task<IActionResult> CreateSupportSession([FromBody] SupportSessionDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.UserMobile))
            {
                return BadRequest("Invalid support session data.");
            }

            var supportSession = new SupportSession
            {
                Id = Guid.NewGuid(),
                UserMobile = dto.UserMobile,
                Category = dto.Category ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                Status = SupportSessionStatus.Open
            };

            await _db.SupportSessions.AddAsync(supportSession);
            await _db.SaveChangesAsync();

            return Ok(new { SessionId = supportSession.Id });
        }

        // POST: api/support/requests (Flutter App)
        [HttpPost("requests")]
        public async Task<IActionResult> CreateSupportRequest([FromBody] CreateSupportRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.UserMobile))
                    return BadRequest("User Mobile is required");

                var session = await _chatService.RequestSupportAsync(request.UserMobile, request.Category, request.Message);

                // Notify Admins about new request
                var data = new Dictionary<string, string>
                {
                    { "conversationId", session.Id.ToString() },
                    { "type", "new_request" },
                    { "userMobile", request.UserMobile }
                };
                await NotifyAdminsAsync($"New Support Request from {request.UserMobile}", request.Message ?? "Started a new chat", data);

                return Ok(new { conversationId = session.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating support request");
                return StatusCode(500, "Internal Server Error");
            }
        }

        // POST: api/support/conversations/{id}/messages
        [HttpPost("conversations/{conversationId}/messages")]
        public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageDto request)
        {
            try
            {
                var senderId = request.UserMobile;
                bool isFromAdmin = false;

                // If UserMobile is not provided, try to resolve from Authenticated Admin User
                if (string.IsNullOrEmpty(senderId))
                {
                    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (userId != null)
                    {
                        var user = await _userManager.FindByIdAsync(userId);
                        if (user != null)
                        {
                            // Check if admin
                            if (User.IsInRole(nameof(UserRoles.Admin)) || User.IsInRole(nameof(UserRoles.OrgUser)))
                            {
                                senderId = user.Email ?? user.UserName ?? user.Id;
                                isFromAdmin = true;
                            }
                            else
                            {
                                senderId = user.PhoneNumber ?? user.UserName ?? user.Id;
                            }
                        }
                        else
                        {
                            senderId = userId;
                        }
                    }
                }

                if (string.IsNullOrEmpty(senderId))
                    return BadRequest("Could not determine sender");

                await _chatService.SendChatMessageAsync(conversationId, senderId, request.Message);

                // Notifications
                if (isFromAdmin)
                {
                    // Notify the User (Mobile App)
                    var session = await _db.SupportSessions.FindAsync(conversationId);
                    if (session != null && !string.IsNullOrEmpty(session.UserMobile))
                    {
                        var user = await _db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == session.UserMobile);
                        if (user != null)
                        {
                            await _notificationService.SendNotificationAsync(
                                user.Id,
                                "Support Response",
                                request.Message,
                                new Dictionary<string, string> {
                                     { "conversationId", conversationId.ToString() },
                                     { "isFromAdmin", "true" }
                                }
                            );
                        }
                    }
                }
                else
                {
                    // Notify Admins
                    var adminData = new Dictionary<string, string> {
                        { "conversationId", conversationId.ToString() },
                        { "userMobile", senderId },
                        { "type", "message" }
                     };
                    await NotifyAdminsAsync($"Message from {senderId}", request.Message, adminData);
                }

                return Ok(new { status = "sent" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending chat message");
                return StatusCode(500, "Internal Server Error");
            }
        }
        private async Task NotifyAdminsAsync(string title, string body, Dictionary<string, string>? data = null)
        {
            try
            {
                var adminUsers = await _userManager.GetUsersInRoleAsync(nameof(UserRoles.Admin));

                // This might be slow if many admins, but fine for now. Better to use Topics.
                foreach (var admin in adminUsers)
                {
                    if (data != null)
                        await _notificationService.SendNotificationAsync(admin.Id, title, body, data);
                    else
                        await _notificationService.SendNotificationAsync(admin.Id, title, body);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to notify admins");
            }
        }

        // GET: api/support/conversations/{id}
        [HttpGet("conversations/{id}")]
        public async Task<IActionResult> GetConversation(Guid id)
        {
            var session = await _db.SupportSessions
                .Include(s => s.Messages)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
                return NotFound("Support session not found");

            var messages = session.Messages == null
                ? new List<MessageDto>()
                : session.Messages.OrderBy(m => m.Timestamp).Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    MessageText = m.MessageText,
                    Timestamp = m.Timestamp
                }).ToList();

            var resultDto = new SupportSessionDto
            {
                Id = session.Id,
                UserMobile = session.UserMobile,
                Category = session.Category,
                Status = session.Status == SupportSessionStatus.Open ? "Active" : session.Status.ToString(),
                Messages = messages
            };

            return Ok(resultDto);
        }

        // POST: api/support/conversations/{id}/status
        [HttpPost("conversations/{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusUpdateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest("Status is required");

            var session = await _db.SupportSessions.FindAsync(id);
            if (session == null)
                return NotFound("Support session not found");

            var incoming = dto.Status.Trim();

            if (string.Equals(incoming, "Active", StringComparison.OrdinalIgnoreCase) || string.Equals(incoming, "Open", StringComparison.OrdinalIgnoreCase))
            {
                session.Status = SupportSessionStatus.Open;
            }
            else if (string.Equals(incoming, "Closed", StringComparison.OrdinalIgnoreCase) || string.Equals(incoming, "Inactive", StringComparison.OrdinalIgnoreCase))
            {
                session.Status = SupportSessionStatus.Closed;
            }
            else if (Enum.TryParse<SupportSessionStatus>(incoming, true, out var parsed))
            {
                session.Status = parsed;
            }
            else
            {
                return BadRequest("Invalid status value");
            }

            _db.SupportSessions.Update(session);
            await _db.SaveChangesAsync();

            if (session.Status == SupportSessionStatus.Open)
            {
                _logger?.LogInformation("Support session {SessionId} set to Active/Open", id);
            }

            return NoContent();
        }

        // GET: api/support/sessions
        [HttpGet("sessions")]
        public async Task<IActionResult> GetSupportSessions()
        {
            var sessions = await _db.SupportSessions
                .Select(s => new
                {
                    s.Id,
                    s.UserMobile,
                    s.Category,
                    s.CreatedAt,
                    s.Status
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // POST: api/support/sessions/{id}/messages
        [HttpPost("sessions/{id}/messages")]
        public async Task<IActionResult> PostMessage(Guid id, [FromBody] AdminPostMessageDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Message))
            {
                return ErrorResponse("Invalid message data.");
            }

            var supportSession = await GetSupportSessionByIdAsync(id);

            if (supportSession == null)
            {
                return ErrorResponse("Support session not found.", 404);
            }

            // Update the status of the SupportSession to Open
            await UpdateSupportSessionStatusAsync(supportSession, SupportSessionStatus.Open);

            // Save the message linked to the SupportSession
            var chatMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SupportSessionId = id,
                SenderId = AdminRole, // Using constant for admin role
                MessageText = dto.Message,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            await _db.ChatMessages.AddAsync(chatMessage);
            await _db.SaveChangesAsync();

            // Note: Real-time notifications now handled via Firebase Cloud Messaging
            // Clients should poll for new messages or register for FCM push notifications

            return Ok();
        }

        private IActionResult ErrorResponse(string message, int statusCode = 400)
        {
            return StatusCode(statusCode, new { Error = message });
        }

        private async Task<SupportSession?> GetSupportSessionByIdAsync(Guid id)
        {
            return await _db.SupportSessions.Include(s => s.Messages).FirstOrDefaultAsync(s => s.Id == id);
        }

        private async Task UpdateSupportSessionStatusAsync(SupportSession session, SupportSessionStatus status)
        {
            session.Status = status;
            _db.SupportSessions.Update(session);
            await _db.SaveChangesAsync();
        }

        private MessageDto MapToMessageDto(Message message)
        {
            return new MessageDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                MessageText = message.MessageText,
                Timestamp = message.Timestamp
            };
        }

        private SupportSessionDto MapToSupportSessionDto(SupportSession session)
        {
            var messages = session.Messages?.OrderBy(m => m.Timestamp).Select(m => MapToMessageDto(m)).ToList() ?? new List<MessageDto>();

            return new SupportSessionDto
            {
                Id = session.Id,
                UserMobile = session.UserMobile,
                Category = session.Category,
                Status = session.Status == SupportSessionStatus.Open ? "Active" : session.Status.ToString(),
                Messages = messages
            };
        }

        [HttpGet("sessions/test")]
        public IActionResult TestRoute() => Ok("Support API is LIVE");
    }
}