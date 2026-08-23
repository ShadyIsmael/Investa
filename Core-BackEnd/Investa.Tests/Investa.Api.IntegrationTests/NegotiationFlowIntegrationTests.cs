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

public sealed class NegotiationFlowIntegrationTests
{
    [Fact]
    public async Task Direct_offer_supports_mixed_legs_and_authorization_flags()
    {
        await using var db = Db();
        var founder = User(); var investor = User(); var outsider = User();
        var opportunity = AddOpportunity(db, founder, "Direct mixed offer");
        db.AuthUsers.AddRange(founder, investor, outsider);
        await db.SaveChangesAsync();

        var service = Service(db);
        var eligibleInvestorState = await service.GetOpportunityViewerStateAsync(investor.Id, opportunity.Id);
        eligibleInvestorState.IsFounder.Should().BeFalse();
        eligibleInvestorState.CanRequestChat.Should().BeTrue();
        eligibleInvestorState.CanSubmitDirectOffer.Should().BeTrue();

        var founderState = await service.GetOpportunityViewerStateAsync(founder.Id, opportunity.Id);
        founderState.CanRequestChat.Should().BeFalse();
        founderState.CanSubmitDirectOffer.Should().BeFalse();

        var request = new CreateNegotiationOfferRequest
        {
            Currency = "USD",
            Legs = new[]
            {
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 10000, EquityPercentage = 8 },
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Loan, Amount = 5000, ReturnRate = 9, TermMonths = 24, RepaymentModel = "Monthly" },
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.ProfitSharing, Amount = 2500, ProfitSharePercentage = 12, TermMonths = 18, ExitTerms = "At maturity" }
            }
        };

        var offer = await service.SubmitDirectOfferAsync(investor.Id, opportunity.Id, request);
        offer.OpportunityId.Should().Be(opportunity.Id);
        offer.ConversationId.Should().BeNull();
        offer.Legs.Should().HaveCount(3);
        offer.CanAccept.Should().BeFalse();
        offer.CanRespond.Should().BeFalse();

        var state = await service.GetOpportunityViewerStateAsync(investor.Id, opportunity.Id);
        state.CanSubmitDirectOffer.Should().BeFalse();
        state.DirectOfferStatus.Should().Be(NegotiationOfferStatus.Pending);
        state.DirectOfferId.Should().Be(offer.Id);

        await FluentActions.Invoking(() => service.GetDirectOffersAsync(outsider.Id, opportunity.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OFFER_FORBIDDEN");
    }

    [Fact]
    public async Task Founder_can_read_viewer_state_for_a_draft_opportunity()
    {
        await using var db = Db();
        var founder = User();
        var outsider = User();
        var opportunity = AddOpportunity(db, founder, "Draft viewer state");
        opportunity.Status = OpportunityStatus.Draft;
        opportunity.FundingStatus = OpportunityFundingStatus.NotScheduled;
        db.AuthUsers.AddRange(founder, outsider);
        await db.SaveChangesAsync();

        var service = Service(db);
        var state = await service.GetOpportunityViewerStateAsync(founder.Id, opportunity.Id);

        state.OpportunityId.Should().Be(opportunity.Id);
        state.IsFounder.Should().BeTrue();
        state.CanSubmitDirectOffer.Should().BeFalse();
        state.CanRequestChat.Should().BeFalse();

        await FluentActions.Invoking(() => service.GetOpportunityViewerStateAsync(outsider.Id, opportunity.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OPPORTUNITY_NOT_FOUND");
    }

    [Fact]
    public async Task Direct_offer_reject_is_terminal_and_founder_only_actions_are_authorized()
    {
        await using var db = Db();
        var founder = User(); var investor = User();
        var opportunity = AddOpportunity(db, founder, "Direct terminal offer");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        var service = Service(db);
        var offer = await service.SubmitDirectOfferAsync(investor.Id, opportunity.Id, EquityRequest());

        await FluentActions.Invoking(() => service.RejectDirectOfferAsync(investor.Id, opportunity.Id, offer.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OFFER_FORBIDDEN");

        var rejected = await service.RejectDirectOfferAsync(founder.Id, opportunity.Id, offer.Id);
        rejected.Status.Should().Be(NegotiationOfferStatus.Rejected);

        await FluentActions.Invoking(() => service.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OFFER_NOT_ACTIVE");
    }

    [Fact]
    public async Task Direct_offer_acceptance_persists_participation_and_contract_from_leg_array_snapshot()
    {
        await using var db = Db();
        var founder = User();
        var investor = User();
        var opportunity = AddOpportunity(db, founder, "Direct acceptance contract snapshot");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        var contractService = new InvestmentContractService(
            new UnitOfWork(db),
            null!,
            null!,
            NullLogger<InvestmentContractService>.Instance);
        var service = new NegotiationService(
            new UnitOfWork(db),
            Mock.Of<IPaidActionService>(),
            Mock.Of<IReputationService>(),
            Mock.Of<IUserNotificationService>(),
            Mock.Of<IRealtimeEventPublisher>(),
            Mock.Of<IConversationPresenceService>(),
            contractService,
            NullLogger<NegotiationService>.Instance);

        var offer = await service.SubmitDirectOfferAsync(investor.Id, opportunity.Id, EquityRequest());

        var accepted = await service.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id);

        accepted.Status.Should().Be(NegotiationOfferStatus.Accepted);
        var participation = await db.OpportunityJoinRequests.SingleAsync(r => r.AcceptedOfferId == offer.Id);
        participation.Status.Should().Be(OpportunityJoinRequestStatus.Approved);
        participation.TermsSnapshotJson.Should().StartWith("[");

        var contract = await db.InvestmentContracts.SingleAsync(c => c.OpportunityId == opportunity.Id);
        contract.InvestorUserId.Should().Be(investor.Id);
        var versions = await db.InvestmentContractVersions.Where(v => v.SourceParticipationRequestId == participation.Id).ToListAsync();
        versions.Should().ContainSingle();
        versions[0].SourceNegotiationOfferId.Should().Be(offer.Id);
        versions[0].TermsSnapshotJson.Should().Contain("sourceAgreedTerms");

        var retry = () => service.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id);
        await FluentActions.Invoking(retry)
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OFFER_NOT_ACTIVE");

        (await db.OpportunityJoinRequests.CountAsync(r => r.AcceptedOfferId == offer.Id)).Should().Be(1);
        (await db.InvestmentContracts.CountAsync(c => c.OpportunityId == opportunity.Id)).Should().Be(1);
    }

    [Fact]
    public async Task Direct_mixed_offer_acceptance_preserves_all_leg_terms_in_contract_snapshot()
    {
        await using var db = Db();
        var founder = User();
        var investor = User();
        var opportunity = AddOpportunity(db, founder, "Direct mixed acceptance");
        db.AuthUsers.AddRange(founder, investor);
        await db.SaveChangesAsync();

        var contractService = new InvestmentContractService(
            new UnitOfWork(db), null!, null!, NullLogger<InvestmentContractService>.Instance);
        var service = new NegotiationService(
            new UnitOfWork(db), Mock.Of<IPaidActionService>(), Mock.Of<IReputationService>(),
            Mock.Of<IUserNotificationService>(), Mock.Of<IRealtimeEventPublisher>(),
            Mock.Of<IConversationPresenceService>(), contractService, NullLogger<NegotiationService>.Instance);

        var offer = await service.SubmitDirectOfferAsync(investor.Id, opportunity.Id, new CreateNegotiationOfferRequest
        {
            Currency = "EGP",
            Legs = new[]
            {
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 10000, EquityPercentage = 8, SharesTerms = "800 shares" },
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Loan, Amount = 5000, ReturnRate = 9, TermMonths = 24, RepaymentModel = "Monthly" },
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.ProfitSharing, Amount = 2500, ProfitSharePercentage = 12, TermMonths = 18, ExitTerms = "At maturity" }
            }
        });

        await service.AcceptDirectOfferAsync(founder.Id, opportunity.Id, offer.Id);

        var participation = await db.OpportunityJoinRequests.SingleAsync(r => r.AcceptedOfferId == offer.Id);
        using var terms = JsonDocument.Parse(participation.TermsSnapshotJson!);
        terms.RootElement.GetArrayLength().Should().Be(3);
        (await db.InvestmentContractVersions.CountAsync(v => v.SourceNegotiationOfferId == offer.Id)).Should().Be(1);
    }

    [Fact]
    public async Task Conversation_replacement_is_a_complete_version_and_targets_exact_version()
    {
        await using var db = Db();
        var founder = User(); var investor = User();
        db.AuthUsers.AddRange(founder, investor);
        var opportunity = AddOpportunity(db, founder, "Conversation replacement");
        var conversation = new Conversation
        {
            Opportunity = opportunity,
            FounderId = founder.Id,
            InvestorId = investor.Id,
            Status = ConversationStatus.Negotiation,
            IsActive = true,
            IsVisibleToFounder = true,
            IsVisibleToInvestor = true
        };
        db.Add(conversation);
        await db.SaveChangesAsync();

        var paid = new Mock<IPaidActionService>();
        paid.Setup(p => p.ChargeAsync(It.IsAny<Guid>(), It.IsAny<PricingAction>(), It.IsAny<ReferenceType>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        var service = Service(db, paid: paid);
        var first = await service.SendOfferAsync(investor.Id, conversation.Id, EquityRequest());
        var replacement = await service.ReplaceOfferAsync(founder.Id, conversation.Id, first.Id, new CreateNegotiationOfferRequest
        {
            Currency = "USD",
            Legs = new[]
            {
                new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Loan, Amount = 15000, ReturnRate = 10, TermMonths = 12, RepaymentModel = "Bullet" }
            }
        });

        replacement.ReplacesOfferId.Should().Be(first.Id);
        replacement.Legs.Single().LegType.Should().Be(NegotiationOfferLegType.Loan);
        (await db.NegotiationOffers.SingleAsync(o => o.Id == first.Id)).Status.Should().Be(NegotiationOfferStatus.Replaced);

        await FluentActions.Invoking(() => service.ReplaceOfferAsync(founder.Id, conversation.Id, first.Id, EquityRequest()))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OFFER_NOT_ACTIVE");
    }

    [Fact]
    public async Task Offer_accept_creates_approved_participation_and_first_investor_locks_opportunity()
    {
        await using var db = Db();
        var founder = User(); var investor = User();
        db.AuthUsers.AddRange(founder, investor);
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Negotiation project",
            Slug = $"nego-{Guid.NewGuid():N}",
            Summary = "Negotiation flow test",
            Description = "Verifies offer accept flow creates participation and locks opportunity"
        };
        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 1,
            Purpose = "Test",
            Type = "Test",
            Title = "Negotiation opportunity",
            ShortDescription = "Test opportunity for negotiation flow",
            UseOfFunds = "Testing",
            FundingTarget = 50000,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published,
            FundingStatus = OpportunityFundingStatus.Open,
            FirstInvestorJoinedAt = null,
            IsLockedForEditing = false
        };
        var conversation = new Conversation
        {
            Opportunity = opportunity,
            FounderId = founder.Id,
            InvestorId = investor.Id,
            Status = ConversationStatus.Negotiation,
            IsActive = true,
            IsVisibleToFounder = true,
            IsVisibleToInvestor = true
        };
        db.AddRange(project, opportunity, conversation);
        await db.SaveChangesAsync();

        var offer = new NegotiationOffer
        {
            ConversationId = conversation.Id,
            CreatedByUserId = founder.Id,
            Status = NegotiationOfferStatus.Pending,
            Legs = new List<NegotiationOfferLeg>
            {
                new() { LegType = NegotiationOfferLegType.Equity, Amount = 10000, EquityPercentage = 10 }
            }
        };
        db.NegotiationOffers.Add(offer);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var mockContractService = new Mock<IInvestmentContractService>();
        var mockNotificationService = new Mock<IUserNotificationService>();
        var mockRealtimePublisher = new Mock<IRealtimeEventPublisher>();
        var mockConversationPresence = new Mock<IConversationPresenceService>();
        var service = new NegotiationService(
            uow,
            null!, null!, mockNotificationService.Object, mockRealtimePublisher.Object, mockConversationPresence.Object, mockContractService.Object,
            new NullLogger<NegotiationService>());

        var result = await service.AcceptOfferAsync(investor.Id, conversation.Id, offer.Id);

        result.ParticipationRequestId.Should().BeGreaterThan(0);
        result.Offer.Status.Should().Be(NegotiationOfferStatus.Accepted);

        var updatedOpportunity = await db.Opportunities.SingleAsync(o => o.Id == opportunity.Id);
        updatedOpportunity.FirstInvestorJoinedAt.Should().NotBeNull();
        updatedOpportunity.IsLockedForEditing.Should().BeTrue();

        var participation = await db.OpportunityJoinRequests.SingleAsync(r => r.Id == result.ParticipationRequestId);
        participation.Status.Should().Be(OpportunityJoinRequestStatus.Approved);
        participation.AcceptedOfferId.Should().Be(offer.Id);
        participation.SourceConversationId.Should().Be(conversation.Id);
    }

    [Fact]
    public async Task Accepting_offer_on_closed_opportunity_throws()
    {
        await using var db = Db();
        var founder = User(); var investor = User();
        db.AuthUsers.AddRange(founder, investor);
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Closed project",
            Slug = $"closed-{Guid.NewGuid():N}",
            Summary = "Closed opportunity test",
            Description = "Verifies offer accept is rejected on closed opportunity"
        };
        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 1,
            Purpose = "Test",
            Type = "Test",
            Title = "Closed opportunity",
            ShortDescription = "Already closed",
            UseOfFunds = "Testing",
            FundingTarget = 50000,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published,
            FundingStatus = OpportunityFundingStatus.Closed
        };
        var conversation = new Conversation
        {
            Opportunity = opportunity,
            FounderId = founder.Id,
            InvestorId = investor.Id,
            Status = ConversationStatus.Negotiation,
            IsActive = true,
            IsVisibleToFounder = true,
            IsVisibleToInvestor = true
        };
        db.AddRange(project, opportunity, conversation);
        await db.SaveChangesAsync();

        var offer = new NegotiationOffer
        {
            ConversationId = conversation.Id,
            CreatedByUserId = founder.Id,
            Status = NegotiationOfferStatus.Pending,
            Legs = new List<NegotiationOfferLeg>
            {
                new() { LegType = NegotiationOfferLegType.Equity, Amount = 10000, EquityPercentage = 10 }
            }
        };
        db.NegotiationOffers.Add(offer);
        await db.SaveChangesAsync();

        var uow = new UnitOfWork(db);
        var mockContractService = new Mock<IInvestmentContractService>();
        var mockNotificationService = new Mock<IUserNotificationService>();
        var mockRealtimePublisher = new Mock<IRealtimeEventPublisher>();
        var mockConversationPresence = new Mock<IConversationPresenceService>();
        var service = new NegotiationService(
            uow,
            null!, null!, mockNotificationService.Object, mockRealtimePublisher.Object, mockConversationPresence.Object, mockContractService.Object,
            new NullLogger<NegotiationService>());

        await FluentActions.Invoking(() =>
            service.AcceptOfferAsync(investor.Id, conversation.Id, offer.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "OPPORTUNITY_NOT_ELIGIBLE");
    }

    private static AuthUser User() => new() { Id = Guid.NewGuid(), Email = $"{Guid.NewGuid():N}@test.local", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
    private static ApplicationDbContext Db() => new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static Opportunity AddOpportunity(ApplicationDbContext db, AuthUser founder, string title)
    {
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = $"{title} project",
            Slug = $"offer-{Guid.NewGuid():N}",
            Summary = title,
            Description = title
        };
        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founder.Id,
            SequenceNumber = 1,
            Purpose = "Test",
            Type = "Test",
            Title = title,
            ShortDescription = title,
            UseOfFunds = "Testing",
            FundingTarget = 50000,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published,
            FundingStatus = OpportunityFundingStatus.Open
        };
        db.Add(opportunity);
        return opportunity;
    }

    private static CreateNegotiationOfferRequest EquityRequest() => new()
    {
        Currency = "USD",
        Legs = new[]
        {
            new CreateNegotiationOfferLegRequest { LegType = NegotiationOfferLegType.Equity, Amount = 10000, EquityPercentage = 10 }
        }
    };

    private static NegotiationService Service(
        ApplicationDbContext db,
        Mock<IPaidActionService>? paid = null,
        Mock<IInvestmentContractService>? contract = null) => new(
        new UnitOfWork(db),
        paid?.Object ?? Mock.Of<IPaidActionService>(),
        Mock.Of<IReputationService>(),
        Mock.Of<IUserNotificationService>(),
        Mock.Of<IRealtimeEventPublisher>(),
        Mock.Of<IConversationPresenceService>(),
        contract?.Object ?? Mock.Of<IInvestmentContractService>(),
        new NullLogger<NegotiationService>());
}
