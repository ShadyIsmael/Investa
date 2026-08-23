using FluentAssertions;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class FounderDashboardServiceTests
{
    [Fact]
    public void Portfolio_projection_ordering_is_translatable_by_sql_server()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=(local);Database=InvestaDashboardQueryTranslation;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
        using var db = new ApplicationDbContext(options);

        var projectQuery = db.Projects
            .Where(p => p.FounderId == Guid.Empty)
            .OrderByDescending(p => p.Id)
            .Select(p => new SqlProjectRow(p.Id, p.DisplayName, p.Status, p.DefaultCurrency))
            .ToQueryString();
        var opportunityQuery = db.Opportunities
            .Where(o => new[] { 1, 2 }.Contains(o.ProjectId))
            .OrderBy(o => o.ProjectId).ThenBy(o => o.SequenceNumber).ThenBy(o => o.Id)
            .Select(o => new SqlOpportunityRow(o.Id, o.ProjectId, o.SequenceNumber, o.Title, o.FundingTarget, o.FundingCurrency))
            .ToQueryString();

        projectQuery.Should().Contain("ORDER BY");
        opportunityQuery.Should().Contain("ORDER BY");
    }

    [Fact]
    public async Task Aggregates_multiple_projects_and_opportunities_with_distinct_investors_and_status_filters()
    {
        await using var db = CreateDb();
        var founder = Founder();
        var otherFounder = Founder();
        db.AuthUsers.AddRange(founder, otherFounder);
        var investorA = Investor(); var investorB = Investor();
        db.AuthUsers.AddRange(investorA, investorB);
        var project = Project(founder.Id, "Owned");
        var secondProject = Project(founder.Id, "Second");
        var foreignProject = Project(otherFounder.Id, "Foreign");
        db.Projects.AddRange(project, secondProject, foreignProject);
        db.SaveChanges();
        var open = Opportunity(founder.Id, project.Id, "Open", 100m, OpportunityFundingStatus.Open, OpportunityStatus.Funding);
        var closed = Opportunity(founder.Id, project.Id, "Closed", 200m, OpportunityFundingStatus.Closed, OpportunityStatus.Funding);
        var openSecond = Opportunity(founder.Id, secondProject.Id, "Open second", 300m, OpportunityFundingStatus.NotScheduled, OpportunityStatus.Published);
        var foreign = Opportunity(otherFounder.Id, foreignProject.Id, "Foreign", 999m, OpportunityFundingStatus.Open, OpportunityStatus.Funding);
        db.Opportunities.AddRange(open, closed, openSecond, foreign); db.SaveChanges();
        db.OpportunityJoinRequests.AddRange(
            Approved(open, investorA, 40m), Approved(closed, investorA, 50m), Approved(openSecond, investorB, 60m), Approved(openSecond, investorA, 10m), Approved(foreign, investorB, 900m));
        await db.SaveChangesAsync();

        var dashboard = Service(db);
        var result = await dashboard.GetAsync(founder.Id, DateTime.UtcNow.AddMonths(-1), DateTime.UtcNow.AddMonths(1));

        result.Metrics.TotalProjects.Should().Be(2);
        result.Metrics.ActiveOpportunities.Should().Be(2);
        result.Metrics.UniqueActiveInvestors.Should().Be(2);
        result.Metrics.TotalFundingTarget.Value.Should().Be(600m);
        result.Metrics.TotalFunded.Value.Should().Be(160m);
        result.Metrics.FundingProgressPercentage.Should().BeApproximately(160m / 600m * 100m, 0.001m);
        result.Projects.Should().HaveCount(2);
        result.Projects.SelectMany(p => p.Opportunities).Should().HaveCount(3);
    }

    [Fact]
    public async Task Excludes_reversed_received_payment_and_keeps_earnings_unavailable()
    {
        await using var db = CreateDb();
        var founder = Founder(); var investor = Investor(); db.AuthUsers.AddRange(founder, investor);
        var project = Project(founder.Id, "Cash"); db.Projects.Add(project); db.SaveChanges();
        var opportunity = Opportunity(founder.Id, project.Id, "Cash opportunity", 100m, OpportunityFundingStatus.Open, OpportunityStatus.Funding);
        db.Opportunities.Add(opportunity); db.SaveChanges();
        var participation = Approved(opportunity, investor, 80m); db.OpportunityJoinRequests.Add(participation); db.SaveChanges();
        db.PaymentTransactions.AddRange(
            new PaymentTransaction { ParticipationRequestId = participation.Id, Amount = 35m, PaymentDate = DateTime.UtcNow.AddDays(-1), IdempotencyKey = "valid", CreatedByUserId = founder.Id },
            new PaymentTransaction { ParticipationRequestId = participation.Id, Amount = 20m, PaymentDate = DateTime.UtcNow.AddDays(-1), IdempotencyKey = "reversed", CreatedByUserId = founder.Id, IsReversed = true, ReversedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var result = await Service(db).GetAsync(founder.Id);

        result.Metrics.ReceivedAmount.Value.Should().Be(35m);
        result.Metrics.Earnings.Available.Should().BeFalse();
    }

    [Fact]
    public async Task Empty_portfolio_returns_zero_metrics_and_does_not_leak_other_founder_data()
    {
        await using var db = CreateDb();
        var founder = Founder(); var other = Founder(); db.AuthUsers.AddRange(founder, other); db.SaveChanges();
        var foreignProject = Project(other.Id, "Not visible"); db.Projects.Add(foreignProject); db.SaveChanges();

        var result = await Service(db).GetAsync(founder.Id);

        result.Metrics.TotalProjects.Should().Be(0);
        result.Metrics.ActiveOpportunities.Should().Be(0);
        result.Metrics.UniqueActiveInvestors.Should().Be(0);
        result.Metrics.TotalFundingTarget.Value.Should().Be(0m);
        result.Metrics.TotalFunded.Value.Should().Be(0m);
        result.Projects.Should().BeEmpty();
        result.Availability.Followers.Should().Be("deferred");
    }

    [Fact]
    public async Task Normalizes_target_and_funded_amounts_to_founder_display_currency_with_fx()
    {
        await using var db = CreateDb();
        var founder = Founder();
        founder.Profile = new UserProfile { UserId = founder.Id, PreferredCurrency = "USD" };
        var investor = Investor();
        db.AuthUsers.AddRange(founder, investor);
        var project = Project(founder.Id, "FX project"); project.DefaultCurrency = "USD"; db.Projects.Add(project); db.SaveChanges();
        var opportunity = Opportunity(founder.Id, project.Id, "EUR opportunity", 100m, OpportunityFundingStatus.Open, OpportunityStatus.Funding);
        opportunity.FundingCurrency = "EGP"; db.Opportunities.Add(opportunity); db.SaveChanges();
        db.OpportunityJoinRequests.Add(Approved(opportunity, investor, 50m)); await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var service = new FounderDashboardService(uow, new CurrencyConversionService(uow, [new FixedProvider(0.02m)]), new CurrencyDisplayService(uow));
        var result = await service.GetAsync(founder.Id);

        result.DisplayCurrency.Should().Be("USD");
        result.Metrics.TotalFundingTarget.Value.Should().Be(2m);
        result.Metrics.TotalFunded.Value.Should().Be(1m);
        result.Metrics.TotalFundingTarget.Approximate.Should().BeTrue();
    }

    [Fact]
    public async Task Legacy_null_currency_data_does_not_break_the_portfolio_read_model()
    {
        await using var db = CreateDb();
        var founder = Founder(); var investor = Investor(); db.AuthUsers.AddRange(founder, investor);
        var project = Project(founder.Id, "Legacy");
        db.Projects.Add(project); await db.SaveChangesAsync();
        var opportunity = Opportunity(founder.Id, project.Id, "Legacy opportunity", 100m, OpportunityFundingStatus.Open, OpportunityStatus.Funding);
        db.Opportunities.Add(opportunity); await db.SaveChangesAsync();
        var participation = Approved(opportunity, investor, 25m);
        db.OpportunityJoinRequests.Add(participation); await db.SaveChangesAsync();
        db.PaymentTransactions.Add(new PaymentTransaction
        {
            ParticipationRequestId = participation.Id,
            Amount = 10m,
            PaymentDate = DateTime.UtcNow,
            IdempotencyKey = "legacy-null-currency",
            CreatedByUserId = founder.Id
        });
        await db.SaveChangesAsync();

        // Simulate rows written by a pre-FX schema. The current model marks these
        // columns required for new writes, but the legacy database can still hold nulls.
        project.DefaultCurrency = "BAD";
        opportunity.FundingCurrency = "BAD";
        participation.FundingCurrency = null;
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var result = await Service(db).GetAsync(founder.Id);

        result.Metrics.TotalProjects.Should().Be(1);
        result.Metrics.TotalFundingTarget.Should().NotBeNull();
        result.Metrics.TotalFunded.Should().NotBeNull();
        result.Metrics.ReceivedAmount.Should().NotBeNull();
        result.TimeSeries.FundingApprovals.Should().NotBeNull();
        result.TimeSeries.ReceivedAmounts.Should().NotBeNull();
    }

    [Fact]
    public async Task Rejects_non_founder_accounts_before_reading_portfolio()
    {
        await using var db = CreateDb();
        var investor = Investor(); db.AuthUsers.Add(investor); await db.SaveChangesAsync();

        await FluentActions.Invoking(() => Service(db).GetAsync(investor.Id))
            .Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>()
            .Where(e => e.Code == "FOUNDER_ACCESS_REQUIRED");
    }

    private static FounderDashboardService Service(ApplicationDbContext db)
    {
        var uow = new UnitOfWork(db);
        return new FounderDashboardService(uow, new CurrencyConversionService(uow, []), new CurrencyDisplayService(uow));
    }

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }

    private static AuthUser Founder() => new() { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
    private static AuthUser Investor() => new() { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
    private static Project Project(Guid founderId, string name) => new() { FounderId = founderId, DisplayName = name, Slug = $"{name}-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", BusinessStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
    private static Opportunity Opportunity(Guid founderId, int projectId, string title, decimal target, OpportunityFundingStatus fundingStatus, OpportunityStatus status) => new() { FounderId = founderId, ProjectId = projectId, Title = title, ShortDescription = "Description", UseOfFunds = "Growth", FundingTarget = target, FundingCurrency = "EGP", FundingStatus = fundingStatus, Status = status, InvestmentModel = InvestmentModel.Equity, ProjectStage = ProjectStage.Idea };
    private static OpportunityJoinRequest Approved(Opportunity opportunity, AuthUser investor, decimal amount) => new() { OpportunityId = opportunity.Id, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = amount, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

    private sealed class FixedProvider(decimal rate) : IExchangeRateProvider
    {
        public string Name => "FounderDashboardTest";
        public int Priority => 1;
        public Task<ExchangeRateQuote> GetCurrentRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default) =>
            Task.FromResult(new ExchangeRateQuote(sourceCurrency, targetCurrency, rate, DateTime.UtcNow, Name));
        public Task<ExchangeRateQuote?> GetHistoricalRateAsync(string sourceCurrency, string targetCurrency, DateTime atUtc, CancellationToken cancellationToken = default) =>
            Task.FromResult<ExchangeRateQuote?>(new ExchangeRateQuote(sourceCurrency, targetCurrency, rate, atUtc, Name));
    }

    private sealed record SqlProjectRow(int Id, string? DisplayName, ProjectStatus Status, string? DefaultCurrency);
    private sealed record SqlOpportunityRow(int Id, int ProjectId, int SequenceNumber, string? Title, decimal FundingTarget, string? FundingCurrency);
}
