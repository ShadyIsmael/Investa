using FluentAssertions;
using Investa.Application.Interfaces;
using Investa.Infrastructure.Services.Firebase;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Investa.UnitTests;

public class FirebaseServiceRegistrationTests
{
    [Fact]
    public void AddFirebaseServices_RegistersFirebaseInitializerAsSingleton()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();
        var init = provider.GetService<Infrastructure.Services.Firebase.FirebaseInitializer>();
        init.Should().NotBeNull();
    }

    [Fact]
    public void AddFirebaseServices_WhenDisabled_RegistersNoopCustomTokenService()
    {
        var services = new ServiceCollection();
        services.Configure<Investa.Application.DTOs.FirebaseOptions>(o => o.Enabled = false);
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IFirebaseCustomTokenService>();
        service.Should().BeOfType<Infrastructure.Services.Firebase.NoopFirebaseCustomTokenService>();
    }

    [Fact]
    public void AddFirebaseServices_WhenDisabled_RegistersNoopRealtimePublisher()
    {
        var services = new ServiceCollection();
        services.Configure<Investa.Application.DTOs.FirebaseOptions>(o => o.Enabled = false);
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IRealtimeEventPublisher>();
        service.Should().BeOfType<Infrastructure.Services.Firebase.NoopRealtimeEventPublisher>();
    }

    [Fact]
    public void AddFirebaseServices_WhenDisabled_RegistersNoopPushSender()
    {
        var services = new ServiceCollection();
        services.Configure<Investa.Application.DTOs.FirebaseOptions>(o => o.Enabled = false);
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IFirebasePushSender>();
        service.Should().BeOfType<Infrastructure.Services.Firebase.NoopFirebasePushSender>();
    }

    [Fact]
    public void AddFirebaseServices_WhenEnabled_RegistersRealImplementations()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.Configure<Investa.Application.DTOs.FirebaseOptions>(o =>
        {
            o.Enabled = true;
            o.ProjectId = "test";
            o.DatabaseUrl = "https://test.firebaseio.com";
            o.CredentialsPath = Path.Combine(Directory.GetCurrentDirectory(), "test-credentials.json");
        });
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();

        var customToken = provider.GetRequiredService<IFirebaseCustomTokenService>();
        customToken.Should().BeOfType<Infrastructure.Services.Firebase.FirebaseCustomTokenService>();

        var publisher = provider.GetRequiredService<IRealtimeEventPublisher>();
        publisher.Should().BeOfType<Infrastructure.Services.Firebase.FirebaseRealtimeEventPublisher>();

        var pushSender = provider.GetRequiredService<IFirebasePushSender>();
        pushSender.Should().BeOfType<Infrastructure.Services.Firebase.FirebasePushSender>();
    }

    [Fact]
    public void NoopImplementations_AreSingletonCompatible()
    {
        var services = new ServiceCollection();
        services.Configure<Investa.Application.DTOs.FirebaseOptions>(o => o.Enabled = false);
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();
        var first = provider.GetRequiredService<IRealtimeEventPublisher>();
        var second = provider.GetRequiredService<IRealtimeEventPublisher>();

        first.Should().BeOfType<Infrastructure.Services.Firebase.NoopRealtimeEventPublisher>();
        second.Should().BeOfType<Infrastructure.Services.Firebase.NoopRealtimeEventPublisher>();
    }
}