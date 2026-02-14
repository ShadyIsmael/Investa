using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class ProfileApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ProfileApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientAndSeed()
    {
        var client = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        Helpers.SeedHelpers.SeedSampleData(db);
        return client;
    }

    [Fact]
    public async Task UpdateMyProfile_ReturnsBadRequest_When_Under18()
    {
        var client = CreateClientAndSeed();

        var under18 = DateTime.UtcNow.Date.AddYears(-17).ToString("yyyy-MM-dd");
        var payload = new { BasicInfo = new { DateOfBirth = under18 } };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var res = await client.PutAsync("/api/profile/me", content);

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var json = await res.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        doc.RootElement.TryGetProperty("errors", out var errors).Should().BeTrue();

        using var scope = _factory.Services.CreateScope();
        var localizer = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Localization.IStringLocalizer<Investa.API.Resources.SharedResource>>();
        var expected = localizer["UserMustBeAtLeast18"].Value;

        var found = false;
        foreach (var e in errors.EnumerateArray())
        {
            if (e.GetString() == expected)
            {
                found = true; break;
            }
        }
        found.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateMyProfile_ReturnsOk_When_Adult()
    {
        var client = CreateClientAndSeed();

        var adult = DateTime.UtcNow.Date.AddYears(-25);
        var adultStr = adult.ToString("yyyy-MM-dd");
        var payload = new { BasicInfo = new { DateOfBirth = adultStr } };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var res = await client.PutAsync("/api/profile/me", content);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        // Expect the returned profile DTO to contain basicInfo.dateOfBirth
        doc.RootElement.TryGetProperty("basicInfo", out var basicInfo).Should().BeTrue();
        basicInfo.TryGetProperty("dateOfBirth", out var dobProp).Should().BeTrue();

        var returned = DateTime.Parse(dobProp.GetString()!);
        returned.Date.Should().Be(adult.Date);
    }
}