using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Investa.API.Hubs;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/support")]
    [Authorize(Roles = nameof(UserRoles.OrgUser) + "," + nameof(UserRoles.Admin))]
    public class SupportController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<SupportController> _logger;

        private const string AdminRole = nameof(UserRoles.Admin);
        private const string SupportSessionGroupPrefix = "SupportSession:";

        public SupportController(ApplicationDbContext db, IHubContext<ChatHub> hubContext, ILogger<SupportController> logger)
        {
            _db = db;
            _hubContext = hubContext;
            _logger = logger;
        }

        // GET: api/support/conversations/active
        [HttpGet("conversations/active")]
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

        // POST: api/support/sessions
        [HttpPost("sessions")]
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
        [HttpPost("/{id}/status")]
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
        [HttpGet("api/support/sessions")]
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

            // Broadcast the message to the SignalR group
            await _hubContext.Clients.Group($"{SupportSessionGroupPrefix}{id}").SendAsync("ReceiveMessage", new
            {
                MessageId = chatMessage.Id,
                SupportSessionId = id,
                Sender = chatMessage.SenderId,
                Text = chatMessage.MessageText,
                Time = chatMessage.Timestamp
            });

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

        private MessageDto MapToMessageDto(ChatMessage message)
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
            var messages = session.Messages?.OfType<ChatMessage>().OrderBy(m => m.Timestamp).Select(m => MapToMessageDto(m)).ToList() ?? new List<MessageDto>();

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