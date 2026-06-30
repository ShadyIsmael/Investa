using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(SendEmailRequest request, CancellationToken cancellationToken = default);
    Task<bool> VerifyConnectionAsync(CancellationToken cancellationToken = default);
}

