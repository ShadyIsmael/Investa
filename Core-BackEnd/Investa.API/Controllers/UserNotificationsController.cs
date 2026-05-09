using System.Security.Claims;
using Investa.Application.DTOs;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers
{
    /// <summary>
    /// In-app notifications for the currently authenticated user.
    /// </summary>
    [ApiController]
    [Route("api/v1/user-notifications")]
    [Authorize]
    public class UserNotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<UserNotificationsController> _logger;

        public UserNotificationsController(ApplicationDbContext db, ILogger<UserNotificationsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        private string? GetUserId() => User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        /// <summary>
        /// Returns the user's notifications, newest first. Max 10 for navbar; use ?page for history.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            pageSize = Math.Clamp(pageSize, 1, 100);
            page = Math.Max(1, page);

            var query = _db.UserNotifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt);

            var totalCount = await query.CountAsync();
            var unreadCount = await _db.UserNotifications.CountAsync(n => n.UserId == userId && !n.IsRead);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new UserNotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Body = n.Body,
                    Type = n.Type,
                    Icon = n.Icon,
                    IsRead = n.IsRead,
                    ActionUrl = n.ActionUrl,
                    CreatedAt = n.CreatedAt,
                    ReadAt = n.ReadAt
                })
                .ToListAsync();

            return Ok(new UserNotificationsPageDto
            {
                Items = items,
                TotalCount = totalCount,
                UnreadCount = unreadCount
            });
        }

        /// <summary>Mark one or more notifications as read (null Ids = mark all)</summary>
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkRead([FromBody] MarkReadRequestDto request)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var now = DateTime.UtcNow;
            if (request.Ids == null || !request.Ids.Any())
            {
                await _db.UserNotifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(n => n.IsRead, true)
                        .SetProperty(n => n.ReadAt, now));
            }
            else
            {
                await _db.UserNotifications
                    .Where(n => n.UserId == userId && request.Ids.Contains(n.Id) && !n.IsRead)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(n => n.IsRead, true)
                        .SetProperty(n => n.ReadAt, now));
            }

            return Ok(new { success = true });
        }

        /// <summary>Delete a single notification</summary>
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var rows = await _db.UserNotifications
                .Where(n => n.Id == id && n.UserId == userId)
                .ExecuteDeleteAsync();

            return rows > 0 ? Ok(new { success = true }) : NotFound();
        }
    }
}
