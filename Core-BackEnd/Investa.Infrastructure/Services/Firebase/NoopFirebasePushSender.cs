using Investa.Application.DTOs;
using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class NoopFirebasePushSender : IFirebasePushSender
{
    public Task<FirebasePushSendResult> SendAsync(
        string registrationToken,
        string title,
        string body,
        IReadOnlyDictionary<string, string>? data,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new FirebasePushSendResult
        {
            Success = true,
            Status = FirebasePushSendStatus.Success
        });
    }
}