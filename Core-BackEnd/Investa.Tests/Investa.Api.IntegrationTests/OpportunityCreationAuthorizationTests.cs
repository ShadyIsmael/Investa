using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class OpportunityCreationAuthorizationTests
{
    private static readonly Guid AuthenticatedUserId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public async Task InvestorOnlyUser_CannotCreateOpportunity()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedUser(factory, ClientType.Investor, status: true);

        var response = await client.PostAsJsonAsync("/api/v1/opportunities", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task InactiveFounder_CannotCreateOpportunity()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedUser(factory, ClientType.Founder, status: false);

        var response = await client.PostAsJsonAsync("/api/v1/opportunities", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DeletedFounder_CannotCreateOpportunity()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedClassificationOnly(factory);

        var response = await client.PostAsJsonAsync("/api/v1/opportunities", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task SuspendedFounder_CannotCreateOpportunity()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedUser(
            factory,
            ClientType.Founder,
            status: true,
            suspendedUntil: DateTime.UtcNow.AddHours(1));

        var response = await client.PostAsJsonAsync("/api/v1/opportunities", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ActiveFounder_CanCreateOpportunity()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedUser(factory, ClientType.Founder, status: true);

        var response = await client.PostAsJsonAsync("/api/v1/opportunities", ValidRequest());

        var responseBody = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Created, responseBody);
    }

    private static void SeedUser(
        CustomWebApplicationFactory factory,
        ClientType clientType,
        bool status,
        DateTime? suspendedUntil = null)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Reset(db);
        var user = db.AuthUsers.Single(x => x.Id == AuthenticatedUserId);
        user.Name = "Opportunity creation test user";
        user.PasswordHash = "test-only";
        user.UserType = UserType.Client;
        user.ClientType = clientType;
        user.Status = status;
        user.SuspendedUntil = suspendedUntil;
        AddClassification(db);
        db.SaveChanges();
    }

    private static void SeedClassificationOnly(CustomWebApplicationFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Reset(db);
        db.AuthUsers.Remove(db.AuthUsers.Single(x => x.Id == AuthenticatedUserId));
        AddClassification(db);
        db.SaveChanges();
    }

    private static void Reset(ApplicationDbContext db)
    {
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }

    private static void AddClassification(ApplicationDbContext db)
    {
        db.OpportunityCategories.Add(new OpportunityCategory
        {
            Id = 9101,
            Name = "Security Test Category",
            Description = "Security test category",
            IsActive = true
        });
        db.FundingGoals.Add(new FundingGoal
        {
            Id = 9102,
            Name = "Security Test Goal",
            Description = "Security test goal",
            IsActive = true,
            SortOrder = 9102
        });
    }

    private static object ValidRequest() => new
    {
        title = "Authorized Founder Opportunity",
        description = "Security integration test opportunity",
        shortDescription = "Security integration test",
        useOfFunds = "Product development, operations, and verified market expansion",
        fundingTarget = 100000m,
        categoryId = 9101,
        fundingGoalId = 9102,
        minimumInvestmentAmount = 1000m,
        maximumInvestmentAmount = 50000m,
        currency = "EGP",
        fundingCurrency = "EGP",
        investmentModel = "EquityInvestment",
        projectStage = "Idea",
        totalShares = 1000,
        offeredShares = 100,
        sharePrice = 1000m,
        equityOfferedPercentage = 10m
    };
}
