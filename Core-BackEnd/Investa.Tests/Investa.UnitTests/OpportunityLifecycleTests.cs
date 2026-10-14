using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class OpportunityLifecycleTests
{
    [Fact]
    public async Task Founder_submission_enters_review_without_approving_or_publishing()
    {
        await using var db = CreateDatabase();
        var (founderId, opportunity) = await AddReviewReadyOpportunityAsync(db);
        var service = CreateService(db);

        var result = await service.SubmitForReviewAsync(founderId, opportunity.Id);

        result.Status.Should().Be(OpportunityStatus.UnderReview);
        result.ModerationStatus.Should().Be(OpportunityModerationStatus.Submitted);
        result.CanFounderSubmitForReview.Should().BeFalse();
        (await db.Opportunities.SingleAsync(x => x.Id == opportunity.Id)).Status
            .Should().Be(OpportunityStatus.UnderReview);
        (await db.OpportunityEvents.AnyAsync(x =>
            x.OpportunityId == opportunity.Id && x.EventType == "SubmittedForReview"))
            .Should().BeTrue();
    }

    [Fact]
    public async Task Draft_cannot_skip_review_by_calling_paid_publish()
    {
        await using var db = CreateDatabase();
        var (founderId, opportunity) = await AddReviewReadyOpportunityAsync(db);
        var service = CreateService(db);

        var act = () => service.PublishAsync(founderId, opportunity.Id);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "OPPORTUNITY_NOT_APPROVED");
        (await db.Opportunities.SingleAsync(x => x.Id == opportunity.Id)).Status
            .Should().Be(OpportunityStatus.Draft);
    }

    [Fact]
    public async Task Founder_cannot_open_funding_directly_from_approved_state()
    {
        await using var db = CreateDatabase();
        var (founderId, opportunity) = await AddReviewReadyOpportunityAsync(db);
        opportunity.Status = OpportunityStatus.Approved;
        opportunity.ModerationStatus = OpportunityModerationStatus.Approved;
        await db.SaveChangesAsync();
        var service = CreateService(db);
        var request = new TransitionOpportunityFundingRequest
        {
            TargetStatus = OpportunityFundingStatus.Open
        };

        var act = () => service.TransitionFundingAsync(
            founderId,
            opportunity.Id,
            request,
            isAdmin: false);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "OPPORTUNITY_NOT_PUBLISHED");
        (await db.Opportunities.SingleAsync(x => x.Id == opportunity.Id)).FundingStatus
            .Should().Be(OpportunityFundingStatus.NotScheduled);
    }

    [Fact]
    public async Task Founder_can_archive_once_and_capability_is_removed_afterward()
    {
        await using var db = CreateDatabase();
        var (founderId, opportunity) = await AddReviewReadyOpportunityAsync(db);
        var service = CreateService(db);

        var archived = await service.ArchiveAsync(founderId, opportunity.Id);

        archived.Status.Should().Be(OpportunityStatus.Archived);
        archived.CanFounderArchive.Should().BeFalse();
        (await db.Opportunities.SingleAsync(x => x.Id == opportunity.Id)).Status
            .Should().Be(OpportunityStatus.Archived);
        var act = () => service.ArchiveAsync(founderId, opportunity.Id);
        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "INVALID_STATUS_TRANSITION");
    }

    [Fact]
    public async Task Admin_opportunity_list_pages_and_projects_authoritative_context_from_database_query()
    {
        await using var db = CreateDatabase();
        var founderA = Guid.NewGuid();
        var founderB = Guid.NewGuid();
        db.AuthUsers.AddRange(
            new AuthUser { Id = founderA, Name = "Alpha Founder", Email = "alpha@example.com", PasswordHash = "test" },
            new AuthUser { Id = founderB, Name = "Beta Founder", Email = "beta@example.com", PasswordHash = "test" });
        db.Projects.AddRange(
            new Project { Id = 101, FounderId = founderA, DisplayName = "Alpha Project", Slug = "alpha-project", Summary = "Alpha summary", Description = "Alpha description", Status = ProjectStatus.Active },
            new Project { Id = 102, FounderId = founderB, DisplayName = "Beta Project", Slug = "beta-project", Summary = "Beta summary", Description = "Beta description", Status = ProjectStatus.Active });

        var created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        for (var index = 0; index < 25; index++)
        {
            var founderId = index % 2 == 0 ? founderA : founderB;
            db.Opportunities.Add(new Opportunity
            {
                ProjectId = founderId == founderA ? 101 : 102,
                FounderId = founderId,
                SequenceNumber = index + 1,
                Title = $"Solar opportunity {index:00}",
                ShortDescription = "A sufficiently detailed opportunity summary.",
                UseOfFunds = "Product expansion, hiring, and market development.",
                FundingTarget = 10_000m + index,
                FundingCurrency = index % 2 == 0 ? "EGP" : "USD",
                InvestmentModel = InvestmentModel.Unspecified,
                ProjectStage = ProjectStage.Idea,
                Status = index % 3 == 0 ? OpportunityStatus.UnderReview : OpportunityStatus.Draft,
                ModerationStatus = index % 3 == 0 ? OpportunityModerationStatus.UnderReview : OpportunityModerationStatus.Draft,
                FundingStatus = index % 4 == 0 ? OpportunityFundingStatus.Open : OpportunityFundingStatus.NotScheduled,
                CreatedAt = created.AddDays(index),
                UpdatedAt = created.AddDays(index + 1)
            });
        }
        await db.SaveChangesAsync();

        var result = await CreateService(db).GetAdminOpportunitiesAsync(new AdminOpportunityListQuery
        {
            Page = 1,
            PageSize = 20,
            SortBy = "createdAt",
            SortDirection = "asc"
        });

        result.Total.Should().Be(25);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(20);
        result.Items.Should().HaveCount(20);
        result.Items.Should().OnlyContain(item => item.ProjectId == 101 || item.ProjectId == 102);
        result.Items.Should().OnlyContain(item => item.ProjectDisplayName == "Alpha Project" || item.ProjectDisplayName == "Beta Project");
        result.Items.Should().OnlyContain(item => item.Founder.Name == "Alpha Founder" || item.Founder.Name == "Beta Founder");
        result.Items.Should().OnlyContain(item => item.FundingCurrency == "EGP" || item.FundingCurrency == "USD");
        result.Items.Select(item => item.CreatedAt).Should().BeInAscendingOrder();

        var defaultSorted = await CreateService(db).GetAdminOpportunitiesAsync(new AdminOpportunityListQuery
        {
            PageSize = 100,
            SortBy = null,
            SortDirection = null
        });
        defaultSorted.Items.Select(item => item.CreatedAt).Should().BeInDescendingOrder();

        var safeFallback = await CreateService(db).GetAdminOpportunitiesAsync(new AdminOpportunityListQuery
        {
            PageSize = 100,
            SortBy = "unsupportedColumn",
            SortDirection = "asc"
        });
        safeFallback.Items.Select(item => item.CreatedAt).Should().BeInAscendingOrder();

        var filtered = await CreateService(db).GetAdminOpportunitiesAsync(new AdminOpportunityListQuery
        {
            Search = "Beta Project",
            Status = OpportunityStatus.Draft,
            ModerationStatus = OpportunityModerationStatus.Draft,
            FundingStatus = OpportunityFundingStatus.NotScheduled,
            ProjectId = 102,
            FounderId = founderB,
            CreatedFrom = created.AddDays(10),
            CreatedTo = created.AddDays(20),
            PageSize = 100,
            SortBy = "updatedAt",
            SortDirection = "desc"
        });

        filtered.Total.Should().Be(4);
        filtered.Items.Should().OnlyContain(item => item.CreatedAt >= created.AddDays(10) && item.CreatedAt < created.AddDays(20));
        filtered.Items.Should().OnlyContain(item => item.ProjectId == 102 && item.FounderId == founderB && item.ProjectDisplayName == "Beta Project");
        filtered.Items.Select(item => item.UpdatedAt).Should().BeInDescendingOrder();
    }

    [Fact]
    public async Task Admin_opportunity_list_clamps_page_size_and_rejects_invalid_date_ranges()
    {
        await using var db = CreateDatabase();
        var (_, opportunity) = await AddReviewReadyOpportunityAsync(db);
        var service = CreateService(db);

        var result = await service.GetAdminOpportunitiesAsync(new AdminOpportunityListQuery { PageSize = 500 });
        result.PageSize.Should().Be(100);
        result.Items.Should().ContainSingle(item => item.Id == opportunity.Id);

        var act = () => service.GetAdminOpportunitiesAsync(new AdminOpportunityListQuery
        {
            CreatedFrom = DateTime.UtcNow,
            CreatedTo = DateTime.UtcNow.AddMinutes(-1)
        });
        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "CREATED_DATE_RANGE");
    }

    private static ApplicationDbContext CreateDatabase() => new(
        new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static OpportunityService CreateService(ApplicationDbContext db) => new(
        new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);

    private static async Task<(Guid FounderId, Opportunity Opportunity)> AddReviewReadyOpportunityAsync(
        ApplicationDbContext db)
    {
        var founderId = Guid.NewGuid();
        var category = new ProjectCategory
        {
            Code = "test-category",
            NameEn = "Test category",
            NameAr = "تصنيف تجريبي"
        };
        var fundingGoal = new FundingGoal
        {
            Code = "test-goal",
            NameEn = "Test goal",
            NameAr = "هدف تجريبي"
        };
        var project = new Project
        {
            FounderId = founderId,
            DisplayName = "Review-ready project",
            Slug = $"review-ready-{Guid.NewGuid():N}",
            Summary = "A review-ready project summary.",
            Description = "A review-ready project description.",
            Category = category,
            Status = ProjectStatus.Active
        };
        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founderId,
            SequenceNumber = 1,
            Type = "Opportunity",
            Title = "Review-ready opportunity",
            ShortDescription = "A sufficiently detailed opportunity summary.",
            UseOfFunds = "Product expansion, hiring, and market development.",
            FundingTarget = 100_000m,
            FundingGoal = fundingGoal,
            FundingCurrency = "EGP",
            ProjectStage = ProjectStage.Idea,
            Status = OpportunityStatus.Draft,
            ModerationStatus = OpportunityModerationStatus.Draft,
            FundingStatus = OpportunityFundingStatus.NotScheduled
        };

        db.Opportunities.Add(opportunity);
        await db.SaveChangesAsync();
        return (founderId, opportunity);
    }
}
