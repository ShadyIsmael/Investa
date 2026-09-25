using System.Reflection;
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

public sealed class ProjectOpportunityLifecyclePhase5Tests
{
    [Fact]
    public async Task Project_transitions_are_owner_scoped_and_audited()
    {
        await using var db = Db();
        var founder = Founder(); var stranger = Founder();
        db.AuthUsers.AddRange(founder, stranger); await db.SaveChangesAsync();
        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
        var project = await service.CreateAsync(founder.Id, new CreateProjectRequest {
            DisplayName="Lifecycle business", Summary="Durable business summary", Description="Durable business description", BusinessStage=ProjectStage.MVP
        });

        var active = await service.TransitionStatusAsync(founder.Id, project.Id,
            new TransitionProjectStatusRequest { TargetStatus=ProjectStatus.Active }, false);
        active.Status.Should().Be(ProjectStatus.Active);
        await FluentActions.Invoking(() => service.TransitionStatusAsync(stranger.Id, project.Id,
            new TransitionProjectStatusRequest { TargetStatus=ProjectStatus.Paused }, false))
            .Should().ThrowAsync<BusinessValidationException>().Where(e => e.Code == "PROJECT_NOT_FOUND");
        db.AuditLogs.Should().Contain(a => a.EntityId == project.Id.ToString() && a.Action == "StatusTransition");
    }

    [Theory]
    [InlineData(OpportunityFundingStatus.Open, -1, false)]
    [InlineData(OpportunityFundingStatus.Open, 1, true)]
    [InlineData(OpportunityFundingStatus.Paused, 1, false)]
    [InlineData(OpportunityFundingStatus.Closed, 1, false)]
    public void Participation_requires_open_funding_inside_date_window(OpportunityFundingStatus status, int closeOffsetDays, bool expected)
    {
        var opportunity = new Opportunity {
            Status=OpportunityStatus.Published, FundingStatus=status,
            FundingOpensAt=DateTime.UtcNow.AddDays(-1), FundingClosesAt=DateTime.UtcNow.AddDays(closeOffsetDays)
        };
        var method = typeof(OpportunityService).GetMethod("IsEligibleForJoin", BindingFlags.NonPublic|BindingFlags.Static)!;
        ((bool)method.Invoke(null, [opportunity])!).Should().Be(expected);
    }

    private static AuthUser Founder() => new() { Id=Guid.NewGuid(), Email=$"{Guid.NewGuid():N}@test.local", UserType=UserType.Client, ClientType=ClientType.Founder, Status=true };
    private static ApplicationDbContext Db() { var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options); db.Database.EnsureCreated(); return db; }
}

