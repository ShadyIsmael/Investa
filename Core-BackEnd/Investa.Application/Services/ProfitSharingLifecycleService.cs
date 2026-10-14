using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public sealed class ProfitSharingLifecycleService(
    IUnitOfWork uow,
    IUserNotificationService? notifications,
    ILogger<ProfitSharingLifecycleService> logger) : IProfitSharingLifecycleService
{
    private const string ClosureSnapshotVersion = "profit-sharing-closure-v1";
    private static readonly SemaphoreSlim LifecycleGate = new(1, 1);

    public async Task<ProfitSharingLifecycleProcessResultDto> ProcessLifecycleAsync(DateTime? asOfUtc = null, CancellationToken cancellationToken = default)
    {
        var now = asOfUtc?.ToUniversalTime() ?? DateTime.UtcNow;
        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            var obligations = await LoadLifecycleObligationsAsync(cancellationToken);
            if (obligations.Count == 0) return new ProfitSharingLifecycleProcessResultDto();

            var participationIds = obligations.Select(x => x.ParticipationRequestId).ToHashSet();
            var participations = await uow.Repository<OpportunityJoinRequest>().Query()
                .Where(x => participationIds.Contains(x.Id)).ToListAsync(cancellationToken);
            var opportunityIds = participations.Select(x => x.OpportunityId).ToHashSet();
            var opportunities = await uow.Repository<Opportunity>().Query()
                .Where(x => opportunityIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, cancellationToken);
            var notificationsToSend = new List<NotificationEventCreation>();
            var matured = 0;
            var settled = 0;

            foreach (var obligation in obligations)
            {
                var previous = obligation.Status;
                if (obligation.Status == ProfitSharingObligationStatus.Active
                    && now >= obligation.ContractualEndDate.ToUniversalTime())
                {
                    obligation.Status = ProfitSharingObligationStatus.Matured;
                    obligation.MaturedAt ??= now;
                    matured++;
                    await uow.Repository<ProfitSharingObligation>().UpdateAsync(obligation);
                    await AddLifecycleAuditAsync(obligation, previous, obligation.Status, now, null);
                    AddLifecycleNotifications(obligation, "Matured", now, participations, opportunities, notificationsToSend);
                }
                else if (obligation.Status == ProfitSharingObligationStatus.Matured && IsSettlementEligible(obligation))
                {
                    obligation.Status = ProfitSharingObligationStatus.Settled;
                    obligation.SettledAt ??= now;
                    settled++;
                    await uow.Repository<ProfitSharingObligation>().UpdateAsync(obligation);
                    await AddLifecycleAuditAsync(obligation, previous, obligation.Status, now, null);
                    AddLifecycleNotifications(obligation, "Settled", now, participations, opportunities, notificationsToSend);
                }
            }

            if (matured > 0 || settled > 0)
                await uow.SaveChangesAsync();
            foreach (var notification in notificationsToSend)
                await NotifyAsync(notification, cancellationToken);

            return new ProfitSharingLifecycleProcessResultDto
            {
                ObligationsEvaluated = obligations.Count,
                Matured = matured,
                Settled = settled,
                NotificationsRequested = notificationsToSend.Count
            };
        }
        finally { LifecycleGate.Release(); }
    }

    public async Task<ProfitSharingObligationDto> CloseAsync(Guid actorId, int obligationId, string reason, bool isAuthorizedOperator, CancellationToken cancellationToken = default)
    {
        if (!isAuthorizedOperator)
            throw new BusinessValidationException("PROFIT_SHARING_CLOSURE_FORBIDDEN", "Only Admin or Operations can close a Profit Sharing obligation.");
        if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length > 2000)
            throw new BusinessValidationException("PROFIT_SHARING_CLOSURE_REASON_REQUIRED", "A closure reason between 1 and 2,000 characters is required.");

        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            var obligation = await LoadObligationAsync(obligationId, cancellationToken)
                ?? throw new BusinessValidationException("PROFIT_SHARING_OBLIGATION_NOT_FOUND", "The Profit Sharing obligation was not found.");
            if (obligation.Status == ProfitSharingObligationStatus.Closed)
                return ToDto(obligation);
            if (obligation.Status != ProfitSharingObligationStatus.Settled)
                throw new BusinessValidationException("PROFIT_SHARING_CLOSURE_NOT_ALLOWED", "A Profit Sharing obligation can close only after settlement.");
            if (!IsSettlementEligible(obligation))
                throw new BusinessValidationException("PROFIT_SHARING_SETTLEMENT_INCOMPLETE", "The obligation no longer satisfies the settlement conditions.");

            var now = DateTime.UtcNow;
            var totals = Totals.From(obligation);
            var snapshot = new ClosureSnapshot(
                obligation.ParticipationRequestId,
                obligation.ContractId,
                obligation.ContractVersionId,
                obligation.AcceptedOfferId,
                obligation.OfferLegId,
                obligation.FounderUserId,
                obligation.InvestorUserId,
                obligation.ContributionAmount,
                obligation.Currency,
                obligation.ProfitSharePercentage,
                obligation.ReportingFrequency,
                obligation.ContractualStartDate,
                obligation.ContractualEndDate,
                obligation.ReportingPeriods.Count,
                totals.TotalDeclaredResult,
                totals.TotalEntitlement,
                totals.TotalConfirmedDistributed,
                totals.TotalDisputed,
                totals.TotalDistributionOutstanding,
                obligation.SettledAt ?? now,
                now,
                actorId,
                reason.Trim(),
                ClosureSnapshotVersion);
            var snapshotJson = JsonSerializer.Serialize(snapshot);
            obligation.Status = ProfitSharingObligationStatus.Closed;
            obligation.ClosedAt = now;
            obligation.ClosedByUserId = actorId;
            obligation.ClosureReason = reason.Trim();
            obligation.ClosureSnapshotJson = snapshotJson;
            obligation.ClosureSnapshotHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(snapshotJson))).ToLowerInvariant();
            obligation.ClosureSnapshotVersion = ClosureSnapshotVersion;
            await uow.Repository<ProfitSharingObligation>().UpdateAsync(obligation);
            await AddLifecycleAuditAsync(obligation, ProfitSharingObligationStatus.Settled, obligation.Status, now, reason.Trim(), snapshot);
            await uow.SaveChangesAsync();
            var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(obligation.ParticipationRequestId);
            var opportunity = participation is null ? null : await uow.Repository<Opportunity>().GetByIdAsync(participation.OpportunityId);
            if (opportunity is not null)
                await NotifyLifecycleAsync(obligation, opportunity, "Closed", now, cancellationToken);
            return ToDto(obligation);
        }
        finally { LifecycleGate.Release(); }
    }

    private async Task<List<ProfitSharingObligation>> LoadLifecycleObligationsAsync(CancellationToken cancellationToken) =>
        await uow.Repository<ProfitSharingObligation>().Query()
            .Where(x => x.Status == ProfitSharingObligationStatus.Active || x.Status == ProfitSharingObligationStatus.Matured)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Declaration)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Entitlement)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.DistributionDeclarations)
            .ToListAsync(cancellationToken);

    private async Task<ProfitSharingObligation?> LoadObligationAsync(int id, CancellationToken cancellationToken) =>
        await uow.Repository<ProfitSharingObligation>().Query()
            .Where(x => x.Id == id)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Declaration)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Entitlement)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.DistributionDeclarations)
            .SingleOrDefaultAsync(cancellationToken);

    private static bool IsSettlementEligible(ProfitSharingObligation obligation)
    {
        if (obligation.Status is not (ProfitSharingObligationStatus.Matured or ProfitSharingObligationStatus.Settled)) return false;
        var periods = obligation.ReportingPeriods.OrderBy(x => x.PeriodNumber).ToList();
        if (periods.Count == 0 || periods.Count(x => x.IsFinalPeriod) != 1) return false;
        var final = periods.Single(x => x.IsFinalPeriod);
        if (final.EndDate != obligation.ContractualEndDate) return false;
        if (periods.Any(x => !IsPeriodComplete(x))) return false;
        var totals = Totals.From(obligation);
        return totals.TotalDistributionOutstanding <= 0m
            && totals.TotalPendingConfirmation <= 0m
            && !periods.SelectMany(x => x.DistributionDeclarations).Any(x => x.Status is ProfitSharingDistributionDeclarationStatus.PendingConfirmation or ProfitSharingDistributionDeclarationStatus.Disputed);
    }

    private static bool IsPeriodComplete(ProfitSharingReportingPeriod period)
    {
        if (period.Declaration is null) return false;
        if (period.Entitlement is null) return period.Status == ProfitSharingReportingPeriodStatus.NoEntitlement;
        var confirmed = period.DistributionDeclarations.Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Confirmed).Sum(x => x.DeclaredAmount);
        return period.Entitlement.EntitlementAmount <= 0m
            ? period.Status == ProfitSharingReportingPeriodStatus.NoEntitlement
            : period.Entitlement.DistributionOutstanding <= 0m && confirmed >= period.Entitlement.EntitlementAmount;
    }

    private static void AddLifecycleNotifications(ProfitSharingObligation obligation, string status, DateTime now, IReadOnlyCollection<OpportunityJoinRequest> participations, IReadOnlyDictionary<int, Opportunity> opportunities, ICollection<NotificationEventCreation> output)
    {
        var participation = participations.FirstOrDefault(x => x.Id == obligation.ParticipationRequestId);
        if (participation is null || !opportunities.TryGetValue(participation.OpportunityId, out var opportunity)) return;
        var title = status == "Matured" ? "Profit Sharing maturity reached" : "Profit Sharing settled";
        var body = status == "Matured"
            ? "The contractual Profit Sharing term has completed. Reporting or external distribution obligations may still remain."
            : "All recorded Profit Sharing entitlements have been confirmed as distributed externally between the parties.";
        foreach (var recipient in new[] { obligation.FounderUserId, obligation.InvestorUserId }.Distinct())
            output.Add(new NotificationEventCreation(recipient, $"ProfitSharing{status}", $"obligation:{obligation.Id}:{status}", title, body, status == "Matured" ? "warning" : "success", $"/admin/opportunities/{opportunity.Id}/room", null, opportunity.Id, "profit-sharing"));
    }

    private async Task NotifyLifecycleAsync(ProfitSharingObligation obligation, Opportunity opportunity, string status, DateTime now, CancellationToken cancellationToken)
    {
        var title = "Profit Sharing closed";
        var body = "The Profit Sharing lifecycle was administratively closed after settlement. FOPX did not process or verify funds.";
        foreach (var recipient in new[] { obligation.FounderUserId, obligation.InvestorUserId }.Distinct())
            await NotifyAsync(new NotificationEventCreation(recipient, "ProfitSharingClosed", $"obligation:{obligation.Id}:Closed", title, body, "success", $"/admin/opportunities/{opportunity.Id}/room", obligation.ClosedByUserId, opportunity.Id, "profit-sharing"), cancellationToken);
    }

    private async Task NotifyAsync(NotificationEventCreation notification, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try { await notifications.CreateEventAsync(notification, cancellationToken); }
        catch (Exception ex) { logger.LogWarning(ex, "Profit Sharing lifecycle notification failed for {EventType}", notification.EventType); }
    }

    private async Task AddLifecycleAuditAsync(ProfitSharingObligation obligation, ProfitSharingObligationStatus previous, ProfitSharingObligationStatus next, DateTime now, string? reason, ClosureSnapshot? snapshot = null)
    {
        var totals = Totals.From(obligation);
        await uow.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = next == ProfitSharingObligationStatus.Closed ? obligation.ClosedByUserId : null,
            EntityType = nameof(ProfitSharingObligation),
            EntityId = obligation.Id.ToString(),
            Action = $"ProfitSharing{next}",
            Changes = JsonSerializer.Serialize(new { previousState = previous.ToString(), newState = next.ToString(), actor = next == ProfitSharingObligationStatus.Closed ? obligation.ClosedByUserId : (Guid?)null, timestamp = now, reason, totals, closureSnapshot = snapshot }),
            Timestamp = now
        });
    }

    private static ProfitSharingObligationDto ToDto(ProfitSharingObligation obligation)
    {
        var totals = Totals.From(obligation);
        return new ProfitSharingObligationDto
        {
            Id = obligation.Id,
            ParticipationId = obligation.ParticipationRequestId,
            ContractId = obligation.ContractId,
            ContractVersionId = obligation.ContractVersionId,
            AcceptedOfferId = obligation.AcceptedOfferId,
            OfferLegId = obligation.OfferLegId,
            FounderUserId = obligation.FounderUserId,
            InvestorUserId = obligation.InvestorUserId,
            ContributionAmount = obligation.ContributionAmount,
            Currency = obligation.Currency,
            ProfitSharePercentage = obligation.ProfitSharePercentage,
            ReportingFrequency = obligation.ReportingFrequency,
            CalculationBasis = obligation.CalculationBasis.ToString(),
            ContractualStartDate = obligation.ContractualStartDate,
            ContractualEndDate = obligation.ContractualEndDate,
            Status = obligation.Status.ToString(),
            ActivatedAt = obligation.ActivatedAt,
            MaturedAt = obligation.MaturedAt,
            SettledAt = obligation.SettledAt,
            ClosedAt = obligation.ClosedAt,
            ClosedByUserId = obligation.ClosedByUserId,
            ClosureReason = obligation.ClosureReason,
            ClosureSnapshotHash = obligation.ClosureSnapshotHash,
            ClosureSnapshotVersion = obligation.ClosureSnapshotVersion,
            TotalDeclaredResult = totals.TotalDeclaredResult,
            TotalEntitlement = totals.TotalEntitlement,
            TotalConfirmedDistributed = totals.TotalConfirmedDistributed,
            TotalPendingConfirmation = totals.TotalPendingConfirmation,
            TotalDisputed = totals.TotalDisputed,
            TotalDistributionOutstanding = totals.TotalDistributionOutstanding,
            CompletedPeriods = obligation.ReportingPeriods.Count(IsPeriodComplete),
            TotalPeriods = obligation.ReportingPeriods.Count,
            ReportingPeriods = obligation.ReportingPeriods.OrderBy(x => x.PeriodNumber).Select(x => new ProfitSharingReportingPeriodDto { Id = x.Id, ObligationId = x.ProfitSharingObligationId, PeriodNumber = x.PeriodNumber, IsFinalPeriod = x.IsFinalPeriod, StartDate = x.StartDate, EndDate = x.EndDate, ReportingDueDate = x.ReportingDueDate, Currency = x.Currency, Status = x.Status.ToString(), HasDeclaration = x.Declaration is not null, InvestorEntitlement = x.Entitlement?.EntitlementAmount, DistributionOutstanding = x.Entitlement?.DistributionOutstanding, ConfirmedDistributed = x.DistributionDeclarations.Where(d => d.Status == ProfitSharingDistributionDeclarationStatus.Confirmed).Sum(d => d.DeclaredAmount), PendingConfirmation = x.Entitlement?.PendingDistributionAmount ?? 0m, Disputed = x.DistributionDeclarations.Where(d => d.Status == ProfitSharingDistributionDeclarationStatus.Disputed).Sum(d => d.DeclaredAmount) }).ToList()
        };
    }

    private sealed record ClosureSnapshot(int ParticipationId, int ContractId, int ContractVersionId, int OfferId, int OfferLegId, Guid FounderUserId, Guid InvestorUserId, decimal Contribution, string Currency, decimal ProfitSharePercentage, string ReportingFrequency, DateTime ContractStart, DateTime ContractualMaturity, int ReportingPeriodCount, decimal TotalDeclaredResult, decimal TotalEntitlement, decimal TotalConfirmedDistributed, decimal TotalDisputed, decimal FinalOutstanding, DateTime SettlementTimestamp, DateTime ClosureTimestamp, Guid ClosedBy, string ClosureReason, string SnapshotVersion);

    private sealed record Totals(decimal TotalDeclaredResult, decimal TotalEntitlement, decimal TotalConfirmedDistributed, decimal TotalPendingConfirmation, decimal TotalDisputed, decimal TotalDistributionOutstanding)
    {
        public static Totals From(ProfitSharingObligation obligation)
        {
            var periods = obligation.ReportingPeriods;
            return new Totals(
                periods.Sum(x => x.Declaration?.DeclaredResultAmount ?? 0m),
                periods.Sum(x => x.Entitlement?.EntitlementAmount ?? 0m),
                periods.SelectMany(x => x.DistributionDeclarations).Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Confirmed).Sum(x => x.DeclaredAmount),
                periods.Sum(x => x.Entitlement?.PendingDistributionAmount ?? 0m),
                periods.SelectMany(x => x.DistributionDeclarations).Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Disputed).Sum(x => x.DeclaredAmount),
                Math.Max(0m, periods.Sum(x => x.Entitlement?.EntitlementAmount ?? 0m) - periods.SelectMany(x => x.DistributionDeclarations).Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Confirmed).Sum(x => x.DeclaredAmount)));
        }
    }
}
