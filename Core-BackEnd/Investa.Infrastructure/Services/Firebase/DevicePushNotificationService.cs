using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class DevicePushNotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly IFirebasePushSender _pushSender;
    private readonly ILogger<DevicePushNotificationService> _logger;

    public DevicePushNotificationService(
        ApplicationDbContext db,
        IFirebasePushSender pushSender,
        ILogger<DevicePushNotificationService> logger)
    {
        _db = db;
        _pushSender = pushSender;
        _logger = logger;
    }

    public async Task SendToUserAsync(
        string userId,
        long notificationId,
        string notificationType,
        Guid entityId,
        string? targetUrl,
        string title,
        string body,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var activeTokens = await _db.DeviceTokens
                .Where(dt => dt.UserId == userId && dt.IsActive)
                .ToListAsync(cancellationToken);

            if (activeTokens.Count == 0)
                return;

            var data = new Dictionary<string, string>
            {
                ["notificationId"] = notificationId.ToString(),
                ["notificationType"] = notificationType,
                ["entityId"] = entityId.ToString(),
                ["targetUrl"] = targetUrl ?? string.Empty
            };

            foreach (var deviceToken in activeTokens)
            {
                var result = await _pushSender.SendAsync(
                    deviceToken.Token,
                    title,
                    body,
                    data,
                    cancellationToken);

                if (result.Status == FirebasePushSendStatus.InvalidToken)
                {
                    deviceToken.IsActive = false;
                    deviceToken.UpdatedAt = DateTime.UtcNow;
                    _logger.LogDebug("Deactivated invalid device token {DeviceTokenId} for user {UserId}",
                        deviceToken.Id, userId);
                }
                else if (result.Status == FirebasePushSendStatus.RetryableFailure)
                {
                    _logger.LogWarning("Retryable FCM failure for device token {DeviceTokenId} for user {UserId}",
                        deviceToken.Id, userId);
                }
                else if (!result.Success)
                {
                    _logger.LogWarning("Permanent FCM failure for device token {DeviceTokenId} for user {UserId}: {Message}",
                        deviceToken.Id, userId, result.Message);
                }
                else
                {
                    deviceToken.LastUsedAt = DateTime.UtcNow;
                }
            }

            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send push notification to user {UserId}", userId);
        }
    }
}