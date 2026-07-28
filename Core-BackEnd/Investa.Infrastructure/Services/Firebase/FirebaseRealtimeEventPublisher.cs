using System.Text;
using System.Text.Json;
using Google.Apis.Auth.OAuth2;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class FirebaseRealtimeEventPublisher : IRealtimeEventPublisher
{
    private static readonly int MaxEventsPerUser = 100;
    private static readonly IReadOnlyDictionary<string, object?> EmptyEventData =
        new Dictionary<string, object?>();

    private readonly ILogger<FirebaseRealtimeEventPublisher> _logger;
    private readonly string _databaseUrl;

    public FirebaseRealtimeEventPublisher(
        IOptions<Investa.Application.DTOs.FirebaseOptions> options,
        ILogger<FirebaseRealtimeEventPublisher> logger)
    {
        _logger = logger;
        _databaseUrl = options.Value.DatabaseUrl;
    }

    public async Task PublishToUserAsync(Guid userId, string eventType, Guid entityId, CancellationToken cancellationToken = default)
    {
        await PublishToUserAsync(userId, eventType, entityId, EmptyEventData, cancellationToken);
    }

    public async Task PublishToUserAsync(
        Guid userId,
        string eventType,
        Guid entityId,
        IReadOnlyDictionary<string, object?> data,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var eventId = Guid.NewGuid().ToString("N");
            var epochMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var path = $"/users/{userId:D}/events/{eventId}";

            var payload = new Dictionary<string, object>
            {
                ["type"] = eventType,
                ["entityId"] = entityId.ToString("D"),
                ["createdAt"] = epochMs,
                ["data"] = data
            };

            using var httpClient = new HttpClient();
            var accessToken = await GetAccessTokenAsync(cancellationToken);
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var requestUri = $"{_databaseUrl.TrimEnd('/')}{path}.json?access_token={accessToken}";
            var response = await httpClient.PutAsync(requestUri, content, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogDebug("RTDB event published for user {UserId}, type {EventType}, id {EventId}", userId, eventType, eventId);
                await TrimEventsAsync(httpClient, accessToken, userId, cancellationToken);
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning(
                    "RTDB write failed for user {UserId}, event {EventType}: {StatusCode} {Body}",
                    userId, eventType, response.StatusCode, errorBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish RTDB event for user {UserId}, type {EventType}", userId, eventType);
        }
    }

    private async Task TrimEventsAsync(HttpClient httpClient, string accessToken, Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var listUrl = $"{_databaseUrl.TrimEnd('/')}/users/{userId:D}/events.json?access_token={accessToken}";
            var listResponse = await httpClient.GetAsync(listUrl, cancellationToken);

            if (!listResponse.IsSuccessStatusCode) return;

            var listJson = await listResponse.Content.ReadAsStringAsync(cancellationToken);
            var events = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, object>>>(listJson);
            if (events == null || events.Count <= MaxEventsPerUser) return;

            var sorted = events
                .Where(kvp => kvp.Value.TryGetValue("createdAt", out var _))
                .OrderByDescending(kvp =>
                {
                    if (kvp.Value.TryGetValue("createdAt", out var val) && val is JsonElement je && je.TryGetInt64(out var ms))
                        return ms;
                    return 0L;
                })
                .ToList();

            var toDelete = sorted.Skip(MaxEventsPerUser).ToList();
            foreach (var kvp in toDelete)
            {
                var deleteUrl = $"{_databaseUrl.TrimEnd('/')}/users/{userId:D}/events/{kvp.Key}.json?access_token={accessToken}";
                await httpClient.DeleteAsync(deleteUrl, cancellationToken);
            }

            _logger.LogDebug("Trimmed {Count} excess events for user {UserId}", toDelete.Count, userId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to trim excess RTDB events for user {UserId}", userId);
        }
    }

    private static async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        var credential = await GoogleCredential.GetApplicationDefaultAsync(cancellationToken);
        var scoped = credential.CreateScoped("https://www.googleapis.com/auth/userinfo.email",
                                             "https://www.googleapis.com/auth/firebase.database");
        var tokenAccess = (ITokenAccess)scoped;
        return await tokenAccess.GetAccessTokenForRequestAsync("https://www.googleapis.com/auth/firebase.database", cancellationToken);
    }
}
