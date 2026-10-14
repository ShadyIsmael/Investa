using FluentAssertions;
using Investa.Application.Interfaces;
using Investa.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Investa.UnitTests;

public sealed class SmsSenderTests
{
    [Fact]
    public async Task Fails_closed_when_no_sms_provider_is_configured()
    {
        var sender = new SmsSender(NullLogger<SmsSender>.Instance);

        var act = () => sender.SendSmsAsync("+201000000000", "sensitive message");

        await act.Should().ThrowAsync<SmsProviderUnavailableException>();
    }
}
