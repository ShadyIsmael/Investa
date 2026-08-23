using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using System.Text.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Migrations;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class ProjectFoundationTests
{
    private static readonly Guid AuthenticatedUserId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public void Model_Requires_ProjectParent_AndRestrictsHistoricalDeletion()
    {
        using var factory = new CustomWebApplicationFactory();
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var opportunityType = db.Model.FindEntityType(typeof(Opportunity));
        var projectType = db.Model.FindEntityType(typeof(Project));

        opportunityType.Should().NotBeNull();
        projectType.Should().NotBeNull();
        opportunityType!.FindProperty(nameof(Opportunity.ProjectId))!.IsNullable.Should().BeFalse();
        opportunityType.FindProperty("CategoryId").Should().BeNull();
        opportunityType.FindNavigation("Category").Should().BeNull();
        projectType!.FindProperty(nameof(Project.CategoryId)).Should().NotBeNull();
        projectType.FindNavigation(nameof(Project.Category)).Should().NotBeNull();

        var foreignKey = opportunityType.GetForeignKeys()
            .Single(key => key.PrincipalEntityType.ClrType == typeof(Project));
        foreignKey.IsRequired.Should().BeTrue();
        foreignKey.DeleteBehavior.Should().Be(DeleteBehavior.Restrict);
        foreignKey.PrincipalToDependent!.Name.Should().Be(nameof(Project.Opportunities));
    }

    [Fact]
    public async Task Existing_CreateOpportunityApi_CreatesExactlyOneOwnedProject_AndReturnsProjectId()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);

        var response = await client.PostAsJsonAsync("/api/v1/opportunities", ValidRequest());
        var body = await response.Content.ReadAsStringAsync();

        response.StatusCode.Should().Be(HttpStatusCode.Created, body);
        using var json = JsonDocument.Parse(body);
        var payload = json.RootElement.TryGetProperty("data", out var data) ? data : json.RootElement;
        var opportunityId = payload.GetProperty("id").GetInt32();
        var projectId = payload.GetProperty("projectId").GetInt32();

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var opportunity = db.Opportunities.Single(item => item.Id == opportunityId);
        var projects = db.Projects.Where(item => item.Id == projectId).ToList();

        projects.Should().ContainSingle();
        opportunity.ProjectId.Should().Be(projectId);
        projects[0].FounderId.Should().Be(AuthenticatedUserId);
        projects[0].DisplayName.Should().Be("Phase 1 compatibility opportunity");
        db.Projects.Should().HaveCount(1);
    }

    [Fact]
    public async Task Phase2_CreateOpportunity_UsesSelectedOwnedProject_WithoutCreatingAnother()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var project = NewProject(AuthenticatedUserId, "Selected project");
            db.Projects.Add(project); db.SaveChanges(); projectId = project.Id;
        }
        var request = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(ValidRequest()))!;
        request["projectId"] = projectId;
        var response = await client.PostAsJsonAsync("/api/v1/opportunities", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created, await response.Content.ReadAsStringAsync());
        using var verify = factory.Services.CreateScope();
        var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        verifyDb.Projects.Should().ContainSingle();
        verifyDb.Opportunities.Single().ProjectId.Should().Be(projectId);
    }

    [Fact]
    public async Task CreateThenPublish_UsesProjectCategoryOnly()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var project = NewProject(AuthenticatedUserId, "Project-owned category");
            db.Projects.Add(project);
            db.SaveChanges();
            projectId = project.Id;
        }

        var create = OpportunityRequest(projectId, "Project category launch", "Seed");
        create.Remove("categoryId");
        var createResponse = await client.PostAsJsonAsync("/api/v1/opportunities", create);
        var createBody = await createResponse.Content.ReadAsStringAsync();
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created, createBody);
        using var createJson = JsonDocument.Parse(createBody);
        var opportunityId = createJson.RootElement.GetProperty("data").GetProperty("id").GetInt32();

        var publishResponse = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/publish", null);
        var publishBody = await publishResponse.Content.ReadAsStringAsync();
        publishResponse.StatusCode.Should().Be(HttpStatusCode.OK, publishBody);

        using var verifyScope = factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var opportunity = verifyDb.Opportunities.Single(o => o.Id == opportunityId);
        opportunity.Status.Should().Be(OpportunityStatus.Published);
        verifyDb.Projects.Single(p => p.Id == projectId).CategoryId.Should().Be(9201);
    }

    [Fact]
    public async Task Phase3_Project_AllowsMultipleIndependentOrderedOpportunities()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var project = NewProject(AuthenticatedUserId, "Multi-opportunity project");
            db.Projects.Add(project); db.SaveChanges(); projectId = project.Id;
        }

        var first = OpportunityRequest(projectId, "Initial launch", "Seed");
        var second = OpportunityRequest(projectId, "Regional expansion", "Growth");
        (await client.PostAsJsonAsync("/api/v1/opportunities", first)).StatusCode.Should().Be(HttpStatusCode.Created);
        (await client.PostAsJsonAsync("/api/v1/opportunities", second)).StatusCode.Should().Be(HttpStatusCode.Created);

        using var verify = factory.Services.CreateScope();
        var opportunities = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>().Opportunities
            .Where(o => o.ProjectId == projectId).OrderBy(o => o.SequenceNumber).ToList();
        opportunities.Select(o => o.SequenceNumber).Should().Equal(1, 2);
        opportunities.Select(o => o.Purpose).Should().Equal("Initial launch", "Regional expansion");
        opportunities.Select(o => o.Type).Should().Equal("Seed", "Growth");
        opportunities.Select(o => o.Id).Distinct().Should().HaveCount(2);
    }

    [Fact]
    public async Task FundingOnlyOpportunityPayload_CreatesAndUpdatesWithoutLegacyInvestmentTerms()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var project = NewProject(AuthenticatedUserId, "Funding-only project");
            db.Projects.Add(project);
            db.SaveChanges();
            projectId = project.Id;
        }

        var createPayload = new
        {
            projectId,
            purpose = "Launch the next funding round",
            type = "Growth",
            title = "Funding-only opportunity",
            description = "A funding need with terms proposed later through an Offer.",
            shortDescription = "A funding need with terms proposed later.",
            useOfFunds = "Product development, operations, and verified market expansion",
            fundingTarget = 125000m,
            categoryId = 9201,
            fundingGoalId = 9202,
            fundingCurrency = "EGP",
            tagIds = Array.Empty<int>(),
            projectStage = 1,
            coverImageUrl = (string?)null
        };

        var createResponse = await client.PostAsJsonAsync("/api/v1/opportunities", createPayload);
        var createBody = await createResponse.Content.ReadAsStringAsync();
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created, createBody);
        using var createJson = JsonDocument.Parse(createBody);
        var createdData = createJson.RootElement.GetProperty("data");
        createdData.GetProperty("investmentModel").GetString().Should().Be("Unspecified");
        var opportunityId = createdData.GetProperty("id").GetInt32();

        var updatePayload = new
        {
            purpose = "Refine the next funding round",
            type = "Bridge",
            title = "Updated funding-only opportunity",
            description = "Updated funding need with no fixed investment terms.",
            shortDescription = "Updated funding need with no fixed terms.",
            useOfFunds = "Product development, operations, and verified market expansion",
            fundingTarget = 150000m,
            categoryId = 9201,
            fundingGoalId = 9202,
            fundingCurrency = "EGP",
            tagIds = Array.Empty<int>(),
            projectStage = 2,
            coverImageUrl = (string?)null
        };

        var updateResponse = await client.PutAsJsonAsync($"/api/v1/opportunities/{opportunityId}", updatePayload);
        var updateBody = await updateResponse.Content.ReadAsStringAsync();
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK, updateBody);

        using var verify = factory.Services.CreateScope();
        var opportunity = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>().Opportunities.Single(o => o.Id == opportunityId);
        opportunity.Title.Should().Be("Updated funding-only opportunity");
        opportunity.FundingTarget.Should().Be(150000m);
        opportunity.FundingCurrency.Should().Be("EGP");
        opportunity.InvestmentModel.Should().Be(InvestmentModel.Unspecified);
        opportunity.MinimumInvestmentAmount.Should().BeNull();
        opportunity.MaximumInvestmentAmount.Should().BeNull();
        opportunity.ExpectedDurationMonths.Should().BeNull();
        opportunity.SharePrice.Should().BeNull();
        opportunity.ProfitSharePercentage.Should().BeNull();
        opportunity.InterestRate.Should().BeNull();
        opportunity.RepaymentFrequency.Should().BeNull();
    }

    [Fact]
    public async Task Phase2_CreateOpportunity_Rejects_ProjectOwnedByAnotherFounder()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var other = Guid.NewGuid();
            db.AuthUsers.Add(new AuthUser { Id=other, Name="Other", PasswordHash="test", UserType=UserType.Client, ClientType=ClientType.Founder, Status=true });
            var project = NewProject(other, "Foreign project");
            db.Projects.Add(project); db.SaveChanges(); projectId = project.Id;
        }
        var request = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(ValidRequest()))!;
        request["projectId"] = projectId;
        var response = await client.PostAsJsonAsync("/api/v1/opportunities", request);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        using var verify = factory.Services.CreateScope();
        verify.ServiceProvider.GetRequiredService<ApplicationDbContext>().Opportunities.Should().BeEmpty();
    }

    [Fact]
    public async Task Existing_UpdateAuthorization_CannotBeBypassedOrReparentProject()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int opportunityId;
        int projectId;

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var otherFounderId = Guid.NewGuid();
            db.AuthUsers.Add(new AuthUser
            {
                Id = otherFounderId,
                Name = "Other founder",
                PasswordHash = "test-only",
                UserType = UserType.Client,
                ClientType = ClientType.Founder,
                Status = true
            });
            var project = new Project
            {
                FounderId = otherFounderId,
                DisplayName = "Other founder project",
                Slug = $"other-{Guid.NewGuid():N}",
                Summary = "Other founder project summary",
                Description = "Other founder project description",
                BusinessStage = ProjectStage.Idea,
                Status = ProjectStatus.Draft
            };
            var opportunity = NewOpportunity(otherFounderId, project);
            db.Opportunities.Add(opportunity);
            db.SaveChanges();
            opportunityId = opportunity.Id;
            projectId = opportunity.ProjectId;
        }

        var response = await client.PutAsJsonAsync($"/api/v1/opportunities/{opportunityId}", ValidRequest());

        // Ownership checks intentionally conceal another founder's resource.
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        using var verifyScope = factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        verifyDb.Opportunities.Single(item => item.Id == opportunityId).ProjectId.Should().Be(projectId);
        verifyDb.Projects.Single(item => item.Id == projectId).FounderId.Should().NotBe(AuthenticatedUserId);
    }

    [Fact]
    public void Migration_BackfillsOneProjectPerOpportunity_ThenMakesRelationshipRequired()
    {
        var migration = new AddProjectFoundation();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        var up = typeof(AddProjectFoundation).GetMethod(
            "Up",
            BindingFlags.Instance | BindingFlags.NonPublic)
            ?? throw new InvalidOperationException("Migration Up method was not found.");

        up.Invoke(migration, [builder]);

        builder.Operations.OfType<CreateTableOperation>()
            .Should().ContainSingle(operation => operation.Name == "Projects");
        builder.Operations.OfType<AddColumnOperation>()
            .Should().ContainSingle(operation =>
                operation.Table == "Opportunities"
                && operation.Name == "ProjectId"
                && operation.IsNullable);

        var backfill = builder.Operations.OfType<SqlOperation>().Single().Sql;
        backfill.Should().Contain("INSERT INTO [Projects]");
        backfill.Should().Contain("[SourceOpportunityId]");
        backfill.Should().Contain("FROM [Opportunities] o");
        backfill.Should().Contain("SET o.[ProjectId] = p.[Id]");
        backfill.Should().Contain("WHERE [ProjectId] IS NULL");
        backfill.Should().NotContain("GROUP BY");
        backfill.Should().NotContain("PARTITION BY");

        builder.Operations.OfType<AlterColumnOperation>()
            .Should().ContainSingle(operation =>
                operation.Table == "Opportunities"
                && operation.Name == "ProjectId"
                && !operation.IsNullable);
        builder.Operations.OfType<DropColumnOperation>()
            .Should().ContainSingle(operation =>
                operation.Table == "Projects"
                && operation.Name == "SourceOpportunityId");
        builder.Operations.OfType<AddForeignKeyOperation>()
            .Should().ContainSingle(operation =>
                operation.Table == "Opportunities"
                && operation.PrincipalTable == "Projects"
                && operation.OnDelete == ReferentialAction.Restrict);
    }

    [Fact]
    public void Phase3Migration_DeterministicallyBackfillsSequence_AndEnforcesProjectOrder()
    {
        var migration = new AddMultipleOpportunitiesPhase3();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(AddMultipleOpportunitiesPhase3).GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);

        builder.Operations.OfType<AddColumnOperation>().Should().Contain(o =>
            o.Table == "Opportunities" && o.Name == "SequenceNumber" && !o.IsNullable);
        var backfill = builder.Operations.OfType<SqlOperation>().Single().Sql;
        backfill.Should().Contain("ROW_NUMBER()");
        backfill.Should().Contain("PARTITION BY [ProjectId]");
        backfill.Should().Contain("ORDER BY [CreatedAt], [Id]");
        builder.Operations.OfType<CreateIndexOperation>().Should().ContainSingle(o =>
            o.Table == "Opportunities"
            && o.Columns.SequenceEqual(new[] { "ProjectId", "SequenceNumber" })
            && o.IsUnique);
    }

    private static void SeedFounderAndClassification(CustomWebApplicationFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
        var user = db.AuthUsers.Single(item => item.Id == AuthenticatedUserId);
        user.Name = "Phase 1 founder";
        user.PasswordHash = "test-only";
        user.UserType = UserType.Client;
        user.ClientType = ClientType.Founder;
        user.Status = true;
        db.OpportunityCategories.Add(new OpportunityCategory
        {
            Id = 9201,
            Name = "Phase 1 Category",
            Description = "Phase 1 category",
            IsActive = true
        });
        db.FundingGoals.Add(new FundingGoal
        {
            Id = 9202,
            Name = "Phase 1 Goal",
            Description = "Phase 1 goal",
            IsActive = true,
            SortOrder = 9202
        });
        db.SaveChanges();
    }

    private static Opportunity NewOpportunity(Guid founderId, Project project) => new()
    {
        Project = project,
        FounderId = founderId,
        Title = "Other founder opportunity",
        Description = "Other founder opportunity description",
        ShortDescription = "Other founder opportunity summary",
        UseOfFunds = "Other founder use of funds for a compatibility authorization test",
        FundingTarget = 100000m,
        FundingGoalId = 9202,
        FundingCurrency = "EGP",
        InvestmentModel = InvestmentModel.Equity,
        ProjectStage = ProjectStage.Idea,
        Status = OpportunityStatus.Draft
    };

    private static Project NewProject(Guid founderId, string name) => new()
    {
        FounderId=founderId, DisplayName=name, Slug=$"project-{Guid.NewGuid():N}",
        Summary="A valid project summary for opportunity selection",
        Description="A valid project description for opportunity selection",
        BusinessStage=ProjectStage.Idea, Status=ProjectStatus.Draft, CategoryId=9201
    };

    private static object ValidRequest() => new
    {
        title = "Phase 1 compatibility opportunity",
        description = "Phase 1 compatibility description",
        shortDescription = "Phase 1 compatibility summary",
        useOfFunds = "Product development, operations, and verified market expansion",
        fundingTarget = 100000m,
        categoryId = 9201,
        fundingGoalId = 9202,
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

    private static Dictionary<string, object> OpportunityRequest(int projectId, string purpose, string type)
    {
        var request = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(ValidRequest()))!;
        request["projectId"] = projectId;
        request["purpose"] = purpose;
        request["type"] = type;
        if (purpose == "Regional expansion") request["projectStage"] = "MVP";
        return request;
    }
}
