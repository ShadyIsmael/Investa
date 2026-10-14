using System.Text.Json;
using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Investa.UnitTests;

public sealed class EquityPositionServiceTests
{
    [Fact]
    public async Task Accepted_equity_creates_pending_then_activates_once_from_confirmed_funding()
    {
        await using var db = CreateDb();
        var fixture = SeedEquity(db, EquityOwnershipModel.PercentageBased, confirmedAmount: 0m);
        var service = Service(db);

        var pending = await service.EnsurePendingForAcceptedContractAsync(fixture.Participation.Id, fixture.Founder.Id);
        await db.SaveChangesAsync();

        pending.Should().NotBeNull();
        pending!.Status.Should().Be(EquityPositionStatus.PendingFunding);
        pending.ContractId.Should().Be(fixture.Contract.Id);
        pending.ContractVersionId.Should().Be(fixture.ContractVersion.Id);
        pending.OfferLegId.Should().Be(fixture.EquityLeg.Id);
        pending.InitialHoldingSnapshot.Should().BeNull();
        (await db.EquityPositions.CountAsync()).Should().Be(1);
        (await db.EquityHoldingLedgerEntries.CountAsync()).Should().Be(0);

        db.FundingDeclarations.Add(ConfirmedFunding(fixture, fixture.Participation.FundingAmount!.Value));
        await db.SaveChangesAsync();

        var activated = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var repeated = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        activated!.Id.Should().Be(pending.Id);
        activated.Status.Should().Be(EquityPositionStatus.Active);
        repeated!.Id.Should().Be(pending.Id);
        (await db.EquityPositions.CountAsync()).Should().Be(1);
        (await db.EquityHoldingSnapshots.CountAsync()).Should().Be(1);
        (await db.EquityHoldingLedgerEntries.CountAsync()).Should().Be(1);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Share_based_activation_persists_typed_snapshot_and_historical_ownership()
    {
        await using var db = CreateDb();
        var fixture = SeedEquity(db, EquityOwnershipModel.ShareBased, confirmedAmount: 1_000m);
        var service = Service(db);

        var position = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        position.Should().NotBeNull();
        position!.InvestorShareCount.Should().Be(250m);
        position.TotalIssuedShares.Should().Be(1_000m);
        position.InitialHoldingSnapshot!.DerivedOwnershipPercentage.Should().Be(25m);
        position.LedgerEntries.Should().ContainSingle();

        var asOf = await service.GetOwnershipAtDateAsync(fixture.Investor.Id, position.Id, fixture.EffectiveDate.AddDays(1));
        asOf.OwnershipModel.Should().Be(EquityOwnershipModel.ShareBased);
        asOf.InvestorShares.Should().Be(250m);
        asOf.TotalIssuedShares.Should().Be(1_000m);
        asOf.OwnershipPercentage.Should().Be(25m);
    }

    [Fact]
    public async Task Mixed_leg_participation_is_not_activated_without_per_leg_funding_attribution()
    {
        await using var db = CreateDb();
        var fixture = SeedEquity(db, EquityOwnershipModel.PercentageBased, confirmedAmount: 1_000m, mixedLeg: true);

        var result = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);

        result.Should().BeNull();
        (await db.EquityPositions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Opportunity_edits_do_not_change_contractual_equity_position()
    {
        await using var db = CreateDb();
        var fixture = SeedEquity(db, EquityOwnershipModel.PercentageBased, confirmedAmount: 1_000m);
        var service = Service(db);

        var position = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        fixture.Opportunity.FundingTarget = 999_999m;
        fixture.Opportunity.Title = "Edited after acceptance";
        await db.SaveChangesAsync();

        var persisted = await db.EquityPositions.Include(x => x.InitialHoldingSnapshot).SingleAsync(x => x.Id == position!.Id);
        persisted.ContractualOwnershipPercentage.Should().Be(12.5m);
        persisted.InvestmentAmount.Should().Be(1_000m);
        persisted.InitialHoldingSnapshot!.ContractualOwnershipPercentage.Should().Be(12.5m);
    }

    [Fact]
    public async Task Applied_share_issuance_updates_dilution_once_and_is_idempotent()
    {
        await using var db = CreateDb();
        var fixture = SeedEquity(db, EquityOwnershipModel.ShareBased, confirmedAmount: 1_000m);
        var service = Service(db);
        var position = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        var draft = await service.CreateCorporateEventAsync(fixture.Founder.Id, new CreateEquityCorporateEventRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            EventType = EquityCorporateEventType.ShareIssuance,
            EffectiveDate = fixture.EffectiveDate.AddDays(10),
            SharesIssued = 250m,
            Reason = "Controlled pilot issuance"
        }, isAdmin: false);
        draft.Status.Should().Be(EquityCorporateEventStatus.Draft);

        var pending = await service.SubmitCorporateEventAsync(fixture.Founder.Id, draft.Id, isAdmin: false);
        pending.Status.Should().Be(EquityCorporateEventStatus.PendingApproval);
        var approved = await service.ApproveCorporateEventAsync(Guid.NewGuid(), draft.Id, isAdmin: true, approve: true, reason: null);
        approved.Status.Should().Be(EquityCorporateEventStatus.PendingApproval);

        var applied = await service.ApplyCorporateEventAsync(Guid.NewGuid(), draft.Id, isAdmin: true);
        var repeated = await service.ApplyCorporateEventAsync(Guid.NewGuid(), draft.Id, isAdmin: true);
        applied.Status.Should().Be(EquityCorporateEventStatus.Applied);
        repeated.Status.Should().Be(EquityCorporateEventStatus.Applied);
        repeated.AfterTotalIssuedShares.Should().Be(1_250m);
        repeated.Positions.Single().NewInvestorShares.Should().Be(250m);
        repeated.Positions.Single().NewOwnershipPercentage.Should().Be(20m);
        repeated.Positions.Single().DilutionPercentagePoints.Should().Be(5m);
        (await db.EquityCorporateEvents.CountAsync()).Should().Be(1);
        (await db.EquityCapitalizationSnapshots.CountAsync()).Should().Be(2);
        (await db.EquityHoldingLedgerEntries.CountAsync()).Should().Be(2);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Percentage_based_corporate_dilution_is_rejected_without_share_capital()
    {
        await using var db = CreateDb();
        var fixture = SeedEquity(db, EquityOwnershipModel.PercentageBased, confirmedAmount: 1_000m);
        var service = Service(db);
        await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        var act = () => service.CreateCorporateEventAsync(fixture.Founder.Id, new CreateEquityCorporateEventRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            EventType = EquityCorporateEventType.ShareIssuance,
            EffectiveDate = fixture.EffectiveDate.AddDays(1),
            SharesIssued = 100m,
            Reason = "Unsupported percentage-only dilution"
        }, isAdmin: false);

        await act.Should().ThrowAsync<BusinessValidationException>().WithMessage("*PercentageBased*");
    }

    private static EquityPositionService Service(ApplicationDbContext db) =>
        new(new UnitOfWork(db), null, NullLogger<EquityPositionService>.Instance);

    private static EquityFixture SeedEquity(ApplicationDbContext db, EquityOwnershipModel model, decimal confirmedAmount, bool mixedLeg = false)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Project", Slug = $"project-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity { FounderId = founder.Id, Project = project, Title = "Opportunity", ShortDescription = "Description", UseOfFunds = "Growth", FundingTarget = 1_000m, FundingCurrency = "EGP", InvestmentModel = mixedLeg ? InvestmentModel.Unspecified : InvestmentModel.Equity, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 1_000m, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow.AddDays(-2) };
        var offer = new NegotiationOffer { Opportunity = opportunity, CreatedByUserId = founder.Id, Version = 2, Status = NegotiationOfferStatus.Accepted, Currency = "EGP" };
        var equityLeg = new NegotiationOfferLeg
        {
            Offer = offer,
            LegType = NegotiationOfferLegType.Equity,
            Amount = 1_000m,
            EquityOwnershipModel = model,
            EquityPercentage = model == EquityOwnershipModel.PercentageBased ? 12.5m : null,
            InvestorShareCount = model == EquityOwnershipModel.ShareBased ? 250m : null,
            TotalIssuedShares = model == EquityOwnershipModel.ShareBased ? 1_000m : null,
            ShareClass = "Ordinary",
            PricePerShare = model == EquityOwnershipModel.ShareBased ? 4m : null,
            PreMoneyValuation = 8_000m,
            PostMoneyValuation = 9_000m,
            EffectiveOwnershipDate = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc)
        };
        offer.Legs.Add(equityLeg);
        if (mixedLeg) offer.Legs.Add(new NegotiationOfferLeg { Offer = offer, LegType = NegotiationOfferLegType.Loan, Amount = 500m, ReturnRate = 10m, TermMonths = 12, RepaymentModel = "Monthly" });

