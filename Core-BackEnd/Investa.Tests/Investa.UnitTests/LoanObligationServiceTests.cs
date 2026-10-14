using System.Text.Json;
using FluentAssertions;
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

public sealed class LoanObligationServiceTests
{
    [Theory]
    [InlineData("Monthly", 12)]
    [InlineData("Quarterly", 4)]
    [InlineData("SemiAnnual", 2)]
    [InlineData("Annual", 1)]
    public async Task Fully_confirmed_funding_persists_the_contractual_schedule(string repaymentModel, int expectedInstallments)
    {
        await using var db = CreateDb();
        var fixture = SeedLoan(db, repaymentModel);

        var obligation = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        obligation.Should().NotBeNull();
        obligation!.ContractId.Should().Be(fixture.Contract.Id);
        obligation.ContractVersionId.Should().Be(fixture.ContractVersion.Id);
        obligation.AcceptedOfferId.Should().Be(fixture.Offer.Id);
        obligation.AcceptedOfferVersionNumber.Should().Be(fixture.Offer.Version);
        obligation.OfferLegId.Should().Be(fixture.LoanLeg.Id);
        obligation.Principal.Should().Be(1_000m);
        obligation.InterestRate.Should().Be(12m);
        obligation.TermMonths.Should().Be(12);
        obligation.RepaymentModel.Should().Be(repaymentModel);
        obligation.ContractualMaturityDate.Should().Be(fixture.StartDate.AddMonths(12));
        obligation.Installments.Should().HaveCount(expectedInstallments);
        obligation.Installments.OrderBy(x => x.InstallmentNumber).Last().PrincipalDue.Should().Be(1_000m);
        obligation.Installments.Sum(x => x.InterestDue).Should().Be(120m);
        obligation.Installments.Select(x => x.Currency).Distinct().Should().ContainSingle("EGP");
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Activation_is_idempotent_and_schedule_terms_are_immutable()
    {
        await using var db = CreateDb();
        var fixture = SeedLoan(db, "Quarterly");
        var service = Service(db);

        var first = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        var second = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        second!.Id.Should().Be(first!.Id);
        (await db.LoanObligations.CountAsync()).Should().Be(1);
        (await db.LoanRepaymentInstallments.CountAsync()).Should().Be(4);

        fixture.Opportunity.FundingTarget = 999_999m;
        fixture.Opportunity.ExpectedDurationMonths = 1;
        await db.SaveChangesAsync();

        var persisted = await db.LoanObligations.Include(x => x.Installments).SingleAsync();
        persisted.Principal.Should().Be(1_000m);
        persisted.TermMonths.Should().Be(12);
        persisted.ContractualMaturityDate.Should().Be(fixture.StartDate.AddMonths(12));
        persisted.Installments.Sum(x => x.TotalDue).Should().Be(1_120m);
    }

    [Fact]
    public async Task Partial_confirmation_creates_pending_obligation_without_schedule_then_activates_once_at_full_funding()
    {
        await using var db = CreateDb();
        var fixture = SeedLoan(db, "Monthly", confirmedAmount: 999m);
        var service = Service(db);

        var pending = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);

        pending.Should().NotBeNull();
        pending!.Status.Should().Be(LoanObligationStatus.PendingFunding);
        pending.Installments.Should().BeEmpty();
        await db.SaveChangesAsync();
        (await db.LoanObligations.CountAsync()).Should().Be(1);
        (await db.LoanRepaymentInstallments.CountAsync()).Should().Be(0);

        db.FundingDeclarations.Single().Amount = 1_000m;
        var activated = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();

        activated!.Id.Should().Be(pending.Id);
        activated.Status.Should().Be(LoanObligationStatus.Active);
        activated.Installments.Should().HaveCount(12);
        (await db.LoanObligations.CountAsync()).Should().Be(1);
        (await db.LoanRepaymentInstallments.CountAsync()).Should().Be(12);

        var repeated = await service.EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);
        await db.SaveChangesAsync();
        repeated!.Id.Should().Be(pending.Id);
        (await db.LoanRepaymentInstallments.CountAsync()).Should().Be(12);
    }

    [Fact]
    public async Task Mixed_leg_participation_is_left_unactivated_until_per_leg_funding_exists()
    {
        await using var db = CreateDb();
        var fixture = SeedLoan(db, "Monthly", mixedLeg: true);

        var result = await Service(db).EnsureActivatedForConfirmedFundingAsync(fixture.Participation.Id, fixture.Investor.Id);

        result.Should().BeNull();
        (await db.LoanObligations.CountAsync()).Should().Be(0);
    }

    private static LoanObligationService Service(ApplicationDbContext db) =>
        new(new UnitOfWork(db), NullLogger<LoanObligationService>.Instance);

    private static LoanFixture SeedLoan(ApplicationDbContext db, string repaymentModel, decimal confirmedAmount = 1_000m, bool mixedLeg = false)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Project", Slug = $"project-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity { FounderId = founder.Id, Project = project, Title = "Opportunity", ShortDescription = "Opportunity description", UseOfFunds = "Working capital", FundingTarget = 1_000m, FundingCurrency = "EGP", InvestmentModel = mixedLeg ? InvestmentModel.Unspecified : InvestmentModel.LoanInvestment, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 1_000m, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow.AddDays(-2) };
        var offer = new NegotiationOffer { Opportunity = opportunity, CreatedByUserId = founder.Id, Version = 3, Status = NegotiationOfferStatus.Accepted, Currency = "EGP" };
        var loanLeg = new NegotiationOfferLeg { Offer = offer, LegType = NegotiationOfferLegType.Loan, Amount = 1_000m, ReturnRate = 12m, TermMonths = 12, RepaymentModel = repaymentModel };
        offer.Legs.Add(loanLeg);
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
            InvestmentModel = opportunity.InvestmentModel,
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
                    returnRate = leg.ReturnRate,
                    termMonths = leg.TermMonths,
                    repaymentModel = leg.RepaymentModel,
                    contractualStartDate = startDate,
                    contractualMaturityDate = startDate.AddMonths(leg.TermMonths ?? 0)
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

        return new LoanFixture(founder, investor, opportunity, participation, offer, loanLeg, contract, contract.Versions.Single(), startDate);
    }

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }

    private sealed record LoanFixture(AuthUser Founder, AuthUser Investor, Opportunity Opportunity, OpportunityJoinRequest Participation, NegotiationOffer Offer, NegotiationOfferLeg LoanLeg, InvestmentContract Contract, InvestmentContractVersion ContractVersion, DateTime StartDate);
}
