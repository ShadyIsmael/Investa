using System.Net;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class HealthContractTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthContractTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Liveness_does_not_depend_on_external_services()
    {
        var response = await _client.GetAsync("/health/live");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        (await response.Content.ReadAsStringAsync()).Should().Contain("Healthy");
    }

    [Fact]
    public async Task Api_health_is_reachable_and_reports_dependency_state()
    {
        var response = await _client.GetAsync("/api/health");
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        document.RootElement.GetProperty("api").GetString().Should().Be("Healthy");
        document.RootElement.GetProperty("checks").GetProperty("database").GetProperty("status").GetString().Should().Be("Healthy");
        document.RootElement.GetProperty("checks").GetProperty("filestore").GetProperty("status").GetString().Should().Be("Degraded");
        document.RootElement.GetProperty("status").GetString().Should().Be("Degraded");
        document.RootElement.GetProperty("ready").GetBoolean().Should().BeTrue();
    }

    [Fact]
    public async Task Readiness_remains_available_when_optional_development_filestore_is_offline()
    {
        var response = await _client.GetAsync("/health/ready");
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        document.RootElement.GetProperty("status").GetString().Should().Be("Degraded");
        document.RootElement.GetProperty("checks").GetProperty("filestore").GetProperty("status").GetString().Should().Be("Degraded");
    }
}
