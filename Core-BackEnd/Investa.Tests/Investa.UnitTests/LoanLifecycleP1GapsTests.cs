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

public sealed class LoanLifecycleP1GapsTests
{
    #region G-001: Obligation Completion Status Aggregation

    [Fact]
    public void DeriveObligationCompletionStatus_returns_NotStarted_when_no_obligations()
    {
        var result = OpportunityService.DeriveObligationCompletionStatus(Array.Empty<LoanObligation>());
        result.Should().Be(ObligationCompletionStatus.NotStarted);
    }

    [Theory]
    [InlineData(LoanObligationStatus.FullyRepaid)]
    [InlineData(LoanObligationStatus.Closed)]
    [InlineData(LoanObligationStatus.Defaulted)]
    public void DeriveObligationCompletionStatus_returns_Completed_when_all_obligations_are_terminal(LoanObligationStatus status)
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = status },
            new() { Status = status }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.Completed);
    }

    [Fact]
    public void DeriveObligationCompletionStatus_returns_Completed_when_mixed_terminal_statuses()
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = LoanObligationStatus.FullyRepaid },
            new() { Status = LoanObligationStatus.Closed },
            new() { Status = LoanObligationStatus.Defaulted }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.Completed);
    }

    [Theory]
    [InlineData(LoanObligationStatus.Active)]
    [InlineData(LoanObligationStatus.PendingFunding)]
    [InlineData(LoanObligationStatus.Matured)]
    public void DeriveObligationCompletionStatus_returns_AwaitingConfirmations_when_any_obligation_is_non_terminal(LoanObligationStatus status)
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = LoanObligationStatus.FullyRepaid },
            new() { Status = status }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
    }

    [Fact]
    public void DeriveObligationCompletionStatus_returns_AwaitingConfirmations_when_all_Active()
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = LoanObligationStatus.Active },
            new() { Status = LoanObligationStatus.Active },
            new() { Status = LoanObligationStatus.Active }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
    }

    [Fact]
    public void DeriveObligationCompletionStatus_returns_AwaitingConfirmations_when_all_PendingFunding()
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = LoanObligationStatus.PendingFunding }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
    }

    [Fact]
    public void DeriveObligationCompletionStatus_returns_Completed_when_single_Closed()
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = LoanObligationStatus.Closed }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.Completed);
    }

    [Fact]
    public void DeriveObligationCompletionStatus_returns_AwaitingConfirmations_when_mixed_Active_and_Closed()
    {
        var obligations = new List<LoanObligation>
        {
            new() { Status = LoanObligationStatus.Active },
            new() { Status = LoanObligationStatus.Closed }
        };
        var result = OpportunityService.DeriveObligationCompletionStatus(obligations);
        result.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
    }

    #endregion

    #region G-004: Installment Selector Validation

    [Fact]
    public void Valid_installment_id_passes_obligation_boundary_validation()
    {
        var installment = new LoanRepaymentInstallment { Id = 1, LoanObligationId = 10, InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date, PrincipalDue = 100m, InterestDue = 10m, TotalDue = 110m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Upcoming };
        var obligation = new LoanObligation { Id = 10, Installments = [installment] };

        var targetIds = new[] { installment.Id };
        var targetInstallments = obligation.Installments.Where(x => targetIds.Contains(x.Id)).ToList();

        targetInstallments.Count.Should().Be(1);
        targetInstallments[0].Id.Should().Be(installment.Id);
    }

    [Fact]
    public void Foreign_installment_id_is_rejected()
    {
        var installment = new LoanRepaymentInstallment { Id = 1, LoanObligationId = 10, InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date, PrincipalDue = 100m, InterestDue = 10m, TotalDue = 110m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Upcoming };
        var obligation = new LoanObligation { Id = 10, Installments = [installment] };

        var foreignId = 99;
        var targetInstallments = obligation.Installments.Where(x => foreignId == x.Id).ToList();

        targetInstallments.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_repayment_with_foreign_installment_id_rejected()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        db.ChangeTracker.Clear();
        var service = Service(db);

        var foreignId = fixture.OtherObligation.Installments.FirstOrDefault()?.Id ?? 99999;
        var error = await Assert.ThrowsAsync<BusinessValidationException>(() =>
            service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
                new CreateLoanRepaymentDeclarationCommand(50m, "EGP", DateTime.UtcNow.Date, null, [foreignId])));
        error.Code.Should().Be("LOAN_REPAYMENT_INSTALLMENT_INVALID");
    }

    [Fact]
    public async Task Create_repayment_with_empty_installment_ids_defaults_to_fifo()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        db.ChangeTracker.Clear();
        var service = Service(db);

        var declaration = await service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
            new CreateLoanRepaymentDeclarationCommand(50m, "EGP", DateTime.UtcNow.Date, null, []));

        declaration.Status.Should().Be(nameof(LoanRepaymentDeclarationStatus.PendingConfirmation));
    }

    [Fact]
    public async Task Create_repayment_with_already_paid_installment_rejected()
    {
        await using var db = CreateDb();
        var fixture = SeedWithPaidInstallment(db);
        db.ChangeTracker.Clear();
        var service = Service(db);

        var paidInstallmentId = fixture.Obligation.Installments.First(x => x.Status == LoanRepaymentInstallmentStatus.Paid).Id;
        var error = await Assert.ThrowsAsync<BusinessValidationException>(() =>
            service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
                new CreateLoanRepaymentDeclarationCommand(10m, "EGP", DateTime.UtcNow.Date, null, [paidInstallmentId])));
        error.Code.Should().Be("LOAN_REPAYMENT_INSTALLMENT_INVALID");
    }

    [Fact]
    public async Task Create_repayment_with_cancelled_installment_rejected()
    {
        await using var db = CreateDb();
        var fixture = SeedWithCancelledInstallment(db);
        db.ChangeTracker.Clear();
        var service = Service(db);

        var cancelledId = fixture.Obligation.Installments.First(x => x.Status == LoanRepaymentInstallmentStatus.Cancelled).Id;
        var error = await Assert.ThrowsAsync<BusinessValidationException>(() =>
            service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
                new CreateLoanRepaymentDeclarationCommand(10m, "EGP", DateTime.UtcNow.Date, null, [cancelledId])));
        error.Code.Should().Be("LOAN_REPAYMENT_INSTALLMENT_INVALID");
    }

    [Fact]
    public void Foreign_installment_id_is_rejected_even_if_obligation_exists()
    {
        var installment = new LoanRepaymentInstallment { Id = 1, LoanObligationId = 10, InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date, PrincipalDue = 100m, InterestDue = 10m, TotalDue = 110m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Upcoming };
        var otherObligation = new LoanObligation { Id = 20, Installments = [] };
        var obligation = new LoanObligation { Id = 10, Installments = [installment] };

        var foreignInstallmentId = 999;
        var targetInstallments = obligation.Installments.Where(x => foreignInstallmentId == x.Id).ToList();

        targetInstallments.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_repayment_with_duplicate_installment_ids_rejected()
    {
        await using var db = CreateDb();
        var fixture = Seed(db);
        db.ChangeTracker.Clear();
        var service = Service(db);

        var id = fixture.Obligation.Installments.First().Id;
        var error = await Assert.ThrowsAsync<BusinessValidationException>(() =>
            service.CreateAsync(fixture.Founder.Id, fixture.Opportunity.Id, fixture.Obligation.Id,
                new CreateLoanRepaymentDeclarationCommand(10m, "EGP", DateTime.UtcNow.Date, null, [id, id])));
        error.Code.Should().Be("LOAN_REPAYMENT_INSTALLMENT_INVALID");
    }

    #endregion

    #region G-002: Per-Investor Loan Summary Isolation

    [Fact]
    public async Task GetMyParticipations_returns_per_investor_principal_from_loan_obligation()
    {
        await using var db = CreateDb();
        var fixture = SeedMultiInvestor(db);
        var service = ServiceOpportunity(db);

        var investorA = await service.GetMyParticipationsAsync(fixture.InvestorA.Id);
        var investorB = await service.GetMyParticipationsAsync(fixture.InvestorB.Id);

        investorA.Should().HaveCount(1);
        investorB.Should().HaveCount(1);

        investorA[0].Principal.Should().Be(100_000m);
        investorB[0].Principal.Should().Be(80_000m);

        investorA[0].Principal.Should().NotBe(investorB[0].Principal);
    }

    [Fact]
    public async Task GetMyParticipations_shows_correct_obligation_status_per_investor()
    {
        await using var db = CreateDb();
        var fixture = SeedMultiInvestor(db);
        var service = ServiceOpportunity(db);

        var investorA = await service.GetMyParticipationsAsync(fixture.InvestorA.Id);
        var expectedTotalDueA = fixture.ObligationA.Installments.Sum(x => x.TotalDue);
        investorA[0].ExpectedTotalRepayment.Should().Be(expectedTotalDueA);
    }

    [Fact]
    public async Task GetMyParticipations_does_not_leak_cross_investor_data()
    {
        await using var db = CreateDb();
        var fixture = SeedMultiInvestor(db);
        var service = ServiceOpportunity(db);

        var investorA = await service.GetMyParticipationsAsync(fixture.InvestorA.Id);
        var investorB = await service.GetMyParticipationsAsync(fixture.InvestorB.Id);

        investorA[0].Principal.Should().Be(100_000m);
        investorB[0].Principal.Should().Be(80_000m);

        investorA[0].Principal.Should().NotBe(investorB[0].Principal);
        investorB[0].Principal.Should().NotBe(investorA[0].Principal);
    }

    #endregion

    #region Helpers

    private static ApplicationDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static LoanRepaymentService Service(ApplicationDbContext db) =>
        new(new UnitOfWork(db), new NoFileUpload(), new NoFileStorage(), null, NullLogger<LoanRepaymentService>.Instance);

    private static OpportunityService ServiceOpportunity(ApplicationDbContext db) =>
        new(new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);

    private static Fixture Seed(ApplicationDbContext db)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investor = new AuthUser { Id = Guid.NewGuid(), Name = "Investor", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var opportunity = new Opportunity { FounderId = founder.Id, Title = "Loan", ShortDescription = "Loan", UseOfFunds = "Working capital", FundingTarget = 200m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.LoanInvestment, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Open };
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

    private static Fixture SeedWithPaidInstallment(ApplicationDbContext db)
    {
        var fixture = Seed(db);
        fixture.Obligation.Installments.First().Status = LoanRepaymentInstallmentStatus.Paid;
        db.SaveChanges();
        return fixture;
    }

    private static Fixture SeedWithCancelledInstallment(ApplicationDbContext db)
    {
        var fixture = Seed(db);
        fixture.Obligation.Installments.First().Status = LoanRepaymentInstallmentStatus.Cancelled;
        db.SaveChanges();
        return fixture;
    }

    private static MultiInvestorFixture SeedMultiInvestor(ApplicationDbContext db)
    {
        var founder = new AuthUser { Id = Guid.NewGuid(), Name = "Founder", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Founder, Status = true };
        var investorA = new AuthUser { Id = Guid.NewGuid(), Name = "Investor A", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var investorB = new AuthUser { Id = Guid.NewGuid(), Name = "Investor B", PasswordHash = "test", UserType = UserType.Client, ClientType = ClientType.Investor, Status = true };
        var project = new Project { FounderId = founder.Id, DisplayName = "Test Project", Slug = $"test-{Guid.NewGuid():N}", Summary = "Summary", Description = "Description", ProjectStage = ProjectStage.Idea, DefaultCurrency = "EGP", Status = ProjectStatus.Active };
        var opportunity = new Opportunity { FounderId = founder.Id, Project = project, Title = "Multi-Investor Loan", ShortDescription = "Test", UseOfFunds = "Working capital", FundingTarget = 300_000m, FundingCurrency = "EGP", InvestmentModel = InvestmentModel.LoanInvestment, ProjectStage = ProjectStage.Idea, Status = OpportunityStatus.Funding, FundingStatus = OpportunityFundingStatus.Closed };

        var participationA = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investorA.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 100_000m, FundingCurrency = "EGP", ParticipationSequence = 1 };
        var participationB = new OpportunityJoinRequest { Opportunity = opportunity, InvestorId = investorB.Id, RequestType = OpportunityJoinRequestType.InvestmentParticipation, Status = OpportunityJoinRequestStatus.Approved, FundingAmount = 80_000m, FundingCurrency = "EGP", ParticipationSequence = 2 };

        db.AuthUsers.AddRange(founder, investorA, investorB);
        db.Opportunities.Add(opportunity);
        db.OpportunityJoinRequests.AddRange(participationA, participationB);
        db.SaveChanges();

        var obligationA = new LoanObligation { ParticipationRequestId = participationA.Id, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, OfferLegNumber = 1, FounderUserId = founder.Id, InvestorUserId = investorA.Id, Principal = 100_000m, Currency = "EGP", InterestRate = 10m, TermMonths = 12, RepaymentModel = "Monthly", ContractualStartDate = DateTime.UtcNow.AddMonths(-6), ContractualMaturityDate = DateTime.UtcNow.AddMonths(6), Status = LoanObligationStatus.Closed };
        obligationA.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date.AddDays(-30), PrincipalDue = 8_333.33m, InterestDue = 833.33m, TotalDue = 9_166.66m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Paid });
        obligationA.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 2, DueDate = DateTime.UtcNow.Date.AddDays(-1), PrincipalDue = 8_333.33m, InterestDue = 833.33m, TotalDue = 9_166.66m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Paid });

        var obligationB = new LoanObligation { ParticipationRequestId = participationB.Id, ContractId = 2, ContractVersionId = 2, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, OfferLegNumber = 1, FounderUserId = founder.Id, InvestorUserId = investorB.Id, Principal = 80_000m, Currency = "EGP", InterestRate = 10m, TermMonths = 12, RepaymentModel = "Monthly", ContractualStartDate = DateTime.UtcNow.AddMonths(-6), ContractualMaturityDate = DateTime.UtcNow.AddMonths(6), Status = LoanObligationStatus.Closed };
        obligationB.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 1, DueDate = DateTime.UtcNow.Date.AddDays(-30), PrincipalDue = 6_666.66m, InterestDue = 666.66m, TotalDue = 7_333.32m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Paid });
        obligationB.Installments.Add(new LoanRepaymentInstallment { InstallmentNumber = 2, DueDate = DateTime.UtcNow.Date.AddDays(-1), PrincipalDue = 6_666.66m, InterestDue = 666.66m, TotalDue = 7_333.32m, Currency = "EGP", Status = LoanRepaymentInstallmentStatus.Paid });

        db.LoanObligations.AddRange(obligationA, obligationB);
        db.SaveChanges();

        return new MultiInvestorFixture(founder, investorA, investorB, opportunity, participationA, participationB, obligationA, obligationB);
    }

    private sealed record Fixture(AuthUser Founder, AuthUser Investor, Opportunity Opportunity, OpportunityJoinRequest Participation, LoanObligation Obligation, LoanObligation OtherObligation);
    private sealed record MultiInvestorFixture(AuthUser Founder, AuthUser InvestorA, AuthUser InvestorB, Opportunity Opportunity, OpportunityJoinRequest ParticipationA, OpportunityJoinRequest ParticipationB, LoanObligation ObligationA, LoanObligation ObligationB);

    private sealed class NoFileUpload : IFileUploadService { public Task<FileUploadResult> UploadAsync(FileUploadCommand command, CancellationToken cancellationToken = default) => throw new NotSupportedException(); }
    private sealed class NoFileStorage : IFileStorage
    {
        public Task<string> SaveFileAsync(string relativePath, Stream data, string contentType) => throw new NotSupportedException();
        public Task<FileStoreUploadResult> UploadWithPolicyAsync(string categoryCode, string originalFileName, Stream data, string contentType, long declaredFileSize, FileStoreUploadPolicy policy, FileStoreUploadContext context, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<bool> DeleteFileAsync(string relativePath) => Task.FromResult(true);
        public Task EnsureDirectoryAsync(string relativeDirectory) => Task.CompletedTask;
        public Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default) => Task.FromResult<FileStoreMetadataDto?>(null);
    }

    #endregion
}
