using System.Net;
using System.Text.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class DraftOpportunityPreviewTests
{
    private static readonly Guid FounderId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public async Task Founder_can_open_draft_viewer_state_while_public_projection_remains_hidden()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        var opportunityId = SeedOpportunity(factory, OpportunityStatus.Draft);

        var viewerResponse = await client.GetAsync($"/api/v1/opportunities/{opportunityId}/viewer-state");
        var viewerBody = await viewerResponse.Content.ReadAsStringAsync();
        viewerResponse.StatusCode.Should().Be(HttpStatusCode.OK, viewerBody);
        using var viewerJson = JsonDocument.Parse(viewerBody);
        var viewerData = viewerJson.RootElement.GetProperty("data");
        viewerData.GetProperty("isFounder").GetBoolean().Should().BeTrue();
        viewerData.GetProperty("canViewAuthorizedDetails").GetBoolean().Should().BeTrue();
        viewerData.GetProperty("canSubmitDirectOffer").GetBoolean().Should().BeFalse();

        var detailsResponse = await client.GetAsync($"/api/v1/opportunities/{opportunityId}");
        var detailsBody = await detailsResponse.Content.ReadAsStringAsync();
        detailsResponse.StatusCode.Should().Be(HttpStatusCode.OK, detailsBody);
        using var detailsJson = JsonDocument.Parse(detailsBody);
        detailsJson.RootElement.GetProperty("data").GetProperty("status").GetString().Should().Be("Draft");

        var publicResponse = await client.GetAsync($"/api/v1/public/opportunities/{opportunityId}");
        publicResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Published_opportunity_still_works_through_public_endpoint()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        var opportunityId = SeedOpportunity(factory, OpportunityStatus.Published);

        var response = await client.GetAsync($"/api/v1/public/opportunities/{opportunityId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Admin_can_preview_another_founders_draft_through_authorized_endpoints()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        var opportunityId = SeedOpportunity(factory, OpportunityStatus.Draft, Guid.NewGuid());

        var viewerResponse = await client.GetAsync($"/api/v1/opportunities/{opportunityId}/viewer-state");
        var viewerBody = await viewerResponse.Content.ReadAsStringAsync();
        viewerResponse.StatusCode.Should().Be(HttpStatusCode.OK, viewerBody);
        using var viewerJson = JsonDocument.Parse(viewerBody);
        viewerJson.RootElement.GetProperty("data").GetProperty("canViewAuthorizedDetails").GetBoolean().Should().BeTrue();

        var detailsResponse = await client.GetAsync($"/api/v1/opportunities/{opportunityId}");
        detailsResponse.StatusCode.Should().Be(HttpStatusCode.OK, await detailsResponse.Content.ReadAsStringAsync());
    }

    private static int SeedOpportunity(CustomWebApplicationFactory factory, OpportunityStatus status, Guid? ownerId = null)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        var founderId = ownerId ?? FounderId;
        if (founderId != FounderId)
        {
            db.AuthUsers.Add(new AuthUser
            {
                Id = founderId,
                Email = $"{founderId:N}@test.local",
                UserType = UserType.Client,
                ClientType = ClientType.Founder,
                Status = true
            });
            db.SaveChanges();
        }

        var founder = db.AuthUsers.Single(user => user.Id == founderId);
        founder.UserType = UserType.Client;
        founder.ClientType = ClientType.Founder;
        founder.Status = true;

        var project = new Project
        {
            FounderId = founderId,
            DisplayName = "Draft preview project",
            Slug = $"draft-preview-{Guid.NewGuid():N}",
            Summary = "Draft preview project summary",
            Description = "Draft preview project description",
            BusinessStage = ProjectStage.Idea,
            Status = ProjectStatus.Draft
        };
        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founderId,
            SequenceNumber = 1,
            Purpose = "Draft funding need",
            Type = "Growth",
            Title = "Draft opportunity preview",
            ShortDescription = "Draft opportunity preview summary",
            UseOfFunds = "Product development and verified market expansion",
            FundingTarget = 100000m,
            FundingCurrency = "EGP",
            ProjectStage = ProjectStage.Idea,
            Status = status,
            FundingStatus = status == OpportunityStatus.Draft ? OpportunityFundingStatus.NotScheduled : OpportunityFundingStatus.Open
        };

        db.Opportunities.Add(opportunity);
        db.SaveChanges();
        return opportunity.Id;
    }
}
