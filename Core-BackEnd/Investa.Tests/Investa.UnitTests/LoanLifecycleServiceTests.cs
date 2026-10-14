using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Investa.UnitTests;

public sealed class LoanLifecycleServiceTests
{
    [Fact]
    public async Task Process_refreshes_due_partial_paid_and_overdue_states_without_defaulting()
    {
        await using var db = CreateDb();
        var obligation = SeedObligation(db, DateTime.UtcNow.AddMonths(12));
        var today = DateTime.UtcNow.Date;
        var due = AddInstallment(db, obligation, today, 100m, LoanRepaymentInstallmentStatus.Upcoming);
        var upcoming = AddInstallment(db, obligation, today.AddDays(2), 100m, LoanRepaymentInstallmentStatus.Due);
        var partial = AddInstallment(db, obligation, today.AddDays(-2), 100m, LoanRepaymentInstallmentStatus.Overdue, 40m);
        var paid = AddInstallment(db, obligation, today.AddDays(-3), 100m, LoanRepaymentInstallmentStatus.Overdue, 100m);
        var overdue = AddInstallment(db, obligation, today.AddDays(-4), 100m, LoanRepaymentInstallmentStatus.Upcoming);
        await db.SaveChangesAsync();
        AddAllocation(db, obligation, partial, 40m);
        AddAllocation(db, obligation, paid, 100m);
        await db.SaveChangesAsync();

        db.LoanObligations.Count().Should().Be(1);
        db.LoanObligations.Single().Status.Should().Be(LoanObligationStatus.Active);
        db.LoanObligations.Where(x => x.Status == LoanObligationStatus.Active || x.Status == LoanObligationStatus.Matured).Count().Should().Be(1);
        var result = await Service(db).ProcessAsync(today.AddHours(12));
        result.ObligationsEvaluated.Should().Be(1);
        var persisted = await db.LoanRepaymentInstallments.AsNoTracking().Where(x => x.LoanObligationId == obligation.Id).ToDictionaryAsync(x => x.Id);

        persisted[due.Id].Status.Should().Be(LoanRepaymentInstallmentStatus.Due);
        persisted[upcoming.Id].Status.Should().Be(LoanRepaymentInstallmentStatus.Upcoming);
        persisted[partial.Id].Status.Should().Be(LoanRepaymentInstallmentStatus.PartiallyPaid);
        persisted[paid.Id].Status.Should().Be(LoanRepaymentInstallmentStatus.Paid);
        persisted[overdue.Id].Status.Should().Be(LoanRepaymentInstallmentStatus.Overdue);
        var snapshot = (await Service(db).GetSnapshotsByObligationAsync([obligation.Id]))[obligation.Id];
        snapshot.OverdueAmount.Should().Be(160m);
        (await db.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id)).Status.Should().Be(LoanObligationStatus.Active);
        result.InstallmentsUpdated.Should().Be(5);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Maturity_sets_matured_with_balance_and_fully_repaid_at_zero_balance_including_early_repayment()
    {
        await using var maturedDb = CreateDb();
        var matured = SeedObligation(maturedDb, DateTime.UtcNow.AddDays(-1));
        var maturedInstallment = AddInstallment(maturedDb, matured, DateTime.UtcNow.AddDays(-2), 100m, LoanRepaymentInstallmentStatus.Overdue);
        await maturedDb.SaveChangesAsync();
        var service = Service(maturedDb);
        await service.ProcessAsync(DateTime.UtcNow);
        (await maturedDb.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == matured.Id)).Status.Should().Be(LoanObligationStatus.Matured);