        db.AuthUsers.AddRange(founder, investor);
        db.Opportunities.Add(opportunity);
        db.OpportunityJoinRequests.Add(participation);
        db.NegotiationOffers.Add(offer);
        db.SaveChanges();

        participation.AcceptedOfferId = offer.Id;
        var effectiveDate = equityLeg.EffectiveOwnershipDate!.Value;
        var contract = new InvestmentContract
        {
            ContractNumber = $"CTR-{Guid.NewGuid():N}", OpportunityId = opportunity.Id, AcceptedOfferId = offer.Id, AcceptedOfferVersionNumber = offer.Version, ParticipationRequestId = participation.Id,
            FounderUserId = founder.Id, InvestorUserId = investor.Id, InvestmentModel = opportunity.InvestmentModel, OpportunityTitleSnapshot = opportunity.Title, FounderNameSnapshot = founder.Name!, InvestorNameSnapshot = investor.Name!,
            AcceptedCurrency = "EGP", AcceptedAmount = 1_000m, AcceptanceTimestamp = effectiveDate, CurrentVersionNumber = 1, Status = InvestmentContractStatus.Active
        };
        contract.Versions.Add(new InvestmentContractVersion
        {
            VersionNumber = 1, VersionType = InvestmentContractVersionType.InitialAgreement, SourceParticipationRequestId = participation.Id, SourceNegotiationOfferId = offer.Id, Status = InvestmentContractVersionStatus.Active,
            TermsSnapshotJson = JsonSerializer.Serialize(new
            {
                acceptedOffer = new { id = offer.Id, versionNumber = offer.Version },
                sourceAgreedTerms = offer.Legs.OrderBy(x => x.Id).Select((leg, index) => new
                {
                    offerLegId = leg.Id, legNumber = index + 1, legType = leg.LegType.ToString(), amount = leg.Amount, currency = "EGP", equityOwnershipModel = leg.EquityOwnershipModel?.ToString(), equityPercentage = leg.EquityPercentage,
                    investorShareCount = leg.InvestorShareCount, totalIssuedShares = leg.TotalIssuedShares, shareClass = leg.ShareClass, pricePerShare = leg.PricePerShare, preMoneyValuation = leg.PreMoneyValuation, postMoneyValuation = leg.PostMoneyValuation,
                    effectiveOwnershipDate = leg.EffectiveOwnershipDate
                })
            }),
            DocumentHash = "test-hash", DocumentContent = "test-document"
        });
        db.InvestmentContracts.Add(contract);
        db.SaveChanges();

