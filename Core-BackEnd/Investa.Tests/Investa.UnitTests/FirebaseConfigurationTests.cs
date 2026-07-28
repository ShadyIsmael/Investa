using FluentAssertions;
using Investa.Infrastructure.Services.Firebase;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Investa.UnitTests;

public class FirebaseConfigurationTests
{
    [Fact]
    public void Initialize_WhenEnabledAndMissingProjectId_Throws()
    {
        var options = Options.Create(new Investa.Application.DTOs.FirebaseOptions
        {
            Enabled = true,
            ProjectId = "",
            CredentialsPath = "C:\\nonexistent.json"
        });
        var logger = NullLogger<FirebaseInitializer>.Instance;
        var init = new FirebaseInitializer(options, logger);

        var action = () => init.Initialize();
        action.Should().Throw<InvalidOperationException>().WithMessage("*ProjectId*");
    }

    [Fact]
    public void Initialize_WhenEnabledAndMissingCredentials_Throws()
    {
        var options = Options.Create(new Investa.Application.DTOs.FirebaseOptions
        {
            Enabled = true,
            ProjectId = "test-project",
            CredentialsPath = "C:\\nonexistent-file.json"
        });
        var logger = NullLogger<FirebaseInitializer>.Instance;
        var init = new FirebaseInitializer(options, logger);

        var action = () => init.Initialize();
        action.Should().Throw<InvalidOperationException>().WithMessage("*credentials*");
    }

    [Fact]
    public void Initialize_WhenDisabled_DoesNotThrow()
    {
        var options = Options.Create(new Investa.Application.DTOs.FirebaseOptions
        {
            Enabled = false,
            ProjectId = "",
            CredentialsPath = ""
        });
        var logger = NullLogger<FirebaseInitializer>.Instance;
        var init = new FirebaseInitializer(options, logger);

        var action = () => init.Initialize();
        action.Should().NotThrow();
    }

    [Fact]
    public void FirebaseHealthCheck_WhenDisabled_ReturnsHealthyDisabled()
    {
        var options = Options.Create(new Investa.Application.DTOs.FirebaseOptions { Enabled = false });
        var check = new FirebaseHealthCheck(options);

        var result = check.CheckHealthAsync(new Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckContext()).GetAwaiter().GetResult();

        result.Status.Should().Be(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy);
        result.Description.Should().Be("Disabled");
    }

    [Fact]
    public void FirebaseHealthCheck_WhenMisconfigured_ReturnsUnhealthy()
    {
        var options = Options.Create(new Investa.Application.DTOs.FirebaseOptions
        {
            Enabled = true,
            ProjectId = "",
            CredentialsPath = ""
        });
        var check = new FirebaseHealthCheck(options);

        var result = check.CheckHealthAsync(new Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckContext()).GetAwaiter().GetResult();

        result.Status.Should().Be(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy);
        result.Description.Should().Be("Misconfigured");
    }
}