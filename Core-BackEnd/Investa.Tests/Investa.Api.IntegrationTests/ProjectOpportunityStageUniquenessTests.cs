using System.Text.Json;
using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class ProjectOpportunityStageUniquenessTests
{
    [Fact]
    public async Task Create_rejects_a_standard_stage_already_used_by_the_same_project()
    {
        await using var db = Db();
        var (service, founder, project) = await CreateFixtureAsync(db);
        await CreateAsync(service, founder.Id, project.Id, "Idea milestone", ProjectStage.Idea);

        var action = () => CreateAsync(service, founder.Id, project.Id, "Duplicate idea", ProjectStage.Idea);

        await action.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "PROJECT_STAGE_ALREADY_USED");
    }

    [Fact]
    public async Task Other_requires_a_trimmed_custom_name_and_rejects_case_insensitive_duplicates()
    {
        await using var db = Db();
        var (service, founder, project) = await CreateFixtureAsync(db);

        var missing = () => CreateAsync(service, founder.Id, project.Id, "Unnamed custom milestone", ProjectStage.Other, "   ");
        await missing.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "CUSTOM_PROJECT_STAGE_REQUIRED");

        var first = await CreateAsync(service, founder.Id, project.Id, "Regional milestone", ProjectStage.Other, "  Regional Expansion  ");
        first.ProjectStageCustomName.Should().Be("Regional Expansion");

        var duplicate = () => CreateAsync(service, founder.Id, project.Id, "Duplicate regional milestone", ProjectStage.Other, "regional expansion");
        await duplicate.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "PROJECT_STAGE_ALREADY_USED");

        var distinct = await CreateAsync(service, founder.Id, project.Id, "International milestone", ProjectStage.Other, "International Launch");
        distinct.ProjectStageCustomName.Should().Be("International Launch");
    }

    [Fact]
    public async Task Edit_can_keep_its_stage_but_cannot_collide_with_a_sibling()
    {
        await using var db = Db();
        var (service, founder, project) = await CreateFixtureAsync(db);
        var idea = await CreateAsync(service, founder.Id, project.Id, "Idea milestone", ProjectStage.Idea);
        var mvp = await CreateAsync(service, founder.Id, project.Id, "MVP milestone", ProjectStage.MVP);

        var retained = await service.UpdateAsync(founder.Id, idea.Id, Update(ProjectStage.Idea));
        retained.ProjectStage.Should().Be(ProjectStage.Idea);

        var collision = () => service.UpdateAsync(founder.Id, mvp.Id, Update(ProjectStage.Idea));
        await collision.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "PROJECT_STAGE_ALREADY_USED");
    }

    [Fact]
    public async Task Independent_projects_can_reuse_the_same_standard_stage()
    {
        await using var db = Db();
        var (service, founder, firstProject) = await CreateFixtureAsync(db);
        var secondProject = Project(founder.Id, "Second project");
        db.Projects.Add(secondProject);
        await db.SaveChangesAsync();

        await CreateAsync(service, founder.Id, firstProject.Id, "First idea", ProjectStage.Idea);
        var reused = await CreateAsync(service, founder.Id, secondProject.Id, "Second idea", ProjectStage.Idea);

        reused.ProjectId.Should().Be(secondProject.Id);
    }

    [Fact]
    public async Task Creation_adds_a_project_timeline_entry_with_stage_and_opportunity_reference()
    {
        await using var db = Db();
        var (service, founder, project) = await CreateFixtureAsync(db);

        var created = await CreateAsync(service, founder.Id, project.Id, "Regional milestone", ProjectStage.Other, "Regional Expansion");
        var timeline = await db.Set<OpportunityEvent>().SingleAsync(eventItem =>
            eventItem.OpportunityId == created.Id && eventItem.EventType == ProjectActivityTimeline.Types.OpportunityCreated);
        var metadata = JsonSerializer.Deserialize<Dictionary<string, string?>>(timeline.LocalizedMetadataJson!);

        timeline.IsImmutableTimelineEntry.Should().BeTrue();
        timeline.IsPublic.Should().BeTrue();
        metadata.Should().ContainKey("opportunityReference").WhoseValue.Should().Be("#1");
        metadata.Should().ContainKey("projectStage").WhoseValue.Should().Be("Other: Regional Expansion");
        metadata.Should().ContainKey("createdOpenedDate");
    }

    [Fact]
    public void Database_constraints_prevent_concurrent_duplicate_stage_claims()
    {
        using var db = Db();
        var entity = db.Model.FindEntityType(typeof(Opportunity))!;
        var indexes = entity.GetIndexes();

        indexes.Should().Contain(index => index.IsUnique
            && index.GetDatabaseName() == "UX_Opportunities_Project_StandardStage"
            && index.Properties.Select(property => property.Name).SequenceEqual(new[] { "ProjectId", "ProjectStage" })
            && index.GetFilter() == "[ProjectStage] <> 'Other'");
        indexes.Should().Contain(index => index.IsUnique
            && index.GetDatabaseName() == "UX_Opportunities_Project_OtherStage"
            && index.Properties.Select(property => property.Name).SequenceEqual(new[] { "ProjectId", "ProjectStageCustomNameNormalized" })
            && index.GetFilter() == "[ProjectStage] = 'Other' AND [ProjectStageCustomNameNormalized] IS NOT NULL");
    }

    private static async Task<(OpportunityService Service, AuthUser Founder, Project Project)> CreateFixtureAsync(ApplicationDbContext db)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Email = $"{Guid.NewGuid():N}@test.local", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var project = Project(founder.Id, "Lifecycle project");
        db.AddRange(founder, project);
        await db.SaveChangesAsync();
        return (new OpportunityService(new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!), founder, project);
    }

    private static Project Project(Guid founderId, string name) => new()
    {
        FounderId = founderId, DisplayName = name, Slug = $"{name}-{Guid.NewGuid():N}",
        Summary = "A durable project summary", Description = "A durable project description", BusinessStage = ProjectStage.Idea
    };

    private static Task<OpportunityDetailDto> CreateAsync(OpportunityService service, Guid founderId, int projectId, string title, ProjectStage stage, string? custom = null) =>
        service.CreateAsync(founderId, new CreateOpportunityRequest
        {
            ProjectId = projectId, Title = title, Purpose = "Lifecycle funding", Type = "Opportunity",
            ShortDescription = "A sufficiently detailed lifecycle opportunity summary.",
            UseOfFunds = "Product, operations, and measured expansion for this lifecycle milestone.",
            FundingTarget = 100_000m, FundingCurrency = "EGP", ProjectStage = stage, ProjectStageCustomName = custom
        });

    private static UpdateOpportunityRequest Update(ProjectStage stage) => new()
    {
        Title = "Updated lifecycle milestone", Purpose = "Lifecycle funding", Type = "Opportunity",
        ShortDescription = "A sufficiently detailed lifecycle opportunity summary.",
        UseOfFunds = "Product, operations, and measured expansion for this lifecycle milestone.",
        FundingTarget = 100_000m, FundingCurrency = "EGP", ProjectStage = stage
    };

    private static ApplicationDbContext Db()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
