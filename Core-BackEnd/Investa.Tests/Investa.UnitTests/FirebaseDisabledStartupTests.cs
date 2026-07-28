using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Investa.UnitTests;

public class FirebaseDisabledStartupTests
{
    [Fact]
    public void FirebaseOptions_DefaultsToDisabled()
    {
        var options = new FirebaseOptions();
        options.Enabled.Should().BeFalse();
    }

    [Fact]
    public void NoopRealtimeEventPublisher_DoesNotThrow()
    {
        var publisher = new Infrastructure.Services.Firebase.NoopRealtimeEventPublisher();
        var func = async () => await publisher.PublishToUserAsync(Guid.NewGuid(), "Test", Guid.NewGuid());
        func.Should().NotThrowAsync();
    }

    [Fact]
    public void NoopFirebasePushSender_ReturnsSuccess()
    {
        var sender = new Infrastructure.Services.Firebase.NoopFirebasePushSender();
        var result = sender.SendAsync("token", "title", "body", null).GetAwaiter().GetResult();
        result.Success.Should().BeTrue();
        result.Status.Should().Be(FirebasePushSendStatus.Success);
    }

    [Fact]
    public void NoopFirebaseCustomTokenService_ThrowsWhenEnabled()
    {
        var service = new Infrastructure.Services.Firebase.NoopFirebaseCustomTokenService();
        var func = async () => await service.CreateTokenAsync(Guid.NewGuid());
        func.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Firebase is disabled*");
    }
}