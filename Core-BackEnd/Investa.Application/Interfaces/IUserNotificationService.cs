using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IUserNotificationService
{
    Task<UserNotification> CreateAsync(string userId, string title, string body, string type,
        string? actionUrl = null, string? icon = null, int? templateId = null, long? notificationId = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UserNotification>> CreateRangeAsync(IEnumerable<UserNotificationCreation> creations,
        CancellationToken cancellationToken = default);

    Task<UserNotification> CreateEventAsync(NotificationEventCreation creation,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UserNotification>> CreateEventRangeAsync(IEnumerable<NotificationEventCreation> creations,
        CancellationToken cancellationToken = default);
}

public record UserNotificationCreation(
    string UserId,
    string Title,
    string Body,
    string Type,
    string? ActionUrl = null,
    string? Icon = null,
    int? TemplateId = null,
    long? NotificationId = null);

public record NotificationEventCreation(
    Guid RecipientUserId,
    string EventType,
    string BusinessEntityId,
    string Title,
    string Body,
    string Severity,
    string TargetUrl,
    Guid? ActorUserId = null,
    int? OpportunityId = null,
    string? Icon = null)
{
    public string IdempotencyKey => $"{EventType}:{BusinessEntityId}:{RecipientUserId:D}".ToLowerInvariant();
}
