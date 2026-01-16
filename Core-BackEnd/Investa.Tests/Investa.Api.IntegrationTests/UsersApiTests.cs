using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using FluentAssertions;
using Investa.Api.IntegrationTests.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class UsersApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UsersApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientAndSeed()
    {
        var client = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        SeedHelpers.SeedSampleData(db);
        return client;
    }

    [Fact]
    public async Task GetUsersList_ReturnsSeededUser()
    {
        var client = CreateClientAndSeed();

        var res = await client.GetAsync("/api/admin/users/list");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        root.TryGetProperty("total", out var totalProp).Should().BeTrue();
        totalProp.GetInt32().Should().Be(2);

        root.TryGetProperty("items", out var items).Should().BeTrue();
        items.GetArrayLength().Should().BeGreaterOrEqualTo(1);

        var first = items[0];
        first.GetProperty("email").GetString().Should().Be("jane.doe@example.com");
    }

    [Fact]
    public async Task FilterByStatus_ReturnsInactiveOnly()
    {
        var client = CreateClientAndSeed();

        var res = await client.GetAsync("/api/admin/users/list?status=inactive");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var items = doc.RootElement.GetProperty("items");
        items.GetArrayLength().Should().Be(1);
        items[0].GetProperty("email").GetString().Should().Be("john.smith@example.com");
    }

    [Fact]
    public async Task SearchByEmail_ReturnsMatching()
    {
        var client = CreateClientAndSeed();

        var res = await client.GetAsync("/api/admin/users/list?search=jane.doe");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var items = doc.RootElement.GetProperty("items");
        items.GetArrayLength().Should().Be(1);
        items[0].GetProperty("email").GetString().Should().Be("jane.doe@example.com");
    }
}