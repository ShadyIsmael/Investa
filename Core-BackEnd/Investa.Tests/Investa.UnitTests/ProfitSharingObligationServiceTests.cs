using System.Text.Json;
using FluentAssertions;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class ProfitSharingObligationServiceTests
{
    [Theory]
    [InlineData("Monthly", 12)]
    [InlineData("Quarterly", 4)]
    [InlineData("SemiAnnual", 2)]
    [InlineData("Annual", 1)]
    public async Task Fully_confirmed_funding_persists_contractual_reporting_periods(string frequency, int expectedPeriods)
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, frequency);
        fixture.Opportunity.ProfitSharingPayoutFrequency = "Annual";

        var obligation = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        obligation.Should().NotBeNull();
        obligation!.Status.Should().Be(ProfitSharingObligationStatus.Active);
        obligation.ContractId.Should().Be(fixture.Contract.Id);
        obligation.ContractVersionId.Should().Be(fixture.ContractVersion.Id);
        obligation.AcceptedOfferId.Should().Be(fixture.Offer.Id);
        obligation.AcceptedOfferVersionNumber.Should().Be(fixture.Offer.Version);
        obligation.OfferLegId.Should().Be(fixture.ProfitLeg.Id);
        obligation.ContributionAmount.Should().Be(1_000m);
        obligation.ProfitSharePercentage.Should().Be(20m);
        obligation.ReportingFrequency.Should().Be(frequency);
        obligation.CalculationBasis.Should().Be(ProfitSharingCalculationBasis.Profit);
        obligation.ReportingPeriods.Should().HaveCount(expectedPeriods);
        obligation.ReportingPeriods.OrderBy(x => x.PeriodNumber).Last().EndDate.Should().Be(fixture.StartDate.AddMonths(12));
    }

    [Fact]
    public async Task Partial_confirmation_creates_one_pending_obligation_without_periods_then_activates_once()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Quarterly", confirmedAmount: 500m);
        var service = Service(db);

        var pending = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        pending.Should().NotBeNull();
        pending!.Status.Should().Be(ProfitSharingObligationStatus.PendingFunding);
        pending.ReportingPeriods.Should().BeEmpty();
        (await db.ProfitSharingObligations.CountAsync()).Should().Be(1);
        (await db.ProfitSharingReportingPeriods.CountAsync()).Should().Be(0);

        db.FundingDeclarations.Single().Amount = 1_000m;
        var active = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        active!.Id.Should().Be(pending.Id);
        active.Status.Should().Be(ProfitSharingObligationStatus.Active);
        active.ReportingPeriods.Should().HaveCount(4);
        (await db.ProfitSharingObligations.CountAsync()).Should().Be(1);
        (await db.ProfitSharingReportingPeriods.CountAsync()).Should().Be(4);

        var repeated = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        repeated!.Id.Should().Be(pending.Id);
        (await db.ProfitSharingReportingPeriods.CountAsync()).Should().Be(4);
    }

    [Fact]
    public async Task Mixed_leg_participation_is_not_activated_without_per_leg_funding_semantics()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Monthly", mixedLeg: true);

        var result = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);

        result.Should().BeNull();
        (await db.ProfitSharingObligations.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Room_summary_is_visible_only_to_the_founder_investor_or_admin()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var service = Service(db);
        await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        var investorView = await service.GetForParticipationAsync(fixture.Investor.Id, fixture.Opportunity.Id, fixture.Participation.Id);
        investorView.Obligations.Should().ContainSingle();

        var act = () => service.GetForParticipationAsync(Guid.NewGuid(), fixture.Opportunity.Id, fixture.Participation.Id);
        await act.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>()
            .WithMessage("*not authorized*");
    }

    [Fact]
    public async Task Declaring_positive_profit_persists_entitlement_from_contractual_percentage()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var service = Service(db);
        var obligation = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        var period = obligation!.ReportingPeriods.Single();
        var declaration = await service.DeclareAsync(
            fixture.Founder.Id,
            fixture.Opportunity.Id,
            obligation.Id,
            period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(
                500m, 500m, "EGP", DateTime.UtcNow.AddDays(-1), "REF-1", "Declared profit", "declare-1"));

        declaration.Entitlement.Should().NotBeNull();
        declaration.Entitlement!.EntitlementAmount.Should().Be(100m);
        declaration.Entitlement.DistributionOutstanding.Should().Be(100m);
        var readback = await service.GetForParticipationAsync(
            fixture.Founder.Id,
            fixture.Opportunity.Id,
            fixture.Participation.Id);
        readback.Obligations.Single().ReportingPeriods.Single().Declaration!.Id
            .Should().Be(declaration.Id);
        (await db.ProfitSharingPeriodDeclarations.CountAsync()).Should().Be(1);
        (await db.ProfitSharingEntitlements.CountAsync()).Should().Be(1);

        var replay = await service.DeclareAsync(
            fixture.Founder.Id,
            fixture.Opportunity.Id,
            obligation.Id,
            period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(
                500m, 500m, "EGP", DateTime.UtcNow.AddDays(-1), "REF-1", "Declared profit", "declare-1"));
        replay.Id.Should().Be(declaration.Id);
        (await db.ProfitSharingPeriodDeclarations.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task Profit_sharing_evidence_category_is_seeded_with_governed_constraints()
    {
        await using var db = CreateDb();
        var category = await db.FileCategories.SingleAsync(
            item => item.Code == "PROFIT_SHARING_EVIDENCE");

        category.IsActive.Should().BeTrue();
        category.MaxFileSizeBytes.Should().Be(25L * 1024 * 1024);
        category.AllowedExtensions.Should().Be(".pdf,.jpg,.jpeg,.png,.webp");
    }

    [Fact]
    public async Task Negative_result_is_preserved_without_positive_entitlement()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var service = Service(db);
        var obligation = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        var period = obligation!.ReportingPeriods.Single();
        var declaration = await service.DeclareAsync(
            fixture.Founder.Id,
            fixture.Opportunity.Id,
            obligation.Id,
            period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(
                -100m, -100m, "EGP", DateTime.UtcNow.AddDays(-1), null, null, "loss-1"));

        declaration.DeclaredResultAmount.Should().Be(-100m);
        declaration.Entitlement.Should().BeNull();
        declaration.CalculationError.Should().Contain("loss-sharing");
        (await db.ProfitSharingEntitlements.CountAsync()).Should().Be(0);
        (await db.ProfitSharingReportingPeriods.SingleAsync()).Status.Should().Be(ProfitSharingReportingPeriodStatus.NoEntitlement);
    }

    [Fact]
    public async Task Partial_distribution_is_reserved_confirmed_and_reconciled_without_legacy_payment_rows()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var service = Service(db);
        var obligation = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var period = obligation!.ReportingPeriods.Single();
        await service.DeclareAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(500m, 500m, "EGP", DateTime.UtcNow.AddDays(-1), null, null, "result-1"));

        var distribution = await service.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(40m, "EGP", "EXT-40", null, "distribution-1"));
        distribution.Status.Should().Be(ProfitSharingDistributionDeclarationStatus.PendingConfirmation.ToString());
        (await db.ProfitSharingEntitlements.SingleAsync()).PendingDistributionAmount.Should().Be(40m);

        var replay = await service.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(40m, "EGP", "EXT-40", null, "distribution-1"));
        replay.Id.Should().Be(distribution.Id);
        (await db.ProfitSharingDistributionDeclarations.CountAsync()).Should().Be(1);

        var confirmed = await service.ConfirmDistributionAsync(fixture.Investor.Id, distribution.Id, "acknowledged");
        confirmed.Status.Should().Be(ProfitSharingDistributionDeclarationStatus.Confirmed.ToString());
        var entitlement = await db.ProfitSharingEntitlements.SingleAsync();
        entitlement.DistributionOutstanding.Should().Be(60m);
        entitlement.PendingDistributionAmount.Should().Be(0m);
        (await db.ProfitSharingDistributionAllocations.CountAsync()).Should().Be(1);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);

        var summary = await service.GetForParticipationAsync(fixture.Investor.Id, fixture.Opportunity.Id, fixture.Participation.Id);
        summary.TotalEntitlement.Should().Be(100m);
        summary.TotalConfirmedDistributed.Should().Be(40m);
        summary.TotalDistributionOutstanding.Should().Be(60m);
        summary.Obligations.Single().ReportingPeriods.Single().Status.Should().Be(ProfitSharingReportingPeriodStatus.PartiallyDistributed.ToString());
    }

    [Fact]
    public async Task Pending_distribution_reserves_capacity_and_dispute_does_not_reduce_outstanding()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var service = Service(db);
        var obligation = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var period = obligation!.ReportingPeriods.Single();
        await service.DeclareAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(500m, 500m, "EGP", DateTime.UtcNow.AddDays(-1), null, null, "result-2"));

        var first = await service.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(70m, "EGP", null, null, "distribution-2"));
        var act = () => service.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(31m, "EGP", null, null, "distribution-3"));
        await act.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>().WithMessage("*remaining distributable*");

        await service.DisputeDistributionAsync(fixture.Investor.Id, first.Id, "Amount is not acknowledged.");
        var entitlement = await db.ProfitSharingEntitlements.SingleAsync();
        entitlement.DistributionOutstanding.Should().Be(100m);
        entitlement.PendingDistributionAmount.Should().Be(0m);
        (await db.ProfitSharingDistributionAllocations.CountAsync()).Should().Be(0);
        (await db.ProfitSharingPeriodDeclarations.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task Activation_marks_exactly_one_final_stub_period_at_contractual_maturity()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Quarterly", durationMonths: 10);
        var obligation = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        obligation!.ReportingPeriods.Should().HaveCount(4);
        obligation.ReportingPeriods.Count(x => x.IsFinalPeriod).Should().Be(1);
        obligation.ReportingPeriods.Single(x => x.IsFinalPeriod).EndDate.Should().Be(fixture.StartDate.AddMonths(10));
    }

    [Fact]
    public async Task Lifecycle_matures_idempotently_and_does_not_default_or_settle_incomplete_reporting()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var obligation = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var lifecycle = LifecycleService(db);

        var first = await lifecycle.ProcessLifecycleAsync(fixture.StartDate.AddMonths(12).AddMinutes(1));
        var second = await lifecycle.ProcessLifecycleAsync(fixture.StartDate.AddMonths(12).AddMinutes(1));

        first.Matured.Should().Be(1);
        second.Matured.Should().Be(0);
        (await db.ProfitSharingObligations.AsNoTracking().SingleAsync(x => x.Id == obligation!.Id)).Status.Should().Be(ProfitSharingObligationStatus.Matured);
        (await db.AuditLogs.CountAsync(x => x.EntityType == nameof(ProfitSharingObligation) && x.Action == "ProfitSharingMatured")).Should().Be(1);
    }

    [Fact]
    public async Task Matured_obligation_settles_then_closes_with_immutable_snapshot_and_blocks_mutation()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var obligationService = Service(db);
        var obligation = await obligationService.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var period = obligation!.ReportingPeriods.Single();
        await obligationService.DeclareAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(500m, 500m, "EGP", DateTime.UtcNow.AddMinutes(-1), null, null, "phase3-final"));
        var distribution = await obligationService.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(100m, "EGP", null, null, "phase3-full"));
        await obligationService.ConfirmDistributionAsync(fixture.Investor.Id, distribution.Id, "acknowledged");
        var lifecycle = LifecycleService(db);

        await lifecycle.ProcessLifecycleAsync(fixture.StartDate.AddMonths(12).AddMinutes(1));
        (await db.ProfitSharingObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id)).Status.Should().Be(ProfitSharingObligationStatus.Matured);
        var settled = await lifecycle.ProcessLifecycleAsync(fixture.StartDate.AddMonths(12).AddMinutes(2));
        settled.Settled.Should().Be(1);
        (await db.ProfitSharingObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id)).Status.Should().Be(ProfitSharingObligationStatus.Settled);

        var closed = await lifecycle.CloseAsync(Guid.NewGuid(), obligation.Id, "Final reporting complete", true);
        closed.Status.Should().Be(ProfitSharingObligationStatus.Closed.ToString());
        closed.ClosureSnapshotHash.Should().NotBeNullOrWhiteSpace();
        var persisted = await db.ProfitSharingObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id);
        persisted.ClosureSnapshotJson.Should().Contain("Final reporting complete");
        persisted.ClosureSnapshotHash.Should().NotBeNullOrWhiteSpace();

        var mutation = () => obligationService.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(1m, "EGP", null, null, "after-close"));
        await mutation.Should().ThrowAsync<Investa.Application.Common.BusinessValidationException>().WithMessage("*active or matured*");
    }

    [Fact]
    public async Task Matured_with_positive_outstanding_or_pending_distribution_does_not_settle()
    {
        await using var db = CreateDb();
        var fixture = SeedProfitSharing(db, "Annual");
        var obligationService = Service(db);
        var obligation = await obligationService.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var period = obligation!.ReportingPeriods.Single();
        await obligationService.DeclareAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDeclarationCreateCommand(500m, 500m, "EGP", DateTime.UtcNow.AddMinutes(-1), null, null, "phase3-open"));
        await obligationService.DeclareDistributionAsync(fixture.Founder.Id, fixture.Opportunity.Id, obligation.Id, period.Id,
            new Investa.Application.DTOs.ProfitSharingDistributionCreateCommand(40m, "EGP", null, null, "phase3-pending"));
        var lifecycle = LifecycleService(db);
        await lifecycle.ProcessLifecycleAsync(fixture.StartDate.AddMonths(12).AddMinutes(1));
        var result = await lifecycle.ProcessLifecycleAsync(fixture.StartDate.AddMonths(12).AddMinutes(2));

        result.Settled.Should().Be(0);
        (await db.ProfitSharingObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id)).Status.Should().Be(ProfitSharingObligationStatus.Matured);
    }

    private static ProfitSharingObligationService Service(ApplicationDbContext db) =>
        new(
            new UnitOfWork(db),
            new Mock<Investa.Application.Interfaces.IFileUploadService>().Object,
            new Mock<Investa.Application.Interfaces.IFileStorage>().Object,
            null,
            NullLogger<ProfitSharingObligationService>.Instance);

    private static ProfitSharingLifecycleService LifecycleService(ApplicationDbContext db) =>
        new(new UnitOfWork(db), null, NullLogger<ProfitSharingLifecycleService>.Instance);

    private static ProfitFixture SeedProfitSharing(ApplicationDbContext db, string frequency, decimal confirmedAmount = 1_000m, bool mixedLeg = false, int durationMonths = 12)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Project", Slug = $"project-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity
        {
            FounderId = founder.Id,
            Project = project,
            Title = "Opportunity",
            ShortDescription = "Opportunity description",
            UseOfFunds = "Working capital",
            FundingTarget = 1_000m,
            FundingCurrency = "EGP",
            InvestmentModel = InvestmentModel.CapitalContributionProfitSharing,
            ProfitSharingPayoutFrequency = frequency,
            ProfitSharePercentage = 20m,
            ExpectedDurationMonths = 12,
            ProjectStage = ProjectStage.Idea,
            Status = OpportunityStatus.Funding,
            FundingStatus = OpportunityFundingStatus.Open
        };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 1_000m, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow.AddDays(-2) };
        var offer = new NegotiationOffer { Opportunity = opportunity, CreatedByUserId = founder.Id, Version = 4, Status = NegotiationOfferStatus.Accepted, Currency = "EGP" };
        var profitLeg = new NegotiationOfferLeg { Offer = offer, LegType = NegotiationOfferLegType.ProfitSharing, Amount = 1_000m, ProfitSharePercentage = 20m, ProfitSharingPayoutFrequency = frequency };
        offer.Legs.Add(profitLeg);
        if (mixedLeg)
            offer.Legs.Add(new NegotiationOfferLeg { Offer = offer, LegType = NegotiationOfferLegType.Equity, Amount = 0m, EquityPercentage = 5m });

        db.AuthUsers.AddRange(founder, investor);
        db.Opportunities.Add(opportunity);
        db.OpportunityJoinRequests.Add(participation);
        db.NegotiationOffers.Add(offer);
        db.SaveChanges();
        participation.AcceptedOfferId = offer.Id;

        var startDate = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc);
        var contract = new InvestmentContract
        {
            ContractNumber = $"CTR-{Guid.NewGuid():N}",
            OpportunityId = opportunity.Id,
            AcceptedOfferId = offer.Id,
            AcceptedOfferVersionNumber = offer.Version,
            ParticipationRequestId = participation.Id,
            FounderUserId = founder.Id,
            InvestorUserId = investor.Id,
            InvestmentModel = InvestmentModel.CapitalContributionProfitSharing,
            OpportunityTitleSnapshot = opportunity.Title,
            FounderNameSnapshot = founder.Name!,
            InvestorNameSnapshot = investor.Name!,
            AcceptedCurrency = "EGP",
            AcceptedAmount = 1_000m,
            AcceptanceTimestamp = startDate,
            CurrentVersionNumber = 1,
            Status = InvestmentContractStatus.Active
        };
        contract.Versions.Add(new InvestmentContractVersion
        {
            VersionNumber = 1,
            VersionType = InvestmentContractVersionType.InitialAgreement,
            SourceParticipationRequestId = participation.Id,
            SourceNegotiationOfferId = offer.Id,
            Status = InvestmentContractVersionStatus.Active,
            TermsSnapshotJson = JsonSerializer.Serialize(new
            {
                acceptedOffer = new { id = offer.Id, versionNumber = offer.Version },
                acceptanceTimestamp = startDate,
                sourceAgreedTerms = offer.Legs.OrderBy(x => x.Id).Select((leg, index) => new
                {
                    offerLegId = leg.Id,
                    legNumber = index + 1,
                    legType = leg.LegType.ToString(),
                    amount = leg.Amount,
                    currency = "EGP",
                    profitSharePercentage = leg.ProfitSharePercentage,
                    payoutFrequency = leg.LegType == NegotiationOfferLegType.ProfitSharing ? leg.ProfitSharingPayoutFrequency : null,
                    reportingFrequency = leg.LegType == NegotiationOfferLegType.ProfitSharing ? leg.ProfitSharingPayoutFrequency : null,
                    calculationBasis = leg.LegType == NegotiationOfferLegType.ProfitSharing ? "Profit" : null,
                    contractualStartDate = startDate,
                    contractualMaturityDate = startDate.AddMonths(durationMonths)
                })
            }),
            DocumentHash = "test-hash",
            DocumentContent = "test-document"
        });
        db.InvestmentContracts.Add(contract);
        db.SaveChanges();

        db.FundingDeclarations.Add(new FundingDeclaration
        {
            ParticipationId = participation.Id,
            OpportunityId = opportunity.Id,
            FounderId = founder.Id,
            InvestorId = investor.Id,
            Amount = confirmedAmount,
            CurrencyCode = "EGP",
            ReceivedDate = startDate,
            PaymentMethod = FundingPaymentMethod.BankTransfer,
            Status = FundingDeclarationStatus.Confirmed,
            ConfirmedAt = startDate.AddDays(1),
            ConfirmedByInvestorId = investor.Id,
            CreatedBy = founder.Id
        });
        db.SaveChanges();

        return new ProfitFixture(founder, investor, opportunity, participation, offer, profitLeg, contract, contract.Versions.Single(), startDate);
    }

    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        var db = new ApplicationDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    private sealed record ProfitFixture(AuthUser Founder, AuthUser Investor, Opportunity Opportunity, OpportunityJoinRequest Participation, NegotiationOffer Offer, NegotiationOfferLeg ProfitLeg, InvestmentContract Contract, InvestmentContractVersion ContractVersion, DateTime StartDate);
}
