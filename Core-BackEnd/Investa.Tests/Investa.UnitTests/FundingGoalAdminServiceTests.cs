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

public sealed class FundingGoalAdminServiceTests
{
    [Fact]
    public async Task Creates_bilingual_goal_with_unique_immutable_code()
    {
        await using var db = CreateDb();
        var service = new FundingGoalAdminService(new UnitOfWork(db));

        var first = await service.CreateAsync(ValidCreate("Scale Operations"), Guid.NewGuid());
        var second = await service.CreateAsync(ValidCreate("Scale Operations"), Guid.NewGuid());
        var updated = await service.UpdateAsync(first.Id, new UpdateFundingGoalRequest
        {
            NameEn = "Scale Production",
            NameAr = "توسيع الإنتاج",
            DescriptionEn = "Updated description",
            DescriptionAr = "وصف محدث",
            SortOrder = 9
        }, Guid.NewGuid());

        first.Code.Should().Be("SCALEOPERATIONS");
        second.Code.Should().Be("SCALEOPERATIONS-2");
        updated!.Code.Should().Be(first.Code);
        updated.NameAr.Should().Be("توسيع الإنتاج");
        updated.DescriptionAr.Should().Be("وصف محدث");
    }

    [Fact]
    public async Task Deactivation_preserves_referenced_goal_and_reports_usage()
    {
        await using var db = CreateDb();
        var service = new FundingGoalAdminService(new UnitOfWork(db));
        var goal = await service.CreateAsync(ValidCreate("Historical Goal"), Guid.NewGuid());

        db.Opportunities.Add(new Opportunity
        {
            Id = 9911,
            FounderId = Guid.NewGuid(),
            Title = "Historical opportunity",
            ShortDescription = "Historical opportunity",
            UseOfFunds = "Historical use of funds",
            FundingTarget = 1000m,
            FundingGoalId = goal.Id,
            FundingCurrency = "EGP",
            ProjectStage = ProjectStage.Idea,
            InvestmentModel = InvestmentModel.Equity,
            Status = OpportunityStatus.Draft
        });
        await db.SaveChangesAsync();

        var deactivated = await service.SetStatusAsync(goal.Id, false, Guid.NewGuid());

        deactivated!.IsActive.Should().BeFalse();
        deactivated.ReferenceCount.Should().Be(1);
        (await service.GetByIdAsync(goal.Id)).Should().NotBeNull();
        (await service.GetAllAsync(isActive: true)).Should().NotContain(item => item.Id == goal.Id);
        db.Opportunities.Single(item => item.Id == 9911).FundingGoalId.Should().Be(goal.Id);
    }

    [Fact]
    public async Task Rejects_missing_bilingual_names_and_invalid_description_length()
    {
        await using var db = CreateDb();
        var service = new FundingGoalAdminService(new UnitOfWork(db));

        await FluentActions.Invoking(() => service.CreateAsync(new CreateFundingGoalRequest
        {
            NameEn = "Funding",
            NameAr = " "
        }, null))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "FUNDING_GOAL_NAMES_REQUIRED");

        await FluentActions.Invoking(() => service.CreateAsync(new CreateFundingGoalRequest
        {
            NameEn = "Funding",
            NameAr = "تمويل",
            DescriptionEn = new string('x', 501)
        }, null))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "FUNDING_GOAL_FIELDS_INVALID");
    }

    private static CreateFundingGoalRequest ValidCreate(string nameEn) => new()
    {
        NameEn = nameEn,
        NameAr = "هدف تمويل تجريبي",
        DescriptionEn = "A bilingual funding goal.",
        DescriptionAr = "هدف تمويل ثنائي اللغة.",
        SortOrder = 1
    };

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
