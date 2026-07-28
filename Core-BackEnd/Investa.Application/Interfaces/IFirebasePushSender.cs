using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IFirebasePushSender
{
    Task<FirebasePushSendResult> SendAsync(
        string registrationToken,
        string title,
        string body,
        IReadOnlyDictionary<string, string>? data,
        CancellationToken cancellationToken = default);
}