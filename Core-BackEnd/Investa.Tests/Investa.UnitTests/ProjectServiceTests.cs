using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class ProjectServiceTests
{
    [Fact]
    public async Task Founder_create_persists_authoritative_project_fields_and_calendar_date()
    {
        await using var db = CreateDb();
        var founder = Founder();
        db.AuthUsers.Add(founder);
        var category = new ProjectCategory
        {
            Code = "FOOD",
            NameEn = "Food",
            NameAr = "أغذية",
            IsActive = true
        };
        var risk = new RiskLevel
        {
            Code = "MEDIUM",
            NameEn = "Medium",
            NameAr = "متوسط",
            IsActive = true
        };
        db.ProjectCategories.Add(category);
        db.RiskLevels.Add(risk);
        await db.SaveChangesAsync();

        var result = await Service(db).CreateAsync(founder.Id, new CreateProjectRequest
        {
            DisplayName = "  Northstar Foods  ",
            LegalName = " Northstar Foods LLC ",
            Summary = "A detailed summary for a real food business.",
            Description = "A detailed description for a real food business project.",
            CategoryId = category.Id,
            Industry = " Food manufacturing ",
            ProjectStage = ProjectStage.MVP,
            Geography = " Cairo ",
            FoundedOn = new DateOnly(2020, 4, 17),
            WebsiteUrl = "https://northstar.example",
            LogoUrl = "https://northstar.example/logo.png",
            TeamDescription = "Founding team details.",
            BusinessModel = "B2B distribution.",
            RiskLevel = risk.Code,
            RiskDisclosure = "Seasonal supply conditions.",
            DefaultCurrency = "egp"
        });

        result.Id.Should().BeGreaterThan(0);
        result.FounderId.Should().Be(founder.Id);
        result.DisplayName.Should().Be("Northstar Foods");
        result.LegalName.Should().Be("Northstar Foods LLC");
        result.CategoryId.Should().Be(category.Id);
        result.ProjectStage.Should().Be(ProjectStage.MVP);
        result.FoundedOn.Should().Be(new DateOnly(2020, 4, 17));
        result.WebsiteUrl.Should().Be("https://northstar.example");
        result.LogoUrl.Should().Be("https://northstar.example/logo.png");
        result.RiskLevel.Should().Be("MEDIUM");
        result.DefaultCurrency.Should().Be("EGP");
        result.Status.Should().Be(ProjectStatus.Draft);
        result.CanEdit.Should().BeTrue();

        var stored = await db.Projects.SingleAsync(project => project.Id == result.Id);
        stored.FoundedOn.Should().Be(new DateOnly(2020, 4, 17));
        (await db.AuditLogs.CountAsync(log => log.EntityId == result.Id.ToString()))
            .Should().Be(1);
    }

    [Fact]
    public async Task Project_update_requires_the_owning_active_founder()
    {
        await using var db = CreateDb();
        var founder = Founder();
        var otherFounder = Founder();
        db.AuthUsers.AddRange(founder, otherFounder);
        var project = new Project
        {
            FounderId = founder.Id,
            DefaultCurrency = "EGP",
            DisplayName = "Owned project",
            Slug = $"project-{Guid.NewGuid():N}",
            Summary = "A detailed summary for an owned project.",
            Description = "A detailed description for an owned project.",
            ProjectStage = ProjectStage.Idea,
            Status = ProjectStatus.Active
        };
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var act = () => Service(db).UpdateAsync(otherFounder.Id, project.Id, new UpdateProjectRequest
        {
            DisplayName = "Unauthorized update",
            Summary = "A detailed summary for an attempted update.",
            Description = "A detailed description for an attempted update.",
            ProjectStage = ProjectStage.MVP
        });

        await act.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>()
            .Where(error => error.Code == "PROJECT_NOT_FOUND");
        (await db.Projects.SingleAsync(item => item.Id == project.Id))
            .DisplayName.Should().Be("Owned project");
    }

    [Fact]
    public async Task Founder_project_list_returns_owned_database_rows_without_tracking_read_entities()
    {
        await using var db = CreateDb();
        var founder = Founder();
        var otherFounder = Founder();
        db.AuthUsers.AddRange(founder, otherFounder);
        var owned = Project(founder.Id, ProjectStatus.Active);
        var other = Project(otherFounder.Id, ProjectStatus.Active);
        db.Projects.AddRange(owned, other);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var projects = await Service(db).GetMineAsync(founder.Id);

        projects.Should().ContainSingle();
        projects[0].Id.Should().Be(owned.Id);
        projects[0].FounderId.Should().Be(founder.Id);
        projects[0].DisplayName.Should().Be(owned.DisplayName);
        projects[0].Status.Should().Be(owned.Status);
        db.ChangeTracker.Entries().Should().BeEmpty();
    }

    [Fact]
    public async Task Founder_can_apply_only_a_governed_status_transition()
    {
        await using var db = CreateDb();
        var founder = Founder();
        db.AuthUsers.Add(founder);
        var project = Project(founder.Id, ProjectStatus.Draft);
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var act = () => Service(db).TransitionStatusAsync(
            founder.Id,
            project.Id,
            new TransitionProjectStatusRequest { TargetStatus = ProjectStatus.Completed },
            isAdmin: false);

        await act.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>()
            .Where(error => error.Code == "INVALID_PROJECT_STATUS_TRANSITION");
        (await db.Projects.SingleAsync(item => item.Id == project.Id))
            .Status.Should().Be(ProjectStatus.Draft);
        (await db.AuditLogs.CountAsync(log => log.EntityId == project.Id.ToString()))
            .Should().Be(0);

        var result = await Service(db).TransitionStatusAsync(
            founder.Id,
            project.Id,
            new TransitionProjectStatusRequest { TargetStatus = ProjectStatus.Active },
            isAdmin: false);

        result.Status.Should().Be(ProjectStatus.Active);
        result.AvailableStatusTransitions.Should().Contain(ProjectStatus.Paused)
            .And.Contain(ProjectStatus.Completed)
            .And.Contain(ProjectStatus.Archived);
        (await db.AuditLogs.CountAsync(log => log.EntityId == project.Id.ToString()))
            .Should().Be(1);
    }

    [Fact]
    public async Task Archiving_requires_a_reason_and_archived_projects_cannot_be_edited()
    {
        await using var db = CreateDb();
        var founder = Founder();
        db.AuthUsers.Add(founder);
        var project = Project(founder.Id, ProjectStatus.Active);
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var missingReason = () => Service(db).TransitionStatusAsync(
            founder.Id,
            project.Id,
            new TransitionProjectStatusRequest { TargetStatus = ProjectStatus.Archived, Reason = "  " },
            isAdmin: false);

        await missingReason.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>()
            .Where(error => error.Code == "PROJECT_REASON_REQUIRED");
        (await db.Projects.SingleAsync(item => item.Id == project.Id))
            .Status.Should().Be(ProjectStatus.Active);

        var archived = await Service(db).TransitionStatusAsync(
            founder.Id,
            project.Id,
            new TransitionProjectStatusRequest
            {
                TargetStatus = ProjectStatus.Archived,
                Reason = "  Founder requested closure  "
            },
            isAdmin: false);

        archived.Status.Should().Be(ProjectStatus.Archived);
        archived.ArchiveReason.Should().Be("Founder requested closure");
        archived.CanEdit.Should().BeFalse();
        archived.CanCreateOpportunity.Should().BeFalse();

        var editArchived = () => Service(db).UpdateAsync(founder.Id, project.Id, new UpdateProjectRequest
        {
            DisplayName = "Updated name",
            Summary = "A sufficiently detailed project summary.",
            Description = "A sufficiently detailed project description.",
            ProjectStage = ProjectStage.MVP
        });
        await editArchived.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>()
            .Where(error => error.Code == "PROJECT_ARCHIVED");
    }

    private static Project Project(Guid founderId, ProjectStatus status) => new()
    {
        FounderId = founderId,
        DefaultCurrency = "EGP",
        DisplayName = "Project under test",
        Slug = $"project-{Guid.NewGuid():N}",
        Summary = "A sufficiently detailed project summary.",
        Description = "A sufficiently detailed project description.",
        ProjectStage = ProjectStage.Idea,
        Status = status
    };

    private static ProjectService Service(ApplicationDbContext db)
    {
        var uow = new UnitOfWork(db);
        return new ProjectService(
            uow,
            new CurrencyConversionService(uow, []),
            new CurrencyDisplayService(uow),
            new RiskLevelService(uow));
    }

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);
        db.Database.EnsureCreated();
        return db;
    }

    private static AuthUser Founder() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Founder",
        PasswordHash = "test",
        UserType = UserType.Client,
        ClientType = ClientType.Founder,
        Status = true
    };
}
