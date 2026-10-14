using System.Text.Json;
using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class ContractIntegritySprint4Tests
{
    [Fact]
    public async Task Unsupported_repayment_model_is_rejected_before_offer_persistence()
    {
        await using var db = Db();
        var founder = User("Founder");
        var investor = User("Investor");
        var opportunity = AddOpportunity(db, founder, "Repayment validation opportunity");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        var negotiation = NegotiationService(db);
        await FluentActions.Invoking(() => negotiation.SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs = [new CreateNegotiationOfferLegRequest
            {
                LegType = NegotiationOfferLegType.Loan,
                Amount = 1000m,
                ReturnRate = 9m,
                TermMonths = 12,
                RepaymentModel = "Monthly principal and interest"
            }]
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "UNSUPPORTED_REPAYMENT_MODEL");

        (await db.NegotiationOffers.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Equity_offer_requires_an_explicit_ownership_model()
    {
        await using var db = Db();
        var founder = User("Founder");
        var investor = User("Investor");
        var opportunity = AddOpportunity(db, founder, "Equity ownership model opportunity");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        await FluentActions.Invoking(() => NegotiationService(db).SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs = [new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 1000m, EquityPercentage = 10m }]
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "EQUITY_OWNERSHIP_MODEL_REQUIRED");
    }

    [Fact]
    public async Task Equity_offer_rejects_invalid_percentage_and_share_terms()
    {
        await using var db = Db();
        var founder = User("Founder");
        var investor = User("Investor");
        var opportunity = AddOpportunity(db, founder, "Equity validation opportunity");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        await FluentActions.Invoking(() => NegotiationService(db).SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs = [new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 1000m, EquityOwnershipModel = EquityOwnershipModel.PercentageBased, EquityPercentage = 101m }]
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "INVALID_EQUITY_PERCENTAGE");

        await FluentActions.Invoking(() => NegotiationService(db).SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs = [new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 1000m, EquityOwnershipModel = EquityOwnershipModel.ShareBased, InvestorShareCount = 1000m, TotalIssuedShares = 999m }]
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "INVALID_EQUITY_SHARES");

        (await db.NegotiationOffers.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Acceptance_persists_exact_offer_version_and_immutable_mixed_leg_contract_snapshot()
    {
        await using var db = Db();
        var founder = User("Founder before edit");
        var investor = User("Investor before edit");
        var outsider = User("Outsider");
        var opportunity = AddOpportunity(db, founder, "Opportunity before edit");
        db.AuthUsers.AddRange(founder, investor, outsider);
        await db.SaveChangesAsync();

        var paid = new Mock<IPaidActionService>(MockBehavior.Strict);
        var contractService = ContractService(db);
        var negotiation = NegotiationService(db, paid, contractService);
        var offer = await negotiation.SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs =
            [
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Loan, Amount = 5000m, ReturnRate = 10m, TermMonths = 12, RepaymentModel = "Monthly" },
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 10000m, EquityOwnershipModel = EquityOwnershipModel.PercentageBased, EquityPercentage = 8m, SharesTerms = "800 ordinary shares" },
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.ProfitSharing, Amount = 2500m, ProfitSharePercentage = 12m, TermMonths = 18, ProfitSharingPayoutFrequency = "Quarterly", ExitTerms = "At maturity" }
            ]
        });

        await negotiation.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id);

        var participation = await db.OpportunityJoinRequests.SingleAsync(r => r.AcceptedOfferId == offer.Id);
        var contract = await db.InvestmentContracts.SingleAsync(c => c.ParticipationRequestId == participation.Id);
        var version = await db.InvestmentContractVersions.SingleAsync(v => v.ContractId == contract.Id);
        using var snapshot = JsonDocument.Parse(version.TermsSnapshotJson);

        contract.OpportunityId.Should().Be(opportunity.Id);
        contract.AcceptedOfferId.Should().Be(offer.Id);
        contract.AcceptedOfferVersionNumber.Should().Be(offer.Version);
        contract.ParticipationRequestId.Should().Be(participation.Id);
        contract.FounderUserId.Should().Be(founder.Id);
        contract.InvestorUserId.Should().Be(investor.Id);
        contract.AcceptedAmount.Should().Be(17500m);
        contract.AcceptedCurrency.Should().Be("EGP");
        contract.OpportunityTitleSnapshot.Should().Be("Opportunity before edit");
        contract.FounderNameSnapshot.Should().Be("Founder before edit");
        contract.InvestorNameSnapshot.Should().Be("Investor before edit");
        snapshot.RootElement.GetProperty("acceptedOffer").GetProperty("id").GetInt32().Should().Be(offer.Id);
        snapshot.RootElement.GetProperty("acceptedOffer").GetProperty("versionNumber").GetInt32().Should().Be(offer.Version);
        snapshot.RootElement.GetProperty("sourceAgreedTerms").GetArrayLength().Should().Be(3);
        snapshot.RootElement.GetProperty("sourceAgreedTerms").EnumerateArray().Select(x => x.GetProperty("investmentModel").GetString())
            .Should().BeEquivalentTo(["LoanInvestment", "Equity", "CapitalContributionProfitSharing"]);

        opportunity.Title = "Opportunity after edit";
        founder.Name = "Founder after edit";
        investor.Name = "Investor after edit";
        var storedOffer = await db.NegotiationOffers.Include(x => x.Legs).SingleAsync(x => x.Id == offer.Id);
        storedOffer.Legs.Single(x => x.LegType == NegotiationOfferLegType.Equity).Amount = 999999m;
        await db.SaveChangesAsync();

        var detail = await contractService.GetContractAsync(founder.Id, contract.Id);
        detail.Contract.FounderDisplayName.Should().Be("Founder before edit");
        detail.Contract.InvestorDisplayName.Should().Be("Investor before edit");
        detail.Contract.AcceptedOfferId.Should().Be(offer.Id);
        detail.Contract.AcceptedOfferVersionNumber.Should().Be(offer.Version);
        detail.CurrentVersion.TermsSnapshotJson.Should().Be(version.TermsSnapshotJson);

        var html = await contractService.GetDocumentAsync(investor.Id, contract.Id, 1);
        html.Content.Should().Contain("Opportunity before edit");
        html.Content.Should().Contain("Founder before edit");
        html.Content.Should().Contain("Investor before edit");
        html.Content.Should().NotContain("Opportunity after edit");
        html.Content.Should().NotContain("Founder after edit");
        html.Content.Should().NotContain("Investor after edit");

        await FluentActions.Invoking(() => contractService.GetContractAsync(outsider.Id, contract.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "CONTRACT_ACCESS_DENIED");
        (await contractService.GetContractAsync(founder.Id, contract.Id)).Contract.ContractId.Should().Be(contract.Id);
        (await contractService.GetContractAsync(investor.Id, contract.Id)).Contract.ContractId.Should().Be(contract.Id);

        await FluentActions.Invoking(() => negotiation.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OFFER_NOT_ACTIVE");
        (await db.InvestmentContracts.CountAsync(c => c.ParticipationRequestId == participation.Id)).Should().Be(1);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
        (await db.WalletTransactions.CountAsync()).Should().Be(0);
        (await db.CreditTransactions.CountAsync()).Should().Be(0);
        paid.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Contract_legal_snapshot_fields_cannot_be_updated_after_creation()
    {
        await using var db = Db();
        var founder = User("Founder");
        var investor = User("Investor");
        var opportunity = AddOpportunity(db, founder, "Immutable opportunity");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        var contractService = ContractService(db);
        var negotiation = NegotiationService(db, contract: contractService);
        var offer = await negotiation.SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs = [new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Loan, Amount = 1000m, ReturnRate = 9m, TermMonths = 12, RepaymentModel = "Monthly" }]
        });
        await negotiation.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id);

        var contract = await db.InvestmentContracts.SingleAsync();
        contract.OpportunityTitleSnapshot = "Silently changed";

        await FluentActions.Invoking(() => db.SaveChangesAsync())
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*immutable*");
    }

    private static InvestmentContractService ContractService(ApplicationDbContext db) => new(
        new UnitOfWork(db), null!, null!, NullLogger<InvestmentContractService>.Instance);

    private static NegotiationService NegotiationService(ApplicationDbContext db, Mock<IPaidActionService>? paid = null, IInvestmentContractService? contract = null) => new(
        new UnitOfWork(db),
        paid?.Object ?? Mock.Of<IPaidActionService>(),
        Mock.Of<IReputationService>(),
        Mock.Of<IUserNotificationService>(),
        Mock.Of<IRealtimeEventPublisher>(),
        Mock.Of<IConversationPresenceService>(),
        contract ?? Mock.Of<IInvestmentContractService>(),
        NullLogger<NegotiationService>.Instance);

    private static AuthUser User(string name) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Email = $"{Guid.NewGuid():N}@test.local",
        UserType = UserType.Client,
        ClientType = ClientType.Both,
        Status = true
    };

    private static Opportunity AddOpportunity(ApplicationDbContext db, AuthUser founder, string title)
    {
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = $"{title} project",
            Slug = $"contract-{Guid.NewGuid():N}",
            Summary = title,
            Description = title
        };
        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 1,
            Type = "Test",
            Title = title,
            ShortDescription = title,
            UseOfFunds = "Working capital",
            FundingTarget = 50000m,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published,
            FundingStatus = OpportunityFundingStatus.Open
        };
        db.Add(opportunity);
        return opportunity;
    }

    private static ApplicationDbContext Db() => new(new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options);
}
