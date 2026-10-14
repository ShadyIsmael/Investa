using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
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
    public async Task Project_create_accepts_the_frontend_projectStage_payload()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);

        var response = await client.PostAsJsonAsync("/api/v1/projects", new
        {
            displayName = "Frontend payload project",
            summary = "A valid project summary from the Angular editor.",
            description = "A valid project description from the Angular editor.",
            projectStage = 2,
            defaultCurrency = "EGP"
        });
        var body = await response.Content.ReadAsStringAsync();

        response.StatusCode.Should().Be(HttpStatusCode.Created, body);
        using var json = JsonDocument.Parse(body);
        var payload = json.RootElement.GetProperty("data");
        payload.GetProperty("displayName").GetString().Should().Be("Frontend payload project");
        var stage = payload.GetProperty("projectStage");
        (stage.ValueKind == JsonValueKind.String && stage.GetString() == "MVP"
            || stage.ValueKind == JsonValueKind.Number && stage.GetInt32() == 2).Should().BeTrue();
    }

    [Fact]
    public async Task Project_create_rejects_a_future_founded_date_with_a_field_error()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);

        var response = await client.PostAsJsonAsync("/api/v1/projects", ProjectPayload(DateOnly.FromDateTime(DateTime.Today).AddDays(1)));
        var body = await response.Content.ReadAsStringAsync();

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, body);
        using var json = JsonDocument.Parse(body);
        var errors = json.RootElement.GetProperty("data");
        FirstFieldError(errors, "FoundedOn").Should().Be("Founded date cannot be in the future.");
    }

    [Fact]
    public async Task Project_create_accepts_today_and_historical_founded_dates()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);

        var today = await client.PostAsJsonAsync("/api/v1/projects", ProjectPayload(DateOnly.FromDateTime(DateTime.Today)));
        var historical = await client.PostAsJsonAsync("/api/v1/projects", ProjectPayload(new DateOnly(2020, 1, 2)));

        today.StatusCode.Should().Be(HttpStatusCode.Created, await today.Content.ReadAsStringAsync());
        historical.StatusCode.Should().Be(HttpStatusCode.Created, await historical.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Project_create_rejects_invalid_stage_and_category_with_field_errors()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);

        var invalidStage = await client.PostAsJsonAsync("/api/v1/projects", new
        {
            displayName = "Invalid stage project",
            summary = "A valid project summary for stage validation.",
            description = "A valid project description for stage validation.",
            projectStage = 999
        });
        invalidStage.StatusCode.Should().Be(HttpStatusCode.BadRequest, await invalidStage.Content.ReadAsStringAsync());
        using var stageJson = JsonDocument.Parse(await invalidStage.Content.ReadAsStringAsync());
        FirstFieldError(stageJson.RootElement.GetProperty("data"), "ProjectStage").Should().Be("Unknown project stage.");

        var invalidCategory = await client.PostAsJsonAsync("/api/v1/projects", new
        {
            displayName = "Invalid category project",
            summary = "A valid project summary for category validation.",
            description = "A valid project description for category validation.",
            projectStage = 2,
            categoryId = 9999
        });
        invalidCategory.StatusCode.Should().Be(HttpStatusCode.BadRequest, await invalidCategory.Content.ReadAsStringAsync());
        using var categoryJson = JsonDocument.Parse(await invalidCategory.Content.ReadAsStringAsync());
        FirstFieldError(categoryJson.RootElement.GetProperty("data"), "CategoryId").Should().Be("CategoryId must reference an active project category.");
    }

    [Fact]
    public async Task Project_create_returns_field_errors_for_missing_and_short_required_values()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);

        var missing = await client.PostAsJsonAsync("/api/v1/projects", new { displayName = "", summary = "", description = "" });
        var missingBody = await missing.Content.ReadAsStringAsync();
        missing.StatusCode.Should().Be(HttpStatusCode.BadRequest, missingBody);
        using var missingJson = JsonDocument.Parse(missingBody);
        missingJson.RootElement.GetProperty("data").EnumerateObject().Select(property => property.Name.ToLowerInvariant())
            .Should().Contain(new[] { "displayname", "summary", "description" });

        var shortValues = await client.PostAsJsonAsync("/api/v1/projects", new
        {
            displayName = "Short values project",
            summary = "too short",
            description = "too short"
        });
        shortValues.StatusCode.Should().Be(HttpStatusCode.BadRequest, await shortValues.Content.ReadAsStringAsync());
        using var shortJson = JsonDocument.Parse(await shortValues.Content.ReadAsStringAsync());
        shortJson.RootElement.GetProperty("data").EnumerateObject().Select(property => property.Name.ToLowerInvariant())
            .Should().Contain(new[] { "summary", "description" });
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
    public async Task CreateThenSubmitForReview_UsesProjectCategoryOnly()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var project = NewProject(AuthenticatedUserId, "Project-owned category");
            project.Status = ProjectStatus.Active;
            db.Projects.Add(project);
            db.SaveChanges();
            projectId = project.Id;
        }

        var create = OpportunityRequest(projectId, "Seed");
        create.Remove("categoryId");
        var createResponse = await client.PostAsJsonAsync("/api/v1/opportunities", create);
        var createBody = await createResponse.Content.ReadAsStringAsync();
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created, createBody);
        using var createJson = JsonDocument.Parse(createBody);
        var opportunityId = createJson.RootElement.GetProperty("data").GetProperty("id").GetInt32();

        var submitResponse = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/submit-review", null);
        var submitBody = await submitResponse.Content.ReadAsStringAsync();
        submitResponse.StatusCode.Should().Be(HttpStatusCode.OK, submitBody);

        using var verifyScope = factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var opportunity = verifyDb.Opportunities.Single(o => o.Id == opportunityId);
        opportunity.Status.Should().Be(OpportunityStatus.UnderReview);
        verifyDb.Projects.Single(p => p.Id == projectId).CategoryId.Should().Be(9201);
    }

    [Fact]
    public async Task FounderCanArchiveOwnedOpportunityThroughLifecycleEndpoint()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SeedFounderAndClassification(factory);
        int projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var project = NewProject(AuthenticatedUserId, "Archive lifecycle project");
            db.Projects.Add(project);
            db.SaveChanges();
            projectId = project.Id;
        }

        var createResponse = await client.PostAsJsonAsync(
            "/api/v1/opportunities",
            OpportunityRequest(projectId, "Archive test"));
        var createBody = await createResponse.Content.ReadAsStringAsync();
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created, createBody);
        using var createJson = JsonDocument.Parse(createBody);
        var opportunityId = createJson.RootElement.GetProperty("data").GetProperty("id").GetInt32();

        var archiveResponse = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/archive", null);
        var archiveBody = await archiveResponse.Content.ReadAsStringAsync();
        archiveResponse.StatusCode.Should().Be(HttpStatusCode.OK, archiveBody);

        using var archiveJson = JsonDocument.Parse(archiveBody);
        archiveJson.RootElement.GetProperty("data").GetProperty("status").GetString()
            .Should().Be(nameof(OpportunityStatus.Archived));
        archiveJson.RootElement.GetProperty("data").GetProperty("canFounderArchive").GetBoolean()
            .Should().BeFalse();
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

        var first = OpportunityRequest(projectId, "Seed");
        var second = OpportunityRequest(projectId, "Growth");
        (await client.PostAsJsonAsync("/api/v1/opportunities", first)).StatusCode.Should().Be(HttpStatusCode.Created);
        (await client.PostAsJsonAsync("/api/v1/opportunities", second)).StatusCode.Should().Be(HttpStatusCode.Created);

        using var verify = factory.Services.CreateScope();
        var opportunities = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>().Opportunities
            .Where(o => o.ProjectId == projectId).OrderBy(o => o.SequenceNumber).ToList();
        opportunities.Select(o => o.SequenceNumber).Should().Equal(1, 2);
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
                ProjectStage = ProjectStage.Idea,
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
        db.ProjectCategories.Add(new ProjectCategory
        {
            Id = 9201,
            Code = "PHASE-1-CATEGORY",
            NameEn = "Phase 1 Category",
            NameAr = "تصنيف المرحلة الأولى",
            IsActive = true
        });
        db.FundingGoals.Add(new FundingGoal
        {
            Id = 9202,
            Code = "PHASE1GOAL",
            NameEn = "Phase 1 Goal",
            NameAr = "هدف المرحلة الأولى",
            DescriptionEn = "Phase 1 goal",
            DescriptionAr = "هدف المرحلة الأولى",
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
                ProjectStage=ProjectStage.Idea, Status=ProjectStatus.Draft, CategoryId=9201
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

    private static object ProjectPayload(DateOnly foundedOn) => new
    {
        displayName = $"Founded date project {foundedOn:yyyyMMdd}",
        summary = "A valid project summary for founded date validation.",
        description = "A valid project description for founded date validation.",
        projectStage = 2,
        foundedOn
    };

    private static string FirstFieldError(JsonElement data, string fieldName) => data.EnumerateObject()
        .Single(property => string.Equals(property.Name, fieldName, StringComparison.OrdinalIgnoreCase))
        .Value[0].GetString()!;

    private static Dictionary<string, object> OpportunityRequest(int projectId, string type)
    {
        var request = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(ValidRequest()))!;
        request["projectId"] = projectId;
        request["type"] = type;
        if (type == "Growth") request["projectStage"] = "MVP";
        return request;
    }
}
