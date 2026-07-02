using System.Security.Claims;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers;

[Route("api/v1/notifications")]
public class NotificationsController : BaseApiController
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(ApplicationDbContext db, ILogger<NotificationsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpPost("broadcast")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<BroadcastNotificationResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastNotificationRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        if (request.Audience == NotificationAudience.SpecificUser && request.SpecificUserId == null)
            return ErrorResponse("SpecificUserId is required for SpecificUser audience", 400);

        var recipients = await ResolveRecipientsAsync(request.Audience, request.SpecificUserId, cancellationToken);
        if (request.Audience == NotificationAudience.SpecificUser && recipients.Count == 0)
            return ErrorResponse("Specific user was not found", 400);

        var now = DateTime.UtcNow;
        var adminUserId = ResolveUserIdFromClaims();
        var notification = new Notification
        {
            Title = request.Title.Trim(),
            Body = request.Body.Trim(),
            Type = string.IsNullOrWhiteSpace(request.Type) ? "info" : request.Type.Trim(),
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? null : request.Icon.Trim(),
            ActionUrl = string.IsNullOrWhiteSpace(request.ActionUrl) ? null : request.ActionUrl.Trim(),
            Audience = request.Audience,
            SpecificUserId = request.Audience == NotificationAudience.SpecificUser ? request.SpecificUserId : null,
            CreatedByUserId = adminUserId,
            CreatedAt = now
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(cancellationToken);

        var userNotifications = recipients.Select(userId => new UserNotification
        {
            NotificationId = notification.Id,
            UserId = userId.ToString(),
            Title = notification.Title,
            Body = notification.Body,
            Type = notification.Type,
            Icon = notification.Icon,
            ActionUrl = notification.ActionUrl,
            IsRead = false,
            CreatedAt = now
        }).ToList();

        if (userNotifications.Count > 0)
            _db.UserNotifications.AddRange(userNotifications);

        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Notification broadcast created. NotificationId={NotificationId} Audience={Audience} RecipientCount={RecipientCount}",
            notification.Id,
            notification.Audience,
            userNotifications.Count);

        var dto = ToNotificationDto(notification, userNotifications.Count);
        return SuccessResponse(new BroadcastNotificationResponseDto
        {
            Notification = dto,
            RecipientCount = userNotifications.Count
        }, "Notification broadcast created", 201);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var notifications = await _db.Notifications
            .AsNoTracking()
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Body = n.Body,
                Type = n.Type,
                Icon = n.Icon,
                ActionUrl = n.ActionUrl,
                Audience = n.Audience,
                SpecificUserId = n.SpecificUserId,
                CreatedByUserId = n.CreatedByUserId,
                CreatedAt = n.CreatedAt,
                RecipientCount = n.UserNotifications.Count
            })
            .ToListAsync(cancellationToken);

        return SuccessResponse<IReadOnlyList<NotificationDto>>(notifications);
    }

    [HttpGet("{id:long}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(long id, CancellationToken cancellationToken)
    {
        var notification = await _db.Notifications
            .AsNoTracking()
            .Where(n => n.Id == id)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Body = n.Body,
                Type = n.Type,
                Icon = n.Icon,
                ActionUrl = n.ActionUrl,
                Audience = n.Audience,
                SpecificUserId = n.SpecificUserId,
                CreatedByUserId = n.CreatedByUserId,
                CreatedAt = n.CreatedAt,
                RecipientCount = n.UserNotifications.Count
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (notification == null)
            return ErrorResponse("Notification not found", 404);

        return SuccessResponse(notification);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<UserNotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        if (skip < 0)
            return ErrorResponse("Skip must be zero or greater", 400);

        if (take <= 0 || take > 500)
            return ErrorResponse("Take must be between 1 and 500", 400);

        var userIdText = userId.Value.ToString();
        var notifications = await _db.UserNotifications
            .AsNoTracking()
            .Where(n => n.UserId == userIdText)
            .OrderByDescending(n => n.CreatedAt)
            .Skip(skip)
            .Take(take)
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
            .ToListAsync(cancellationToken);

        return SuccessResponse<IReadOnlyList<UserNotificationDto>>(notifications);
    }

    [HttpGet("me/unread-count")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyUnreadCount(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var userIdText = userId.Value.ToString();
        var count = await _db.UserNotifications
            .CountAsync(n => n.UserId == userIdText && !n.IsRead, cancellationToken);

        return SuccessResponse(new { unreadCount = count });
    }

    [HttpPatch("me/{id:long}/read")]
    [Authorize]
    public async Task<IActionResult> MarkMineRead(long id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var userIdText = userId.Value.ToString();
        var notification = await _db.UserNotifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userIdText, cancellationToken);

        if (notification == null)
            return ErrorResponse("Notification not found", 404);

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
        }

        return SuccessResponse(message: "Notification marked as read");
    }

    [HttpPatch("me/read-all")]
    [Authorize]
    public async Task<IActionResult> MarkAllMineRead(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var userIdText = userId.Value.ToString();
        var unread = await _db.UserNotifications
            .Where(n => n.UserId == userIdText && !n.IsRead)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessResponse(new { updatedCount = unread.Count }, "Notifications marked as read");
    }

    private async Task<List<Guid>> ResolveRecipientsAsync(
        NotificationAudience audience,
        Guid? specificUserId,
        CancellationToken cancellationToken)
    {
        var query = _db.AuthUsers
            .AsNoTracking()
            .Where(u => u.Status);

        query = audience switch
        {
            NotificationAudience.All => query,
            NotificationAudience.Clients => query.Where(u => u.UserType == UserType.Client),
            NotificationAudience.Founders => query.Where(u =>
                u.UserType == UserType.Client &&
                (u.ClientType == ClientType.Founder || u.ClientType == ClientType.Both)),
            NotificationAudience.Investors => query.Where(u =>
                u.UserType == UserType.Client &&
                (u.ClientType == ClientType.Investor || u.ClientType == ClientType.Both)),
            NotificationAudience.SpecificUser => query.Where(u => u.Id == specificUserId),
            _ => query.Where(_ => false)
        };

        return await query.Select(u => u.Id).ToListAsync(cancellationToken);
    }

    private Guid? ResolveUserIdFromClaims()
    {
        var claimValue = User.FindFirst("sub")?.Value
                         ?? User.FindFirst("id")?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(claimValue, out var userId) ? userId : null;
    }

    private static NotificationDto ToNotificationDto(Notification notification, int recipientCount) => new()
    {
        Id = notification.Id,
        Title = notification.Title,
        Body = notification.Body,
        Type = notification.Type,
        Icon = notification.Icon,
        ActionUrl = notification.ActionUrl,
        Audience = notification.Audience,
        SpecificUserId = notification.SpecificUserId,
        CreatedByUserId = notification.CreatedByUserId,
        RecipientCount = recipientCount,
        CreatedAt = notification.CreatedAt
    };
}
