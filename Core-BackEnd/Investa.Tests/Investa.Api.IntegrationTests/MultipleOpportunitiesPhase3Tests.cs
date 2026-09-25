using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class MultipleOpportunitiesPhase3Tests
{
    [Fact]
    public async Task Multiple_opportunities_are_sequenced_and_independent()
    {
        await using var db = Db();
        var founder = User(); var investor = User();
        db.AuthUsers.AddRange(founder, investor);
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Multi-opportunity project",
            Slug = $"multi-{Guid.NewGuid():N}",
            Summary = "Multiple opportunities test",
            Description = "Verifies Phase 3 multiple opportunities per Project"
        };
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var service = new OpportunityService(new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);
        var first = await service.CreateAsync(founder.Id, new CreateOpportunityRequest
        {
            ProjectId = project.Id,
            Title = "First funding round",
            Purpose = "Seed funding",
            Type = "Seed",
            FundingTarget = 50000,
            FundingCurrency = "EGP",
            ProjectStage = ProjectStage.Idea,
            ShortDescription = "First round for seed funding to develop product",
            UseOfFunds = "Product development and initial team hiring for MVP"
        });
        first.SequenceNumber.Should().Be(1);
        var persistedFirst = await db.Opportunities.SingleAsync(o => o.Id == first.Id);
        persistedFirst.InvestmentModel.Should().Be(InvestmentModel.Unspecified);
        persistedFirst.SharePrice.Should().BeNull();
        persistedFirst.InterestRate.Should().BeNull();
        persistedFirst.ProfitSharePercentage.Should().BeNull();

        var second = await service.CreateAsync(founder.Id, new CreateOpportunityRequest
        {
            ProjectId = project.Id,
            Title = "Second funding round",
            Purpose = "Growth funding",
            Type = "Series A",
            FundingTarget = 200000,
            FundingCurrency = "EGP",
            ProjectStage = ProjectStage.MVP,
            ShortDescription = "Second round for growth funding to expand market reach",
            UseOfFunds = "Market expansion and customer acquisition initiatives"
        });
        second.SequenceNumber.Should().Be(2);

        var projectUow = new UnitOfWork(db);
        var projectDto = await new ProjectService(projectUow, new CurrencyConversionService(projectUow, []), new CurrencyDisplayService(projectUow)).GetAsync(founder.Id, project.Id);
        projectDto.Opportunities.Should().HaveCount(2);
        projectDto.Opportunities.Select(o => o.SequenceNumber).Should().Equal(1, 2);
        projectDto.Opportunities.Select(o => o.Title).Should().Equal("First funding round", "Second funding round");
    }

    [Fact]
    public async Task Each_opportunity_has_independent_participations()
    {
        await using var db = Db();
        var founder = User(); var investor = User();
        db.AuthUsers.AddRange(founder, investor);
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Independent opps",
            Slug = $"indep-{Guid.NewGuid():N}",
            Summary = "Independent opportunities test",
            Description = "Verifies each opportunity tracks its own participations"
        };
        var first = new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 1,
            Purpose = "Seed",
            Type = "Seed",
            Title = "First",
            ShortDescription = "First opportunity",
            UseOfFunds = "Development",
            FundingTarget = 100000,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published
        };
        var second = new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 2,
            Purpose = "Growth",
            Type = "Growth",
            Title = "Second",
            ShortDescription = "Second opportunity",
            UseOfFunds = "Expansion",
            FundingTarget = 300000,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published
        };
        db.AddRange(project, first, second);
        await db.SaveChangesAsync();

        var join1 = new OpportunityJoinRequest
        {
            OpportunityId = first.Id,
            InvestorId = investor.Id,
            ParticipationSequence = 1,
            RequestType = OpportunityJoinRequestType.InvestmentParticipation,
            Status = OpportunityJoinRequestStatus.Approved,
            FundingAmount = 10000,
            FundingCurrency = "EGP"
        };
        var join2 = new OpportunityJoinRequest
        {
            OpportunityId = second.Id,
            InvestorId = investor.Id,
            ParticipationSequence = 1,
            RequestType = OpportunityJoinRequestType.InvestmentParticipation,
            Status = OpportunityJoinRequestStatus.Approved,
            FundingAmount = 50000,
            FundingCurrency = "EGP"
        };
        db.OpportunityJoinRequests.AddRange(join1, join2);
        await db.SaveChangesAsync();

        var service = new OpportunityService(new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);
        var firstSummary = await service.GetMyParticipationsAsync(investor.Id);
        firstSummary.Should().ContainSingle(p => p.OpportunityId == first.Id);
        firstSummary.Should().ContainSingle(p => p.OpportunityId == second.Id);
    }

    [Fact]
    public async Task Stranger_cannot_create_opportunity_on_others_project()
    {
        await using var db = Db();
        var founder = User(); var stranger = User();
        db.AuthUsers.AddRange(founder, stranger);
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Protected project",
            Slug = $"prot-{Guid.NewGuid():N}",
            Summary = "Authorization test",
            Description = "Verifies only project owner can add opportunities"
        };
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var service = new OpportunityService(new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);
        await FluentActions.Invoking(() => service.CreateAsync(stranger.Id, new CreateOpportunityRequest
        {
            ProjectId = project.Id,
            Title = "Unauthorized",
            Purpose = "Hack",
            Type = "Hack",
            FundingTarget = 1000,
            FundingCurrency = "EGP",
            ProjectStage = ProjectStage.Idea,
            ShortDescription = "Unauthorized attempt to create opportunity",
            UseOfFunds = "Unauthorized use of funds attempt"
        })).Should().ThrowAsync<BusinessValidationException>().Where(e => e.Code == "PROJECT_NOT_FOUND");
    }

    private static AuthUser User() => new() { Id = Guid.NewGuid(), Email = $"{Guid.NewGuid():N}@test.local", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
    private static ApplicationDbContext Db() { var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options); db.Database.EnsureCreated(); return db; }
}