        await using var repaidDb = CreateDb();
        var repaid = SeedObligation(repaidDb, DateTime.UtcNow.AddDays(-1));
        var repaidInstallment = AddInstallment(repaidDb, repaid, DateTime.UtcNow.AddDays(-2), 100m, LoanRepaymentInstallmentStatus.Overdue);
        await repaidDb.SaveChangesAsync();
        AddAllocation(repaidDb, repaid, repaidInstallment, 100m);
        await repaidDb.SaveChangesAsync();
        await Service(repaidDb).ProcessAsync(DateTime.UtcNow);
        var repaidState = await repaidDb.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == repaid.Id);
        repaidState.Status.Should().Be(LoanObligationStatus.FullyRepaid);
        repaidState.FullyRepaidAt.Should().NotBeNull();

        await using var earlyDb = CreateDb();
        var early = SeedObligation(earlyDb, DateTime.UtcNow.AddMonths(6));
        var earlyInstallment = AddInstallment(earlyDb, early, DateTime.UtcNow.AddDays(2), 100m, LoanRepaymentInstallmentStatus.Upcoming);
        await earlyDb.SaveChangesAsync();
        AddAllocation(earlyDb, early, earlyInstallment, 100m);
        await earlyDb.SaveChangesAsync();
        await Service(earlyDb).ProcessAsync(DateTime.UtcNow);
        var earlyState = await earlyDb.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == early.Id);
        earlyState.Status.Should().Be(LoanObligationStatus.FullyRepaid);
        earlyState.ContractualMaturityDate.Should().Be(early.ContractualMaturityDate);
    }

    [Fact]
    public async Task Pending_and_disputed_declarations_do_not_satisfy_full_repayment()
    {
        await using var db = CreateDb();
        var obligation = SeedObligation(db, DateTime.UtcNow.AddDays(-1));
        var installment = AddInstallment(db, obligation, DateTime.UtcNow.AddDays(-2), 100m, LoanRepaymentInstallmentStatus.Overdue);
        await db.SaveChangesAsync();
        db.LoanRepaymentDeclarations.AddRange(
            new LoanRepaymentDeclaration { LoanObligationId = obligation.Id, ParticipationId = 1, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, FounderUserId = Guid.NewGuid(), InvestorUserId = Guid.NewGuid(), Amount = 100m, Currency = "EGP", ExternalPaymentDate = DateTime.UtcNow, DeclaredByUserId = Guid.NewGuid(), Status = LoanRepaymentDeclarationStatus.PendingConfirmation },
            new LoanRepaymentDeclaration { LoanObligationId = obligation.Id, ParticipationId = 1, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, FounderUserId = Guid.NewGuid(), InvestorUserId = Guid.NewGuid(), Amount = 100m, Currency = "EGP", ExternalPaymentDate = DateTime.UtcNow, DeclaredByUserId = Guid.NewGuid(), Status = LoanRepaymentDeclarationStatus.Disputed });
        await db.SaveChangesAsync();

        await Service(db).ProcessAsync(DateTime.UtcNow);
        (await db.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id)).Status.Should().Be(LoanObligationStatus.Matured);
        (await db.LoanRepaymentAllocations.CountAsync()).Should().Be(0);
        (await db.LoanRepaymentInstallments.AsNoTracking().SingleAsync(x => x.Id == installment.Id)).Status.Should().Be(LoanRepaymentInstallmentStatus.Overdue);
    }

    [Fact]
    public async Task Default_requires_operator_and_reason_persists_balance_snapshot_and_is_idempotent()
    {
        await using var db = CreateDb();
        var obligation = SeedObligation(db, DateTime.UtcNow.AddMonths(6));
        AddInstallment(db, obligation, DateTime.UtcNow.AddDays(-1), 100m, LoanRepaymentInstallmentStatus.Overdue);
        await db.SaveChangesAsync();
        var service = Service(db);

        var forbidden = await Assert.ThrowsAsync<BusinessValidationException>(() => service.MarkDefaultAsync(Guid.NewGuid(), obligation.Id, "reason", false));
        forbidden.Code.Should().Be("LOAN_LIFECYCLE_FORBIDDEN");
        var missingReason = await Assert.ThrowsAsync<BusinessValidationException>(() => service.MarkDefaultAsync(Guid.NewGuid(), obligation.Id, " ", true));
        missingReason.Code.Should().Be("LOAN_DEFAULT_REASON_REQUIRED");

        var actor = Guid.NewGuid();
        var marked = await service.MarkDefaultAsync(actor, obligation.Id, "No payment after operational review", true);
        marked.Status.Should().Be(nameof(LoanObligationStatus.Defaulted));
        marked.DefaultOutstandingTotal.Should().Be(100m);
        marked.DefaultedByUserId.Should().Be(actor);
        var repeated = await service.MarkDefaultAsync(Guid.NewGuid(), obligation.Id, "different", true);
        repeated.DefaultReason.Should().Be("No payment after operational review");
        (await db.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id)).Status.Should().Be(LoanObligationStatus.Defaulted);
    }

    [Fact]
    public async Task Close_requires_fully_repaid_or_defaulted_and_is_terminal()
    {
        await using var db = CreateDb();
        var obligation = SeedObligation(db, DateTime.UtcNow.AddMonths(6));
        AddInstallment(db, obligation, DateTime.UtcNow.AddDays(1), 100m, LoanRepaymentInstallmentStatus.Upcoming);
        await db.SaveChangesAsync();
        var service = Service(db);
        var actor = Guid.NewGuid();

        var premature = await Assert.ThrowsAsync<BusinessValidationException>(() => service.CloseAsync(actor, obligation.Id, "close", true));
        premature.Code.Should().Be("LOAN_CLOSURE_NOT_ALLOWED");
        await service.MarkDefaultAsync(actor, obligation.Id, "Explicit operational default", true);
        var closed = await service.CloseAsync(actor, obligation.Id, "Resolution recorded", true);
        closed.Status.Should().Be(nameof(LoanObligationStatus.Closed));
        closed.ClosedFinalTotalOutstanding.Should().Be(100m);
        var repeated = await service.CloseAsync(Guid.NewGuid(), obligation.Id, "ignored", true);
        repeated.ClosureReason.Should().Be("Resolution recorded");
        var persisted = await db.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == obligation.Id);
        persisted.Status.Should().Be(LoanObligationStatus.Closed);
        persisted.ClosedByUserId.Should().Be(actor);
        (await db.AuditLogs.CountAsync(x => x.EntityType == nameof(LoanObligation))).Should().Be(2);
    }

    [Fact]
    public async Task Repeated_scheduler_runs_are_idempotent_and_isolate_obligations()
    {
        await using var db = CreateDb();
        var first = SeedObligation(db, DateTime.UtcNow.AddDays(-1));
        AddInstallment(db, first, DateTime.UtcNow.AddDays(-2), 100m, LoanRepaymentInstallmentStatus.Upcoming);
        var second = SeedObligation(db, DateTime.UtcNow.AddMonths(6));
        AddInstallment(db, second, DateTime.UtcNow.AddDays(2), 200m, LoanRepaymentInstallmentStatus.Upcoming);
        await db.SaveChangesAsync();
        var service = Service(db);

        var initial = await service.ProcessAsync(DateTime.UtcNow);
        var repeated = await service.ProcessAsync(DateTime.UtcNow.AddMinutes(1));

        initial.LifecycleTransitions.Should().Be(1);
        repeated.LifecycleTransitions.Should().Be(0);
        repeated.InstallmentsUpdated.Should().Be(0);
        (await db.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == first.Id)).Status.Should().Be(LoanObligationStatus.Matured);
        (await db.LoanObligations.AsNoTracking().SingleAsync(x => x.Id == second.Id)).Status.Should().Be(LoanObligationStatus.Active);
        (await db.PaymentTransactions.CountAsync()).Should().Be(0);
    }

    private static LoanLifecycleService Service(ApplicationDbContext db) =>
        new(new UnitOfWork(db), null, NullLogger<LoanLifecycleService>.Instance, Options.Create(new LoanLifecycleOptions { UpcomingReminderDays = 7 }));

    private static ApplicationDbContext CreateDb() => new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static LoanObligation SeedObligation(ApplicationDbContext db, DateTime maturity) {
        var obligation = new LoanObligation { ParticipationRequestId = 1, ContractId = 1, ContractVersionId = 1, AcceptedOfferId = 1, AcceptedOfferVersionNumber = 1, OfferLegId = 1, OfferLegNumber = 1, FounderUserId = Guid.NewGuid(), InvestorUserId = Guid.NewGuid(), Principal = 100m, Currency = "EGP", InterestRate = 12m, TermMonths = 12, RepaymentModel = "Monthly", ContractualStartDate = DateTime.UtcNow.AddMonths(-1), ContractualMaturityDate = maturity, Status = LoanObligationStatus.Active };
        db.LoanObligations.Add(obligation);
        db.SaveChanges();
        return obligation;
    }

    private static LoanRepaymentInstallment AddInstallment(ApplicationDbContext db, LoanObligation obligation, DateTime dueDate, decimal total, LoanRepaymentInstallmentStatus status, decimal allocated = 0m) {
        var installment = new LoanRepaymentInstallment { LoanObligationId = obligation.Id, InstallmentNumber = db.LoanRepaymentInstallments.Count(x => x.LoanObligationId == obligation.Id) + 1, DueDate = dueDate, PrincipalDue = total, InterestDue = 0m, TotalDue = total, Currency = "EGP", Status = status };
        obligation.Installments.Add(installment);
        if (allocated > 0m) db.SaveChanges();
        return installment;
    }

    private static void AddAllocation(ApplicationDbContext db, LoanObligation obligation, LoanRepaymentInstallment installment, decimal amount) => db.LoanRepaymentAllocations.Add(new LoanRepaymentAllocation { LoanRepaymentDeclarationId = 1, LoanObligationId = obligation.Id, LoanRepaymentInstallmentId = installment.Id, InstallmentNumber = installment.InstallmentNumber, PrincipalAllocated = amount, InterestAllocated = 0m, TotalAllocated = amount });
}
