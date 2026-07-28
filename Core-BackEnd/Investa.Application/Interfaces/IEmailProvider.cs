using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IEmailProvider
{
    string Name { get; }

    Task<EmailProviderResult> SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}
