using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

/// <summary>
/// Simple SMS sender implementation for development. In production replace with provider integration (Twilio, Nexmo, etc.).
/// </summary>
public class SmsSender : ISmsSender
{
    private readonly ILogger<SmsSender> _logger;

    public SmsSender(ILogger<SmsSender> logger)
    {
        _logger = logger;
    }

    public Task SendSmsAsync(string phoneNumber, string message)
    {
        // In production send via provider. For now, log the message so operators can retrieve it from logs.
        _logger.LogInformation("[SMS] To: {Phone} Message: {Message}", phoneNumber, message);
        return Task.CompletedTask;
    }
}