using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class ProjectDefaultCurrencyTests
{
    [Fact]
    public async Task New_project_defaults_to_founders_preferred_currency_from_currency_master()
    {
        await using var db = CreateDb();
        var founder = Founder("SAR");
        db.AuthUsers.Add(founder);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
        var created = await service.CreateAsync(founder.Id, Request());

        created.DefaultCurrency.Should().Be("SAR");
        created.DefaultCurrencyInfo.Should().NotBeNull();
        created.DefaultCurrencyInfo!.Symbol.Should().Be("﷼");
        created.DefaultCurrencyInfo.EnglishName.Should().Be("Saudi Riyal");
        created.DefaultCurrencyInfo.ArabicName.Should().Be("الريال السعودي");
        created.DefaultCurrencyInfo.DecimalDigits.Should().Be(2);
    }

    [Fact]
    public async Task Explicit_default_currency_overrides_founders_preference()
    {
        await using var db = CreateDb();
        var founder = Founder("SAR");
        db.AuthUsers.Add(founder);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
        var request = Request();
        request.DefaultCurrency = "USD";

        var created = await service.CreateAsync(founder.Id, request);

        created.DefaultCurrency.Should().Be("USD");
        created.DefaultCurrencyInfo!.Symbol.Should().Be("$");
    }

    [Fact]
    public async Task Unknown_currency_is_rejected_against_currency_master()
    {
        await using var db = CreateDb();
        var founder = Founder("SAR");
        db.AuthUsers.Add(founder);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
        var request = Request();
        request.DefaultCurrency = "XYZ";

        await FluentActions.Invoking(() => service.CreateAsync(founder.Id, request))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "UNSUPPORTED_CURRENCY");
    }

    [Fact]
    public async Task Founder_without_preference_falls_back_to_platform_default()
    {
        await using var db = CreateDb();
        var founder = Founder(null);
        db.AuthUsers.Add(founder);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
        var created = await service.CreateAsync(founder.Id, Request());

        created.DefaultCurrency.Should().Be(CurrencyMasterDefaults.DefaultCurrency);
    }

    [Fact]
    public async Task Project_totals_are_summed_in_project_default_currency()
    {
        await using var db = CreateDb();
        var founder = Founder("EGP");
        db.AuthUsers.Add(founder);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var service = new ProjectService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
        var project = await service.CreateAsync(founder.Id, Request());

        db.Opportunities.AddRange(
            Opportunity(project, 1, 100_000m),
            Opportunity(project, 2, 250_000m));
        await db.SaveChangesAsync();

        var dto = await service.GetAsync(founder.Id, project.Id);

        dto.TotalFundingTargetInDefaultCurrency.Should().Be(350_000m);
        dto.OpportunityCount.Should().Be(2);
    }

    private static AuthUser Founder(string? preferredCurrency)
    {
        var user = new AuthUser
        {
            Id = Guid.NewGuid(),
            Email = $"{Guid.NewGuid():N}@test.local",
            UserType = UserType.Client,
            ClientType = ClientType.Founder,
            Status = true
        };
        if (preferredCurrency != null)
            user.Profile = new UserProfile { UserId = user.Id, PreferredCurrency = preferredCurrency };
        return user;
    }

    private static CreateProjectRequest Request() => new()
    {
        DisplayName = "Durable business",
        Summary = "A durable business summary.",
        Description = "A durable business description.",
        BusinessStage = ProjectStage.MVP
    };

    private static Opportunity Opportunity(ProjectDto project, int sequence, decimal target) => new()
    {
        ProjectId = project.Id,
        FounderId = project.FounderId,
        SequenceNumber = sequence,
        Title = $"Round {sequence}",
        ShortDescription = "Seed round",
        UseOfFunds = "Growth",
        FundingTarget = target,
        FundingCurrency = "EGP",
        InvestmentModel = InvestmentModel.CapitalContributionProfitSharing,
        ProjectStage = ProjectStage.MVP,
        Status = OpportunityStatus.Draft
    };

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
