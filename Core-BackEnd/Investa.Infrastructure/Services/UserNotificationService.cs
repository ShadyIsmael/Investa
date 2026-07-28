using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Services.Firebase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace Investa.Infrastructure.Services;

public sealed class UserNotificationService : IUserNotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly DevicePushNotificationService _pushService;
    private readonly IRealtimeEventPublisher _realtimePublisher;
    private readonly ILogger<UserNotificationService> _logger;

    public UserNotificationService(
        ApplicationDbContext db,
        DevicePushNotificationService pushService,
        IRealtimeEventPublisher realtimePublisher,
        ILogger<UserNotificationService> logger)
    {
        _db = db;
        _pushService = pushService;
        _realtimePublisher = realtimePublisher;
        _logger = logger;
    }

    public async Task<UserNotification> CreateAsync(
        string userId,
        string title,
        string body,
        string type,
        string? actionUrl = null,
        string? icon = null,
        int? templateId = null,
        long? notificationId = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[TRACE] UserNotificationService.CreateAsync ENTERED — userId={UserId}, title={Title}, type={Type}", userId, title, type);

        var notification = new UserNotification
        {
            UserId = userId,
            Title = title,
            Body = body,
            Type = type,
            Icon = icon,
            ActionUrl = actionUrl,
            TemplateId = templateId,
            NotificationId = notificationId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _db.UserNotifications.Add(notification);
        _logger.LogInformation("[TRACE] Added UserNotification to DbContext — UserId={UserId}, Title={Title}", userId, title);

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("[TRACE] SaveChangesAsync completed — notificationId={NotificationId}", notification.Id);

        await TrySendPushAsync(notification, Guid.TryParse(userId, out var uid) ? uid : Guid.Empty, cancellationToken);

        _logger.LogInformation("[TRACE] UserNotificationService.CreateAsync completed — returning notificationId={NotificationId}", notification.Id);
        return notification;
    }

    public async Task<IReadOnlyList<UserNotification>> CreateRangeAsync(
        IEnumerable<UserNotificationCreation> creations,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var notifications = creations.Select(c => new UserNotification
        {
            UserId = c.UserId,
            Title = c.Title,
            Body = c.Body,
            Type = c.Type,
            Icon = c.Icon,
            ActionUrl = c.ActionUrl,
            TemplateId = c.TemplateId,
            NotificationId = c.NotificationId,
            CreatedAt = now,
            IsRead = false
        }).ToList();

        if (notifications.Count > 0)
        {
            _db.UserNotifications.AddRange(notifications);
            await _db.SaveChangesAsync(cancellationToken);
        }

        foreach (var notification in notifications)
        {
            await TrySendPushAsync(notification, Guid.TryParse(notification.UserId, out var uid) ? uid : Guid.Empty, cancellationToken);
        }

        return notifications;
    }

    public async Task<UserNotification> CreateEventAsync(
        NotificationEventCreation creation,
        CancellationToken cancellationToken = default)
    {
        var existing = await _db.UserNotifications
            .FirstOrDefaultAsync(x => x.IdempotencyKey == creation.IdempotencyKey, cancellationToken);
        if (existing != null)
            return existing;

        var notification = new UserNotification
        {
            UserId = creation.RecipientUserId.ToString(),
            Title = creation.Title,
            Body = creation.Body,
            Type = creation.Severity,
            Icon = creation.Icon,
            ActionUrl = creation.TargetUrl,
            EventType = creation.EventType,
            ActorUserId = creation.ActorUserId,
            OpportunityId = creation.OpportunityId,
            RelatedEntityId = creation.BusinessEntityId,
            IdempotencyKey = creation.IdempotencyKey,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _db.UserNotifications.Add(notification);
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            _db.Entry(notification).State = EntityState.Detached;
            existing = await _db.UserNotifications
                .FirstOrDefaultAsync(x => x.IdempotencyKey == creation.IdempotencyKey, cancellationToken);
            if (existing != null)
                return existing;
            throw;
        }

        await TryPublishRealtimeAsync(notification, creation, cancellationToken);
        await TrySendPushAsync(notification, StableGuid(creation.IdempotencyKey), cancellationToken);
        return notification;
    }

    public async Task<IReadOnlyList<UserNotification>> CreateEventRangeAsync(
        IEnumerable<NotificationEventCreation> creations,
        CancellationToken cancellationToken = default)
    {
        var results = new List<UserNotification>();
        foreach (var creation in creations
                     .GroupBy(x => x.IdempotencyKey, StringComparer.OrdinalIgnoreCase)
                     .Select(x => x.First()))
        {
            results.Add(await CreateEventAsync(creation, cancellationToken));
        }

        return results;
    }

    private async Task TryPublishRealtimeAsync(
        UserNotification notification,
        NotificationEventCreation creation,
        CancellationToken cancellationToken)
    {
        try
        {
            await _realtimePublisher.PublishToUserAsync(
                creation.RecipientUserId,
                "NotificationCreated",
                StableGuid(creation.IdempotencyKey),
                new Dictionary<string, object?>
                {
                    ["notificationId"] = notification.Id,
                    ["eventType"] = creation.EventType,
                    ["opportunityId"] = creation.OpportunityId,
                    ["relatedEntityId"] = creation.BusinessEntityId,
                    ["targetUrl"] = creation.TargetUrl
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Non-blocking realtime failure for notification {NotificationId} ({EventType})",
                notification.Id, creation.EventType);
        }
    }

    private static Guid StableGuid(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return new Guid(bytes.AsSpan(0, 16));
    }

    private async Task TrySendPushAsync(UserNotification notification, Guid entityId, CancellationToken cancellationToken)
    {
        try
        {
            await _pushService.SendToUserAsync(
                notification.UserId,
                notification.Id,
                notification.Type,
                entityId,
                notification.ActionUrl,
                notification.Title,
                notification.Body,
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-blocking push failure for notification {NotificationId} to user {UserId}",
                notification.Id, notification.UserId);
        }
    }
}
