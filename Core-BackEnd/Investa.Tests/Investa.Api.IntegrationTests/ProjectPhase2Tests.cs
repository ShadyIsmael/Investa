using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class ProjectPhase2Tests
{
    [Fact]
    public async Task Project_crud_is_owner_scoped_and_audited()
    {
        await using var db = Db();
        var founder = Founder();
        var other = Founder();
        db.AuthUsers.AddRange(founder, other);
        await db.SaveChangesAsync();
        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow), new RiskLevelService(uow));
        var created = await service.CreateAsync(founder.Id, Request());
        created.FounderId.Should().Be(founder.Id);
        created.CanEdit.Should().BeTrue();
        created.CanCreateOpportunity.Should().BeTrue();
        created.AvailableStatusTransitions.Should().Contain(ProjectStatus.Active);
        (await service.GetAsync(founder.Id, created.Id)).DisplayName.Should().Be("Durable business");
        await FluentActions.Invoking(() => service.GetAsync(other.Id, created.Id))
            .Should().ThrowAsync<BusinessValidationException>().Where(e => e.Code == "PROJECT_VIEW_FORBIDDEN");
        var updated = await service.UpdateAsync(founder.Id, created.Id, new UpdateProjectRequest
        {
            DisplayName = "Durable business updated",
            Summary = "Updated durable business summary.",
            Description = "Updated durable business description.",
            ProjectStage = ProjectStage.Startup,
            FoundedOn = new DateOnly(2020, 5, 7),
            LogoUrl = "https://example.test/project-logo.png"
        });
        updated.DisplayName.Should().Be("Durable business updated");
        updated.ProjectStage.Should().Be(ProjectStage.Startup);
        updated.FoundedOn.Should().Be(new DateOnly(2020, 5, 7));
        updated.LogoUrl.Should().Be("https://example.test/project-logo.png");
        updated.CanEdit.Should().BeTrue();
        await FluentActions.Invoking(() => service.UpdateAsync(other.Id, created.Id, new UpdateProjectRequest
        {
            DisplayName = "Unauthorized edit",
            Summary = "A sufficiently descriptive summary.",
            Description = "A sufficiently descriptive description."
        })).Should().ThrowAsync<BusinessValidationException>().Where(e => e.Code == "PROJECT_NOT_FOUND");
        db.AuditLogs.Should().Contain(a => a.EntityType == nameof(Project) && a.EntityId == created.Id.ToString() && a.Action == "Create");
        db.AuditLogs.Should().Contain(a => a.EntityType == nameof(Project) && a.EntityId == created.Id.ToString() && a.Action == "Update");
    }

    [Fact]
    public async Task Archive_preserves_project_and_disables_opportunity_creation()
    {
        await using var db = Db();
        var founder = Founder(); db.AuthUsers.Add(founder); await db.SaveChangesAsync();
        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow), new RiskLevelService(uow));
        var created = await service.CreateAsync(founder.Id, Request());
        var archived = await service.ArchiveAsync(founder.Id, created.Id, new ArchiveProjectRequest { Reason = "No longer pursuing this business" });
        archived.Status.Should().Be(ProjectStatus.Archived);
        archived.CanCreateOpportunity.Should().BeFalse();
        archived.CanEdit.Should().BeFalse();
        archived.AvailableStatusTransitions.Should().BeEmpty();
        db.Projects.Should().ContainSingle(p => p.Id == created.Id);
        db.AuditLogs.Should().Contain(a => a.EntityId == created.Id.ToString() && a.Action == "Archive");
    }

    private static CreateProjectRequest Request() => new() { DisplayName = "Durable business", Summary = "A durable business summary.", Description = "A durable business description.", ProjectStage = ProjectStage.MVP };
    private static AuthUser Founder() => new() { Id = Guid.NewGuid(), Email = $"{Guid.NewGuid():N}@test.local", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
    private static ApplicationDbContext Db()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        var db = new ApplicationDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }
}

