using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Application.Services;

public sealed class LoanLifecycleService(
    IUnitOfWork uow,
    IUserNotificationService? notifications,
    ILogger<LoanLifecycleService> logger,
    IOptions<LoanLifecycleOptions>? options = null) : ILoanLifecycleService
{
    private static readonly SemaphoreSlim LifecycleGate = new(1, 1);
    private readonly int _upcomingReminderDays = Math.Max(0, options?.Value.UpcomingReminderDays ?? 7);

    public async Task<LoanLifecycleProcessResultDto> ProcessAsync(DateTime? asOfUtc = null, CancellationToken cancellationToken = default)
    {
        var now = asOfUtc?.ToUniversalTime() ?? DateTime.UtcNow;
        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            var obligations = (await uow.Repository<LoanObligation>().FindWithIncludesAsync(
                x => true,
                x => x.Installments))
                .Where(x => x.Status is LoanObligationStatus.Active or LoanObligationStatus.Matured)
                .ToList();
            if (obligations.Count == 0)
                return new LoanLifecycleProcessResultDto();

            var obligationIds = obligations.Select(x => x.Id).ToHashSet();
            var allocations = await uow.Repository<LoanRepaymentAllocation>().Query()
                .Where(x => obligationIds.Contains(x.LoanObligationId))
                .ToListAsync(cancellationToken);
            var participationIds = obligations.Select(x => x.ParticipationRequestId).ToHashSet();
            var participationRows = await uow.Repository<OpportunityJoinRequest>().Query()
                .Where(x => participationIds.Contains(x.Id))
                .ToListAsync(cancellationToken);
            var opportunityIds = participationRows.Select(x => x.OpportunityId).ToHashSet();
            var opportunities = await uow.Repository<Opportunity>().Query()
                .Where(x => opportunityIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, cancellationToken);

            var notificationsToSend = new List<NotificationEventCreation>();
            var installmentsUpdated = 0;
            var transitions = 0;
            foreach (var obligation in obligations)
            {
                var priorStatus = obligation.Status;
                var obligationAllocations = allocations.Where(x => x.LoanObligationId == obligation.Id).ToList();
                var priorInstallmentStatuses = obligation.Installments.ToDictionary(x => x.Id, x => x.Status);
                var changedInstallments = RefreshInstallmentStatuses(obligation, obligationAllocations, now, _upcomingReminderDays, notificationsToSend, participationRows, opportunities);
                installmentsUpdated += changedInstallments;
                foreach (var installment in obligation.Installments.Where(x => priorInstallmentStatuses.TryGetValue(x.Id, out var status) && status != x.Status))
                    await uow.Repository<AuditLog>().AddAsync(BuildInstallmentAudit(obligation, installment, priorInstallmentStatuses[installment.Id], now));

                var balance = Balance.From(obligation, obligationAllocations);
                if (balance.IsFullyRepaid && obligation.Status is LoanObligationStatus.Active or LoanObligationStatus.Matured)
                {
                    obligation.Status = LoanObligationStatus.FullyRepaid;
                    obligation.FullyRepaidAt ??= now;
                }
                else if (!balance.IsFullyRepaid && obligation.Status == LoanObligationStatus.Active && now.Date >= obligation.ContractualMaturityDate.ToUniversalTime().Date)
                {
                    obligation.Status = LoanObligationStatus.Matured;
                    obligation.MaturedAt ??= now;
                }

                if (obligation.Status != priorStatus)
                {
                    transitions++;
                    await uow.Repository<AuditLog>().AddAsync(BuildAudit(
                        null,
                        "LifecycleTransition",
                        obligation,
                        new { PreviousStatus = priorStatus.ToString(), NewStatus = obligation.Status.ToString(), asOfUtc = now, balance.PrincipalOutstanding, balance.InterestOutstanding, balance.TotalOutstanding },
                        now));
                    AddLifecycleNotifications(obligation, obligation.Status, now, notificationsToSend, participationRows, opportunities);
                }
            }

            if (installmentsUpdated > 0 || transitions > 0)
                await uow.SaveChangesAsync();

            foreach (var notification in notificationsToSend)
                await NotifyAsync(notification, cancellationToken);

            return new LoanLifecycleProcessResultDto
            {
                ObligationsEvaluated = obligations.Count,
                InstallmentsUpdated = installmentsUpdated,
                LifecycleTransitions = transitions,
                NotificationsRequested = notificationsToSend.Count
            };
        }
        finally
        {
            LifecycleGate.Release();
        }
    }

    public async Task<IReadOnlyDictionary<int, LoanLifecycleSnapshotDto>> GetSnapshotsByObligationAsync(IEnumerable<int> obligationIds, CancellationToken cancellationToken = default)
    {
        var ids = obligationIds.Distinct().ToHashSet();
        if (ids.Count == 0) return new Dictionary<int, LoanLifecycleSnapshotDto>();
        var obligations = await uow.Repository<LoanObligation>().Query().Where(x => ids.Contains(x.Id)).Include(x => x.Installments).ToListAsync(cancellationToken);
        var allocations = await uow.Repository<LoanRepaymentAllocation>().Query().Where(x => ids.Contains(x.LoanObligationId)).ToListAsync(cancellationToken);
        return obligations.ToDictionary(x => x.Id, x => ToSnapshot(x, allocations.Where(a => a.LoanObligationId == x.Id)));
    }

    public async Task<LoanLifecycleSnapshotDto> MarkDefaultAsync(Guid actorId, int loanObligationId, string reason, bool isAuthorizedOperator, CancellationToken cancellationToken = default)
    {
        EnsureOperator(isAuthorizedOperator);
        var normalizedReason = RequireReason(reason, "LOAN_DEFAULT_REASON_REQUIRED");
        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            var obligation = await GetTrackedObligationAsync(loanObligationId, cancellationToken);
            if (obligation.Status == LoanObligationStatus.Defaulted)
                return ToSnapshot(obligation, await GetAllocationsAsync(loanObligationId, cancellationToken));
            if (obligation.Status == LoanObligationStatus.Closed)
                throw new BusinessValidationException("LOAN_LIFECYCLE_ALREADY_CLOSED", "A closed Loan cannot be defaulted.");
            if (obligation.Status is LoanObligationStatus.PendingFunding or LoanObligationStatus.FullyRepaid)
                throw new BusinessValidationException("LOAN_DEFAULT_NOT_ALLOWED", "Only an active or matured Loan can be marked defaulted.");

            var allocations = await GetAllocationsAsync(loanObligationId, cancellationToken);
            var balance = Balance.From(obligation, allocations);
            var now = DateTime.UtcNow;
            obligation.Status = LoanObligationStatus.Defaulted;
            obligation.DefaultedAt = now;
            obligation.DefaultedByUserId = actorId;
            obligation.DefaultReason = normalizedReason;
            obligation.DefaultOutstandingPrincipal = balance.PrincipalOutstanding;
            obligation.DefaultOutstandingInterest = balance.InterestOutstanding;
            obligation.DefaultOutstandingTotal = balance.TotalOutstanding;
            await uow.Repository<AuditLog>().AddAsync(BuildAudit(actorId, "Defaulted", obligation, new { reason = normalizedReason, balance.PrincipalOutstanding, balance.InterestOutstanding, balance.TotalOutstanding }, now));
            await uow.SaveChangesAsync();
            await NotifyForObligationAsync(obligation, "LoanDefaulted", "Loan default recorded", "A controlled operational default was recorded for this Loan.", "warning", actorId, cancellationToken);
            return ToSnapshot(obligation, allocations);
        }
        finally
        {
            LifecycleGate.Release();
        }
    }

    public async Task<LoanLifecycleSnapshotDto> CloseAsync(Guid actorId, int loanObligationId, string reason, bool isAuthorizedOperator, CancellationToken cancellationToken = default)
    {
        EnsureOperator(isAuthorizedOperator);
        var normalizedReason = RequireReason(reason, "LOAN_CLOSURE_REASON_REQUIRED");
        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            var obligation = await GetTrackedObligationAsync(loanObligationId, cancellationToken);
            if (obligation.Status == LoanObligationStatus.Closed)
                return ToSnapshot(obligation, await GetAllocationsAsync(loanObligationId, cancellationToken));
            if (obligation.Status is not (LoanObligationStatus.FullyRepaid or LoanObligationStatus.Defaulted))
                throw new BusinessValidationException("LOAN_CLOSURE_NOT_ALLOWED", "A Loan can close only after full repayment or an explicit default.");

            var allocations = await GetAllocationsAsync(loanObligationId, cancellationToken);
            var balance = Balance.From(obligation, allocations);
            var now = DateTime.UtcNow;
            obligation.Status = LoanObligationStatus.Closed;
            obligation.ClosedAt = now;
            obligation.ClosedByUserId = actorId;
            obligation.ClosureReason = normalizedReason;
            obligation.ClosedFinalPrincipalOutstanding = balance.PrincipalOutstanding;
            obligation.ClosedFinalInterestOutstanding = balance.InterestOutstanding;
            obligation.ClosedFinalTotalOutstanding = balance.TotalOutstanding;
            await uow.Repository<AuditLog>().AddAsync(BuildAudit(actorId, "Closed", obligation, new { reason = normalizedReason, balance.PrincipalOutstanding, balance.InterestOutstanding, balance.TotalOutstanding }, now));
            await uow.SaveChangesAsync();
            await NotifyForObligationAsync(obligation, "LoanClosed", "Loan closed", "This Loan lifecycle has been formally closed.", "success", actorId, cancellationToken);
            return ToSnapshot(obligation, allocations);
        }
        finally
        {
            LifecycleGate.Release();
        }
    }

    private async Task<LoanObligation> GetTrackedObligationAsync(int id, CancellationToken cancellationToken)
    {
        return await uow.Repository<LoanObligation>().GetSingleAsync(x => x.Id == id, x => x.Installments)
            ?? throw new BusinessValidationException("LOAN_OBLIGATION_NOT_FOUND", "The Loan obligation was not found.");
    }

    private async Task<List<LoanRepaymentAllocation>> GetAllocationsAsync(int obligationId, CancellationToken cancellationToken) =>
        (await uow.Repository<LoanRepaymentAllocation>().FindAsync(x => x.LoanObligationId == obligationId)).ToList();

    private static int RefreshInstallmentStatuses(
        LoanObligation obligation,
        IReadOnlyCollection<LoanRepaymentAllocation> allocations,
        DateTime now,
        int upcomingReminderDays,
        ICollection<NotificationEventCreation> notificationsToSend,
        IReadOnlyCollection<OpportunityJoinRequest> participations,
        IReadOnlyDictionary<int, Opportunity> opportunities)
    {
        var today = now.Date;
        var paid = allocations.GroupBy(x => x.LoanRepaymentInstallmentId).ToDictionary(x => x.Key, x => x.Sum(a => a.TotalAllocated));
        var changed = 0;
        foreach (var installment in obligation.Installments)
        {
            if (installment.Status == LoanRepaymentInstallmentStatus.Cancelled) continue;
            var amountPaid = paid.GetValueOrDefault(installment.Id);
            var nextStatus = amountPaid >= installment.TotalDue
                ? LoanRepaymentInstallmentStatus.Paid
                : amountPaid > 0m
                    ? LoanRepaymentInstallmentStatus.PartiallyPaid
                    : installment.DueDate.ToUniversalTime().Date < today
                        ? LoanRepaymentInstallmentStatus.Overdue
                        : installment.DueDate.ToUniversalTime().Date == today ? LoanRepaymentInstallmentStatus.Due : LoanRepaymentInstallmentStatus.Upcoming;
            if (nextStatus != installment.Status)
            {
                installment.Status = nextStatus;
                changed++;
            }

            var notificationStatus = nextStatus == LoanRepaymentInstallmentStatus.PartiallyPaid && installment.DueDate.ToUniversalTime().Date < today
                ? LoanRepaymentInstallmentStatus.Overdue
                : nextStatus;
            if (notificationStatus is LoanRepaymentInstallmentStatus.Due or LoanRepaymentInstallmentStatus.Overdue
                || notificationStatus == LoanRepaymentInstallmentStatus.Upcoming && installment.DueDate.ToUniversalTime().Date <= today.AddDays(upcomingReminderDays))
                AddInstallmentNotification(obligation, installment, notificationStatus, notificationsToSend, participations, opportunities);
        }
        return changed;
    }

    private static void AddInstallmentNotification(LoanObligation obligation, LoanRepaymentInstallment installment, LoanRepaymentInstallmentStatus status, ICollection<NotificationEventCreation> notifications, IReadOnlyCollection<OpportunityJoinRequest> participations, IReadOnlyDictionary<int, Opportunity> opportunities)
    {
        var participation = participations.FirstOrDefault(x => x.Id == obligation.ParticipationRequestId);
        if (participation is null || !opportunities.TryGetValue(participation.OpportunityId, out var opportunity)) return;
        var (eventType, title, body, severity) = status switch
        {
            LoanRepaymentInstallmentStatus.Due => ("LoanInstallmentDue", "Loan installment due today", "A contractual Loan installment is due today.", "info"),
            LoanRepaymentInstallmentStatus.Overdue => ("LoanInstallmentOverdue", "Loan installment overdue", "A contractual Loan installment remains outstanding after its due date.", "warning"),
            _ => ("LoanInstallmentUpcoming", "Loan installment upcoming", "A contractual Loan installment is approaching its due date.", "info")
        };
        var entity = $"obligation:{obligation.Id}:installment:{installment.Id}:{installment.DueDate:yyyyMMdd}";
        foreach (var recipient in new[] { obligation.FounderUserId, obligation.InvestorUserId }.Distinct())
            notifications.Add(new NotificationEventCreation(recipient, eventType, entity, title, body, severity, $"/admin/opportunities/{opportunity.Id}/room#loan-{obligation.Id}", null, opportunity.Id, "loan-lifecycle"));
    }

    private static void AddLifecycleNotifications(LoanObligation obligation, LoanObligationStatus status, DateTime now, ICollection<NotificationEventCreation> notifications, IReadOnlyCollection<OpportunityJoinRequest> participations, IReadOnlyDictionary<int, Opportunity> opportunities)
    {
        var participation = participations.FirstOrDefault(x => x.Id == obligation.ParticipationRequestId);
        if (participation is null || !opportunities.TryGetValue(participation.OpportunityId, out var opportunity)) return;
        var details = status switch
        {
            LoanObligationStatus.Matured => ("LoanMaturityReached", "Loan maturity reached", "The contractual Loan maturity date has been reached and an outstanding balance remains.", "warning"),
            LoanObligationStatus.FullyRepaid => ("LoanFullyRepaid", "Loan fully repaid", "Confirmed repayment allocations have satisfied the full contractual Loan balance.", "success"),
            _ => (string.Empty, string.Empty, string.Empty, string.Empty)
        };
        if (string.IsNullOrEmpty(details.Item1)) return;
        foreach (var recipient in new[] { obligation.FounderUserId, obligation.InvestorUserId }.Distinct())
            notifications.Add(new NotificationEventCreation(recipient, details.Item1, $"obligation:{obligation.Id}:{status}", details.Item2, details.Item3, details.Item4, $"/admin/opportunities/{opportunity.Id}/room#loan-{obligation.Id}", null, opportunity.Id, "loan-lifecycle"));
    }

    private async Task NotifyForObligationAsync(LoanObligation obligation, string eventType, string title, string body, string severity, Guid actorId, CancellationToken cancellationToken)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(obligation.ParticipationRequestId);
        if (participation is null) return;
        foreach (var recipient in new[] { obligation.FounderUserId, obligation.InvestorUserId }.Distinct())
            await NotifyAsync(new NotificationEventCreation(recipient, eventType, $"obligation:{obligation.Id}:{eventType}", title, body, severity, $"/admin/opportunities/{participation.OpportunityId}/room#loan-{obligation.Id}", actorId, participation.OpportunityId, "loan-lifecycle"), cancellationToken);
    }

    private async Task NotifyAsync(NotificationEventCreation notification, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try { await notifications.CreateEventAsync(notification, cancellationToken); }
        catch (Exception ex) { logger.LogWarning(ex, "Loan lifecycle notification failed for {EventType}/{BusinessEntityId}", notification.EventType, notification.BusinessEntityId); }
    }

    private static LoanLifecycleSnapshotDto ToSnapshot(LoanObligation obligation, IEnumerable<LoanRepaymentAllocation> allocations, DateTime? asOfUtc = null)
    {
        var allocationRows = allocations.ToList();
        var today = (asOfUtc?.ToUniversalTime() ?? DateTime.UtcNow).Date;
        var balance = Balance.From(obligation, allocationRows);
        var overdue = obligation.Installments
            .Where(x => x.DueDate.ToUniversalTime().Date < today)
            .Sum(x => Math.Max(0m, x.TotalDue - allocationRows.Where(a => a.LoanRepaymentInstallmentId == x.Id).Sum(a => a.TotalAllocated)));
        var next = obligation.Installments.Where(x => x.Status is (LoanRepaymentInstallmentStatus.Upcoming or LoanRepaymentInstallmentStatus.Due or LoanRepaymentInstallmentStatus.Overdue or LoanRepaymentInstallmentStatus.PartiallyPaid) && x.TotalDue > allocationRows.Where(a => a.LoanRepaymentInstallmentId == x.Id).Sum(a => a.TotalAllocated)).OrderBy(x => x.DueDate).ThenBy(x => x.InstallmentNumber).FirstOrDefault();
        return new LoanLifecycleSnapshotDto
        {
            LoanObligationId = obligation.Id,
            Status = obligation.Status.ToString(),
            MaturityDate = obligation.ContractualMaturityDate,
            OverdueAmount = overdue,
            NextDueDate = next?.DueDate,
            NextDueAmount = next is null ? null : Math.Max(0m, next.TotalDue - allocationRows.Where(a => a.LoanRepaymentInstallmentId == next.Id).Sum(a => a.TotalAllocated)),
            FullyRepaidAt = obligation.FullyRepaidAt,
            DefaultedAt = obligation.DefaultedAt,
            DefaultedByUserId = obligation.DefaultedByUserId,
            DefaultReason = obligation.DefaultReason,
            DefaultOutstandingPrincipal = obligation.DefaultOutstandingPrincipal,
            DefaultOutstandingInterest = obligation.DefaultOutstandingInterest,
            DefaultOutstandingTotal = obligation.DefaultOutstandingTotal,
            ClosedAt = obligation.ClosedAt,
            ClosedByUserId = obligation.ClosedByUserId,
            ClosureReason = obligation.ClosureReason,
            ClosedFinalPrincipalOutstanding = obligation.ClosedFinalPrincipalOutstanding,
            ClosedFinalInterestOutstanding = obligation.ClosedFinalInterestOutstanding,
            ClosedFinalTotalOutstanding = obligation.ClosedFinalTotalOutstanding
        };
    }

    private static void EnsureOperator(bool isAuthorizedOperator)
    {
        if (!isAuthorizedOperator)
            throw new BusinessValidationException("LOAN_LIFECYCLE_FORBIDDEN", "Only an authorized lifecycle operator can perform this action.");
    }

    private static string RequireReason(string reason, string code)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new BusinessValidationException(code, "A reason is required.");
        var normalized = reason.Trim();
        if (normalized.Length > 2000) throw new BusinessValidationException(code, "The reason cannot exceed 2,000 characters.");
        return normalized;
    }

    private static AuditLog BuildAudit(Guid? actor, string action, LoanObligation obligation, object payload, DateTime now) => new()
    {
        UserId = actor,
        EntityType = nameof(LoanObligation),
        EntityId = obligation.Id.ToString(),
        Action = action,
        NewValues = JsonSerializer.Serialize(payload),
        Timestamp = now
    };

    private static AuditLog BuildInstallmentAudit(LoanObligation obligation, LoanRepaymentInstallment installment, LoanRepaymentInstallmentStatus previousStatus, DateTime now) => new()
    {
        EntityType = nameof(LoanRepaymentInstallment),
        EntityId = installment.Id.ToString(),
        Action = "LifecycleStatusChanged",
        NewValues = JsonSerializer.Serialize(new { obligationId = obligation.Id, installmentNumber = installment.InstallmentNumber, PreviousStatus = previousStatus.ToString(), NewStatus = installment.Status.ToString() }),
        Timestamp = now
    };

    private sealed record Balance(decimal PrincipalOutstanding, decimal InterestOutstanding, decimal TotalOutstanding)
    {
        public bool IsFullyRepaid => PrincipalOutstanding <= 0m && InterestOutstanding <= 0m;

        public static Balance From(LoanObligation obligation, IEnumerable<LoanRepaymentAllocation> allocations)
        {
            var rows = allocations.ToList();
            return new Balance(
                Math.Max(0m, obligation.Installments.Sum(x => x.PrincipalDue) - rows.Sum(x => x.PrincipalAllocated)),
                Math.Max(0m, obligation.Installments.Sum(x => x.InterestDue) - rows.Sum(x => x.InterestAllocated)),
                Math.Max(0m, obligation.Installments.Sum(x => x.TotalDue) - rows.Sum(x => x.TotalAllocated)));
        }
    }
}
