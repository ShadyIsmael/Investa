using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Investa.UnitTests;

public sealed class LoanRepaymentServiceTests
{
    [Fact]
    public async Task Declaration_stays_pending_then_allocates_fifo_interest_first_without_legacy_payment_rows()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        var service = Service(db);

        var declaration = await service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(120m, "EGP", DateTime.UtcNow.Date, "BANK-1"));
        await db.SaveChangesAsync();

        declaration.Status.Should().Be(nameof(LoanRepaymentDeclarationStatus.PendingConfirmation));
        (await db.LoanRepaymentAllocations.CountAsync()).Should().Be(0);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);

        var confirmed = await service.ConfirmAsync(fixture.Investor.Id, declaration.Id, "Seen externally");
        confirmed.Status.Should().Be(nameof(LoanRepaymentDeclarationStatus.Confirmed));
        confirmed.Allocations.Should().HaveCount(2);
        confirmed.Allocations[0].InstallmentNumber.Should().Be(1);
        confirmed.Allocations[0].InterestAllocated.Should().Be(10m);
        confirmed.Allocations[0].PrincipalAllocated.Should().Be(100m);
        confirmed.Allocations[1].InstallmentNumber.Should().Be(2);
        confirmed.Allocations[1].InterestAllocated.Should().Be(10m);
        confirmed.Allocations[1].PrincipalAllocated.Should().Be(0m);

        var summary = (await service.GetSummariesByObligationAsync([fixture.Obligation.Id]))[fixture.Obligation.Id];
        summary.PrincipalOutstanding.Should().Be(100m);
        summary.InterestOutstanding.Should().Be(0m);
        summary.TotalOutstanding.Should().Be(100m);
        summary.ConfirmedRepaidAmount.Should().Be(120m);
        summary.PendingConfirmationAmount.Should().Be(0m);
        summary.NextDueAmount.Should().Be(100m);
        (await db.LoanRepaymentAllocations.CountAsync()).Should().Be(2);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Summary_counts_remaining_partial_and_multiple_overdue_installments_from_confirmed_allocations_only()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        db.LoanRepaymentInstallments.RemoveRange(fixture.Obligation.Installments);
        fixture.Obligation.Installments.Clear();
        fixture.Obligation.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date.AddDays(-4), PrincipalDue = 100m, InterestDue = 10m, TotalDue = 110m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.PartiallyPaid });
        fixture.Obligation.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 2, DueDate = DateTime.UtcNow.Date.AddDays(-3), PrincipalDue = 40m, InterestDue = 10m, TotalDue = 50m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Overdue });
        fixture.Obligation.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 3, DueDate = DateTime.UtcNow.Date.AddDays(-2), PrincipalDue = 20m, InterestDue = 0m, TotalDue = 20m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Overdue });
        fixture.Obligation.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 4, DueDate = DateTime.UtcNow.Date.AddDays(2), PrincipalDue = 10m, InterestDue = 1m, TotalDue = 11m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Upcoming });
        await db.SaveChangesAsync();

        var confirmed = new LoanRepaymentDeclaration { LoanObligationId = fixture.Obligation.Id, ParticipationId = fixture.Participation.Id, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, FounderUserId = fixture.Founder.Id, InvestorUserId = fixture.Investor.Id, Amount = 70m, Currency = "EGP", ExternalPaymentDate = DateTime.UtcNow.Date, DeclaredByUserId = fixture.Founder.Id, Status = LoanRepaymentDeclarationStatus.Confirmed };
        var pending = new LoanRepaymentDeclaration { LoanObligationId = fixture.Obligation.Id, ParticipationId = fixture.Participation.Id, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, FounderUserId = fixture.Founder.Id, InvestorUserId = fixture.Investor.Id, Amount = 5m, Currency = "EGP", ExternalPaymentDate = DateTime.UtcNow.Date, DeclaredByUserId = fixture.Founder.Id, Status = LoanRepaymentDeclarationStatus.PendingConfirmation };
        var disputed = new LoanRepaymentDeclaration { LoanObligationId = fixture.Obligation.Id, ParticipationId = fixture.Participation.Id, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, FounderUserId = fixture.Founder.Id, InvestorUserId = fixture.Investor.Id, Amount = 7m, Currency = "EGP", ExternalPaymentDate = DateTime.UtcNow.Date, DeclaredByUserId = fixture.Founder.Id, Status = LoanRepaymentDeclarationStatus.Disputed };
        db.LoanRepaymentDeclarations.AddRange(confirmed, pending, disputed);
        await db.SaveChangesAsync();
        db.LoanRepaymentAllocations.Add(new LoanRepaymentAllocation { LoanRepaymentDeclarationId = confirmed.Id, LoanObligationId = fixture.Obligation.Id, LoanRepaymentInstallmentId = fixture.Obligation.Installments.ElementAt(0).Id, InstallmentNumber = 1, PrincipalAllocated = 60m, InterestAllocated = 10m, TotalAllocated = 70m });
        await db.SaveChangesAsync();

        var summary = (await Service(db).GetSummariesByObligationAsync([fixture.Obligation.Id]))[fixture.Obligation.Id];

        summary.ConfirmedRepaidAmount.Should().Be(70m);
        summary.PendingConfirmationAmount.Should().Be(5m);
        summary.DisputedAmount.Should().Be(7m);
        summary.PrincipalOutstanding.Should().Be(110m);
        summary.InterestOutstanding.Should().Be(11m);
        summary.TotalOutstanding.Should().Be(121m);
        summary.OverdueAmount.Should().Be(110m);
        summary.NextDueAmount.Should().Be(40m);
        summary.NextDueDate.Should().Be(fixture.Obligation.Installments.ElementAt(0).DueDate);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Dispute_is_terminal_and_does_not_allocate_or_change_balance()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        var service = Service(db);
        var declaration = await service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(20m, "EGP", DateTime.UtcNow.Date, null));
        await db.SaveChangesAsync();

        var disputed = await service.DisputeAsync(fixture.Investor.Id, declaration.Id, "Reference does not match");
        disputed.Status.Should().Be(nameof(LoanRepaymentDeclarationStatus.Disputed));
        disputed.DisputeReason.Should().Be("Reference does not match");
        (await db.LoanRepaymentAllocations.CountAsync()).Should().Be(0);
        var repeated = await service.DisputeAsync(fixture.Investor.Id, declaration.Id, "same action");
        repeated.Status.Should().Be(nameof(LoanRepaymentDeclarationStatus.Disputed));
        db.LoanRepaymentDeclarations.AsNoTracking().Single().Status.Should().Be(LoanRepaymentDeclarationStatus.Disputed);
        await Assert.ThrowsAsync<BusinessValidationException>(() => service.ConfirmAsync(fixture.Investor.Id, declaration.Id, null));
    }

    [Fact]
    public async Task Overpayment_is_rejected_at_confirmation_and_wrong_users_cannot_view_or_decide()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        var service = Service(db);
        var declaration = await service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(221m, "EGP", DateTime.UtcNow.Date, null));
        await db.SaveChangesAsync();

        var error = await Assert.ThrowsAsync<BusinessValidationException>(() => service.ConfirmAsync(fixture.Investor.Id, declaration.Id, null));
        error.Code.Should().Be("LOAN_REPAYMENT_OVERPAYMENT");
        await Assert.ThrowsAsync<BusinessValidationException>(() => service.GetForParticipationAsync(Guid.NewGuid(), fixture.Opportunity.Id, fixture.Participation.Id));
        await Assert.ThrowsAsync<BusinessValidationException>(() => service.ConfirmAsync(Guid.NewGuid(), declaration.Id, null));
        (await db.LoanRepaymentAllocations.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Explicit_installments_cannot_cross_obligation_boundary()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        var other = new LoanRepaymentInstallment { LoanObligationId = fixture.OtherObligation.Id, InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date, PrincipalDue = 10m, InterestDue = 1m, TotalDue = 11m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Due };
        db.LoanRepaymentInstallments.Add(other);
        await db.SaveChangesAsync();
        var service = Service(db);

        await Assert.ThrowsAsync<BusinessValidationException>(() => service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(5m, "EGP", DateTime.UtcNow.Date, null, [other.Id])));
        (await db.LoanRepaymentDeclarations.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Proof_is_optional_and_file_store_failure_returns_controlled_business_error()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        var service = Service(db);
        var withoutProof = await service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(5m, "EGP", DateTime.UtcNow.Date, null));
        withoutProof.ProofAvailable.Should().BeFalse();

        var unavailable = Service(db, new UnavailableFileUpload());
        var error = await Assert.ThrowsAsync<BusinessValidationException>(() => unavailable.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(5m, "EGP", DateTime.UtcNow.Date, null, ProofContent: new MemoryStream([1, 2, 3]), ProofOriginalFileName: "proof.pdf", ProofContentType: "application/pdf", ProofFileSize: 3)));
        error.Code.Should().Be("LOAN_REPAYMENT_PROOF_UPLOAD_UNAVAILABLE");
    }

    private static LoanRepaymentService Service(ApplicationDbContext db, IFileUploadService? upload = null) => new(new UnitOfWork(db), upload ?? new NoFileUpload(), new NoFileStorage(), null, NullLogger<LoanRepaymentService>.Instance);

    private static ApplicationDbContext CreateDb() => new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static Fixture Seed(ApplicationDbContext db)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var opportunity = new Opportunity { FounderId = founder.Id, Title = "Loan", ShortDescription = "Loan opportunity", UseOfFunds = "Working capital", FundingTarget = 200m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.LoanInvestment, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
        var participation = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investor.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 200m, FundingCurrency = "EGP" };
        var obligation = new LoanObligation { ParticipationRequestId = 1, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, OfferLegNumber = 1, FounderUserId = founder.Id, InvestorUserId = investor.Id, Principal = 200m, Currency = "EGP", InterestRate = 12m, TermMonths = 12, RepaymentModel = "Monthly", ContractualStartDate = DateTime.UtcNow.AddMonths(-2), ContractualMaturityDate = DateTime.UtcNow.AddMonths(10), Status = LoanObligationStatus.Active };
        obligation.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date.AddDays(-1), PrincipalDue = 100m, InterestDue = 10m, TotalDue = 110m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Overdue });
        obligation.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 2, DueDate = DateTime.UtcNow.Date.AddMonths(1), PrincipalDue = 100m, InterestDue = 10m, TotalDue = 110m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Upcoming });
        var other = new LoanObligation { ParticipationRequestId = 2, ContractId = 2, ContractVersionId = 2, AcceptedOfferId = 2, AcceptedOfferVersionNumber = 1, OfferLegId = 2, OfferLegNumber = 1, FounderUserId = founder.Id, InvestorUserId = investor.Id, Principal = 10m, Currency = "EGP", InterestRate = 12m, TermMonths = 1, RepaymentModel = "Monthly", ContractualStartDate = DateTime.UtcNow, ContractualMaturityDate = DateTime.UtcNow.AddMonths(1), Status = LoanObligationStatus.Active };
        db.AuthUsers.AddRange(founder, investor);
        db.Opportunities.Add(opportunity);
        db.OpportunityJoinRequests.Add(participation);
        db.LoanObligations.AddRange(obligation, other);
        db.SaveChanges();
        return new Fixture(founder, investor, opportunity, participation, obligation, other);
    }

    private sealed record Fixture(AuthUser Founder, AuthUser Investor, Opportunity Opportunity, OpportunityJoinRequest Participation, LoanObligation Obligation, LoanObligation OtherObligation);

    private sealed class NoFileUpload : IFileUploadService { public Task<FileUploadResult> UploadAsync(FileUploadCommand command, CancellationToken cancellationToken = default) => throw new NotSupportedException(); }
    private sealed class UnavailableFileUpload : IFileUploadService { public Task<FileUploadResult> UploadAsync(FileUploadCommand command, CancellationToken cancellationToken = default) => throw new IOException("FileStore unavailable"); }
    private sealed class NoFileStorage : IFileStorage
    {
        public Task<string> SaveFileAsync(string relativePath, Stream data, string contentType) => throw new NotSupportedException();
        public Task<FileStoreUploadResult> UploadWithPolicyAsync(string categoryCode, string originalFileName, Stream data, string contentType, long declaredFileSize, FileStoreUploadPolicy policy, FileStoreUploadContext context, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<bool> DeleteFileAsync(string relativePath) => Task.FromResult(true);
        public Task EnsureDirectoryAsync(string relativeDirectory) => Task.CompletedTask;
        public Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default) => Task.FromResult<FileStoreMetadataDto?>(null);
    }
}
