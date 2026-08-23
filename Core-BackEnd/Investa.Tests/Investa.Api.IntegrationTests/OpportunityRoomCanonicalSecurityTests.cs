using FluentAssertions;
using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class OpportunityRoomCanonicalSecurityTests
{
    [Fact]
    public async Task Founder_receives_the_opportunity_room_payload_without_project_room_redirect()
    {
        await using var fixture = await Fixture.Create();

        var room = await fixture.Service.GetOpportunityRoomAsync(fixture.Founder.Id, fixture.OpportunityA.Id);

        room.ProjectId.Should().Be(fixture.Project.Id);
        room.ProjectDisplayName.Should().Be(fixture.Project.DisplayName);
        room.Overview.Id.Should().Be(fixture.OpportunityA.Id);
        room.Overview.Title.Should().Be(fixture.OpportunityA.Title);
        room.ParticipantContext.IsFounder.Should().BeTrue();
        room.ParticipantContext.IsApprovedParticipant.Should().BeFalse();
    }

    [Fact]
    public async Task Approved_investor_can_open_only_their_authorized_opportunity_room()
    {
        await using var fixture = await Fixture.Create();

        var ownRoom = await fixture.Service.GetOpportunityRoomAsync(fixture.InvestorA.Id, fixture.OpportunityA.Id);
        ownRoom.Overview.Id.Should().Be(fixture.OpportunityA.Id);
        ownRoom.ParticipantContext.IsApprovedParticipant.Should().BeTrue();

        await FluentActions.Invoking(() => fixture.Service.GetOpportunityRoomAsync(fixture.InvestorA.Id, fixture.OpportunityB.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "OPPORTUNITY_ROOM_FORBIDDEN");
    }

    [Fact]
    public async Task Admin_can_open_a_specific_opportunity_room_without_exposing_sibling_opportunities()
    {
        await using var fixture = await Fixture.Create();

        var room = await fixture.Service.GetOpportunityRoomAsync(Guid.NewGuid(), fixture.OpportunityB.Id, isAdmin: true);

        room.Overview.Id.Should().Be(fixture.OpportunityB.Id);
        room.Overview.Title.Should().Be(fixture.OpportunityB.Title);
        room.ParticipantContext.IsAdmin.Should().BeTrue();
        room.ParticipantContext.CanViewPrivateFiles.Should().BeTrue();
    }

    [Fact]
    public async Task Room_renders_immutable_mixed_leg_participation_and_one_covering_contract()
    {
        await using var fixture = await Fixture.Create();
        await fixture.AddMixedParticipationAsync();

        var room = await fixture.Service.GetOpportunityRoomAsync(fixture.InvestorA.Id, fixture.OpportunityA.Id);
        var participation = room.Participations.Should().ContainSingle().Subject;

        participation.TermsImmutable.Should().BeTrue();
        participation.TermsSnapshotHash.Should().NotBeNullOrWhiteSpace();
        participation.Contract.Should().NotBeNull();
        participation.Legs.Should().HaveCount(2);
        participation.Legs.Select(leg => leg.LegType).Should().Contain(["Equity", "Loan"]);
        participation.Legs.Single(leg => leg.LegType == "Equity").CashFlows.Should().BeEmpty();
        participation.Legs.Single(leg => leg.LegType == "Loan").CashFlows.Should().HaveCount(12);
        participation.Legs.Should().OnlyContain(leg => leg.Obligations.Count > 0);

        var storedOffer = await fixture.Db.NegotiationOffers.Include(offer => offer.Legs).SingleAsync();
        storedOffer.Legs.Single(leg => leg.LegType == NegotiationOfferLegType.Equity).Amount = 999m;
        await fixture.Db.SaveChangesAsync();
        var refreshed = await fixture.Service.GetOpportunityRoomAsync(fixture.InvestorA.Id, fixture.OpportunityA.Id);
        refreshed.Participations.Single().Legs.Single(leg => leg.LegType == "Equity").Amount.Should().Be(250m);
    }

    private sealed class Fixture : IAsyncDisposable
    {
        public ApplicationDbContext Db { get; }
        public OpportunityService Service { get; }
        public AuthUser Founder { get; } = User(ClientType.Founder);
        public AuthUser InvestorA { get; } = User(ClientType.Investor);
        public AuthUser InvestorB { get; } = User(ClientType.Investor);
        public Project Project { get; private set; } = null!;
        public Opportunity OpportunityA { get; private set; } = null!;
        public Opportunity OpportunityB { get; private set; } = null!;

        private Fixture()
        {
            Db = new(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);
            Service = new OpportunityService(new UnitOfWork(Db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);
        }

        public static async Task<Fixture> Create()
        {
            var fixture = new Fixture();
            fixture.Db.AuthUsers.AddRange(fixture.Founder, fixture.InvestorA, fixture.InvestorB);
            fixture.Project = new()
            {
                FounderId = fixture.Founder.Id,
                DisplayName = "Canonical Project",
                Slug = "canonical-project",
                Summary = "A project with multiple opportunities.",
                Description = "The parent Project is context only for the Opportunity Room."
            };
            fixture.OpportunityA = Opportunity(fixture.Project, fixture.Founder.Id, 1, "Opportunity A");
            fixture.OpportunityB = Opportunity(fixture.Project, fixture.Founder.Id, 2, "Opportunity B");
            fixture.Db.AddRange(fixture.Project, fixture.OpportunityA, fixture.OpportunityB);
            await fixture.Db.SaveChangesAsync();
            fixture.Db.OpportunityJoinRequests.AddRange(
                ApprovedParticipation(fixture.OpportunityA, fixture.InvestorA),
                ApprovedParticipation(fixture.OpportunityB, fixture.InvestorB));
            await fixture.Db.SaveChangesAsync();
            return fixture;
        }

        public async Task AddMixedParticipationAsync()
        {
            var request = await Db.OpportunityJoinRequests.SingleAsync(r => r.OpportunityId == OpportunityA.Id && r.InvestorId == InvestorA.Id);
            var offer = new Investa.Domain.Entities.Chat.NegotiationOffer
            {
                OpportunityId = OpportunityA.Id,
                CreatedByUserId = InvestorA.Id,
                Currency = "EGP",
                Version = 1,
                Status = NegotiationOfferStatus.Accepted,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            };
            offer.Legs.Add(new Investa.Domain.Entities.Chat.NegotiationOfferLeg
            {
                LegType = NegotiationOfferLegType.Equity,
                Amount = 250m,
                EquityPercentage = 4m,
                SharesTerms = "4% ownership"
            });
            offer.Legs.Add(new Investa.Domain.Entities.Chat.NegotiationOfferLeg
            {
                LegType = NegotiationOfferLegType.Loan,
                Amount = 750m,
                ReturnRate = 12m,
                TermMonths = 12,
                RepaymentModel = "Monthly"
            });
            Db.NegotiationOffers.Add(offer);
            await Db.SaveChangesAsync();

            request.AcceptedOfferId = offer.Id;
            request.ReviewedAt = DateTime.UtcNow.AddDays(-2);
            request.TermsSnapshotJson = JsonSerializer.Serialize(new object[]
            {
                new { LegType = NegotiationOfferLegType.Equity, Amount = 250m, EquityPercentage = 4m, SharesTerms = "4% ownership" },
                new { LegType = NegotiationOfferLegType.Loan, Amount = 750m, ReturnRate = 12m, TermMonths = 12, RepaymentModel = "Monthly" }
            });

            var contract = new InvestmentContract
            {
                ContractNumber = "ROOM-MIXED-001",
                OpportunityId = OpportunityA.Id,
                FounderUserId = Founder.Id,
                InvestorUserId = InvestorA.Id,
                CurrentVersionNumber = 1,
                Status = InvestmentContractStatus.Active,
                Versions = new List<InvestmentContractVersion>
                {
                    new()
                    {
                        VersionNumber = 1,
                        SourceParticipationRequestId = request.Id,
                        TermsSnapshotJson = request.TermsSnapshotJson,
                        DocumentHash = "mixed-leg-contract-hash",
                        DocumentContent = "<html>mixed</html>",
                        Status = InvestmentContractVersionStatus.Active,
                        ActivatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                }
            };
            Db.InvestmentContracts.Add(contract);
            await Db.SaveChangesAsync();
        }

        public ValueTask DisposeAsync() => Db.DisposeAsync();
    }

    private static AuthUser User(ClientType clientType) => new()
    {
        Id = Guid.NewGuid(),
        Email = $"{Guid.NewGuid():N}@test.local",
        UserType = UserType.Client,
        ClientType = clientType,
        Status = true
    };

    private static Opportunity Opportunity(Project project, Guid founderId, int sequence, string title) => new()
    {
        Project = project,
        FounderId = founderId,
        SequenceNumber = sequence,
        Purpose = "Purpose",
        Type = "Opportunity",
        Title = title,
        ShortDescription = "Short opportunity description",
        UseOfFunds = "Opportunity-specific use of funds",
        FundingTarget = 1000m,
        FundingCurrency = "EGP",
        Currency = "EGP",
        InvestmentModel = InvestmentModel.LoanInvestment,
        ProjectStage = ProjectStage.MVP,
        Status = OpportunityStatus.Completed,
        ModerationStatus = OpportunityModerationStatus.Approved,
        FundingStatus = OpportunityFundingStatus.Closed
    };

    private static OpportunityJoinRequest ApprovedParticipation(Opportunity opportunity, AuthUser investor) => new()
    {
        Opportunity = opportunity,
        InvestorId = investor.Id,
        RequestType = OpportunityJoinRequestType.InvestmentParticipation,
        Status = OpportunityJoinRequestStatus.Approved,
        ParticipationSequence = 1,
        RequestedAmount = 100m,
        FundingAmount = 100m,
        FundingCurrency = "EGP"
    };
}
