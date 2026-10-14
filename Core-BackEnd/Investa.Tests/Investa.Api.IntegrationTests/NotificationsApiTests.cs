using System.Net;
using System.Text.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class NotificationsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string UserId = "11111111-1111-1111-1111-111111111111";
    private readonly CustomWebApplicationFactory _factory;

    public NotificationsApiTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetNotifications_ExposesTypedEventMetadataForSafeClientRouting()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.UserNotifications.Add(new UserNotification
            {
                UserId = UserId,
                Title = "Funding declaration",
                Body = "A funding declaration changed.",
                Type = "info",
                ActionUrl = "/admin/opportunities/42/room",
                EventType = "FundingDeclarationConfirmed",
                OpportunityId = 42,
                RelatedEntityId = "81",
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }

        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/user-notifications?pageSize=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var notification = json.RootElement.GetProperty("items")[0];
        notification.GetProperty("eventType").GetString().Should().Be("FundingDeclarationConfirmed");
        notification.GetProperty("opportunityId").GetInt32().Should().Be(42);
        notification.GetProperty("relatedEntityId").GetString().Should().Be("81");
    }
}
