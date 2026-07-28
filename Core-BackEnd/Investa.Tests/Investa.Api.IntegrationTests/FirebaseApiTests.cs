using System.Net;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class FirebaseApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public FirebaseApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PostCustomToken_WhenFirebaseDisabled_Returns503()
    {
        var client = _factory.CreateClient();
        var content = new System.Net.Http.StringContent("", System.Text.Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/api/v1/firebase/custom-token", content);

        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        doc.RootElement.TryGetProperty("success", out var success).Should().BeTrue();
        success.GetBoolean().Should().BeFalse();
    }

    [Fact]
    public async Task PostCustomToken_Endpoint_IsReachable()
    {
        var client = _factory.CreateClient();
        var content = new System.Net.Http.StringContent("", System.Text.Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/api/v1/firebase/custom-token", content);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.ServiceUnavailable);
    }
}