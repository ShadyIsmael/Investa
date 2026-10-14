using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class OfferNativeParticipationApiTests
{
    private static readonly Guid AuthenticatedInvestorId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public async Task Legacy_investment_join_request_returns_offer_required_for_a_published_opportunity()
    {
        using var factory = new CustomWebApplicationFactory();
        SeedPublishedOpportunity(factory);
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/opportunities/1/join-requests", new
        {
            requestType = "InvestmentParticipation",
            requestedAmount = 2_000_000m,
            enteredCurrency = "EGP"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        body.RootElement.GetProperty("success").GetBoolean().Should().BeFalse();
        body.RootElement.GetProperty("data").GetProperty("code").GetString().Should().Be("OFFER_REQUIRED");
        body.RootElement.GetProperty("message").GetString().Should().Contain("structured offer");

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.OpportunityJoinRequests.Should().BeEmpty();
    }

    private static void SeedPublishedOpportunity(CustomWebApplicationFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        var founder = new AuthUser
        {
            Id = Guid.NewGuid(),
            Email = "offer-native-founder@test.local",
            Name = "Offer-native Founder",
            UserType = UserType.Client,
            ClientType = ClientType.Founder,
            Status = true
        };
        var investor = db.AuthUsers.SingleOrDefault(user => user.Id == AuthenticatedInvestorId);
        if (investor == null)
        {
            investor = new AuthUser { Id = AuthenticatedInvestorId };
            db.AuthUsers.Add(investor);
        }
        investor.Email = "offer-native-investor@test.local";
        investor.Name = "Offer-native Investor";
        investor.UserType = UserType.Client;
        investor.ClientType = ClientType.Investor;
        investor.Status = true;
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Offer-native project",
            Slug = "offer-native-project",
            Summary = "Offer-native participation test",
            Description = "Offer-native participation test"
        };
        db.AddRange(founder, project, new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 1,
            Type = "Growth",
            Title = "Offer-native opportunity",
            ShortDescription = "Offer-native participation test opportunity",
            UseOfFunds = "Product expansion, hiring, and verified customer acquisition",
            FundingTarget = 8_000_000m,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published,
            FundingStatus = OpportunityFundingStatus.Open,
            InvestmentModel = InvestmentModel.Unspecified
        });
        db.SaveChanges();
    }
}
