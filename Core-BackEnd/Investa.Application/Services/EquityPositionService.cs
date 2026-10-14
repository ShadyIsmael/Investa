using System.Globalization;
using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public sealed class EquityPositionService(
    IUnitOfWork uow,
    IUserNotificationService? notifications,
    ILogger<EquityPositionService> logger) : IEquityPositionService
{
    private static readonly SemaphoreSlim LifecycleGate = new(1, 1);

    public Task<EquityPosition?> EnsurePendingForAcceptedContractAsync(int participationRequestId, Guid actorUserId, CancellationToken cancellationToken = default) =>
        EnsureInternalAsync(participationRequestId, actorUserId, requireConfirmedFunding: false, cancellationToken);

    public Task<EquityPosition?> EnsureActivatedForConfirmedFundingAsync(int participationRequestId, Guid activatedByUserId, CancellationToken cancellationToken = default) =>
        EnsureInternalAsync(participationRequestId, activatedByUserId, requireConfirmedFunding: true, cancellationToken);

    private async Task<EquityPosition?> EnsureInternalAsync(int participationRequestId, Guid actorUserId, bool requireConfirmedFunding, CancellationToken cancellationToken)
    {
        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationRequestId);
            if (participation is null || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation || participation.Status != OpportunityJoinRequestStatus.Approved)
                return null;

            var contractCommittedAmount = participation.FundingAmount ?? participation.RequestedAmount ?? 0m;
            if (contractCommittedAmount <= 0m) return null;
            var declarations = await uow.Repository<FundingDeclaration>().FindAsync(x => x.ParticipationId == participationRequestId);
            var confirmedAmount = FundingSemantics.SumConfirmed(declarations);
            if (requireConfirmedFunding && confirmedAmount <= 0m) return null;

            var contract = await uow.Repository<InvestmentContract>().GetSingleAsync(
                x => x.ParticipationRequestId == participationRequestId && x.Status == InvestmentContractStatus.Active,
                x => x.Versions);
            if (contract is null || !contract.AcceptedOfferId.HasValue || !contract.AcceptedOfferVersionNumber.HasValue) return null;
            var version = contract.Versions.SingleOrDefault(x => x.VersionNumber == contract.CurrentVersionNumber && x.Status == InvestmentContractVersionStatus.Active);
            if (version is null) return null;
            var offer = await uow.Repository<NegotiationOffer>().GetSingleAsync(x => x.Id == contract.AcceptedOfferId.Value && x.Status == NegotiationOfferStatus.Accepted, x => x.Legs);
            if (offer is null || offer.OpportunityId != contract.OpportunityId || offer.Version != contract.AcceptedOfferVersionNumber.Value) return null;

            var equityLegs = offer.Legs.Where(x => x.LegType == NegotiationOfferLegType.Equity).OrderBy(x => x.Id).ToList();
            if (equityLegs.Count != 1)
            {
                logger.LogWarning("Equity position lifecycle skipped for participation {ParticipationId}: exactly one Equity OfferLeg is required.", participationRequestId);
                return null;
            }

            var leg = equityLegs[0];
            if (!TryReadSnapshot(version.TermsSnapshotJson, leg.Id, out var snapshot, out var reason))
            {
                logger.LogWarning("Equity position lifecycle skipped for participation {ParticipationId}: {Reason}", participationRequestId, reason);
                return null;
            }
            ValidateSnapshot(snapshot);

            var confirmedForLeg = await ConfirmedAmountForLegAsync(participationRequestId, declarations, leg.Id, offer.Legs.Count == 1 ? confirmedAmount : 0m);
            if (requireConfirmedFunding && confirmedForLeg <= 0m) return null;
            var committedAmount = leg.Amount;
            var fullyConfirmed = confirmedForLeg >= committedAmount;
            var existing = await uow.Repository<EquityPosition>().GetSingleAsync(
                x => x.ParticipationRequestId == participationRequestId && x.OfferLegId == leg.Id,
                x => x.InitialHoldingSnapshot!, x => x.LedgerEntries);
            var now = DateTime.UtcNow;
            if (existing is not null)
            {
                if (existing.Status == EquityPositionStatus.PendingFunding && fullyConfirmed)
                {
                    if (snapshot.OwnershipModel == EquityOwnershipModel.ShareBased && await HasActiveShareBasedIssuerPositionAsync(opportunityId: contract.OpportunityId, existing.Id, cancellationToken))
                        existing.Status = EquityPositionStatus.PendingCapitalization;
                    else
                        await ActivateAsync(existing, snapshot, actorUserId, now);
                }
                return existing;
            }

            var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(contract.OpportunityId);
            var requiresCapitalization = fullyConfirmed && snapshot.OwnershipModel == EquityOwnershipModel.ShareBased && opportunity?.ProjectId is int projectId
                && await HasActiveShareBasedProjectPositionAsync(projectId, cancellationToken);
            var position = new EquityPosition
            {
                ParticipationRequestId = participationRequestId,
                ContractId = contract.Id,
                ContractVersionId = version.Id,
                AcceptedOfferId = offer.Id,
                AcceptedOfferVersionNumber = offer.Version,
                OfferLegId = leg.Id,
                OfferLegNumber = snapshot.LegNumber,
                OpportunityId = contract.OpportunityId,
                ProjectId = opportunity?.ProjectId,
                FounderUserId = contract.FounderUserId,
                InvestorUserId = contract.InvestorUserId,
                InvestmentAmount = snapshot.Amount,
                Currency = snapshot.Currency,
                OwnershipModel = snapshot.OwnershipModel,
                ContractualOwnershipPercentage = snapshot.ContractualOwnershipPercentage,
                InvestorShareCount = snapshot.InvestorShareCount,
                TotalIssuedShares = snapshot.TotalIssuedShares,
                ShareClass = snapshot.ShareClass,
                PricePerShare = snapshot.PricePerShare,
                PreMoneyValuation = snapshot.PreMoneyValuation,
                PostMoneyValuation = snapshot.PostMoneyValuation,
                EffectiveOwnershipDate = snapshot.EffectiveOwnershipDate,
                Status = !fullyConfirmed ? EquityPositionStatus.PendingFunding : requiresCapitalization ? EquityPositionStatus.PendingCapitalization : EquityPositionStatus.Active,
                ActivatedAt = fullyConfirmed && !requiresCapitalization ? now : null,
                CreatedAt = now
            };
            if (fullyConfirmed && !requiresCapitalization) AddInitialHolding(position, snapshot, actorUserId, now);
            await uow.Repository<EquityPosition>().AddAsync(position);
            var action = !fullyConfirmed ? "CreatePendingFunding" : requiresCapitalization ? "CreatePendingCapitalization" : "Activate";
            await uow.Repository<AuditLog>().AddAsync(BuildAudit(actorUserId, action, position, snapshot, confirmedForLeg, now));
            await NotifyAsync(position, !fullyConfirmed || requiresCapitalization ? "EquityPositionPendingFunding" : "EquityPositionActivated", now, cancellationToken);
            return position;
        }
        finally { LifecycleGate.Release(); }
    }

    private async Task<decimal> ConfirmedAmountForLegAsync(int participationId, IEnumerable<FundingDeclaration> declarations, int offerLegId, decimal legacySingleLegAmount)
    {
        var allocations = await uow.Repository<FundingDeclarationLegAllocation>().FindAsync(x => x.ParticipationId == participationId && x.OfferLegId == offerLegId);
        if (!allocations.Any())
            return legacySingleLegAmount;
        var confirmedIds = declarations.Where(x => x.Status == FundingDeclarationStatus.Confirmed).Select(x => x.Id).ToHashSet();
        return allocations.Where(x => confirmedIds.Contains(x.FundingDeclarationId)).Sum(x => x.AllocatedAmount);
    }

    private async Task ActivateAsync(EquityPosition position, EquitySnapshot snapshot, Guid actor, DateTime now)
    {
        position.Status = EquityPositionStatus.Active;
        position.ActivatedAt = now;
        if (position.InitialHoldingSnapshot is null && !position.LedgerEntries.Any(x => x.EventType == EquityHoldingLedgerEventType.InitialActivation))
        {
            AddInitialHolding(position, snapshot, actor, now);
            await uow.Repository<AuditLog>().AddAsync(BuildAudit(actor, "Activate", position, snapshot, 0m, now));
            await NotifyAsync(position, "EquityPositionActivated", now, CancellationToken.None);
        }
    }

    private async Task<bool> HasActiveShareBasedIssuerPositionAsync(int opportunityId, int currentPositionId, CancellationToken cancellationToken)
    {
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
        return opportunity?.ProjectId is int projectId && await HasActiveShareBasedProjectPositionAsync(projectId, cancellationToken, currentPositionId);
    }

    private async Task<bool> HasActiveShareBasedProjectPositionAsync(int projectId, CancellationToken cancellationToken, int? excludePositionId = null)
    {
        return await uow.Repository<EquityPosition>().Query().AnyAsync(x => x.ProjectId == projectId
            && x.Status == EquityPositionStatus.Active
            && x.OwnershipModel == EquityOwnershipModel.ShareBased
            && (!excludePositionId.HasValue || x.Id != excludePositionId.Value), cancellationToken);
    }

    private static void AddInitialHolding(EquityPosition position, EquitySnapshot snapshot, Guid actor, DateTime now)
    {
        var derived = snapshot.OwnershipModel == EquityOwnershipModel.ShareBased
            ? decimal.Round(snapshot.InvestorShareCount!.Value / snapshot.TotalIssuedShares!.Value * 100m, 6)
            : snapshot.ContractualOwnershipPercentage;
        position.InitialHoldingSnapshot = new EquityHoldingSnapshot
        {
            EquityPosition = position,
            OwnershipModel = snapshot.OwnershipModel,
            EffectiveDate = snapshot.EffectiveOwnershipDate ?? now,
            ContractualOwnershipPercentage = snapshot.ContractualOwnershipPercentage,
            InvestorShareCount = snapshot.InvestorShareCount,
            TotalIssuedShares = snapshot.TotalIssuedShares,
            DerivedOwnershipPercentage = derived,
            ShareClass = snapshot.ShareClass,
            PricePerShare = snapshot.PricePerShare,
            PreMoneyValuation = snapshot.PreMoneyValuation,
            PostMoneyValuation = snapshot.PostMoneyValuation,
            ContractId = position.ContractId,
            ContractVersionId = position.ContractVersionId,
            AcceptedOfferId = position.AcceptedOfferId,
            OfferLegId = position.OfferLegId,
            CreatedAt = now
        };
        position.LedgerEntries.Add(new EquityHoldingLedgerEntry
        {
            EquityPosition = position,
            EventType = EquityHoldingLedgerEventType.InitialActivation,
            EffectiveDate = snapshot.EffectiveOwnershipDate ?? now,
            ShareDelta = snapshot.OwnershipModel == EquityOwnershipModel.ShareBased ? snapshot.InvestorShareCount : null,
            ResultingInvestorShares = snapshot.InvestorShareCount,
            ResultingTotalIssuedShares = snapshot.TotalIssuedShares,
            ResultingOwnershipPercentage = derived,
            ContractualOwnershipPercentage = snapshot.ContractualOwnershipPercentage,
            ContractId = position.ContractId,
            ContractVersionId = position.ContractVersionId,
            AcceptedOfferId = position.AcceptedOfferId,
            OfferLegId = position.OfferLegId,
            ActorUserId = actor,
            ActorType = actor == Guid.Empty ? "System" : "User",
            CorrelationId = $"equity-position:{position.ParticipationRequestId}:leg:{position.OfferLegId}",
            CreatedAt = now
        });
    }

    public async Task<IReadOnlyDictionary<int, IReadOnlyList<EquityPosition>>> GetByParticipationAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default)
    {
        var set = ids.Distinct().ToHashSet();
        if (set.Count == 0) return new Dictionary<int, IReadOnlyList<EquityPosition>>();
        var rows = await uow.Repository<EquityPosition>().Query()
            .Where(x => set.Contains(x.ParticipationRequestId))
            .Include(x => x.InitialHoldingSnapshot)
            .Include(x => x.LedgerEntries)
            .ToListAsync(cancellationToken);
        return rows.GroupBy(x => x.ParticipationRequestId).ToDictionary(x => x.Key, x => (IReadOnlyList<EquityPosition>)x.OrderBy(y => y.OfferLegNumber).ThenBy(y => y.Id).ToList());
    }

    public async Task<IReadOnlyList<EquityPositionDto>> GetForParticipationAsync(Guid actorId, int opportunityId, int participationId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationId);
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
        if (participation is null || opportunity is null || participation.OpportunityId != opportunityId || participation.Status != OpportunityJoinRequestStatus.Approved || (!isAdmin && opportunity.FounderId != actorId && participation.InvestorId != actorId))
            throw new BusinessValidationException("EQUITY_POSITION_FORBIDDEN", "You are not authorized to view this Equity position.");
        var rows = await uow.Repository<EquityPosition>().Query().Where(x => x.ParticipationRequestId == participationId).Include(x => x.InitialHoldingSnapshot).Include(x => x.LedgerEntries).ToListAsync(cancellationToken);
        return rows.OrderBy(x => x.OfferLegNumber).Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<EquityHoldingLedgerEntryDto>> GetHistoryAsync(Guid actorId, int positionId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var position = await uow.Repository<EquityPosition>().Query().Where(x => x.Id == positionId).Include(x => x.LedgerEntries).SingleOrDefaultAsync(cancellationToken)
            ?? throw new BusinessValidationException("EQUITY_POSITION_NOT_FOUND", "The Equity position was not found.");
        if (!isAdmin && position.FounderUserId != actorId && position.InvestorUserId != actorId)
            throw new BusinessValidationException("EQUITY_POSITION_FORBIDDEN", "You are not authorized to view this Equity ownership history.");
        return position.LedgerEntries.OrderBy(x => x.EffectiveDate).ThenBy(x => x.Id).Select(ToLedgerDto).ToList();
    }

    public async Task<EquityOwnershipAtDateDto> GetOwnershipAtDateAsync(Guid actorId, int positionId, DateTime asOf, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var position = await uow.Repository<EquityPosition>().Query()
            .Where(x => x.Id == positionId)
            .Include(x => x.LedgerEntries)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new BusinessValidationException("EQUITY_POSITION_NOT_FOUND", "The Equity position was not found.");

        if (!isAdmin && position.FounderUserId != actorId && position.InvestorUserId != actorId)
            throw new BusinessValidationException("EQUITY_POSITION_FORBIDDEN", "You are not authorized to view this Equity ownership history.");

        var effectiveAsOf = asOf.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(asOf, DateTimeKind.Utc) : asOf.ToUniversalTime();
        var entry = position.LedgerEntries
            .Where(x => x.EffectiveDate <= effectiveAsOf)
            .OrderByDescending(x => x.EffectiveDate)
            .ThenByDescending(x => x.Id)
            .FirstOrDefault();

        return new EquityOwnershipAtDateDto
        {
            PositionId = position.Id,
            AsOf = effectiveAsOf,
            OwnershipModel = position.OwnershipModel,
            OwnershipPercentage = entry?.ResultingOwnershipPercentage,
            InvestorShares = entry?.ResultingInvestorShares,
            TotalIssuedShares = entry?.ResultingTotalIssuedShares,
            EffectiveDate = entry?.EffectiveDate
        };
    }

    public async Task<IReadOnlyList<EquityPositionDto>> GetCapitalizationAsync(Guid actorId, int opportunityId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId) ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
        if (!isAdmin && opportunity.FounderId != actorId) throw new BusinessValidationException("EQUITY_CAP_TABLE_FORBIDDEN", "The private capitalization summary is available only to the Founder and authorized operators.");
        var rows = await uow.Repository<EquityPosition>().Query().Where(x => x.ProjectId == opportunity.ProjectId && x.Status == EquityPositionStatus.Active).Include(x => x.InitialHoldingSnapshot).Include(x => x.LedgerEntries).ToListAsync(cancellationToken);
        return rows.OrderBy(x => x.Id).Select(ToDto).ToList();
    }

    public async Task<EquityCorporateEventDto> CreateCorporateEventAsync(Guid actorId, CreateEquityCorporateEventRequest request, bool isAdmin, CancellationToken cancellationToken = default)
    {
        if (!request.OpportunityId.HasValue)
            throw new BusinessValidationException("EQUITY_EVENT_OPPORTUNITY_REQUIRED", "A corporate event must be scoped to an Opportunity.");
        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length > 2000)
            throw new BusinessValidationException("EQUITY_EVENT_REASON_REQUIRED", "A corporate event reason between 1 and 2,000 characters is required.");
        if (!Enum.IsDefined(request.EventType))
            throw new BusinessValidationException("EQUITY_EVENT_TYPE_UNSUPPORTED", "The corporate event type is not supported in Equity Phase 2.");

        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(request.OpportunityId.Value)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
        if (!isAdmin && opportunity.FounderId != actorId)
            throw new BusinessValidationException("EQUITY_EVENT_FORBIDDEN", "Only the Founder or an authorized operator may initiate this corporate event.");

        var project = await uow.Repository<Project>().GetByIdAsync(opportunity.ProjectId);
        if (project is null || (!isAdmin && project.FounderId != actorId))
            throw new BusinessValidationException("EQUITY_EVENT_FORBIDDEN", "The corporate event is not authorized for this project.");

        var projectPositions = await LoadProjectPositionsAsync(project.Id, cancellationToken);
        var activePositions = projectPositions.Where(x => x.Status == EquityPositionStatus.Active).ToList();
        var requestedIds = request.PositionIds?.Distinct().ToHashSet() ?? [];
        var requestedPending = projectPositions.Where(x => requestedIds.Contains(x.Id) && x.Status == EquityPositionStatus.PendingCapitalization).ToList();
        if (projectPositions.Any(x => requestedIds.Contains(x.Id) && x.Status == EquityPositionStatus.PendingFunding))
            throw new BusinessValidationException("EQUITY_EVENT_POSITION_NOT_FUNDING_COMPLETE", "A capitalization event can include only funding-complete Equity positions.");
        var positions = activePositions.Concat(requestedPending).GroupBy(x => x.Id).Select(x => x.First()).ToList();
        if (positions.Count == 0)
            throw new BusinessValidationException("EQUITY_EVENT_NO_SHARE_POSITIONS", "No valid ShareBased Equity positions were found for this event.");
        if (positions.Any(x => x.OwnershipModel != EquityOwnershipModel.ShareBased))
            throw new BusinessValidationException("EQUITY_EVENT_PERCENTAGE_UNSUPPORTED", "Corporate dilution events are unsupported for PercentageBased Equity positions.");
        if (projectPositions.Any(x => x.Status == EquityPositionStatus.Active && x.OwnershipModel == EquityOwnershipModel.PercentageBased))
            throw new BusinessValidationException("EQUITY_EVENT_PERCENTAGE_UNSUPPORTED", "The issuer contains PercentageBased positions; Phase 2 cannot fabricate share dilution for them.");
        ValidateEventTerms(request, positions);
        var baselineTotal = ResolveCurrentTotal(activePositions, requestedPending);
        if (baselineTotal <= 0m)
            throw new BusinessValidationException("EQUITY_EVENT_CAPITALIZATION_INVALID", "A corporate event requires one positive issuer share baseline.");
        var latestApplied = await uow.Repository<EquityCorporateEvent>().Query()
            .Where(x => x.ProjectId == project.Id && x.Status == EquityCorporateEventStatus.Applied)
            .OrderByDescending(x => x.EffectiveDate).ThenByDescending(x => x.Id)
            .Select(x => new { x.Id, x.EffectiveDate })
            .FirstOrDefaultAsync(cancellationToken);
        var effectiveDate = NormalizeUtc(request.EffectiveDate);
        if (latestApplied is not null && effectiveDate < latestApplied.EffectiveDate)
            throw new BusinessValidationException("EQUITY_EVENT_BACKDATED", "A new capitalization event cannot be backdated before an applied event.");

        var eventEntity = new EquityCorporateEvent
        {
            ProjectId = project.Id,
            OpportunityId = opportunity.Id,
            EventType = request.EventType,
            Status = EquityCorporateEventStatus.Draft,
            EffectiveDate = effectiveDate,
            InitiatedByUserId = actorId,
            Reason = request.Reason.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            SharesIssued = request.SharesIssued,
            SplitNumerator = request.SplitNumerator,
            SplitDenominator = request.SplitDenominator,
            ShareClass = request.ShareClass,
            Currency = request.Currency?.Trim().ToUpperInvariant(),
            PreMoneyValuation = request.PreMoneyValuation,
            PostMoneyValuation = request.PostMoneyValuation,
            PricePerShare = request.PricePerShare,
            ExpectedTotalIssuedShares = baselineTotal,
            ExpectedLatestAppliedEventId = latestApplied?.Id,
            CorrelationId = $"equity-event:{Guid.NewGuid():N}"
        };
        foreach (var position in positions)
            eventEntity.Positions.Add(new EquityCorporateEventPosition { EquityPositionId = position.Id, IsNewPosition = position.Status == EquityPositionStatus.PendingFunding });
        await uow.Repository<EquityCorporateEvent>().AddAsync(eventEntity);
        await uow.Repository<AuditLog>().AddAsync(BuildEventAudit(actorId, eventEntity, "Created", null));
        await uow.SaveChangesAsync();
        return await LoadEventDtoAsync(eventEntity.Id, cancellationToken);
    }

    public Task<EquityCorporateEventDto> SubmitCorporateEventAsync(Guid actorId, int eventId, bool isAdmin, CancellationToken cancellationToken = default) =>
        TransitionEventAsync(actorId, eventId, EquityCorporateEventStatus.PendingApproval, isAdmin, false, null, cancellationToken);

    public async Task<EquityCorporateEventDto> ApproveCorporateEventAsync(Guid actorId, int eventId, bool isAdmin, bool approve, string? reason, CancellationToken cancellationToken = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_EVENT_APPROVAL_FORBIDDEN", "Only Admin or Operations can approve or reject corporate events.");
        var eventEntity = await LoadEventEntityAsync(eventId, cancellationToken)
            ?? throw new BusinessValidationException("EQUITY_EVENT_NOT_FOUND", "The corporate event was not found.");
        if (eventEntity.Status != EquityCorporateEventStatus.PendingApproval)
            throw new BusinessValidationException("EQUITY_EVENT_INVALID_STATE", "Only PendingApproval events can be approved or rejected.");
        if (eventEntity.InitiatedByUserId == actorId)
            throw new BusinessValidationException("EQUITY_EVENT_SELF_APPROVAL", "The initiating Founder cannot approve the same capitalization event.");
        if (!approve && string.IsNullOrWhiteSpace(reason))
            throw new BusinessValidationException("EQUITY_EVENT_REJECTION_REASON_REQUIRED", "A rejection reason is required.");

        // Approval records the separation-of-duties decision while the event
        // remains PendingApproval until the distinct Apply operation commits
        // the capitalization change.
        eventEntity.Status = approve ? EquityCorporateEventStatus.PendingApproval : EquityCorporateEventStatus.Rejected;
        eventEntity.ApprovedByUserId = actorId;
        eventEntity.ApprovedAt = DateTime.UtcNow;
        if (!approve) eventEntity.Notes = string.IsNullOrWhiteSpace(eventEntity.Notes) ? reason?.Trim() : $"{eventEntity.Notes}\n{reason?.Trim()}";
        await uow.Repository<EquityCorporateEvent>().UpdateAsync(eventEntity);
        await uow.Repository<AuditLog>().AddAsync(BuildEventAudit(actorId, eventEntity, approve ? "Approved" : "Rejected", reason));
        await uow.SaveChangesAsync();
        return await LoadEventDtoAsync(eventId, cancellationToken);
    }

    public async Task<EquityCorporateEventDto> ApplyCorporateEventAsync(Guid actorId, int eventId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_EVENT_APPLICATION_FORBIDDEN", "Only Admin or Operations can apply a corporate event.");
        await LifecycleGate.WaitAsync(cancellationToken);
        var transactionStarted = false;
        try
        {
            var eventEntity = await LoadEventEntityAsync(eventId, cancellationToken)
                ?? throw new BusinessValidationException("EQUITY_EVENT_NOT_FOUND", "The corporate event was not found.");
            if (eventEntity.Status == EquityCorporateEventStatus.Applied) return await LoadEventDtoAsync(eventId, cancellationToken);
            if (eventEntity.Status != EquityCorporateEventStatus.PendingApproval)
                throw new BusinessValidationException("EQUITY_EVENT_INVALID_STATE", "Only a PendingApproval corporate event can be applied.");

            await uow.BeginTransactionAsync();
            transactionStarted = true;
            var positions = await LoadProjectPositionsAsync(eventEntity.ProjectId, eventEntity.Positions.Select(x => x.EquityPositionId).ToArray(), cancellationToken);
            if (positions.Count == 0 || positions.Any(x => x.OwnershipModel != EquityOwnershipModel.ShareBased))
                throw new BusinessValidationException("EQUITY_EVENT_PERCENTAGE_UNSUPPORTED", "The event no longer reconciles to ShareBased positions.");

            var activePositions = positions.Where(x => x.Status == EquityPositionStatus.Active).ToList();
            var pendingPositions = positions.Where(x => x.Status == EquityPositionStatus.PendingCapitalization && eventEntity.Positions.Any(p => p.EquityPositionId == x.Id)).ToList();
            if (positions.Any(x => x.Status == EquityPositionStatus.PendingFunding) || activePositions.Any(x => !eventEntity.Positions.Any(p => p.EquityPositionId == x.Id)))
                throw new BusinessValidationException("EQUITY_EVENT_STALE_CAPITALIZATION", "The event no longer covers the complete active issuer capitalization or contains an unfunded position.");
            var beforeTotal = ResolveCurrentTotal(activePositions, pendingPositions);
            if (beforeTotal <= 0m) throw new BusinessValidationException("EQUITY_EVENT_CAPITALIZATION_INVALID", "The current issued-share base is invalid.");
            var latestApplied = await uow.Repository<EquityCorporateEvent>().Query()
                .Where(x => x.ProjectId == eventEntity.ProjectId && x.Status == EquityCorporateEventStatus.Applied)
                .OrderByDescending(x => x.EffectiveDate).ThenByDescending(x => x.Id)
                .Select(x => new { x.Id, x.EffectiveDate })
                .FirstOrDefaultAsync(cancellationToken);
            if (eventEntity.ExpectedTotalIssuedShares != beforeTotal || eventEntity.ExpectedLatestAppliedEventId != latestApplied?.Id)
                throw new BusinessValidationException("EQUITY_EVENT_STALE_CAPITALIZATION", "The issuer capitalization changed after this event was prepared. Rebuild the event from the current baseline.");
            if (latestApplied is not null && eventEntity.EffectiveDate < latestApplied.EffectiveDate)
                throw new BusinessValidationException("EQUITY_EVENT_BACKDATED", "The event effective date precedes an already applied capitalization event.");
            if (activePositions.Select(CurrentState).Select(x => x.Total).Where(x => x > 0m).Distinct().Count() > 1)
                throw new BusinessValidationException("EQUITY_EVENT_STALE_CAPITALIZATION", "Active issuer positions do not reconcile to one total issued-share value.");
            var result = CalculateEvent(eventEntity, activePositions, pendingPositions, beforeTotal);
            var now = DateTime.UtcNow;
            eventEntity.BeforeCapitalizationSnapshotJson = JsonSerializer.Serialize(result.BeforeSnapshot);
            eventEntity.AfterCapitalizationSnapshotJson = JsonSerializer.Serialize(result.AfterSnapshot);
            eventEntity.BeforeSnapshotHash = HashSnapshot(eventEntity.BeforeCapitalizationSnapshotJson);
            eventEntity.AfterSnapshotHash = HashSnapshot(eventEntity.AfterCapitalizationSnapshotJson);
            eventEntity.ResultingTotalIssuedShares = result.AfterTotal;
            eventEntity.AppliedByUserId = actorId;
            eventEntity.AppliedAt = now;
            eventEntity.Status = EquityCorporateEventStatus.Applied;

            var beforeCap = new EquityCapitalizationSnapshot { CorporateEvent = eventEntity, IsBefore = true, CapturedAt = now, TotalIssuedShares = result.BeforeTotal, Currency = eventEntity.Currency, SnapshotHash = eventEntity.BeforeSnapshotHash };
            var afterCap = new EquityCapitalizationSnapshot { CorporateEvent = eventEntity, IsBefore = false, CapturedAt = now, TotalIssuedShares = result.AfterTotal, Currency = eventEntity.Currency, SnapshotHash = eventEntity.AfterSnapshotHash };
            foreach (var holder in result.BeforeHolders)
                beforeCap.Holders.Add(new EquityCapitalizationSnapshotHolder { EquityPositionId = holder.PositionId, InvestorUserId = holder.InvestorId, InvestorShares = holder.Shares, OwnershipPercentage = holder.Ownership, ShareClass = holder.ShareClass });
            foreach (var holder in result.AfterHolders)
                afterCap.Holders.Add(new EquityCapitalizationSnapshotHolder { EquityPositionId = holder.PositionId, InvestorUserId = holder.InvestorId, InvestorShares = holder.Shares, OwnershipPercentage = holder.Ownership, ShareClass = holder.ShareClass });
            eventEntity.CapitalizationSnapshots.Add(beforeCap);
            eventEntity.CapitalizationSnapshots.Add(afterCap);

            foreach (var holder in result.AfterHolders)
            {
                var position = positions.Single(x => x.Id == holder.PositionId);
                var before = result.BeforeHolders.FirstOrDefault(x => x.PositionId == holder.PositionId);
                if (position.InitialHoldingSnapshot is null)
                {
                    position.Status = EquityPositionStatus.Active;
                    position.ActivatedAt = now;
                    var initialShares = position.InvestorShareCount ?? holder.Shares;
                    var initialTotal = position.TotalIssuedShares ?? result.AfterTotal;
                    position.InitialHoldingSnapshot = new EquityHoldingSnapshot { EquityPosition = position, OwnershipModel = position.OwnershipModel, EffectiveDate = eventEntity.EffectiveDate, InvestorShareCount = initialShares, TotalIssuedShares = initialTotal, DerivedOwnershipPercentage = initialTotal > 0m ? decimal.Round(initialShares / initialTotal * 100m, 6) : 0m, ContractualOwnershipPercentage = position.ContractualOwnershipPercentage, ShareClass = position.ShareClass, PricePerShare = position.PricePerShare, PreMoneyValuation = position.PreMoneyValuation, PostMoneyValuation = position.PostMoneyValuation, ContractId = position.ContractId, ContractVersionId = position.ContractVersionId, AcceptedOfferId = position.AcceptedOfferId, OfferLegId = position.OfferLegId, CreatedAt = now };
                }
                position.LedgerEntries.Add(new EquityHoldingLedgerEntry { EquityPosition = position, CorporateEvent = eventEntity, EventType = ToLedgerEventType(eventEntity.EventType), EffectiveDate = eventEntity.EffectiveDate, PreviousInvestorShares = before?.Shares, ShareDelta = holder.Shares - (before?.Shares ?? 0m), ResultingInvestorShares = holder.Shares, PreviousTotalIssuedShares = before?.TotalIssuedShares ?? result.BeforeTotal, ResultingTotalIssuedShares = result.AfterTotal, PreviousOwnershipPercentage = before?.Ownership, ResultingOwnershipPercentage = holder.Ownership, ContractualOwnershipPercentage = position.ContractualOwnershipPercentage, ShareClass = position.ShareClass, ContractId = position.ContractId, ContractVersionId = position.ContractVersionId, AcceptedOfferId = position.AcceptedOfferId, OfferLegId = position.OfferLegId, ActorUserId = actorId, ActorType = "Admin", CorrelationId = eventEntity.CorrelationId, CreatedAt = now });
                eventEntity.LedgerEntries.Add(position.LedgerEntries.Last());
            }
            await uow.Repository<EquityCorporateEvent>().UpdateAsync(eventEntity);
            await uow.Repository<AuditLog>().AddAsync(BuildEventAudit(actorId, eventEntity, "Applied", new { result.BeforeTotal, result.AfterTotal, result.BeforeHolders, result.AfterHolders }));
            await uow.SaveChangesAsync();
            await uow.CommitTransactionAsync();
            transactionStarted = false;
            await NotifyCorporateEventAsync(eventEntity, result, cancellationToken);
            return await LoadEventDtoAsync(eventId, cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (transactionStarted) await uow.RollbackTransactionAsync();
            throw new BusinessValidationException("EQUITY_EVENT_CONCURRENCY", "Another capitalization operation changed this event or issuer. Refresh and rebuild the event.");
        }
        catch
        {
            if (transactionStarted) await uow.RollbackTransactionAsync();
            throw;
        }
        finally { LifecycleGate.Release(); }
    }

    public async Task<IReadOnlyList<EquityCorporateEventDto>> GetCorporateEventsAsync(Guid actorId, int opportunityId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId) ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
        var isFounder = opportunity.FounderId == actorId;
        if (!isAdmin && !isFounder)
        {
            var own = await uow.Repository<EquityPosition>().Query().AnyAsync(x => x.OpportunityId == opportunityId && x.InvestorUserId == actorId, cancellationToken);
            if (!own) throw new BusinessValidationException("EQUITY_EVENT_FORBIDDEN", "You are not authorized to view these corporate events.");
        }
        var events = await uow.Repository<EquityCorporateEvent>().Query()
            .Where(x => x.ProjectId == opportunity.ProjectId
                && ((isAdmin || isFounder)
                    || (x.Status != EquityCorporateEventStatus.Draft && x.Status != EquityCorporateEventStatus.Rejected)))
            .Include(x => x.Positions).ThenInclude(x => x.EquityPosition)
            .Include(x => x.LedgerEntries)
            .ToListAsync(cancellationToken);
        if (!isAdmin && !isFounder)
        {
            // An affected investor may see only their own position movements.
            events = events.Where(x => x.Positions.Any(p => p.EquityPosition?.InvestorUserId == actorId)).ToList();
            foreach (var item in events)
                item.Positions = item.Positions.Where(p => p.EquityPosition?.InvestorUserId == actorId).ToList();
        }
        return events.OrderBy(x => x.EffectiveDate).ThenBy(x => x.Id).Select(ToEventDto).ToList();
    }

    private async Task<EquityCorporateEventDto> TransitionEventAsync(Guid actorId, int eventId, EquityCorporateEventStatus target, bool isAdmin, bool ignored, string? reason, CancellationToken cancellationToken)
    {
        var eventEntity = await LoadEventEntityAsync(eventId, cancellationToken) ?? throw new BusinessValidationException("EQUITY_EVENT_NOT_FOUND", "The corporate event was not found.");
        if (eventEntity.Status != EquityCorporateEventStatus.Draft) throw new BusinessValidationException("EQUITY_EVENT_INVALID_STATE", "Only Draft corporate events can be submitted.");
        if (!isAdmin && eventEntity.InitiatedByUserId != actorId) throw new BusinessValidationException("EQUITY_EVENT_FORBIDDEN", "You are not authorized to submit this corporate event.");
        eventEntity.Status = target; eventEntity.SubmittedAt = DateTime.UtcNow;
        await uow.Repository<EquityCorporateEvent>().UpdateAsync(eventEntity);
        await uow.Repository<AuditLog>().AddAsync(BuildEventAudit(actorId, eventEntity, "Submitted", reason));
        await uow.SaveChangesAsync();
        return await LoadEventDtoAsync(eventId, cancellationToken);
    }

    private async Task<EquityCorporateEvent?> LoadEventEntityAsync(int eventId, CancellationToken cancellationToken) =>
        await uow.Repository<EquityCorporateEvent>().Query().AsTracking().Where(x => x.Id == eventId).Include(x => x.Positions).Include(x => x.LedgerEntries).SingleOrDefaultAsync(cancellationToken);

    private async Task<EquityCorporateEventDto> LoadEventDtoAsync(int eventId, CancellationToken cancellationToken) =>
        ToEventDto(await uow.Repository<EquityCorporateEvent>().Query().Where(x => x.Id == eventId).Include(x => x.Positions).ThenInclude(x => x.EquityPosition).Include(x => x.LedgerEntries).Include(x => x.CapitalizationSnapshots).SingleAsync(cancellationToken));

    private async Task<List<EquityPosition>> LoadProjectPositionsAsync(int projectId, CancellationToken cancellationToken)
    {
        var query = uow.Repository<EquityPosition>().Query().AsTracking()
            .Where(x => x.ProjectId == projectId && (x.Status == EquityPositionStatus.Active || x.Status == EquityPositionStatus.PendingCapitalization))
            .Include(x => x.InitialHoldingSnapshot).Include(x => x.LedgerEntries);
        return await query.ToListAsync(cancellationToken);
    }

    private async Task<List<EquityPosition>> LoadProjectPositionsAsync(int projectId, IReadOnlyList<int>? requestedIds, CancellationToken cancellationToken)
    {
        var query = uow.Repository<EquityPosition>().Query().AsTracking()
            .Where(x => x.ProjectId == projectId && (x.Status == EquityPositionStatus.Active || (requestedIds != null && requestedIds.Contains(x.Id))))
            .Include(x => x.InitialHoldingSnapshot).Include(x => x.LedgerEntries);
        return await query.ToListAsync(cancellationToken);
    }

    private static void ValidateEventTerms(CreateEquityCorporateEventRequest request, IReadOnlyCollection<EquityPosition> positions)
    {
        if (request.EventType is EquityCorporateEventType.ShareIssuance or EquityCorporateEventType.CapitalIncrease && (!request.SharesIssued.HasValue || request.SharesIssued <= 0))
            throw new BusinessValidationException("EQUITY_EVENT_SHARES_REQUIRED", "Share issuance and capital increase require a positive share count.");
        if (request.EventType is EquityCorporateEventType.ShareSplit or EquityCorporateEventType.ReverseSplit && (!request.SplitNumerator.HasValue || !request.SplitDenominator.HasValue || request.SplitNumerator <= 0 || request.SplitDenominator <= 0))
            throw new BusinessValidationException("EQUITY_EVENT_RATIO_REQUIRED", "Share split events require positive numerator and denominator values.");
        if (request.EventType is EquityCorporateEventType.ShareSplit or EquityCorporateEventType.ReverseSplit && positions.SelectMany(x => x.LedgerEntries).Select(x => x.ResultingInvestorShares).Any(x => x.HasValue && request.SplitNumerator.HasValue && request.SplitDenominator.HasValue && (x.Value * request.SplitNumerator.Value / request.SplitDenominator.Value) % 1m != 0m))
            throw new BusinessValidationException("EQUITY_EVENT_FRACTIONAL_SHARES", "This reverse split would produce fractional holdings and was rejected.");
    }

    private static decimal ResolveCurrentTotal(IReadOnlyCollection<EquityPosition> active, IReadOnlyCollection<EquityPosition> pending)
    {
        var values = active.Select(CurrentState).Select(x => x.Total).Where(x => x > 0m).Distinct().ToList();
        if (values.Count > 1) throw new BusinessValidationException("EQUITY_EVENT_STALE_CAPITALIZATION", "Existing positions do not reconcile to one current issued-share base.");
        return values.SingleOrDefault() > 0m ? values.Single() : pending.Select(x => x.TotalIssuedShares ?? 0m).FirstOrDefault();
    }

    private static EventCalculation CalculateEvent(EquityCorporateEvent entity, IReadOnlyList<EquityPosition> active, IReadOnlyList<EquityPosition> pending, decimal beforeTotal)
    {
        var before = active.Select(x => { var s = CurrentState(x); return new HolderState(x.Id, x.InvestorUserId, s.Shares, beforeTotal, s.Ownership, x.ShareClass); }).ToList();
        foreach (var position in pending)
        {
            var target = position.InvestorShareCount ?? 0m;
            before.Add(new HolderState(position.Id, position.InvestorUserId, 0m, beforeTotal, 0m, position.ShareClass));
            if (target <= 0m) throw new BusinessValidationException("EQUITY_EVENT_NEW_POSITION_INVALID", "The new position has no valid investor share count.");
        }
        var afterTotal = entity.EventType is EquityCorporateEventType.ShareIssuance or EquityCorporateEventType.CapitalIncrease ? beforeTotal + (entity.SharesIssued ?? 0m) : beforeTotal * (entity.SplitNumerator ?? 0m) / (entity.SplitDenominator ?? 1m);
        if (afterTotal <= 0m) throw new BusinessValidationException("EQUITY_EVENT_CAPITALIZATION_INVALID", "The resulting issued-share count must be positive.");
        var after = new List<HolderState>();
        foreach (var holder in before)
        {
            var position = active.Concat(pending).Single(x => x.Id == holder.PositionId);
            var shares = pending.Any(x => x.Id == holder.PositionId) ? position.InvestorShareCount!.Value : entity.EventType is EquityCorporateEventType.ShareSplit or EquityCorporateEventType.ReverseSplit ? holder.Shares * entity.SplitNumerator!.Value / entity.SplitDenominator!.Value : holder.Shares;
            if (shares % 1m != 0m && entity.EventType == EquityCorporateEventType.ReverseSplit) throw new BusinessValidationException("EQUITY_EVENT_FRACTIONAL_SHARES", "The reverse split would produce fractional holdings.");
            after.Add(holder with { Shares = shares, TotalIssuedShares = afterTotal, Ownership = decimal.Round(shares / afterTotal * 100m, 6) });
        }
        if (pending.Count > 0 && entity.EventType is EquityCorporateEventType.ShareIssuance or EquityCorporateEventType.CapitalIncrease && pending.Sum(x => x.InvestorShareCount ?? 0m) != entity.SharesIssued)
            throw new BusinessValidationException("EQUITY_EVENT_ISSUANCE_RECONCILIATION", "New position shares must reconcile exactly to the declared issued shares.");
        return new EventCalculation(beforeTotal, afterTotal, before, after, new { totalIssuedShares = beforeTotal, holders = before }, new { totalIssuedShares = afterTotal, holders = after });
    }

    private static CurrentHoldingState CurrentState(EquityPosition position)
    {
        var latest = position.LedgerEntries.OrderByDescending(x => x.EffectiveDate).ThenByDescending(x => x.Id).FirstOrDefault();
        var shares = latest?.ResultingInvestorShares ?? position.InitialHoldingSnapshot?.InvestorShareCount ?? position.InvestorShareCount ?? 0m;
        var total = latest?.ResultingTotalIssuedShares ?? position.InitialHoldingSnapshot?.TotalIssuedShares ?? position.TotalIssuedShares ?? 0m;
        var ownership = latest?.ResultingOwnershipPercentage ?? position.InitialHoldingSnapshot?.DerivedOwnershipPercentage ?? (total > 0m ? decimal.Round(shares / total * 100m, 6) : 0m);
        return new CurrentHoldingState(shares, total, ownership);
    }

    private static EquityHoldingLedgerEventType ToLedgerEventType(EquityCorporateEventType type) => type switch { EquityCorporateEventType.ShareIssuance => EquityHoldingLedgerEventType.ShareIssuance, EquityCorporateEventType.CapitalIncrease => EquityHoldingLedgerEventType.CapitalIncrease, EquityCorporateEventType.ShareSplit => EquityHoldingLedgerEventType.ShareSplit, _ => EquityHoldingLedgerEventType.ReverseSplit };
    private static DateTime NormalizeUtc(DateTime value) => value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value, DateTimeKind.Utc) : value.ToUniversalTime();
    private static string HashSnapshot(string json) => Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(json))).ToLowerInvariant();
    private static string? SerializeSnapshot(object? value) => value is null ? null : JsonSerializer.Serialize(value);

    private static AuditLog BuildEventAudit(Guid actor, EquityCorporateEvent entity, string action, object? details) => new() { UserId = actor, EntityType = nameof(EquityCorporateEvent), EntityId = entity.Id == 0 ? entity.CorrelationId ?? "pending" : entity.Id.ToString(), Action = $"EquityCorporateEvent{action}", Changes = JsonSerializer.Serialize(new { entity.EventType, entity.Status, entity.ProjectId, entity.OpportunityId, entity.EffectiveDate, entity.SharesIssued, entity.SplitNumerator, entity.SplitDenominator, entity.Reason, details }), Timestamp = DateTime.UtcNow };

    private async Task NotifyCorporateEventAsync(EquityCorporateEvent entity, EventCalculation result, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        var holders = entity.Positions.Select(x => x.EquityPosition?.InvestorUserId).Where(x => x.HasValue).Select(x => x!.Value).Distinct();
        foreach (var investor in holders)
        {
            var before = result.BeforeHolders.FirstOrDefault(x => x.InvestorId == investor);
            var after = result.AfterHolders.FirstOrDefault(x => x.InvestorId == investor);
            await notifications.CreateEventAsync(new NotificationEventCreation(investor, "EquityCorporateEventApplied", entity.Id.ToString(), "Equity corporate event applied", $"An approved {entity.EventType} event changed the recorded ownership from {before?.Ownership ?? 0m}% to {after?.Ownership ?? 0m}% effective {entity.EffectiveDate:yyyy-MM-dd}. This is not official securities registration.", "info", $"/admin/opportunities/{entity.OpportunityId}/room", entity.AppliedByUserId, entity.OpportunityId, "equity"), cancellationToken);
        }
    }

    private static EquityCorporateEventDto ToEventDto(EquityCorporateEvent entity)
    {
        var beforeSnapshot = entity.CapitalizationSnapshots.FirstOrDefault(x => x.IsBefore)?.TotalIssuedShares;
        var afterSnapshot = entity.CapitalizationSnapshots.FirstOrDefault(x => !x.IsBefore)?.TotalIssuedShares ?? entity.ResultingTotalIssuedShares;
        var positions = entity.Positions.Select(link =>
        {
            var entries = entity.LedgerEntries.Where(x => x.EquityPositionId == link.EquityPositionId).OrderByDescending(x => x.Id).FirstOrDefault();
            return new EquityCorporateEventPositionDto { PositionId = link.EquityPositionId, IsNewPosition = link.IsNewPosition, PreviousOwnershipPercentage = entries?.PreviousOwnershipPercentage, NewOwnershipPercentage = entries?.ResultingOwnershipPercentage, DilutionPercentagePoints = entries?.PreviousOwnershipPercentage - entries?.ResultingOwnershipPercentage, PreviousInvestorShares = entries?.PreviousInvestorShares, NewInvestorShares = entries?.ResultingInvestorShares, PreviousTotalIssuedShares = entries?.PreviousTotalIssuedShares, NewTotalIssuedShares = entries?.ResultingTotalIssuedShares };
        }).ToList();
        return new EquityCorporateEventDto { Id = entity.Id, ProjectId = entity.ProjectId, OpportunityId = entity.OpportunityId, EventType = entity.EventType, Status = entity.Status, EffectiveDate = entity.EffectiveDate, InitiatedByUserId = entity.InitiatedByUserId, ApprovedByUserId = entity.ApprovedByUserId, AppliedByUserId = entity.AppliedByUserId, CreatedAt = entity.CreatedAt, AppliedAt = entity.AppliedAt, Reason = entity.Reason, SharesIssued = entity.SharesIssued, ResultingTotalIssuedShares = entity.ResultingTotalIssuedShares, SplitNumerator = entity.SplitNumerator, SplitDenominator = entity.SplitDenominator, ShareClass = entity.ShareClass, ExpectedTotalIssuedShares = entity.ExpectedTotalIssuedShares, ExpectedLatestAppliedEventId = entity.ExpectedLatestAppliedEventId, PreviousTotalIssuedShares = beforeSnapshot, AfterTotalIssuedShares = afterSnapshot, Positions = positions };
    }

    private sealed record CurrentHoldingState(decimal Shares, decimal Total, decimal Ownership);
    private sealed record HolderState(int PositionId, Guid InvestorId, decimal Shares, decimal TotalIssuedShares, decimal Ownership, string? ShareClass) { public decimal Total => TotalIssuedShares; }
    private sealed record EventCalculation(decimal BeforeTotal, decimal AfterTotal, IReadOnlyList<HolderState> BeforeHolders, IReadOnlyList<HolderState> AfterHolders, object BeforeSnapshot, object AfterSnapshot);

    private async Task NotifyAsync(EquityPosition position, string eventType, DateTime now, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try
        {
            var entityId = position.Id > 0 ? position.Id.ToString() : $"participation:{position.ParticipationRequestId}:leg:{position.OfferLegId}";
            await notifications.CreateEventRangeAsync([
                new NotificationEventCreation(position.FounderUserId, eventType, entityId, eventType == "EquityPositionActivated" ? "Equity ownership record activated" : "Equity position recorded as pending funding", "FOPX One recorded a contractual Equity position. This is not custody or official share registration by the platform.", eventType == "EquityPositionActivated" ? "success" : "info", $"/admin/opportunities/{position.OpportunityId}/room", position.InvestorUserId, position.OpportunityId, "equity"),
                new NotificationEventCreation(position.InvestorUserId, eventType, entityId, eventType == "EquityPositionActivated" ? "Equity ownership record activated" : "Equity position recorded as pending funding", "FOPX One recorded a contractual Equity position. This is not custody or official share registration by the platform.", eventType == "EquityPositionActivated" ? "success" : "info", $"/admin/opportunities/{position.OpportunityId}/room", position.FounderUserId, position.OpportunityId, "equity")
            ], cancellationToken);
        }
        catch (Exception ex) { logger.LogWarning(ex, "Equity position notification failed for {PositionId}", position.Id); }
    }

    private static AuditLog BuildAudit(Guid actor, string action, EquityPosition position, EquitySnapshot snapshot, decimal confirmedAmount, DateTime now) => new()
    {
        UserId = actor == Guid.Empty ? position.FounderUserId : actor,
        EntityType = nameof(EquityPosition),
        EntityId = position.Id == 0 ? $"participation:{position.ParticipationRequestId}:leg:{position.OfferLegId}" : position.Id.ToString(),
        Action = action,
        Changes = JsonSerializer.Serialize(new { position.ParticipationRequestId, position.ContractId, position.ContractVersionId, position.AcceptedOfferId, position.AcceptedOfferVersionNumber, position.OfferLegId, position.OwnershipModel, position.Status, position.InvestmentAmount, position.Currency, snapshot.ContractualOwnershipPercentage, snapshot.InvestorShareCount, snapshot.TotalIssuedShares, snapshot.EffectiveOwnershipDate, confirmedAmount }),
        Timestamp = now
    };

    private static EquityPositionDto ToDto(EquityPosition position)
    {
        var latest = position.LedgerEntries.OrderByDescending(x => x.EffectiveDate).ThenByDescending(x => x.Id).FirstOrDefault();
        var snapshot = position.InitialHoldingSnapshot;
        var initialOwnership = snapshot?.DerivedOwnershipPercentage ?? position.ContractualOwnershipPercentage;
        var dilution = initialOwnership.HasValue && latest?.ResultingOwnershipPercentage.HasValue == true ? initialOwnership.Value - latest.ResultingOwnershipPercentage.Value : (decimal?)null;
        return new EquityPositionDto
        {
            Id = position.Id, ParticipationId = position.ParticipationRequestId, ContractId = position.ContractId, ContractVersionId = position.ContractVersionId, OfferId = position.AcceptedOfferId, OfferVersion = position.AcceptedOfferVersionNumber, OfferLegId = position.OfferLegId, OpportunityId = position.OpportunityId, InvestorId = position.InvestorUserId, InvestmentAmount = position.InvestmentAmount, Currency = position.Currency, OwnershipModel = position.OwnershipModel, Status = position.Status, ContractualOwnershipPercentage = position.ContractualOwnershipPercentage, CurrentOwnershipPercentage = latest?.ResultingOwnershipPercentage ?? snapshot?.DerivedOwnershipPercentage, CurrentInvestorShares = latest?.ResultingInvestorShares, CurrentTotalIssuedShares = latest?.ResultingTotalIssuedShares, InvestorShareCount = position.InvestorShareCount, TotalIssuedShares = position.TotalIssuedShares, InitialOwnershipPercentage = initialOwnership, DilutionPercentagePoints = dilution, DilutionRelativeReductionPercentage = initialOwnership.HasValue && initialOwnership.Value != 0m && dilution.HasValue ? decimal.Round(dilution.Value / initialOwnership.Value * 100m, 6) : null, ShareClass = position.ShareClass, PricePerShare = position.PricePerShare, PreMoneyValuation = position.PreMoneyValuation, PostMoneyValuation = position.PostMoneyValuation, EffectiveOwnershipDate = position.EffectiveOwnershipDate, ActivatedAt = position.ActivatedAt, HasInitialHolding = snapshot is not null, Ledger = position.LedgerEntries.OrderBy(x => x.EffectiveDate).ThenBy(x => x.Id).Select(ToLedgerDto).ToList(), CorporateEvents = position.LedgerEntries.Where(x => x.CorporateEvent is not null).OrderBy(x => x.EffectiveDate).ThenBy(x => x.Id).Select(x => new EquityCorporateEventDto { Id = x.CorporateEventId!.Value, EventType = x.CorporateEvent!.EventType, Status = x.CorporateEvent.Status, EffectiveDate = x.EffectiveDate, Reason = x.CorporateEvent.Reason, AppliedAt = x.CorporateEvent.AppliedAt, PreviousTotalIssuedShares = x.PreviousTotalIssuedShares, AfterTotalIssuedShares = x.ResultingTotalIssuedShares, Positions = [new EquityCorporateEventPositionDto { PositionId = position.Id, PreviousOwnershipPercentage = x.PreviousOwnershipPercentage, NewOwnershipPercentage = x.ResultingOwnershipPercentage, DilutionPercentagePoints = x.PreviousOwnershipPercentage - x.ResultingOwnershipPercentage, PreviousInvestorShares = x.PreviousInvestorShares, NewInvestorShares = x.ResultingInvestorShares, PreviousTotalIssuedShares = x.PreviousTotalIssuedShares, NewTotalIssuedShares = x.ResultingTotalIssuedShares }] }).ToList()
        };
    }

    private static EquityHoldingLedgerEntryDto ToLedgerDto(EquityHoldingLedgerEntry x) => new() { Id = x.Id, EventType = x.EventType, EffectiveDate = x.EffectiveDate, ShareDelta = x.ShareDelta, ResultingInvestorShares = x.ResultingInvestorShares, ResultingTotalIssuedShares = x.ResultingTotalIssuedShares, ResultingOwnershipPercentage = x.ResultingOwnershipPercentage, ContractualOwnershipPercentage = x.ContractualOwnershipPercentage, ContractId = x.ContractId, ContractVersionId = x.ContractVersionId, OfferId = x.AcceptedOfferId, OfferLegId = x.OfferLegId, CorporateEventId = x.CorporateEventId, PreviousInvestorShares = x.PreviousInvestorShares, PreviousTotalIssuedShares = x.PreviousTotalIssuedShares, PreviousOwnershipPercentage = x.PreviousOwnershipPercentage, ShareClass = x.ShareClass, CreatedAt = x.CreatedAt };

    private static void ValidateSnapshot(EquitySnapshot snapshot)
    {
        if (snapshot.Amount <= 0 || string.IsNullOrWhiteSpace(snapshot.Currency)) throw new BusinessValidationException("EQUITY_CONTRACT_TERMS_INVALID", "The immutable Equity contract snapshot is incomplete.");
        if (snapshot.OwnershipModel == EquityOwnershipModel.PercentageBased && (!snapshot.ContractualOwnershipPercentage.HasValue || snapshot.ContractualOwnershipPercentage <= 0 || snapshot.ContractualOwnershipPercentage > 100)) throw new BusinessValidationException("EQUITY_CONTRACT_TERMS_INVALID", "The immutable PercentageBased Equity snapshot is invalid.");
        if (snapshot.OwnershipModel == EquityOwnershipModel.ShareBased && (!snapshot.InvestorShareCount.HasValue || !snapshot.TotalIssuedShares.HasValue || snapshot.InvestorShareCount <= 0 || snapshot.TotalIssuedShares <= 0 || snapshot.InvestorShareCount > snapshot.TotalIssuedShares)) throw new BusinessValidationException("EQUITY_CONTRACT_TERMS_INVALID", "The immutable ShareBased Equity snapshot is invalid.");
    }

    private static bool TryReadSnapshot(string json, int offerLegId, out EquitySnapshot snapshot, out string reason)
    {
        snapshot = default!; reason = "The Equity OfferLeg is not present in the immutable Contract snapshot.";
        try
        {
            using var doc = JsonDocument.Parse(json ?? "{}");
            var root = doc.RootElement;
            JsonElement legs = root.ValueKind == JsonValueKind.Array ? root : root.TryGetProperty("sourceAgreedTerms", out var source) ? source : root.TryGetProperty("legs", out var nested) ? nested : default;
            if (legs.ValueKind != JsonValueKind.Array) return false;
            JsonElement selected = default;
            foreach (var candidate in legs.EnumerateArray())
            {
                if (ReadInt(candidate, "offerLegId") == offerLegId) { selected = candidate; break; }
            }
            if (selected.ValueKind == JsonValueKind.Undefined) return false;
            var modelText = ReadString(selected, "equityOwnershipModel", "ownershipModel");
            if (!Enum.TryParse<EquityOwnershipModel>(modelText, true, out var model)) { reason = "The accepted Equity OfferLeg has no explicit ownership model."; return false; }
            var start = ReadDate(selected, "effectiveOwnershipDate");
            snapshot = new EquitySnapshot(model, ReadDecimal(selected, "amount"), ReadString(selected, "currency")?.Trim().ToUpperInvariant() ?? string.Empty, ReadNullableDecimal(selected, "equityPercentage"), ReadNullableDecimal(selected, "investorShareCount"), ReadNullableDecimal(selected, "totalIssuedShares"), ReadString(selected, "shareClass"), ReadNullableDecimal(selected, "pricePerShare"), ReadNullableDecimal(selected, "preMoneyValuation"), ReadNullableDecimal(selected, "postMoneyValuation"), start, ReadInt(selected, "legNumber"));
            return true;
        }
        catch (JsonException) { reason = "The immutable Equity Contract snapshot is not valid JSON."; return false; }
    }

    private static JsonElement Find(JsonElement element, params string[] names) { if (element.ValueKind == JsonValueKind.Object) foreach (var p in element.EnumerateObject()) if (names.Any(n => string.Equals(n, p.Name, StringComparison.OrdinalIgnoreCase))) return p.Value; return default; }
    private static string? ReadString(JsonElement e, params string[] names) { var v = Find(e, names); return v.ValueKind == JsonValueKind.String ? v.GetString() : v.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined ? null : v.ToString(); }
    private static decimal ReadDecimal(JsonElement e, params string[] names) => ReadNullableDecimal(e, names) ?? 0m;
    private static decimal? ReadNullableDecimal(JsonElement e, params string[] names) { var v = Find(e, names); if (v.ValueKind == JsonValueKind.Number && v.TryGetDecimal(out var n)) return n; return decimal.TryParse(v.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out n) ? n : null; }
    private static int ReadInt(JsonElement e, params string[] names) { var v = Find(e, names); return v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var n) ? n : int.TryParse(v.ToString(), out n) ? n : 0; }
    private static DateTime? ReadDate(JsonElement e, params string[] names) => DateTime.TryParse(ReadString(e, names), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var value) ? value : null;

    private sealed record EquitySnapshot(EquityOwnershipModel OwnershipModel, decimal Amount, string Currency, decimal? ContractualOwnershipPercentage, decimal? InvestorShareCount, decimal? TotalIssuedShares, string? ShareClass, decimal? PricePerShare, decimal? PreMoneyValuation, decimal? PostMoneyValuation, DateTime? EffectiveOwnershipDate, int LegNumber);
}
