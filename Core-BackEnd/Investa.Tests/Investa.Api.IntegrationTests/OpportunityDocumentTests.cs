using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class OpportunityDocumentTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public OpportunityDocumentTests(CustomWebApplicationFactory factory)
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
    public async Task CreateOpportunity_DoesNotCreateFakeDocuments()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var authenticatedUser = db.AuthUsers.Single(x =>
            x.Id == Guid.Parse("11111111-1111-1111-1111-111111111111"));
        authenticatedUser.UserType = Investa.Domain.Entities.Enums.UserType.Client;
        authenticatedUser.ClientType = Investa.Domain.Entities.Enums.ClientType.Founder;

        var category = new Investa.Domain.Entities.OpportunityCategory
        {
            Id = 7000,
            Name = "Test Category",
            Description = "Test opportunity category",
            IsActive = true
        };
        db.OpportunityCategories.Add(category);

        var fundingGoal = new Investa.Domain.Entities.FundingGoal
        {
            Id = 7001,
            Name = "Test Goal",
            Description = "Test Goal Description",
            SortOrder = 7001
        };
        db.FundingGoals.Add(fundingGoal);

        var founderId = Guid.NewGuid();
        var user = new Investa.Infrastructure.Identity.ApplicationIdentityUser
        {
            Id = founderId,
            UserName = "testfounder",
            Email = "testfounder@example.com"
        };
        db.Users.Add(user);
        db.SaveChanges();

        var createRequest = new
        {
            title = "Test Opportunity",
            description = "Test opportunity description for document verification",
            shortDescription = "Test Short Description",
            useOfFunds = "Test use of funds for verified project delivery",
            fundingTarget = 100000m,
            categoryId = category.Id,
            fundingGoalId = fundingGoal.Id,
            minimumInvestmentAmount = 1000m,
            maximumInvestmentAmount = 50000m,
            currency = "USD",
            sharePrice = 1000m,
            totalShares = 100,
            offeredShares = 10,
            investmentModel = "EquityInvestment",
            projectStage = 1,
            equityOfferedPercentage = 10m
        };

        var res = await client.PostAsJsonAsync("/api/v1/opportunities", createRequest);
        var createBody = await res.Content.ReadAsStringAsync();
        res.StatusCode.Should().Be(HttpStatusCode.Created, createBody);

        var json = await res.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>();
        json.Should().NotBeNull();
        var opportunityId = json!["data"]!["id"]?.GetValue<int>();

        var documents = db.OpportunityDocuments.Where(d => d.OpportunityId == opportunityId).ToList();
        documents.Should().BeEmpty("No documents should be created automatically when an opportunity is created");
    }

    [Fact]
    public async Task CreateOpportunity_DocumentListIsEmptyAfterCreation()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var authenticatedUser = db.AuthUsers.Single(x =>
            x.Id == Guid.Parse("11111111-1111-1111-1111-111111111111"));
        authenticatedUser.UserType = Investa.Domain.Entities.Enums.UserType.Client;
        authenticatedUser.ClientType = Investa.Domain.Entities.Enums.ClientType.Founder;

        var category = new Investa.Domain.Entities.OpportunityCategory
        {
            Id = 8000,
            Name = "Test Category 2",
            Description = "Second test opportunity category",
            IsActive = true
        };
        db.OpportunityCategories.Add(category);

        var fundingGoal = new Investa.Domain.Entities.FundingGoal
        {
            Id = 8001,
            Name = "Test Goal 2",
            Description = "Test Goal 2 Description",
            SortOrder = 8001
        };
        db.FundingGoals.Add(fundingGoal);

        var founderId = Guid.NewGuid();
        var user = new Investa.Infrastructure.Identity.ApplicationIdentityUser
        {
            Id = founderId,
            UserName = "testfounder2",
            Email = "testfounder2@example.com"
        };
        db.Users.Add(user);
        db.SaveChanges();

        var createRequest = new
        {
            title = "Test Opportunity 2",
            description = "Second test opportunity description for document verification",
            shortDescription = "Test Short Description 2",
            useOfFunds = "Test use of funds for verified project delivery two",
            fundingTarget = 200000m,
            categoryId = category.Id,
            fundingGoalId = fundingGoal.Id,
            minimumInvestmentAmount = 2000m,
            maximumInvestmentAmount = 100000m,
            currency = "USD",
            sharePrice = 2000m,
            totalShares = 100,
            offeredShares = 15,
            investmentModel = "EquityInvestment",
            projectStage = 1,
            equityOfferedPercentage = 15m
        };

        var res = await client.PostAsJsonAsync("/api/v1/opportunities", createRequest);
        var createBody = await res.Content.ReadAsStringAsync();
        res.StatusCode.Should().Be(HttpStatusCode.Created, createBody);

        var json = await res.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>();
        json.Should().NotBeNull();
        var opportunityId = json!["data"]!["id"]?.GetValue<int>();

        var roomRes = await client.GetAsync($"/api/v1/opportunities/{opportunityId}/room");
        roomRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var roomJson = await roomRes.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>();
        roomJson.Should().NotBeNull();
        var documents = roomJson!["data"]!["documents"]?.AsArray();

        (documents?.Count ?? 0).Should().Be(
            0,
            "Document library should contain no generated documents after opportunity creation");
    }
}
