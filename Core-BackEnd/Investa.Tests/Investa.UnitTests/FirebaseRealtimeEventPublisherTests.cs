using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Infrastructure.Services.Firebase;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Investa.UnitTests;

public class FirebaseRealtimeEventPublisherTests
{
    [Fact]
    public async Task PublishToUserAsync_ShouldNotThrowSynchronously_WhenDatabaseUrlIsSet()
    {
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<FirebaseRealtimeEventPublisher>();
        var options = Microsoft.Extensions.Options.Options.Create(new FirebaseOptions
        {
            Enabled = true,
            DatabaseUrl = "https://test.firebaseio.com",
        });

        var publisher = new FirebaseRealtimeEventPublisher(options, logger);
        var act = () => publisher.PublishToUserAsync(Guid.NewGuid(), "Test", Guid.NewGuid());

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public void RealtimeEventPublisher_IsScopedRegistration()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.Configure<FirebaseOptions>(o =>
        {
            o.Enabled = true;
            o.ProjectId = "test";
            o.DatabaseUrl = "https://test.firebaseio.com";
            o.CredentialsPath = Path.Combine(Directory.GetCurrentDirectory(), "test-credentials.json");
        });
        services.AddFirebaseServices();

        var provider = services.BuildServiceProvider();
        using var scope1 = provider.CreateScope();
        using var scope2 = provider.CreateScope();

        var pub1 = scope1.ServiceProvider.GetRequiredService<Application.Interfaces.IRealtimeEventPublisher>();
        var pub2 = scope2.ServiceProvider.GetRequiredService<Application.Interfaces.IRealtimeEventPublisher>();

        pub1.Should().NotBeSameAs(pub2);
    }

    [Fact]
    public void MaxEventsPerUser_IsSetTo100()
    {
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<FirebaseRealtimeEventPublisher>();
        var options = Microsoft.Extensions.Options.Options.Create(new FirebaseOptions
        {
            Enabled = true,
            DatabaseUrl = "https://test.firebaseio.com",
        });

        var publisher = new FirebaseRealtimeEventPublisher(options, logger);
        var field = typeof(FirebaseRealtimeEventPublisher)
            .GetField("MaxEventsPerUser", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);

        field.Should().NotBeNull();
        var value = field!.GetValue(null);
        value.Should().Be(100);
    }
}