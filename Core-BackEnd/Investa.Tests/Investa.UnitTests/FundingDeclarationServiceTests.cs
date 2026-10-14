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

namespace Investa.UnitTests;

public sealed class FundingDeclarationServiceTests
{
    [Fact]
    public async Task Founder_can_record_partial_declarations_but_not_exceed_commitment()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 1_000m);
        var service = Service(db);

        var first = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(600m));
        var second = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(400m));

        first.Status.Should().Be(nameof(FundingDeclarationStatus.PendingConfirmation));
        second.Amount.Should().Be(400m);
        (await db.FundingDeclarations.CountAsync()).Should().Be(2);
        await FluentActions.Invoking(() => service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(1m)))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_EXCEEDS_COMMITMENT");
    }

    [Fact]
    public async Task Mixed_declaration_requires_exact_leg_allocation_and_persists_rows()
    {
        await using var db = CreateDb();
        var (founder, investor, participation, loanLeg, equityLeg) = SeedMixedParticipation(db);
        var service = Service(db);

        await FluentActions.Invoking(() => service.CreateAsync(
            founder.Id, participation.OpportunityId, participation.Id,
            Command(700m) with { LegAllocations = [new FundingDeclarationLegAllocationRequest { OfferLegId = loanLeg.Id, AllocatedAmount = 600m }] }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_LEG_ALLOCATION_SUM_MISMATCH");

        var declaration = await service.CreateAsync(
            founder.Id, participation.OpportunityId, participation.Id,
            Command(700m) with
            {
                LegAllocations =
                [
                    new FundingDeclarationLegAllocationRequest { OfferLegId = loanLeg.Id, AllocatedAmount = 600m },
                    new FundingDeclarationLegAllocationRequest { OfferLegId = equityLeg.Id, AllocatedAmount = 100m }
                ]
            });

        declaration.LegAllocations.Should().HaveCount(2);
        declaration.LegAllocations.Sum(x => x.AllocatedAmount).Should().Be(700m);
        (await db.FundingDeclarationLegAllocations.CountAsync()).Should().Be(2);
        investor.Id.Should().Be(participation.InvestorId);
    }

    [Fact]
    public async Task Mixed_declaration_rejects_leg_overfunding_before_confirmation()
    {
        await using var db = CreateDb();
        var (founder, _, participation, loanLeg, equityLeg) = SeedMixedParticipation(db);
        var service = Service(db);

        await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(900m) with
        {
            LegAllocations =
            [
                new FundingDeclarationLegAllocationRequest { OfferLegId = loanLeg.Id, AllocatedAmount = 600m },
                new FundingDeclarationLegAllocationRequest { OfferLegId = equityLeg.Id, AllocatedAmount = 300m }
            ]
        });

        await FluentActions.Invoking(() => service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(200m) with
        {
            LegAllocations = [new FundingDeclarationLegAllocationRequest { OfferLegId = equityLeg.Id, AllocatedAmount = 200m }]
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_LEG_ALLOCATION_EXCEEDS_COMMITMENT");
    }

    [Fact]
    public async Task Other_founder_cannot_declare_against_the_participation()
    {
        await using var db = CreateDb();
        var (founder, otherFounder, participation) = SeedParticipation(db, 500m);

        await FluentActions.Invoking(() => Service(db).CreateAsync(otherFounder.Id, participation.OpportunityId, participation.Id, Command(100m)))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_FORBIDDEN");
        founder.Id.Should().NotBe(otherFounder.Id);
    }

    [Fact]
    public async Task Declaration_without_proof_does_not_create_a_payment_transaction()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 500m);

        var result = await Service(db).CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(125m));

        result.ProofAvailable.Should().BeFalse();
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
        (await db.FundingDeclarations.SumAsync(d => d.Amount)).Should().Be(125m);
    }

    [Fact]
    public async Task Valid_proof_is_optional_but_is_stored_and_only_parties_can_download_it()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 500m);
        var storage = new TestFileStorage();
        var uow = new UnitOfWork(db);
        var fileUpload = new FileUploadService(uow, storage);
        var service = new FundingDeclarationService(
            uow,
            fileUpload,
            storage,
            Mock.Of<IUserNotificationService>(),
            NullLogger<FundingDeclarationService>.Instance);

        var result = await service.CreateAsync(
            founder.Id,
            participation.OpportunityId,
            participation.Id,
            Command(125m) with
            {
                ProofContent = new MemoryStream([1, 2, 3]),
                ProofOriginalFileName = "receipt.pdf",
                ProofContentType = "application/pdf",
                ProofFileSize = 3
            });

        result.ProofAvailable.Should().BeTrue();
        result.ProofFileName.Should().Be("receipt.pdf");
        var downloaded = await service.DownloadProofAsync(founder.Id, result.Id);
        downloaded.Content.Should().Equal(1, 2, 3);
        await FluentActions.Invoking(() => service.DownloadProofAsync(Guid.NewGuid(), result.Id))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_PROOF_FORBIDDEN");
    }

    [Fact]
    public async Task FileStore_failure_returns_controlled_error_without_creating_declaration()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 500m);
        var upload = new Mock<IFileUploadService>();
        upload
            .Setup(x => x.UploadAsync(It.IsAny<FileUploadCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new IOException("FileStore unavailable"));
        var service = new FundingDeclarationService(
            new UnitOfWork(db),
            upload.Object,
            Mock.Of<IFileStorage>(),
            Mock.Of<IUserNotificationService>(),
            NullLogger<FundingDeclarationService>.Instance);

        await FluentActions.Invoking(() => service.CreateAsync(
            founder.Id,
            participation.OpportunityId,
            participation.Id,
            Command(125m) with
            {
                ProofContent = new MemoryStream([1, 2, 3]),
                ProofOriginalFileName = "receipt.pdf",
                ProofContentType = "application/pdf",
                ProofFileSize = 3
            }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_PROOF_UPLOAD_UNAVAILABLE");

        (await db.FundingDeclarations.CountAsync()).Should().Be(0);
    }

    [Fact]
    public void Declared_amount_never_becomes_confirmed_or_reduces_outstanding()
    {
        var declarations = new[]
        {
            new FundingDeclaration { Amount = 750m, Status = FundingDeclarationStatus.PendingConfirmation }
        };

        FundingSemantics.SumDeclared(declarations).Should().Be(750m);
        FundingSemantics.CalculateAwaitingConfirmationAmount(750m, 0m).Should().Be(750m);
        FundingSemantics.CalculateOutstanding(2_000m, 0m).Should().Be(2_000m);
        FundingSemantics.CalculateFundingProgress(2_000m, 0m).Should().Be(0m);
    }

    [Fact]
    public async Task Owning_investor_can_confirm_without_proof_and_confirmed_aggregates_update()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 2_000_000m);
        var investor = await db.AuthUsers.SingleAsync(u => u.Id == participation.InvestorId);
        var notifications = new Mock<IUserNotificationService>();
        var service = Service(db, notifications.Object);
        var declaration = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(750_000m));

        var confirmed = await service.ConfirmAsync(investor.Id, declaration.Id, "I acknowledge the external receipt.");

        confirmed.Status.Should().Be(nameof(FundingDeclarationStatus.Confirmed));
        confirmed.ConfirmedByInvestorId.Should().Be(investor.Id);
        confirmed.ConfirmedAt.Should().NotBeNull();
        confirmed.ProofAvailable.Should().BeFalse();
        var rows = await db.FundingDeclarations.ToListAsync();
        FundingSemantics.SumDeclared(rows).Should().Be(750_000m);
        FundingSemantics.SumConfirmed(rows).Should().Be(750_000m);
        FundingSemantics.SumAwaitingConfirmation(rows).Should().Be(0m);
        FundingSemantics.CalculateOutstanding(2_000_000m, FundingSemantics.SumConfirmed(rows)).Should().Be(1_250_000m);
        FundingSemantics.CalculateFundingProgress(8_000_000m, FundingSemantics.SumConfirmed(rows)).Should().Be(9.38m);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
        (await db.OpportunityEvents.CountAsync(e => e.EventType == "FundingDeclarationConfirmed" && !e.IsPublic)).Should().Be(1);
        notifications.Verify(n => n.CreateEventAsync(
            It.Is<NotificationEventCreation>(e => e.RecipientUserId == founder.Id && e.EventType == "FundingDeclarationConfirmed"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Owning_investor_can_dispute_without_proof_and_disputed_stays_declared_but_not_confirmed()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 2_000m);
        var investor = await db.AuthUsers.SingleAsync(u => u.Id == participation.InvestorId);
        var notifications = new Mock<IUserNotificationService>();
        var service = Service(db, notifications.Object);
        var declaration = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(250m));

        var disputed = await service.DisputeAsync(investor.Id, declaration.Id, "The amount does not match my external transfer record.");

        disputed.Status.Should().Be(nameof(FundingDeclarationStatus.Disputed));
        disputed.DisputedByInvestorId.Should().Be(investor.Id);
        disputed.DisputedAt.Should().NotBeNull();
        disputed.DisputeReason.Should().Contain("does not match");
        var rows = await db.FundingDeclarations.ToListAsync();
        FundingSemantics.SumDeclared(rows).Should().Be(250m);
        FundingSemantics.SumConfirmed(rows).Should().Be(0m);
        FundingSemantics.SumDisputed(rows).Should().Be(250m);
        FundingSemantics.SumAwaitingConfirmation(rows).Should().Be(0m);
        FundingSemantics.CalculateOutstanding(2_000m, 0m).Should().Be(2_000m);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
        (await db.OpportunityEvents.CountAsync(e => e.EventType == "FundingDeclarationDisputed" && !e.IsPublic)).Should().Be(1);
        notifications.Verify(n => n.CreateEventAsync(
            It.Is<NotificationEventCreation>(e => e.RecipientUserId == founder.Id && e.EventType == "FundingDeclarationDisputed"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Only_the_associated_investor_can_decide_and_terminal_states_cannot_change()
    {
        await using var db = CreateDb();
        var (founder, otherFounder, participation) = SeedParticipation(db, 500m);
        var investor = await db.AuthUsers.SingleAsync(u => u.Id == participation.InvestorId);
        var unrelatedInvestor = new AuthUser { Id = Guid.NewGuid(), Name = "Other Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        db.AuthUsers.Add(unrelatedInvestor);
        await db.SaveChangesAsync();
        var service = Service(db);
        var declaration = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(100m));

        await FluentActions.Invoking(() => service.ConfirmAsync(founder.Id, declaration.Id, null))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_FORBIDDEN");
        await FluentActions.Invoking(() => service.DisputeAsync(unrelatedInvestor.Id, declaration.Id, "Not my transaction"))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_FORBIDDEN");
        await FluentActions.Invoking(() => service.DisputeAsync(otherFounder.Id, declaration.Id, "Not my declaration"))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_FORBIDDEN");
        await service.ConfirmAsync(investor.Id, declaration.Id, null);
        var repeated = await service.ConfirmAsync(investor.Id, declaration.Id, "A different repeat comment");
        repeated.Status.Should().Be(nameof(FundingDeclarationStatus.Confirmed));
        await FluentActions.Invoking(() => service.DisputeAsync(investor.Id, declaration.Id, "Too late"))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_ALREADY_CONFIRMED");
        otherFounder.Id.Should().NotBe(founder.Id);
    }

    [Fact]
    public async Task Disputed_declaration_cannot_be_confirmed_and_confirm_dispute_race_has_one_winner()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 500m);
        var investor = await db.AuthUsers.SingleAsync(u => u.Id == participation.InvestorId);
        var service = Service(db);
        var disputedDeclaration = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(100m));

        await service.DisputeAsync(investor.Id, disputedDeclaration.Id, "The recorded receipt is not mine.");
        await FluentActions.Invoking(() => service.ConfirmAsync(investor.Id, disputedDeclaration.Id, null))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DECLARATION_ALREADY_DISPUTED");

        var raceDeclaration = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(150m));
        var decisions = await Task.WhenAll(
            TryConfirmAsync(service, investor.Id, raceDeclaration.Id),
            TryDisputeAsync(service, investor.Id, raceDeclaration.Id));

        decisions.Count(result => result.Succeeded).Should().Be(1);
        decisions.Count(result => !result.Succeeded && result.ErrorCode is not null).Should().Be(1);
        var stored = await db.FundingDeclarations.SingleAsync(d => d.Id == raceDeclaration.Id);
        stored.Status.Should().BeOneOf(FundingDeclarationStatus.Confirmed, FundingDeclarationStatus.Disputed);
    }

    [Fact]
    public async Task Dispute_requires_a_non_empty_reason()
    {
        await using var db = CreateDb();
        var (founder, _, participation) = SeedParticipation(db, 500m);
        var investor = await db.AuthUsers.SingleAsync(u => u.Id == participation.InvestorId);
        var service = Service(db);
        var declaration = await service.CreateAsync(founder.Id, participation.OpportunityId, participation.Id, Command(100m));

        await FluentActions.Invoking(() => service.DisputeAsync(investor.Id, declaration.Id, "   "))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "FUNDING_DISPUTE_REASON_REQUIRED");
    }

    private static FundingDeclarationService Service(ApplicationDbContext db, IUserNotificationService? notifications = null)
    {
        return new FundingDeclarationService(
            new UnitOfWork(db),
            Mock.Of<IFileUploadService>(),
            Mock.Of<IFileStorage>(),
            notifications ?? Mock.Of<IUserNotificationService>(),
            NullLogger<FundingDeclarationService>.Instance);
    }

    private static FundingDeclarationCreateCommand Command(decimal amount) => new(
        amount, "EGP", DateTime.UtcNow.AddDays(-1), "BankTransfer", "BANK-TEST-001", "Test declaration");

    private static async Task<DecisionResult> TryConfirmAsync(FundingDeclarationService service, Guid investorId, int declarationId)
    {
        try
        {
            await service.ConfirmAsync(investorId, declarationId, null);
            return new DecisionResult(true, null);
        }
        catch (BusinessValidationException ex)
        {
            return new DecisionResult(false, ex.Code);
        }
    }

    private static async Task<DecisionResult> TryDisputeAsync(FundingDeclarationService service, Guid investorId, int declarationId)
    {
        try
        {
            await service.DisputeAsync(investorId, declarationId, "Concurrent decision test");
            return new DecisionResult(true, null);
        }
        catch (BusinessValidationException ex)
        {
            return new DecisionResult(false, ex.Code);
        }
    }

    private static (AuthUser Founder, AuthUser OtherFounder, OpportunityJoinRequest Participation) SeedParticipation(ApplicationDbContext db, decimal amount)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var otherFounder = new AuthUser { Id = Guid.NewGuid(), Name = "Other Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Test project", Slug = $"test-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity { FounderId = founder.Id, Project = project, Title = "Test opportunity", ShortDescription = "A realistic test opportunity description", UseOfFunds = "Product development and market expansion", FundingTarget = 2_000m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.LoanInvestment, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = amount, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow.AddDays(-2), UpdatedAt = DateTime.UtcNow.AddDays(-2) };
        db.AuthUsers.AddRange(founder, otherFounder, investor);
        db.Opportunities.Add(opportunity);
        db.OpportunityJoinRequests.Add(participation);
        db.SaveChanges();
        return (founder, otherFounder, participation);
    }

    private static (AuthUser Founder, AuthUser Investor, OpportunityJoinRequest Participation, NegotiationOfferLeg LoanLeg, NegotiationOfferLeg EquityLeg) SeedMixedParticipation(ApplicationDbContext db)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Mixed Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Mixed Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Mixed project", Slug = $"mixed-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity { FounderId = founder.Id, Project = project, Title = "Mixed opportunity", ShortDescription = "Mixed", UseOfFunds = "Mixed", FundingTarget = 5_000m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.Unspecified, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 1_000m, FundingCurrency = "EGP", ReviewedAt = DateTime.UtcNow.AddDays(-2), UpdatedAt = DateTime.UtcNow.AddDays(-2) };
        var offer = new NegotiationOffer { Opportunity = opportunity, OpportunityId = opportunity.Id, CreatedByUserId = investor.Id, Version = 1, Status = NegotiationOfferStatus.Accepted, Currency = "EGP" };
        var loanLeg = new NegotiationOfferLeg { Offer = offer, LegType = NegotiationOfferLegType.Loan, Amount = 600m, ReturnRate = 10m, TermMonths = 12, RepaymentModel = "Monthly" };
        var equityLeg = new NegotiationOfferLeg { Offer = offer, LegType = NegotiationOfferLegType.Equity, Amount = 400m, EquityOwnershipModel = EquityOwnershipModel.PercentageBased, EquityPercentage = 10m };
        offer.Legs.Add(loanLeg); offer.Legs.Add(equityLeg);
        var contract = new InvestmentContract { ContractNumber = $"MIX-{Guid.NewGuid():N}", Opportunity = opportunity, OpportunityId = opportunity.Id, AcceptedOffer = offer, AcceptedOfferVersionNumber = 1, ParticipationRequest = participation, FounderUserId = founder.Id, InvestorUserId = investor.Id, InvestmentModel = InvestmentModel.Unspecified, OpportunityTitleSnapshot = opportunity.Title, FounderNameSnapshot = founder.Name, InvestorNameSnapshot = investor.Name, AcceptedCurrency = "EGP", AcceptedAmount = 1_000m, AcceptanceTimestamp = DateTime.UtcNow.AddDays(-2), CurrentVersionNumber = 1, Status = InvestmentContractStatus.Active };
        contract.Versions.Add(new InvestmentContractVersion { VersionNumber = 1, VersionType = InvestmentContractVersionType.InitialAgreement, SourceParticipationRequest = participation, SourceNegotiationOffer = offer, Status = InvestmentContractVersionStatus.Active, TermsSnapshotJson = "{}", DocumentHash = "hash", DocumentContent = "content", ActivatedAt = DateTime.UtcNow.AddDays(-2) });
        db.AuthUsers.AddRange(founder, investor);
        db.Opportunities.Add(opportunity);
        db.NegotiationOffers.Add(offer);
        db.OpportunityJoinRequests.Add(participation);
        db.InvestmentContracts.Add(contract);
        db.SaveChanges();
        return (founder, investor, participation, loanLeg, equityLeg);
    }

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }

    private sealed class TestFileStorage : IFileStorage
    {
        public Task<string> SaveFileAsync(string relativePath, Stream data, string contentType) => Task.FromResult(relativePath);
        public async Task<FileStoreUploadResult> UploadWithPolicyAsync(string categoryCode, string originalFileName, Stream data, string contentType, long declaredFileSize, FileStoreUploadPolicy policy, FileStoreUploadContext context, CancellationToken cancellationToken = default)
        {
            using var buffer = new MemoryStream();
            await data.CopyToAsync(buffer, cancellationToken);
            LastContent = buffer.ToArray();
            return new FileStoreUploadResult("proof-file-1", $"FUNDING_PROOF/proof-file-1.pdf", "proof-file-1.pdf", originalFileName, ".pdf", contentType, declaredFileSize, categoryCode, "/storage/FUNDING_PROOF/proof-file-1.pdf", null, null);
        }
        public Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default) => Task.FromResult(LastContent);
        public Task<bool> DeleteFileAsync(string relativePath) => Task.FromResult(true);
        public Task EnsureDirectoryAsync(string relativeDirectory) => Task.CompletedTask;
        public Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default) => Task.FromResult<FileStoreMetadataDto?>(null);
        private byte[] LastContent { get; set; } = [];
    }

    private sealed record DecisionResult(bool Succeeded, string? ErrorCode);
}
