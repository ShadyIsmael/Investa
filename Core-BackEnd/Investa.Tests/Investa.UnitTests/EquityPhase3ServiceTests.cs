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

public sealed class EquityPhase3ServiceTests
{
    [Fact]
    public async Task Create_dividend_declaration_requires_admin()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var act = () => service.CreateDividendDeclarationAsync(fixture.Investor.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(14),
            Currency = "EGP",
            DividendPerShare = 0.5m,
            Reason = "Q1 dividend"
        }, isAdmin: false);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_DIVIDEND_FORBIDDEN");
    }

    [Fact]
    public async Task Create_dividend_declaration_validates_record_date()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var act = () => service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = new DateTime(2026, 6, 1),
            RecordDate = new DateTime(2026, 5, 1),
            Currency = "EGP",
            DividendPerShare = 1m,
            Reason = "Invalid dates"
        }, isAdmin: true);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_DIVIDEND_RECORD_DATE_INVALID");
    }

    [Fact]
    public async Task Create_dividend_declaration_requires_amount()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var act = () => service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(14),
            Currency = "EGP",
            Reason = "No amount"
        }, isAdmin: true);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_DIVIDEND_AMOUNT_REQUIRED");
    }

    [Fact]
    public async Task Create_and_generate_dividend_entitlements()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var declaration = await service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(7),
            Currency = "EGP",
            DividendPerShare = 2m,
            Reason = "Dividend test"
        }, isAdmin: true);

        declaration.Status.Should().Be(EquityDividendStatus.Declared);
        declaration.Entitlements.Should().BeEmpty();

        var enriched = await service.GenerateEntitlementsAsync(fixture.Admin.Id, declaration.Id, isAdmin: true);

        enriched.Status.Should().Be(EquityDividendStatus.EntitlementsGenerated);
        enriched.Entitlements.Should().HaveCount(1);
        enriched.Entitlements[0].EquityPositionId.Should().Be(fixture.Position!.Id);
        enriched.Entitlements[0].EligibleShares.Should().Be(250m);
        enriched.Entitlements[0].EntitlementAmount.Should().Be(500m);
    }

    [Fact]
    public async Task Generate_entitlements_is_idempotent()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var declaration = await service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(7),
            Currency = "EGP",
            DividendPerShare = 1m,
            Reason = "Test"
        }, isAdmin: true);

        await service.GenerateEntitlementsAsync(fixture.Admin.Id, declaration.Id, isAdmin: true);

        var act = () => service.GenerateEntitlementsAsync(fixture.Admin.Id, declaration.Id, isAdmin: true);
        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_DIVIDEND_INVALID_STATE");
    }

    [Fact]
    public async Task Declare_and_confirm_distribution()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var declaration = await service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(7),
            Currency = "EGP",
            DividendPerShare = 2m,
            Reason = "Test"
        }, isAdmin: true);
        var enriched = await service.GenerateEntitlementsAsync(fixture.Admin.Id, declaration.Id, isAdmin: true);

        var entitlement = enriched.Entitlements.Single();
        var distribution = await service.DeclareDistributionAsync(fixture.Admin.Id, new DeclareExternalDistributionRequest
        {
            EntitlementId = entitlement.Id,
            Amount = 300m,
            Notes = "Partial payment"
        }, isAdmin: true);

        distribution.Status.Should().Be(EquityDividendDistributionStatus.PendingConfirmation);
        distribution.Amount.Should().Be(300m);

        var confirmed = await service.ConfirmDistributionAsync(fixture.Investor.Id, new ConfirmDistributionRequest
        {
            DistributionId = distribution.Id,
            IsConfirmed = true,
            Reason = "Received"
        });

        confirmed.Status.Should().Be(EquityDividendDistributionStatus.Confirmed);
        confirmed.IsConfirmed.Should().BeTrue();
    }

    [Fact]
    public async Task Investor_cannot_confirm_others_distribution()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var declaration = await service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(7),
            Currency = "EGP",
            DividendPerShare = 2m,
            Reason = "Test"
        }, isAdmin: true);
        var enriched = await service.GenerateEntitlementsAsync(fixture.Admin.Id, declaration.Id, isAdmin: true);

        var entitlement = enriched.Entitlements.Single();
        var distribution = await service.DeclareDistributionAsync(fixture.Admin.Id, new DeclareExternalDistributionRequest
        {
            EntitlementId = entitlement.Id,
            Amount = 100m
        }, isAdmin: true);

        var stranger = new AuthUser { Id = Guid.NewGuid(), Name = "Stranger", PasswordHash = "x", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        db.AuthUsers.Add(stranger);
        await db.SaveChangesAsync();

        var act = () => service.ConfirmDistributionAsync(stranger.Id, new ConfirmDistributionRequest
        {
            DistributionId = distribution.Id,
            IsConfirmed = true
        });

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_DIVIDEND_FORBIDDEN");
    }

    [Fact]
    public async Task Create_transfer_validates_quantity()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var act = () => service.CreateTransferAsync(fixture.Investor.Id, new CreateTransferRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            SourcePositionId = fixture.Position!.Id,
            TransferType = EquityTransferType.PartialTransfer,
            Quantity = -10m,
            EffectiveDate = DateTime.UtcNow,
            Reason = "Invalid"
        }, isAdmin: false);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_TRANSFER_QUANTITY_INVALID");
    }

    [Fact]
    public async Task Create_and_apply_internal_transfer()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);
        var destination = new AuthUser { Id = Guid.NewGuid(), Name = "Dest", PasswordHash = "x", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        db.AuthUsers.Add(destination);
        await db.SaveChangesAsync();

        var transfer = await service.CreateTransferAsync(fixture.Investor.Id, new CreateTransferRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            SourcePositionId = fixture.Position!.Id,
            DestinationInvestorUserId = destination.Id,
            TransferType = EquityTransferType.PartialTransfer,
            Quantity = 100m,
            EffectiveDate = DateTime.UtcNow,
            Reason = "Internal move"
        }, isAdmin: false);

        transfer.Status.Should().Be(EquityTransferStatus.Draft);
        transfer.Quantity.Should().Be(100m);

        var submitted = await service.SubmitTransferAsync(fixture.Investor.Id, transfer.Id, isAdmin: false);
        submitted.Status.Should().Be(EquityTransferStatus.PendingAcknowledgement);

        (await service.GetTransfersAsync(fixture.Founder.Id, fixture.Opportunity.Id, isAdmin: false))
            .Should().ContainSingle(item => item.Id == transfer.Id);
        var outsider = Guid.NewGuid();
        var outsiderRead = () => service.GetTransfersAsync(outsider, fixture.Opportunity.Id, isAdmin: false);
        await outsiderRead.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_TRANSFER_FORBIDDEN");
        var outsiderAcknowledge = () => service.AcknowledgeTransferAsync(outsider, transfer.Id, approve: true, reason: null);
        await outsiderAcknowledge.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_TRANSFER_FORBIDDEN");
        var sourceAcknowledge = () => service.AcknowledgeTransferAsync(fixture.Investor.Id, transfer.Id, approve: false, reason: "self");
        await sourceAcknowledge.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_TRANSFER_FORBIDDEN");

        var acknowledged = await service.AcknowledgeTransferAsync(destination.Id, transfer.Id, approve: true, reason: null);
        acknowledged.Status.Should().Be(EquityTransferStatus.PendingApproval);

        var applied = await service.ApplyTransferAsync(fixture.Admin.Id, transfer.Id, isAdmin: true);
        applied.Status.Should().Be(EquityTransferStatus.Applied);
        applied.SourceSharesAfter.Should().Be(150m);
        applied.DestinationSharesAfter.Should().Be(100m);

        var sourcePosition = await db.EquityPositions.Include(x => x.LedgerEntries).SingleAsync(x => x.Id == fixture.Position.Id);
        sourcePosition.Status.Should().Be(EquityPositionStatus.PartiallyExited);
        sourcePosition.LedgerEntries.Should().HaveCount(2);
    }

    [Fact]
    public async Task Full_transfer_sets_position_to_fully_exited()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);
        var destination = new AuthUser { Id = Guid.NewGuid(), Name = "Dest", PasswordHash = "x", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        db.AuthUsers.Add(destination);
        await db.SaveChangesAsync();

        var transfer = await service.CreateTransferAsync(fixture.Investor.Id, new CreateTransferRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            SourcePositionId = fixture.Position!.Id,
            DestinationInvestorUserId = destination.Id,
            TransferType = EquityTransferType.FullTransfer,
            Quantity = 250m,
            EffectiveDate = DateTime.UtcNow,
            Reason = "Full exit"
        }, isAdmin: false);

        await service.SubmitTransferAsync(fixture.Investor.Id, transfer.Id, isAdmin: false);
        await service.AcknowledgeTransferAsync(destination.Id, transfer.Id, approve: true, reason: null);
        await service.ApplyTransferAsync(fixture.Admin.Id, transfer.Id, isAdmin: true);

        var sourcePosition = await db.EquityPositions.SingleAsync(x => x.Id == fixture.Position.Id);
        sourcePosition.Status.Should().Be(EquityPositionStatus.FullyExited);
        sourcePosition.ClosedAt.Should().BeNull();
    }

    [Fact]
    public async Task Transfer_stale_baseline_rejected()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var t1 = await service.CreateTransferAsync(fixture.Investor.Id, new CreateTransferRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            SourcePositionId = fixture.Position!.Id,
            TransferType = EquityTransferType.PartialTransfer,
            Quantity = 50m,
            EffectiveDate = DateTime.UtcNow,
            Reason = "First"
        }, isAdmin: false);
        var t2 = await service.CreateTransferAsync(fixture.Investor.Id, new CreateTransferRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            SourcePositionId = fixture.Position!.Id,
            TransferType = EquityTransferType.PartialTransfer,
            Quantity = 100m,
            EffectiveDate = DateTime.UtcNow,
            Reason = "Second on stale"
        }, isAdmin: false);

        await service.SubmitTransferAsync(fixture.Investor.Id, t1.Id, isAdmin: false);
        await service.ApplyTransferAsync(fixture.Admin.Id, t1.Id, isAdmin: true);

        await service.SubmitTransferAsync(fixture.Investor.Id, t2.Id, isAdmin: false);

        var act = () => service.ApplyTransferAsync(fixture.Admin.Id, t2.Id, isAdmin: true);
        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_TRANSFER_STALE_BASELINE");
    }

    [Fact]
    public async Task Close_position_requires_fully_exited()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        var act = () => service.ClosePositionAsync(fixture.Admin.Id, fixture.Position!.Id, new ClosePositionRequest { Reason = "Test" }, isAdmin: true);
        await act.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_CLOSURE_NOT_ELIGIBLE");
    }

    [Fact]
    public async Task Close_position_creates_snapshot()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);
        var destination = new AuthUser { Id = Guid.NewGuid(), Name = "Dest", PasswordHash = "x", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        db.AuthUsers.Add(destination);
        await db.SaveChangesAsync();

        var transfer = await service.CreateTransferAsync(fixture.Investor.Id, new CreateTransferRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            SourcePositionId = fixture.Position!.Id,
            DestinationInvestorUserId = destination.Id,
            TransferType = EquityTransferType.FullTransfer,
            Quantity = 250m,
            EffectiveDate = DateTime.UtcNow,
            Reason = "Full exit"
        }, isAdmin: false);
        await service.SubmitTransferAsync(fixture.Investor.Id, transfer.Id, isAdmin: false);
        await service.AcknowledgeTransferAsync(destination.Id, transfer.Id, approve: true, reason: null);
        await service.ApplyTransferAsync(fixture.Admin.Id, transfer.Id, isAdmin: true);

        var closure = await service.ClosePositionAsync(fixture.Admin.Id, fixture.Position!.Id, new ClosePositionRequest { Reason = "Wrapping up" }, isAdmin: true);

        closure.EquityPositionId.Should().Be(fixture.Position.Id);
        closure.FinalInvestorShares.Should().Be(0m);
        closure.ClosureReason.Should().Be("Wrapping up");
        closure.ClosedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        var founderSnapshot = await service.GetClosureSnapshotAsync(fixture.Founder.Id, fixture.Position.Id, isAdmin: false);
        founderSnapshot.Should().NotBeNull();
        founderSnapshot!.ClosureReason.Should().Be("Wrapping up");
        founderSnapshot.FinalInvestorShares.Should().Be(0m);
        var outsider = Guid.NewGuid();
        var readAct = () => service.GetClosureSnapshotAsync(outsider, fixture.Position.Id, isAdmin: false);
        await readAct.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_CLOSURE_FORBIDDEN");

        var position = await db.EquityPositions.SingleAsync(x => x.Id == fixture.Position.Id);
        position.Status.Should().Be(EquityPositionStatus.Closed);
        position.ClosedAt.Should().HaveValue();
    }

    [Fact]
    public async Task Get_dividend_declarations_filters_by_opportunity()
    {
        await using var db = CreateDb();
        var fixture = SeedShareBasedPosition(db);
        var service = Service(db);

        await service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = fixture.Opportunity.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(7),
            Currency = "EGP",
            DividendPerShare = 1m,
            Reason = "For this opportunity"
        }, isAdmin: true);

        var results = await service.GetDividendDeclarationsAsync(fixture.Admin.Id, fixture.Opportunity.Id, isAdmin: true);
        results.Should().HaveCount(1);
        (await service.GetDividendDeclarationsAsync(fixture.Founder.Id, fixture.Opportunity.Id, isAdmin: false))
            .Should().HaveCount(1);
        var outsiderRead = () => service.GetDividendDeclarationsAsync(Guid.NewGuid(), fixture.Opportunity.Id, isAdmin: false);
        await outsiderRead.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "EQUITY_DIVIDEND_FORBIDDEN");

        var other = new AuthUser { Id = Guid.NewGuid(), Name = "Other", PasswordHash = "x", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var otherProject = new Project { FounderId = other.Id, DisplayName = "Other", Slug = $"other-{Guid.NewGuid():N}", Summary = "s", Description = "d", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var otherOpp = new Opportunity { FounderId = other.Id, Project = otherProject, Title = "Other", ShortDescription = "d", UseOfFunds = "g", FundingTarget = 1000m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.Equity, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        db.AuthUsers.Add(other);
        db.Opportunities.Add(otherOpp);
        await db.SaveChangesAsync();

        await service.CreateDividendDeclarationAsync(fixture.Admin.Id, new CreateDividendDeclarationRequest
        {
            OpportunityId = otherOpp.Id,
            DeclarationDate = DateTime.UtcNow,
            RecordDate = DateTime.UtcNow.AddDays(7),
            Currency = "EGP",
            DividendPerShare = 1m,
            Reason = "Other"
        }, isAdmin: true);

        var stillOne = await service.GetDividendDeclarationsAsync(fixture.Admin.Id, fixture.Opportunity.Id, isAdmin: true);
        stillOne.Should().HaveCount(1);
    }

    // ── Helpers ──────────────────────────────────────────────

    private static EquityPhase3Service Service(ApplicationDbContext db) =>
        new(new UnitOfWork(db), null, NullLogger<EquityPhase3Service>.Instance);

    private static Phase3Fixture SeedShareBasedPosition(ApplicationDbContext db)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var admin = new AuthUser { Id = Guid.NewGuid(), Name = "Admin", PasswordHash = "test", UserType = UserType.OrgUser, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Project", Slug = $"project-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity { FounderId = founder.Id, Project = project, Title = "Opportunity", ShortDescription = "Desc", UseOfFunds = "Growth", FundingTarget = 1_000m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.Equity, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 1_000m, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow.AddDays(-2) };
        var offer = new NegotiationOffer { Opportunity = opportunity, CreatedByUserId = founder.Id, Version = 1, Status = NegotiationOfferStatus.Accepted, Currency = "EGP" };
        var equityLeg = new NegotiationOfferLeg
        {
            Offer = offer, LegType = NegotiationOfferLegType.Equity, Amount = 1_000m,
            EquityOwnershipModel = EquityOwnershipModel.ShareBased,
            InvestorShareCount = 250m, TotalIssuedShares = 1_000m,
            ShareClass = "Ordinary", PricePerShare = 4m,
            PreMoneyValuation = 8_000m, PostMoneyValuation = 9_000m,
            EffectiveOwnershipDate = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc)
        };
        offer.Legs.Add(equityLeg);

        db.AuthUsers.AddRange(founder, investor, admin);
        db.Opportunities.Add(opportunity);
        db.OpportunityJoinRequests.Add(participation);
        db.NegotiationOffers.Add(offer);
        db.SaveChanges();

        participation.AcceptedOfferId = offer.Id;
        var effectiveDate = equityLeg.EffectiveOwnershipDate!.Value;
        var contract = new InvestmentContract
        {
            ContractNumber = $"CTR-{Guid.NewGuid():N}", OpportunityId = opportunity.Id, AcceptedOfferId = offer.Id, AcceptedOfferVersionNumber = offer.Version,
            ParticipationRequestId = participation.Id, FounderUserId = founder.Id, InvestorUserId = investor.Id, InvestmentModel = opportunity.InvestmentModel,
            OpportunityTitleSnapshot = opportunity.Title, FounderNameSnapshot = founder.Name!, InvestorNameSnapshot = investor.Name!,
            AcceptedCurrency = "EGP", AcceptedAmount = 1_000m, AcceptanceTimestamp = effectiveDate, CurrentVersionNumber = 1, Status = InvestmentContractStatus.Active
        };
        contract.Versions.Add(new InvestmentContractVersion
        {
            VersionNumber = 1, VersionType = InvestmentContractVersionType.InitialAgreement,
            SourceParticipationRequestId = participation.Id, SourceNegotiationOfferId = offer.Id,
            Status = InvestmentContractVersionStatus.Active,
            TermsSnapshotJson = "{}", DocumentHash = "h", DocumentContent = "d"
        });
        db.InvestmentContracts.Add(contract);
        db.SaveChanges();

        var funding = new FundingDeclaration
        {
            ParticipationId = participation.Id, OpportunityId = opportunity.Id, FounderId = founder.Id, InvestorId = investor.Id,
            Amount = 1_000m, CurrencyCode = "EGP", ReceivedDate = effectiveDate, PaymentMethod = FundingPaymentMethod.BankTransfer,
            Status = FundingDeclarationStatus.Confirmed, ConfirmedAt = effectiveDate.AddDays(1), ConfirmedByInvestorId = investor.Id, CreatedBy = founder.Id
        };
        db.FundingDeclarations.Add(funding);
        db.SaveChanges();

        var position = new EquityPosition
        {
            ParticipationRequestId = participation.Id, ContractId = contract.Id, ContractVersionId = contract.Versions.Single().Id,
            AcceptedOfferId = offer.Id, AcceptedOfferVersionNumber = offer.Version,
            OfferLegId = equityLeg.Id, OfferLegNumber = 1, OpportunityId = opportunity.Id, ProjectId = project.Id,
            FounderUserId = founder.Id, InvestorUserId = investor.Id,
            InvestmentAmount = 1_000m, Currency = "EGP",
            OwnershipModel = EquityOwnershipModel.ShareBased,
            InvestorShareCount = 250m, TotalIssuedShares = 1_000m,
            ShareClass = "Ordinary", PricePerShare = 4m,
            PreMoneyValuation = 8_000m, PostMoneyValuation = 9_000m,
            EffectiveOwnershipDate = effectiveDate,
            Status = EquityPositionStatus.Active, ActivatedAt = DateTime.UtcNow
        };
        position.InitialHoldingSnapshot = new EquityHoldingSnapshot
        {
            OwnershipModel = EquityOwnershipModel.ShareBased, EffectiveDate = effectiveDate,
            InvestorShareCount = 250m, TotalIssuedShares = 1_000m,
            DerivedOwnershipPercentage = 25m, ShareClass = "Ordinary",
            PricePerShare = 4m, PreMoneyValuation = 8_000m, PostMoneyValuation = 9_000m,
            ContractId = contract.Id, ContractVersionId = contract.Versions.Single().Id,
            AcceptedOfferId = offer.Id, OfferLegId = equityLeg.Id
        };
        position.LedgerEntries.Add(new EquityHoldingLedgerEntry
        {
            EventType = EquityHoldingLedgerEventType.InitialActivation, EffectiveDate = effectiveDate,
            PreviousInvestorShares = 0m, PreviousTotalIssuedShares = 0m, PreviousOwnershipPercentage = 0m,
            ShareDelta = 250m,
            ResultingInvestorShares = 250m, ResultingTotalIssuedShares = 1_000m,
            ResultingOwnershipPercentage = 25m,
            ContractualOwnershipPercentage = 25m,
            ContractId = contract.Id, ContractVersionId = contract.Versions.Single().Id,
            AcceptedOfferId = offer.Id, OfferLegId = equityLeg.Id,
            ActorType = "System", ShareClass = "Ordinary"
        });
        db.EquityPositions.Add(position);
        db.SaveChanges();

        return new Phase3Fixture(founder, investor, admin, opportunity, position);
    }

    private sealed record Phase3Fixture(AuthUser Founder, AuthUser Investor, AuthUser Admin, Opportunity Opportunity, EquityPosition Position);
    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
