using System.Security.Claims;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers
{
    /// <summary>
    /// Admin endpoints for managing notification templates and sending template-based notifications.
    /// </summary>
    [ApiController]
    [Route("api/v1/notification-templates")]
    [Authorize]
    public class NotificationTemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<NotificationTemplatesController> _logger;

        public NotificationTemplatesController(ApplicationDbContext db, ILogger<NotificationTemplatesController> logger)
        {
            _db = db;
            _logger = logger;
        }

        private string? GetUserId() => User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        // ── Template CRUD ──────────────────────────────────────────────────────

        [HttpGet]
        [Authorize(Roles = "Admin,OrgUser")]
        public async Task<IActionResult> GetAll([FromQuery] string? category = null, [FromQuery] bool? activeOnly = null)
        {
            var query = _db.NotificationTemplates.AsQueryable();
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(t => t.Category == category);
            if (activeOnly == true)
                query = query.Where(t => t.IsActive);

            var templates = await query
                .OrderBy(t => t.Category).ThenBy(t => t.Name)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return Ok(new { success = true, data = templates });
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,OrgUser")]
        public async Task<IActionResult> GetById(int id)
        {
            var t = await _db.NotificationTemplates.FindAsync(id);
            if (t == null) return NotFound(new { message = "Template not found" });
            return Ok(new { success = true, data = MapToDto(t) });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateNotificationTemplateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _db.NotificationTemplates.AnyAsync(t => t.Key == dto.Key))
                return Conflict(new { message = $"A template with key '{dto.Key}' already exists." });

            var entity = new NotificationTemplate
            {
                Key = dto.Key,
                Name = dto.Name,
                TitleTemplate = dto.TitleTemplate,
                BodyTemplate = dto.BodyTemplate,
                Type = dto.Type,
                Icon = dto.Icon,
                Category = dto.Category,
                IsActive = dto.IsActive,
                PlaceholderDocs = dto.PlaceholderDocs,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = GetUserId()
            };

            _db.NotificationTemplates.Add(entity);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new { success = true, data = MapToDto(entity) });
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNotificationTemplateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = await _db.NotificationTemplates.FindAsync(id);
            if (entity == null) return NotFound(new { message = "Template not found" });

            // Ensure key uniqueness if changed
            if (entity.Key != dto.Key && await _db.NotificationTemplates.AnyAsync(t => t.Key == dto.Key && t.Id != id))
                return Conflict(new { message = $"A template with key '{dto.Key}' already exists." });

            entity.Key = dto.Key;
            entity.Name = dto.Name;
            entity.TitleTemplate = dto.TitleTemplate;
            entity.BodyTemplate = dto.BodyTemplate;
            entity.Type = dto.Type;
            entity.Icon = dto.Icon;
            entity.Category = dto.Category;
            entity.IsActive = dto.IsActive;
            entity.PlaceholderDocs = dto.PlaceholderDocs;
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(new { success = true, data = MapToDto(entity) });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.NotificationTemplates.FindAsync(id);
            if (entity == null) return NotFound(new { message = "Template not found" });
            _db.NotificationTemplates.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ── Send from template ────────────────────────────────────────────────

        /// <summary>
        /// Sends an in-app notification to a user using a named template.
        /// Variables in the template (e.g. {{userName}}) are substituted from the provided dictionary.
        /// </summary>
        [HttpPost("send")]
        [Authorize(Roles = "Admin,OrgUser")]
        public async Task<IActionResult> SendFromTemplate([FromBody] SendFromTemplateRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var template = await _db.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Key == dto.TemplateKey && t.IsActive);

            if (template == null)
                return NotFound(new { message = $"No active template found with key '{dto.TemplateKey}'." });

            var title = Substitute(template.TitleTemplate, dto.Variables);
            var body  = Substitute(template.BodyTemplate, dto.Variables);

            var notification = new UserNotification
            {
                UserId = dto.UserId,
                TemplateId = template.Id,
                Title = title,
                Body = body,
                Type = template.Type,
                Icon = template.Icon,
                ActionUrl = dto.ActionUrl,
                CreatedAt = DateTime.UtcNow
            };

            _db.UserNotifications.Add(notification);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Sent in-app notification from template '{Key}' to user {UserId}", dto.TemplateKey, dto.UserId);
            return Ok(new { success = true, notificationId = notification.Id });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static NotificationTemplateDto MapToDto(NotificationTemplate t) => new()
        {
            Id = t.Id,
            Key = t.Key,
            Name = t.Name,
            TitleTemplate = t.TitleTemplate,
            BodyTemplate = t.BodyTemplate,
            Type = t.Type,
            Icon = t.Icon,
            Category = t.Category,
            IsActive = t.IsActive,
            PlaceholderDocs = t.PlaceholderDocs,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
        };

        private static string Substitute(string template, Dictionary<string, string>? variables)
        {
            if (variables == null || variables.Count == 0) return template;
            foreach (var kv in variables)
                template = template.Replace($"{{{{{kv.Key}}}}}", kv.Value, StringComparison.OrdinalIgnoreCase);
            return template;
        }
    }
}