        if (confirmedAmount > 0m)
        {
            db.FundingDeclarations.Add(ConfirmedFunding(new EquityFixture(founder, investor, opportunity, participation, offer, equityLeg, contract, contract.Versions.Single(), effectiveDate), confirmedAmount));
            db.SaveChanges();
        }

        return new EquityFixture(founder, investor, opportunity, participation, offer, equityLeg, contract, contract.Versions.Single(), effectiveDate);
    }

    private static FundingDeclaration ConfirmedFunding(EquityFixture fixture, decimal amount) => new()
    {
        ParticipationId = fixture.Participation.Id, OpportunityId = fixture.Opportunity.Id, FounderId = fixture.Founder.Id, InvestorId = fixture.Investor.Id, Amount = amount, CurrencyCode = "EGP", ReceivedDate = fixture.EffectiveDate,
        PaymentMethod = FundingPaymentMethod.BankTransfer, Status = FundingDeclarationStatus.Confirmed, ConfirmedAt = fixture.EffectiveDate.AddDays(1), ConfirmedByInvestorId = fixture.Investor.Id, CreatedBy = fixture.Founder.Id
    };

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }

    private sealed record EquityFixture(AuthUser Founder, AuthUser Investor, Opportunity Opportunity, OpportunityJoinRequest Participation, NegotiationOffer Offer, NegotiationOfferLeg EquityLeg, InvestmentContract Contract, InvestmentContractVersion ContractVersion, DateTime EffectiveDate);
}
