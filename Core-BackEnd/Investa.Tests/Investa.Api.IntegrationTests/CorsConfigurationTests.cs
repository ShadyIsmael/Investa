using FluentAssertions;
using Investa.API.Configuration;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class CorsConfigurationTests
{
    [Fact]
    public void Development_includes_both_loopback_variants()
    {
        var origins = CorsConfiguration.GetAllowedOrigins(Configuration(), "Development");

        origins.Should().Contain("http://localhost:5173");
        origins.Should().Contain("http://127.0.0.1:5173");
    }

    [Fact]
    public void Production_uses_only_explicit_origins()
    {
        var configuration = Configuration(new Dictionary<string, string?>
        {
            ["Cors:AllowedOrigins:0"] = "https://admin.example.test",
        });

        var origins = CorsConfiguration.GetAllowedOrigins(configuration, "Production");

        origins.Should().Equal("https://admin.example.test");
        origins.Should().NotContain("http://localhost:5173");
        origins.Should().NotContain(origin => origin.Contains("10."));
    }

    private static IConfiguration Configuration(IReadOnlyDictionary<string, string?>? values = null)
    {
        var settings = new Dictionary<string, string?>
        {
            ["NetworkConfig:FrontendPort"] = "5173",
            ["NetworkConfig:HostName"] = "localhost",
        };

        if (values is not null)
            foreach (var pair in values) settings[pair.Key] = pair.Value;

        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }
}
