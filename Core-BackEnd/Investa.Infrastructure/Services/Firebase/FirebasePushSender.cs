using FirebaseAdmin.Messaging;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class FirebasePushSender : IFirebasePushSender
{
    private readonly ILogger<FirebasePushSender> _logger;

    public FirebasePushSender(ILogger<FirebasePushSender> logger)
    {
        _logger = logger;
    }

    public async Task<FirebasePushSendResult> SendAsync(
        string registrationToken,
        string title,
        string body,
        IReadOnlyDictionary<string, string>? data,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = new Message
            {
                Token = registrationToken,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value)
            };

            var response = await FirebaseMessaging.DefaultInstance.SendAsync(message, cancellationToken);
            _logger.LogDebug("FCM message sent. Response: {Response}", response);
            return new FirebasePushSendResult { Success = true, Status = FirebasePushSendStatus.Success };
        }
        catch (FirebaseMessagingException ex)
        {
            var status = ex.MessagingErrorCode switch
            {
                MessagingErrorCode.Unregistered => FirebasePushSendStatus.InvalidToken,
                MessagingErrorCode.InvalidArgument => FirebasePushSendStatus.InvalidToken,
                MessagingErrorCode.SenderIdMismatch => FirebasePushSendStatus.InvalidToken,
                MessagingErrorCode.Unavailable => FirebasePushSendStatus.RetryableFailure,
                MessagingErrorCode.Internal => FirebasePushSendStatus.RetryableFailure,
                _ => FirebasePushSendStatus.PermanentFailure
            };

            _logger.LogDebug("FCM send result: {Status} for token prefix {TokenPrefix}",
                status, registrationToken[..Math.Min(20, registrationToken.Length)]);

            return new FirebasePushSendResult
            {
                Success = false,
                Status = status,
                Message = ex.MessagingErrorCode.ToString()
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FCM send failed unexpectedly for token prefix {TokenPrefix}",
                registrationToken[..Math.Min(20, registrationToken.Length)]);

            return new FirebasePushSendResult
            {
                Success = false,
                Status = FirebasePushSendStatus.PermanentFailure,
                Message = ex.Message
            };
        }
    }
}