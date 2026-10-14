using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

/// <summary>
/// Fails closed until a real SMS provider is configured.
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
        _logger.LogError("SMS delivery requested, but no SMS provider is configured");
        throw new SmsProviderUnavailableException();
    }
}
