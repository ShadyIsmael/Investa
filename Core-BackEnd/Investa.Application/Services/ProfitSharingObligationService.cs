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

public sealed class ProfitSharingObligationService(
    IUnitOfWork uow,
    IFileUploadService fileUpload,
    IFileStorage fileStorage,
    IUserNotificationService? notifications,
    ILogger<ProfitSharingObligationService> logger) : IProfitSharingObligationService
{
    private const string EvidenceCategory = "PROFIT_SHARING_EVIDENCE";
    private const string CalculationVersion = "profit-share-v1";
    private static readonly SemaphoreSlim LifecycleGate = new(1, 1);

    public async Task<ProfitSharingObligation?> EnsureActivatedForConfirmedFundingAsync(
        int participationRequestId,
        Guid activatedByUserId,
        CancellationToken cancellationToken = default)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationRequestId);
        if (participation is null
            || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation
            || participation.Status != OpportunityJoinRequestStatus.Approved)
            return null;

        var contractCommittedAmount = participation.FundingAmount ?? participation.RequestedAmount ?? 0m;
        if (contractCommittedAmount <= 0m)
            return null;

        var declarations = await uow.Repository<FundingDeclaration>().FindAsync(x => x.ParticipationId == participationRequestId);
        var confirmedAmount = FundingSemantics.SumConfirmed(declarations);
        if (confirmedAmount <= 0m)
            return null;

        var contract = await uow.Repository<InvestmentContract>().GetSingleAsync(
            x => x.ParticipationRequestId == participationRequestId && x.Status == InvestmentContractStatus.Active,
            x => x.Versions);
        if (contract is null || !contract.AcceptedOfferId.HasValue || !contract.AcceptedOfferVersionNumber.HasValue)
            return null;

        var contractVersion = contract.Versions.SingleOrDefault(x =>
            x.VersionNumber == contract.CurrentVersionNumber && x.Status == InvestmentContractVersionStatus.Active);
        if (contractVersion is null)
            return null;

        var acceptedOffer = await uow.Repository<NegotiationOffer>().GetSingleAsync(
            x => x.Id == contract.AcceptedOfferId.Value && x.Status == NegotiationOfferStatus.Accepted,
            x => x.Legs);
        if (acceptedOffer is null
            || acceptedOffer.OpportunityId != contract.OpportunityId
            || acceptedOffer.Version != contract.AcceptedOfferVersionNumber.Value)
            return null;

        var profitLegs = acceptedOffer.Legs.Where(x => x.LegType == NegotiationOfferLegType.ProfitSharing).OrderBy(x => x.Id).ToList();
        if (profitLegs.Count != 1)
        {
            logger.LogWarning("Profit Sharing activation skipped for participation {ParticipationId}: exactly one Profit Sharing OfferLeg is required.", participationRequestId);
            return null;
        }

        var leg = profitLegs[0];
        if (!TryReadContractSnapshot(contractVersion.TermsSnapshotJson, acceptedOffer, leg, out var snapshot, out var reason))
        {
            logger.LogWarning("Profit Sharing activation skipped for participation {ParticipationId}: {Reason}", participationRequestId, reason);
            return null;
        }

        var confirmedForLeg = await ConfirmedAmountForLegAsync(participationRequestId, declarations, leg.Id, acceptedOffer.Legs.Count == 1 ? confirmedAmount : 0m);
        var committedAmount = leg.Amount;
        if (confirmedForLeg <= 0m)
            return null;
        var fullyConfirmed = confirmedForLeg >= committedAmount;
        var existing = await uow.Repository<ProfitSharingObligation>().GetSingleAsync(
            x => x.ParticipationRequestId == participationRequestId && x.OfferLegId == leg.Id,
            x => x.ReportingPeriods);
        var now = DateTime.UtcNow;

        if (existing is not null)
        {
            if (existing.Status == ProfitSharingObligationStatus.PendingFunding && fullyConfirmed)
            {
                existing.Status = ProfitSharingObligationStatus.Active;
                existing.ActivatedAt = now;
                if (existing.ReportingPeriods.Count == 0)
                    AddPeriods(existing, snapshot, now);
                await AddAuditAsync(activatedByUserId, "Activate", existing, snapshot, confirmedForLeg, now);
            }
            return existing;
        }

        var obligation = new ProfitSharingObligation
        {
            ParticipationRequestId = participationRequestId,
            ContractId = contract.Id,
            ContractVersionId = contractVersion.Id,
            AcceptedOfferId = acceptedOffer.Id,
            AcceptedOfferVersionNumber = acceptedOffer.Version,
            OfferLegId = leg.Id,
            OfferLegNumber = snapshot.LegNumber,
            FounderUserId = contract.FounderUserId,
            InvestorUserId = contract.InvestorUserId,
            ContributionAmount = snapshot.ContributionAmount,
            Currency = snapshot.Currency,
            ProfitSharePercentage = snapshot.ProfitSharePercentage,
            ReportingFrequency = snapshot.ReportingFrequency,
            CalculationBasis = snapshot.CalculationBasis,
            ContractualStartDate = snapshot.ContractualStartDate,
            ContractualEndDate = snapshot.ContractualEndDate,
            Status = fullyConfirmed ? ProfitSharingObligationStatus.Active : ProfitSharingObligationStatus.PendingFunding,
            ActivatedAt = fullyConfirmed ? now : null,
            CreatedAt = now
        };

        if (fullyConfirmed)
            AddPeriods(obligation, snapshot, now);

        await uow.Repository<ProfitSharingObligation>().AddAsync(obligation);
        await AddAuditAsync(activatedByUserId, fullyConfirmed ? "Activate" : "CreatePendingFunding", obligation, snapshot, confirmedForLeg, now);
        return obligation;
    }

    private async Task<decimal> ConfirmedAmountForLegAsync(int participationId, IEnumerable<FundingDeclaration> declarations, int offerLegId, decimal legacySingleLegAmount)
    {
        var allocations = await uow.Repository<FundingDeclarationLegAllocation>().FindAsync(x => x.ParticipationId == participationId && x.OfferLegId == offerLegId);
        if (!allocations.Any())
            return legacySingleLegAmount;
        var confirmedIds = declarations.Where(x => x.Status == FundingDeclarationStatus.Confirmed).Select(x => x.Id).ToHashSet();
        return allocations.Where(x => confirmedIds.Contains(x.FundingDeclarationId)).Sum(x => x.AllocatedAmount);
    }

    public async Task<IReadOnlyDictionary<int, IReadOnlyList<ProfitSharingObligation>>> GetByParticipationAsync(
        IEnumerable<int> participationRequestIds,
        CancellationToken cancellationToken = default)
    {
        var ids = participationRequestIds.Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<int, IReadOnlyList<ProfitSharingObligation>>();

        var obligations = await uow.Repository<ProfitSharingObligation>().Query()
            .Where(x => ids.Contains(x.ParticipationRequestId))
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Declaration)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Declaration).ThenInclude(x => x!.SupportingEvidenceFile)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Entitlement)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.DistributionDeclarations).ThenInclude(x => x.Allocation)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.DistributionDeclarations).ThenInclude(x => x.SupportingEvidenceFile)
            .ToListAsync(cancellationToken);
        return obligations.GroupBy(x => x.ParticipationRequestId)
            .ToDictionary(x => x.Key, x => (IReadOnlyList<ProfitSharingObligation>)x.OrderBy(o => o.OfferLegNumber).ThenBy(o => o.Id).ToList());
    }

    public async Task<ProfitSharingSummaryDto> GetForParticipationAsync(
        Guid actorId,
        int opportunityId,
        int participationId,
        bool isAdmin = false,
        CancellationToken cancellationToken = default)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationId)
            ?? throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "The Participation was not found.");
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
        if (participation.OpportunityId != opportunityId
            || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation
            || participation.Status != OpportunityJoinRequestStatus.Approved
            || (!isAdmin && actorId != opportunity?.FounderId && actorId != participation.InvestorId))
            throw new BusinessValidationException("PROFIT_SHARING_FORBIDDEN", "You are not authorized to view this Profit Sharing obligation.");

        var obligations = await uow.Repository<ProfitSharingObligation>().Query()
            .Where(x => x.ParticipationRequestId == participationId)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Declaration)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Declaration).ThenInclude(x => x!.SupportingEvidenceFile)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.Entitlement)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.DistributionDeclarations).ThenInclude(x => x.Allocation)
            .Include(x => x.ReportingPeriods).ThenInclude(x => x.DistributionDeclarations).ThenInclude(x => x.SupportingEvidenceFile)
            .ToListAsync(cancellationToken);
        var periods = obligations.SelectMany(x => x.ReportingPeriods).ToList();
        return new ProfitSharingSummaryDto
        {
            ParticipationId = participationId,
            Obligations = obligations.OrderBy(x => x.OfferLegNumber).ThenBy(x => x.Id).Select(ToDto).ToList(),
            TotalEntitlement = periods.Sum(x => x.Entitlement?.EntitlementAmount ?? 0m),
            TotalConfirmedDistributed = periods.Sum(x => ConfirmedDistributed(x)),
            TotalPendingConfirmation = periods.Sum(x => x.Entitlement?.PendingDistributionAmount ?? 0m),
            TotalDisputed = periods.Sum(x => x.DistributionDeclarations.Where(d => d.Status == ProfitSharingDistributionDeclarationStatus.Disputed).Sum(d => d.DeclaredAmount)),
            TotalDistributionOutstanding = periods.Sum(x => x.Entitlement?.DistributionOutstanding ?? 0m),
            TotalDeclaredResult = periods.Sum(x => x.Declaration?.DeclaredResultAmount ?? 0m),
            CompletedPeriods = periods.Count(IsPeriodComplete),
            TotalPeriods = periods.Count
        };
    }

    public async Task<ProfitSharingDeclarationDto> DeclareAsync(
        Guid founderId,
        int opportunityId,
        int obligationId,
        int reportingPeriodId,
        ProfitSharingDeclarationCreateCommand command,
        CancellationToken cancellationToken = default)
    {
        ValidateCommand(command);
        await LifecycleGate.WaitAsync(cancellationToken);
        FileUploadResult? uploadedEvidence = null;
        try
        {
            var obligation = await uow.Repository<ProfitSharingObligation>().GetSingleAsync(
                x => x.Id == obligationId,
                x => x.ReportingPeriods);
            if (obligation is null)
                throw new BusinessValidationException("PROFIT_SHARING_OBLIGATION_NOT_FOUND", "The Profit Sharing obligation was not found.");
            var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
                ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
            if (obligation.ParticipationRequestId <= 0 || obligation.FounderUserId != founderId || opportunity.FounderId != founderId)
                throw new BusinessValidationException("PROFIT_SHARING_FORBIDDEN", "Only the Founder of the Profit Sharing obligation can declare a period result.");
            var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(obligation.ParticipationRequestId);
            if (participation is null
                || participation.OpportunityId != opportunityId
                || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation
                || participation.Status != OpportunityJoinRequestStatus.Approved)
                throw new BusinessValidationException("PROFIT_SHARING_FORBIDDEN", "The Profit Sharing obligation is not attached to an eligible Participation in this Opportunity.");
            if (obligation.Status is not (ProfitSharingObligationStatus.Active or ProfitSharingObligationStatus.Matured))
                throw new BusinessValidationException("PROFIT_SHARING_OBLIGATION_INACTIVE", "Period results can only be declared while the Profit Sharing lifecycle is active or matured.");
            if (!string.Equals(obligation.Currency, NormalizeCurrency(command.Currency), StringComparison.OrdinalIgnoreCase))
                throw new BusinessValidationException("PROFIT_SHARING_CURRENCY_MISMATCH", "Declaration currency must match the contractual Profit Sharing currency.");

            var period = obligation.ReportingPeriods.SingleOrDefault(x => x.Id == reportingPeriodId)
                ?? throw new BusinessValidationException("PROFIT_SHARING_PERIOD_NOT_FOUND", "The Reporting Period does not belong to the exact Profit Sharing obligation.");
            var idempotencyKey = Normalize(command.IdempotencyKey);
            if (idempotencyKey is not null)
            {
                var replay = (await uow.Repository<ProfitSharingPeriodDeclaration>().FindAsync(x => x.ProfitSharingObligationId == obligationId && x.IdempotencyKey == idempotencyKey)).SingleOrDefault();
                if (replay is not null)
                    return await ToDtoAsync(replay, cancellationToken);
            }
            var existing = await uow.Repository<ProfitSharingPeriodDeclaration>().GetSingleAsync(x => x.ReportingPeriodId == reportingPeriodId);
            if (existing is not null)
                throw new BusinessValidationException("PROFIT_SHARING_PERIOD_ALREADY_DECLARED", "This Reporting Period already has a declaration.");
            if (obligation.CalculationBasis == ProfitSharingCalculationBasis.Profit && Math.Round(command.DeclaredBasisAmount, 2) != Math.Round(command.DeclaredResultAmount, 2))
                throw new BusinessValidationException("PROFIT_SHARING_BASIS_MISMATCH", "Declared basis amount and declared result must match for the contractual Profit basis.");

            if (command.EvidenceContent is not null)
            {
                uploadedEvidence = await fileUpload.UploadAsync(new FileUploadCommand(
                    EvidenceCategory,
                    command.EvidenceContent,
                    command.EvidenceOriginalFileName ?? "profit-sharing-evidence.pdf",
                    command.EvidenceContentType,
                    command.EvidenceFileSize,
                    founderId,
                    opportunity.ProjectId,
                    "ProfitSharingPeriodDeclaration",
                    $"obligation:{obligationId}:period:{reportingPeriodId}"), cancellationToken);
            }

            await uow.BeginTransactionAsync();
            try
            {
                var now = DateTime.UtcNow;
                var declaration = new ProfitSharingPeriodDeclaration
                {
                    ProfitSharingObligationId = obligation.Id,
                    ReportingPeriodId = period.Id,
                    ParticipationId = obligation.ParticipationRequestId,
                    ContractId = obligation.ContractId,
                    ContractVersionId = obligation.ContractVersionId,
                    FounderUserId = obligation.FounderUserId,
                    InvestorUserId = obligation.InvestorUserId,
                    CalculationBasis = obligation.CalculationBasis,
                    DeclaredBasisAmount = decimal.Round(command.DeclaredBasisAmount, 2),
                    DeclaredResultAmount = decimal.Round(command.DeclaredResultAmount, 2),
                    Currency = obligation.Currency,
                    DeclarationDate = command.DeclarationDate,
                    ExternalReference = Normalize(command.ExternalReference),
                    Notes = Normalize(command.Notes),
                    SupportingEvidenceFileId = uploadedEvidence?.FileId,
                    DeclaredByUserId = founderId,
                    DeclaredAt = now,
                    Status = ProfitSharingDeclarationStatus.Declared,
                    IdempotencyKey = idempotencyKey
                };
                period.Status = EffectivePeriodStatus(period, now);
                period.Status = ProfitSharingReportingPeriodStatus.Declared;
                declaration.Obligation = obligation;
                declaration.ReportingPeriod = period;
                period.Declaration = declaration;
                await uow.Repository<ProfitSharingPeriodDeclaration>().AddAsync(declaration);

                if (obligation.CalculationBasis is ProfitSharingCalculationBasis.Profit or ProfitSharingCalculationBasis.Revenue)
                {
                    declaration.CalculationError = command.DeclaredResultAmount < 0m
                        ? "Loss result recorded; current contract does not define investor loss-sharing, so entitlement is zero."
                        : null;
                    if (command.DeclaredResultAmount > 0m)
                    {
                        var entitlementAmount = decimal.Round(command.DeclaredResultAmount * obligation.ProfitSharePercentage / 100m, 2, MidpointRounding.AwayFromZero);
                        var entitlement = new ProfitSharingEntitlement
                        {
                            ProfitSharingObligationId = obligation.Id,
                            ReportingPeriodId = period.Id,
                            DeclarationId = declaration.Id,
                            CalculationBasis = obligation.CalculationBasis,
                            BasisAmount = decimal.Round(command.DeclaredResultAmount, 2),
                            ProfitSharePercentage = obligation.ProfitSharePercentage,
                            EntitlementAmount = entitlementAmount,
                            DistributionOutstanding = entitlementAmount,
                            Currency = obligation.Currency,
                            CalculationVersion = CalculationVersion,
                            CalculatedAt = now
                        };
                        await uow.Repository<ProfitSharingEntitlement>().AddAsync(entitlement);
                        declaration.Entitlement = entitlement;
                        entitlement.Declaration = declaration;
                        entitlement.ReportingPeriod = period;
                        period.Entitlement = entitlement;
                        period.Status = ProfitSharingReportingPeriodStatus.EntitlementCalculated;
                    }
                    else
                    {
                        period.Status = ProfitSharingReportingPeriodStatus.NoEntitlement;
                    }
                }
                else
                {
                    declaration.CalculationError = "The accepted Contract snapshot does not define a supported Profit Sharing calculation basis.";
                }

                await AddAuditAsync(founderId, "DeclarePeriodResult", declaration, obligation, period, now);
                if (period.Entitlement is not null)
                    await AddAuditAsync(founderId, "CalculateEntitlement", period.Entitlement, obligation, period, now);
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();
                await NotifyInvestorAsync(declaration, opportunity, period, cancellationToken);
                if (period.Status == ProfitSharingReportingPeriodStatus.EntitlementCalculated)
                    await NotifyEntitlementAsync(declaration, opportunity, period, cancellationToken);
                return await ToDtoAsync(declaration, cancellationToken);
            }
            catch
            {
                await uow.RollbackTransactionAsync();
                throw;
            }
        }
        catch (IOException ex) when (command.EvidenceContent is not null && uploadedEvidence is null)
        {
            logger.LogWarning(ex, "Profit Sharing evidence upload unavailable for period {ReportingPeriodId}", reportingPeriodId);
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_UPLOAD_UNAVAILABLE", "Supporting evidence is temporarily unavailable. You can submit the declaration without evidence and try again later.");
        }
        catch
        {
            if (uploadedEvidence is not null)
            {
                try { await fileStorage.DeleteFileAsync(uploadedEvidence.FileKey); } catch (Exception cleanup) { logger.LogWarning(cleanup, "Failed to clean up Profit Sharing evidence {FileKey}", uploadedEvidence.FileKey); }
            }
            throw;
        }
        finally
        {
            LifecycleGate.Release();
        }
    }

    public async Task<ProfitSharingEvidenceDownload> DownloadEvidenceAsync(Guid actorId, int declarationId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var declaration = await uow.Repository<ProfitSharingPeriodDeclaration>().GetByIdAsync(declarationId)
            ?? throw new BusinessValidationException("PROFIT_SHARING_DECLARATION_NOT_FOUND", "The Profit Sharing declaration was not found.");
        if (!isAdmin && declaration.FounderUserId != actorId && declaration.InvestorUserId != actorId)
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_FORBIDDEN", "You are not authorized to access this evidence.");
        if (string.IsNullOrWhiteSpace(declaration.SupportingEvidenceFileId))
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_NOT_FOUND", "No supporting evidence was provided.");
        var file = (await uow.Repository<StoredFile>().FindAsync(x => x.FileId == declaration.SupportingEvidenceFileId && !x.IsDeleted)).SingleOrDefault()
            ?? throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_NOT_FOUND", "The supporting evidence is not available.");
        return new ProfitSharingEvidenceDownload(await fileStorage.ReadFileAsync(file.FileKey, cancellationToken), file.OriginalFileName, file.MimeType);
    }

    public async Task<ProfitSharingDistributionDeclarationDto> DeclareDistributionAsync(
        Guid founderId,
        int opportunityId,
        int obligationId,
        int reportingPeriodId,
        ProfitSharingDistributionCreateCommand command,
        CancellationToken cancellationToken = default)
    {
        ValidateDistributionCommand(command);
        await LifecycleGate.WaitAsync(cancellationToken);
        FileUploadResult? uploadedEvidence = null;
        try
        {
            var obligation = await uow.Repository<ProfitSharingObligation>().GetByIdAsync(obligationId)
                ?? throw new BusinessValidationException("PROFIT_SHARING_OBLIGATION_NOT_FOUND", "The Profit Sharing obligation was not found.");
            var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
                ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
            var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(obligation.ParticipationRequestId)
                ?? throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "The Profit Sharing Participation was not found.");
            if (participation.OpportunityId != opportunityId || obligation.FounderUserId != founderId || opportunity.FounderId != founderId)
                throw new BusinessValidationException("PROFIT_SHARING_FORBIDDEN", "Only the Founder of the exact Profit Sharing participation can declare a distribution.");
            if (obligation.Status is not (ProfitSharingObligationStatus.Active or ProfitSharingObligationStatus.Matured))
                throw new BusinessValidationException("PROFIT_SHARING_OBLIGATION_INACTIVE", "Distributions can only be declared while the Profit Sharing lifecycle is active or matured.");
            if (!string.Equals(NormalizeCurrency(command.Currency), obligation.Currency, StringComparison.OrdinalIgnoreCase))
                throw new BusinessValidationException("PROFIT_SHARING_CURRENCY_MISMATCH", "Distribution currency must match the contractual Profit Sharing currency.");

            var idempotencyKey = Normalize(command.IdempotencyKey);
            if (idempotencyKey is not null)
            {
                var replay = await uow.Repository<ProfitSharingDistributionDeclaration>().Query()
                    .Include(x => x.Allocation)
                    .SingleOrDefaultAsync(x => x.ProfitSharingObligationId == obligationId && x.IdempotencyKey == idempotencyKey, cancellationToken);
                if (replay is not null) return ToDistributionDto(replay);
            }

            if (command.EvidenceContent is not null)
            {
                uploadedEvidence = await fileUpload.UploadAsync(new FileUploadCommand(
                    "PROFIT_SHARING_DISTRIBUTION_EVIDENCE",
                    command.EvidenceContent,
                    command.EvidenceOriginalFileName ?? "profit-sharing-distribution-evidence.pdf",
                    command.EvidenceContentType,
                    command.EvidenceFileSize,
                    founderId,
                    opportunity.ProjectId,
                    "ProfitSharingDistributionDeclaration",
                    $"obligation:{obligationId}:period:{reportingPeriodId}"), cancellationToken);
            }

            await uow.BeginTransactionAsync();
            try
            {
                var period = await uow.Repository<ProfitSharingReportingPeriod>().Query()
                    .Include(x => x.Entitlement)
                    .SingleOrDefaultAsync(x => x.Id == reportingPeriodId && x.ProfitSharingObligationId == obligationId, cancellationToken)
                    ?? throw new BusinessValidationException("PROFIT_SHARING_PERIOD_NOT_FOUND", "The Reporting Period does not belong to the exact Profit Sharing obligation.");
                var entitlement = period.Entitlement
                    ?? throw new BusinessValidationException("PROFIT_SHARING_ENTITLEMENT_REQUIRED", "A calculated positive entitlement is required before a distribution can be declared.");
                if (entitlement.EntitlementAmount <= 0m || period.Status == ProfitSharingReportingPeriodStatus.NoEntitlement)
                    throw new BusinessValidationException("PROFIT_SHARING_NO_ENTITLEMENT", "A distribution cannot be declared for a period without a positive entitlement.");

                if (idempotencyKey is not null)
                {
                    var replay = await uow.Repository<ProfitSharingDistributionDeclaration>().Query()
                        .Include(x => x.Allocation)
                        .SingleOrDefaultAsync(x => x.ProfitSharingObligationId == obligationId && x.IdempotencyKey == idempotencyKey, cancellationToken);
                    if (replay is not null)
                    {
                        await uow.RollbackTransactionAsync();
                        return ToDistributionDto(replay);
                    }
                }

                var remaining = entitlement.EntitlementAmount - (entitlement.EntitlementAmount - entitlement.DistributionOutstanding) - entitlement.PendingDistributionAmount;
                if (command.DeclaredAmount > decimal.Round(Math.Max(0m, remaining), 2))
                    throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_OVERALLOCATION", "The declared distribution exceeds the remaining distributable entitlement.");

                var now = DateTime.UtcNow;
                entitlement.PendingDistributionAmount = decimal.Round(entitlement.PendingDistributionAmount + command.DeclaredAmount, 2);
                var declaration = new ProfitSharingDistributionDeclaration
                {
                    ProfitSharingObligationId = obligation.Id,
                    ReportingPeriodId = period.Id,
                    EntitlementId = entitlement.Id,
                    ParticipationId = obligation.ParticipationRequestId,
                    ContractId = obligation.ContractId,
                    ContractVersionId = obligation.ContractVersionId,
                    AcceptedOfferId = obligation.AcceptedOfferId,
                    AcceptedOfferVersionNumber = obligation.AcceptedOfferVersionNumber,
                    OfferLegId = obligation.OfferLegId,
                    FounderUserId = obligation.FounderUserId,
                    InvestorUserId = obligation.InvestorUserId,
                    DeclaredAmount = decimal.Round(command.DeclaredAmount, 2),
                    Currency = obligation.Currency,
                    DeclaredAt = now,
                    ExternalReference = Normalize(command.ExternalReference),
                    Notes = Normalize(command.Notes),
                    SupportingEvidenceFileId = uploadedEvidence?.FileId,
                    DeclaredByUserId = founderId,
                    Status = ProfitSharingDistributionDeclarationStatus.PendingConfirmation,
                    IdempotencyKey = idempotencyKey
                };
                await uow.Repository<ProfitSharingEntitlement>().UpdateAsync(entitlement);
                await uow.Repository<ProfitSharingDistributionDeclaration>().AddAsync(declaration);
                await uow.Repository<AuditLog>().AddAsync(BuildDistributionAudit(founderId, "ProfitSharingDistributionDeclared", declaration, period, entitlement, null, declaration.Status, now));
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();
                await NotifyDistributionAsync(declaration, opportunity, period, "ProfitSharingDistributionDeclared", "Profit Sharing distribution awaiting your acknowledgement.", cancellationToken);
                return await LoadDistributionDtoAsync(declaration.Id, cancellationToken);
            }
            catch
            {
                await uow.RollbackTransactionAsync();
                throw;
            }
        }
        catch (IOException ex) when (command.EvidenceContent is not null && uploadedEvidence is null)
        {
            logger.LogWarning(ex, "Profit Sharing distribution evidence upload unavailable for period {ReportingPeriodId}", reportingPeriodId);
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_UPLOAD_UNAVAILABLE", "Supporting evidence is temporarily unavailable. You can submit the distribution without evidence and try again later.");
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrent Profit Sharing distribution declaration for obligation {ObligationId}, period {PeriodId}", obligationId, reportingPeriodId);
            throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_CONCURRENCY", "The distribution capacity changed while this declaration was being submitted. Please review the current entitlement and try again.");
        }
        catch
        {
            if (uploadedEvidence is not null)
            {
                try { await fileStorage.DeleteFileAsync(uploadedEvidence.FileKey); } catch (Exception cleanup) { logger.LogWarning(cleanup, "Failed to clean up Profit Sharing distribution evidence {FileKey}", uploadedEvidence.FileKey); }
            }
            throw;
        }
        finally { LifecycleGate.Release(); }
    }

    public Task<ProfitSharingDistributionDeclarationDto> ConfirmDistributionAsync(Guid investorId, int declarationId, string? comment, CancellationToken cancellationToken = default) =>
        TransitionDistributionAsync(investorId, declarationId, ProfitSharingDistributionDeclarationStatus.Confirmed, Normalize(comment), cancellationToken);

    public Task<ProfitSharingDistributionDeclarationDto> DisputeDistributionAsync(Guid investorId, int declarationId, string reason, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_DISPUTE_REASON_REQUIRED", "A dispute reason is required.");
        if (reason.Trim().Length > 2000)
            throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_DISPUTE_REASON_INVALID", "The dispute reason cannot exceed 2,000 characters.");
        return TransitionDistributionAsync(investorId, declarationId, ProfitSharingDistributionDeclarationStatus.Disputed, reason.Trim(), cancellationToken);
    }

    private async Task<ProfitSharingDistributionDeclarationDto> TransitionDistributionAsync(Guid investorId, int declarationId, ProfitSharingDistributionDeclarationStatus target, string? decisionText, CancellationToken cancellationToken)
    {
        await LifecycleGate.WaitAsync(cancellationToken);
        try
        {
            await uow.BeginTransactionAsync();
            try
            {
                var declaration = await uow.Repository<ProfitSharingDistributionDeclaration>().Query()
                    .Include(x => x.Obligation)
                    .Include(x => x.ReportingPeriod).ThenInclude(x => x!.Entitlement)
                    .Include(x => x.Allocation)
                    .SingleOrDefaultAsync(x => x.Id == declarationId, cancellationToken)
                    ?? throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_NOT_FOUND", "The Profit Sharing distribution declaration was not found.");
                if (declaration.InvestorUserId != investorId)
                    throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_FORBIDDEN", "Only the owning Investor can confirm or dispute this distribution.");
                if (declaration.Obligation is null || declaration.Obligation.Status is not (ProfitSharingObligationStatus.Active or ProfitSharingObligationStatus.Matured))
                    throw new BusinessValidationException("PROFIT_SHARING_OBLIGATION_INACTIVE", "Distribution decisions are not allowed after settlement or closure.");
                if (declaration.Status == target)
                {
                    await uow.RollbackTransactionAsync();
                    return ToDistributionDto(declaration);
                }
                if (declaration.Status == ProfitSharingDistributionDeclarationStatus.Confirmed)
                    throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_ALREADY_CONFIRMED", "This distribution is already confirmed and cannot be changed.");
                if (declaration.Status == ProfitSharingDistributionDeclarationStatus.Disputed)
                    throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_ALREADY_DISPUTED", "This distribution is already disputed and cannot be changed.");

                var entitlement = declaration.ReportingPeriod?.Entitlement
                    ?? throw new BusinessValidationException("PROFIT_SHARING_ENTITLEMENT_REQUIRED", "The Profit Sharing entitlement was not found.");
                var oldStatus = declaration.Status;
                var now = DateTime.UtcNow;
                entitlement.PendingDistributionAmount = decimal.Round(Math.Max(0m, entitlement.PendingDistributionAmount - declaration.DeclaredAmount), 2);
                if (target == ProfitSharingDistributionDeclarationStatus.Confirmed)
                {
                    if (declaration.DeclaredAmount > decimal.Round(Math.Max(0m, entitlement.DistributionOutstanding), 2))
                        throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_OVERALLOCATION", "The confirmed distribution exceeds the remaining entitlement.");
                    entitlement.DistributionOutstanding = decimal.Round(entitlement.DistributionOutstanding - declaration.DeclaredAmount, 2);
                    var allocation = new ProfitSharingDistributionAllocation
                    {
                        ProfitSharingDistributionDeclarationId = declaration.Id,
                        ProfitSharingObligationId = declaration.ProfitSharingObligationId,
                        ReportingPeriodId = declaration.ReportingPeriodId,
                        EntitlementId = declaration.EntitlementId,
                        InvestorUserId = declaration.InvestorUserId,
                        Amount = declaration.DeclaredAmount,
                        Currency = declaration.Currency,
                        ConfirmedAt = now,
                        DecisionActorId = investorId
                    };
                    declaration.Allocation = allocation;
                    await uow.Repository<ProfitSharingDistributionAllocation>().AddAsync(allocation);
                }
                declaration.Status = target;
                declaration.DecidedAt = now;
                declaration.DecidedByUserId = investorId;
                if (target == ProfitSharingDistributionDeclarationStatus.Confirmed) declaration.ConfirmationComment = decisionText;
                else declaration.DisputeReason = decisionText;
                var reportingPeriod = declaration.ReportingPeriod!;
                RefreshPeriodStatus(reportingPeriod, entitlement);
                declaration.Obligation = null;
                declaration.ReportingPeriod = null;
                declaration.Entitlement = null;
                declaration.Allocation = null;
                reportingPeriod.Obligation = null;
                reportingPeriod.Declaration = null;
                reportingPeriod.Entitlement = null;
                await uow.Repository<ProfitSharingDistributionDeclaration>().UpdateAsync(declaration);
                await uow.Repository<ProfitSharingReportingPeriod>().UpdateAsync(reportingPeriod);
                await uow.Repository<ProfitSharingEntitlement>().UpdateAsync(entitlement);
                await uow.Repository<AuditLog>().AddAsync(BuildDistributionAudit(investorId, target == ProfitSharingDistributionDeclarationStatus.Confirmed ? "ProfitSharingDistributionConfirmed" : "ProfitSharingDistributionDisputed", declaration, reportingPeriod, entitlement, oldStatus, target, now, decisionText));
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();
                var opportunity = await FindOpportunityForDistributionAsync(declaration);
                if (opportunity is not null)
                    await NotifyDistributionAsync(declaration, opportunity, reportingPeriod, target == ProfitSharingDistributionDeclarationStatus.Confirmed ? "ProfitSharingDistributionConfirmed" : "ProfitSharingDistributionDisputed", target == ProfitSharingDistributionDeclarationStatus.Confirmed ? "Your Investor acknowledged the declared Profit Sharing distribution." : "Your Investor disputed the declared Profit Sharing distribution.", cancellationToken);
                return await LoadDistributionDtoAsync(declaration.Id, cancellationToken);
            }
            catch
            {
                await uow.RollbackTransactionAsync();
                throw;
            }
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrent Profit Sharing distribution decision for declaration {DeclarationId}", declarationId);
            throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_CONCURRENCY", "The distribution state changed while this decision was being submitted. Please refresh and try again.");
        }
        finally { LifecycleGate.Release(); }
    }

    public async Task<ProfitSharingEvidenceDownload> DownloadDistributionEvidenceAsync(Guid actorId, int declarationId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var declaration = await uow.Repository<ProfitSharingDistributionDeclaration>().GetByIdAsync(declarationId)
            ?? throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_NOT_FOUND", "The Profit Sharing distribution declaration was not found.");
        if (!isAdmin && declaration.FounderUserId != actorId && declaration.InvestorUserId != actorId)
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_FORBIDDEN", "You are not authorized to access this evidence.");
        if (string.IsNullOrWhiteSpace(declaration.SupportingEvidenceFileId))
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_NOT_FOUND", "No supporting evidence was provided.");
        var file = (await uow.Repository<StoredFile>().FindAsync(x => x.FileId == declaration.SupportingEvidenceFileId && !x.IsDeleted)).SingleOrDefault()
            ?? throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_NOT_FOUND", "The supporting evidence is not available.");
        return new ProfitSharingEvidenceDownload(await fileStorage.ReadFileAsync(file.FileKey, cancellationToken), file.OriginalFileName, file.MimeType);
    }

    private static void AddPeriods(ProfitSharingObligation obligation, Snapshot snapshot, DateTime now)
    {
        var interval = FrequencyMonths(snapshot.ReportingFrequency);
        var durationMonths = Math.Max(1, (int)Math.Ceiling((snapshot.ContractualEndDate - snapshot.ContractualStartDate).TotalDays / 30.4375));
        var count = Math.Max(1, (int)Math.Ceiling(durationMonths / (decimal)interval));
        for (var i = 1; i <= count; i++)
        {
            var start = snapshot.ContractualStartDate.AddMonths(interval * (i - 1));
            var end = i == count ? snapshot.ContractualEndDate : snapshot.ContractualStartDate.AddMonths(interval * i);
            obligation.ReportingPeriods.Add(new ProfitSharingReportingPeriod
            {
                PeriodNumber = i,
                StartDate = start,
                EndDate = end,
                IsFinalPeriod = i == count,
                ReportingDueDate = end,
                Currency = snapshot.Currency,
                Status = start <= now ? ProfitSharingReportingPeriodStatus.Open : ProfitSharingReportingPeriodStatus.Upcoming,
                CreatedAt = now
            });
        }
    }

    private async Task AddAuditAsync(Guid actor, string action, ProfitSharingObligation obligation, Snapshot snapshot, decimal confirmedAmount, DateTime now)
    {
        await uow.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = actor,
            EntityType = nameof(ProfitSharingObligation),
            EntityId = obligation.Id == 0 ? $"participation:{obligation.ParticipationRequestId}:leg:{obligation.OfferLegId}" : obligation.Id.ToString(),
            Action = action,
            Changes = JsonSerializer.Serialize(new { obligation.ParticipationRequestId, obligation.ContractId, obligation.ContractVersionId, obligation.AcceptedOfferId, obligation.OfferLegId, obligation.ContributionAmount, obligation.Currency, obligation.ProfitSharePercentage, obligation.ReportingFrequency, obligation.CalculationBasis, obligation.Status, confirmedAmount, periodCount = obligation.ReportingPeriods.Count }),
            Timestamp = now
        });
    }

    private async Task AddAuditAsync(Guid actor, string action, ProfitSharingPeriodDeclaration declaration, ProfitSharingObligation obligation, ProfitSharingReportingPeriod period, DateTime now)
    {
        await uow.Repository<AuditLog>().AddAsync(new AuditLog { UserId = actor, EntityType = nameof(ProfitSharingPeriodDeclaration), EntityId = declaration.Id == 0 ? $"obligation:{obligation.Id}:period:{period.Id}" : declaration.Id.ToString(), Action = action, Changes = JsonSerializer.Serialize(new { obligationId = obligation.Id, periodId = period.Id, declaration.DeclaredBasisAmount, declaration.DeclaredResultAmount, declaration.CalculationBasis, declaration.Currency, periodStatus = period.Status }), Timestamp = now });
    }

    private async Task AddAuditAsync(Guid actor, string action, ProfitSharingEntitlement entitlement, ProfitSharingObligation obligation, ProfitSharingReportingPeriod period, DateTime now)
    {
        await uow.Repository<AuditLog>().AddAsync(new AuditLog { UserId = actor, EntityType = nameof(ProfitSharingEntitlement), EntityId = entitlement.Id == 0 ? $"obligation:{obligation.Id}:period:{period.Id}" : entitlement.Id.ToString(), Action = action, Changes = JsonSerializer.Serialize(new { obligationId = obligation.Id, periodId = period.Id, entitlement.BasisAmount, entitlement.ProfitSharePercentage, entitlement.EntitlementAmount, entitlement.DistributionOutstanding, entitlement.Currency, entitlement.CalculationVersion }), Timestamp = now });
    }

    private async Task NotifyInvestorAsync(ProfitSharingPeriodDeclaration declaration, Opportunity opportunity, ProfitSharingReportingPeriod period, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try { await notifications.CreateEventAsync(new NotificationEventCreation(declaration.InvestorUserId, "ProfitSharingPeriodDeclared", declaration.Id.ToString(), "Profit Sharing period result submitted", $"The Founder submitted the result for Profit Sharing period {period.PeriodNumber}.", "info", $"/admin/opportunities/{opportunity.Id}/room", declaration.FounderUserId, opportunity.Id, "profit-sharing"), cancellationToken); }
        catch (Exception ex) { logger.LogWarning(ex, "Profit Sharing declaration notification failed for {DeclarationId}", declaration.Id); }
    }

    private async Task NotifyEntitlementAsync(ProfitSharingPeriodDeclaration declaration, Opportunity opportunity, ProfitSharingReportingPeriod period, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try { await notifications.CreateEventAsync(new NotificationEventCreation(declaration.InvestorUserId, "ProfitSharingEntitlementCalculated", declaration.Id.ToString(), "Profit Sharing entitlement available", $"The entitlement for Profit Sharing period {period.PeriodNumber} is now available for review.", "success", $"/admin/opportunities/{opportunity.Id}/room", declaration.FounderUserId, opportunity.Id, "profit-sharing"), cancellationToken); }
        catch (Exception ex) { logger.LogWarning(ex, "Profit Sharing entitlement notification failed for {DeclarationId}", declaration.Id); }
    }

    private async Task<ProfitSharingDeclarationDto> ToDtoAsync(ProfitSharingPeriodDeclaration declaration, CancellationToken cancellationToken)
    {
        var row = await uow.Repository<ProfitSharingPeriodDeclaration>().Query()
            .Where(x => x.Id == declaration.Id)
            .Include(x => x.ReportingPeriod).ThenInclude(x => x!.Entitlement)
            .Include(x => x.Entitlement)
            .Include(x => x.SupportingEvidenceFile)
            .SingleOrDefaultAsync(cancellationToken) ?? declaration;
        return ToDto(row);
    }

    private async Task<ProfitSharingDistributionDeclarationDto> LoadDistributionDtoAsync(int declarationId, CancellationToken cancellationToken)
    {
        var row = await uow.Repository<ProfitSharingDistributionDeclaration>().Query()
            .Include(x => x.ReportingPeriod).ThenInclude(x => x!.Entitlement)
            .Include(x => x.Allocation)
            .Include(x => x.SupportingEvidenceFile)
            .SingleOrDefaultAsync(x => x.Id == declarationId, cancellationToken)
            ?? throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_NOT_FOUND", "The Profit Sharing distribution declaration was not found.");
        return ToDistributionDto(row);
    }

    private static ProfitSharingObligationDto ToDto(ProfitSharingObligation obligation) => new()
    {
        Id = obligation.Id, ParticipationId = obligation.ParticipationRequestId, ContractId = obligation.ContractId, ContractVersionId = obligation.ContractVersionId, AcceptedOfferId = obligation.AcceptedOfferId, OfferLegId = obligation.OfferLegId, FounderUserId = obligation.FounderUserId, InvestorUserId = obligation.InvestorUserId, ContributionAmount = obligation.ContributionAmount, Currency = obligation.Currency, ProfitSharePercentage = obligation.ProfitSharePercentage, ReportingFrequency = obligation.ReportingFrequency, CalculationBasis = obligation.CalculationBasis.ToString(), ContractualStartDate = obligation.ContractualStartDate, ContractualEndDate = obligation.ContractualEndDate, Status = obligation.Status.ToString(), ActivatedAt = obligation.ActivatedAt, MaturedAt = obligation.MaturedAt, SettledAt = obligation.SettledAt, ClosedAt = obligation.ClosedAt, ClosedByUserId = obligation.ClosedByUserId, ClosureReason = obligation.ClosureReason, ClosureSnapshotHash = obligation.ClosureSnapshotHash, ClosureSnapshotVersion = obligation.ClosureSnapshotVersion, TotalDeclaredResult = obligation.ReportingPeriods.Sum(x => x.Declaration?.DeclaredResultAmount ?? 0m), TotalEntitlement = obligation.ReportingPeriods.Sum(x => x.Entitlement?.EntitlementAmount ?? 0m), TotalConfirmedDistributed = obligation.ReportingPeriods.Sum(ConfirmedDistributed), TotalPendingConfirmation = obligation.ReportingPeriods.Sum(x => x.Entitlement?.PendingDistributionAmount ?? 0m), TotalDisputed = obligation.ReportingPeriods.Sum(x => x.DistributionDeclarations.Where(d => d.Status == ProfitSharingDistributionDeclarationStatus.Disputed).Sum(d => d.DeclaredAmount)), TotalDistributionOutstanding = obligation.ReportingPeriods.Sum(x => x.Entitlement?.DistributionOutstanding ?? 0m), CompletedPeriods = obligation.ReportingPeriods.Count(IsPeriodComplete), TotalPeriods = obligation.ReportingPeriods.Count,
        ReportingPeriods = obligation.ReportingPeriods.OrderBy(x => x.PeriodNumber).Select(ToDto).ToList()
    };

    private static ProfitSharingReportingPeriodDto ToDto(ProfitSharingReportingPeriod period) => new()
    {
        Id = period.Id, ObligationId = period.ProfitSharingObligationId, PeriodNumber = period.PeriodNumber, IsFinalPeriod = period.IsFinalPeriod, StartDate = period.StartDate, EndDate = period.EndDate, ReportingDueDate = period.ReportingDueDate, Currency = period.Currency, Status = EffectivePeriodStatus(period, DateTime.UtcNow).ToString(), HasDeclaration = period.Declaration is not null, DeclaredBasisAmount = period.Declaration?.DeclaredBasisAmount, DeclaredResultAmount = period.Declaration?.DeclaredResultAmount, DeclarationStatus = period.Declaration?.Status.ToString(), Declaration = period.Declaration is null ? null : ToDto(period.Declaration, period.PeriodNumber), InvestorEntitlement = period.Entitlement?.EntitlementAmount, DistributionOutstanding = period.Entitlement?.DistributionOutstanding, ConfirmedDistributed = ConfirmedDistributed(period), PendingConfirmation = period.Entitlement?.PendingDistributionAmount ?? 0m, Disputed = period.DistributionDeclarations.Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Disputed).Sum(x => x.DeclaredAmount), DistributionDeclarations = period.DistributionDeclarations.OrderBy(x => x.Id).Select(ToDistributionDto).ToList()
    };

    private static ProfitSharingDeclarationDto ToDto(ProfitSharingPeriodDeclaration declaration, int? periodNumber = null) => new()
    {
        Id = declaration.Id, ObligationId = declaration.ProfitSharingObligationId, ReportingPeriodId = declaration.ReportingPeriodId, PeriodNumber = periodNumber ?? declaration.ReportingPeriod?.PeriodNumber ?? 0, FounderUserId = declaration.FounderUserId, InvestorUserId = declaration.InvestorUserId, CalculationBasis = declaration.CalculationBasis.ToString(), DeclaredBasisAmount = declaration.DeclaredBasisAmount, DeclaredResultAmount = declaration.DeclaredResultAmount, Currency = declaration.Currency, DeclarationDate = declaration.DeclarationDate, ExternalReference = declaration.ExternalReference, Notes = declaration.Notes, EvidenceAvailable = declaration.SupportingEvidenceFile is not null && !declaration.SupportingEvidenceFile.IsDeleted, EvidenceFileName = declaration.SupportingEvidenceFile?.OriginalFileName, Status = declaration.Status.ToString(), DeclaredAt = declaration.DeclaredAt, DeclaredByUserId = declaration.DeclaredByUserId, CalculationError = declaration.CalculationError, Entitlement = declaration.Entitlement is null ? null : ToEntitlementDto(declaration.Entitlement, declaration.ReportingPeriod)
    };

    private static ProfitSharingEntitlementDto ToEntitlementDto(ProfitSharingEntitlement entitlement, ProfitSharingReportingPeriod? period) => new()
    {
        BasisAmount = entitlement.BasisAmount,
        ProfitSharePercentage = entitlement.ProfitSharePercentage,
        EntitlementAmount = entitlement.EntitlementAmount,
        DistributionOutstanding = entitlement.DistributionOutstanding,
        ConfirmedDistributed = entitlement.EntitlementAmount - entitlement.DistributionOutstanding,
        PendingConfirmation = entitlement.PendingDistributionAmount,
        Disputed = period?.DistributionDeclarations.Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Disputed).Sum(x => x.DeclaredAmount) ?? 0m,
        Currency = entitlement.Currency,
        CalculationBasis = entitlement.CalculationBasis.ToString(),
        CalculationVersion = entitlement.CalculationVersion,
        CalculatedAt = entitlement.CalculatedAt
    };

    private static ProfitSharingDistributionDeclarationDto ToDistributionDto(ProfitSharingDistributionDeclaration declaration) => new()
    {
        Id = declaration.Id,
        ObligationId = declaration.ProfitSharingObligationId,
        ReportingPeriodId = declaration.ReportingPeriodId,
        EntitlementId = declaration.EntitlementId,
        ParticipationId = declaration.ParticipationId,
        ContractId = declaration.ContractId,
        ContractVersionId = declaration.ContractVersionId,
        AcceptedOfferId = declaration.AcceptedOfferId,
        OfferLegId = declaration.OfferLegId,
        FounderUserId = declaration.FounderUserId,
        InvestorUserId = declaration.InvestorUserId,
        DeclaredAmount = declaration.DeclaredAmount,
        Currency = declaration.Currency,
        DeclaredAt = declaration.DeclaredAt,
        ExternalReference = declaration.ExternalReference,
        Notes = declaration.Notes,
        EvidenceAvailable = declaration.SupportingEvidenceFile is not null && !declaration.SupportingEvidenceFile.IsDeleted,
        EvidenceFileName = declaration.SupportingEvidenceFile?.OriginalFileName,
        DeclaredByUserId = declaration.DeclaredByUserId,
        Status = declaration.Status.ToString(),
        DecidedAt = declaration.DecidedAt,
        DecidedByUserId = declaration.DecidedByUserId,
        ConfirmationComment = declaration.ConfirmationComment,
        DisputeReason = declaration.DisputeReason,
        Allocation = declaration.Allocation is null ? null : new ProfitSharingDistributionAllocationDto
        {
            Id = declaration.Allocation.Id,
            DeclarationId = declaration.Allocation.ProfitSharingDistributionDeclarationId,
            ReportingPeriodId = declaration.Allocation.ReportingPeriodId,
            Amount = declaration.Allocation.Amount,
            Currency = declaration.Allocation.Currency,
            ConfirmedAt = declaration.Allocation.ConfirmedAt,
            DecisionActorId = declaration.Allocation.DecisionActorId
        }
    };

    private static decimal ConfirmedDistributed(ProfitSharingReportingPeriod period) => period.DistributionDeclarations.Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Confirmed).Sum(x => x.DeclaredAmount);

    private static void RefreshPeriodStatus(ProfitSharingReportingPeriod period, ProfitSharingEntitlement entitlement)
    {
        if (entitlement.EntitlementAmount <= 0m) { period.Status = ProfitSharingReportingPeriodStatus.NoEntitlement; return; }
        var confirmed = entitlement.EntitlementAmount - entitlement.DistributionOutstanding;
        period.Status = confirmed >= entitlement.EntitlementAmount ? ProfitSharingReportingPeriodStatus.Distributed : confirmed > 0m ? ProfitSharingReportingPeriodStatus.PartiallyDistributed : ProfitSharingReportingPeriodStatus.EntitlementCalculated;
    }

    private static bool IsPeriodComplete(ProfitSharingReportingPeriod period)
    {
        if (period.Declaration is null) return false;
        if (period.Entitlement is null) return period.Status == ProfitSharingReportingPeriodStatus.NoEntitlement;
        return period.Entitlement.EntitlementAmount <= 0m
            ? period.Status == ProfitSharingReportingPeriodStatus.NoEntitlement
            : period.Entitlement.DistributionOutstanding <= 0m
                && period.DistributionDeclarations.Where(x => x.Status == ProfitSharingDistributionDeclarationStatus.Confirmed).Sum(x => x.DeclaredAmount) >= period.Entitlement.EntitlementAmount;
    }

    private static AuditLog BuildDistributionAudit(Guid actor, string action, ProfitSharingDistributionDeclaration declaration, ProfitSharingReportingPeriod period, ProfitSharingEntitlement entitlement, ProfitSharingDistributionDeclarationStatus? previousStatus, ProfitSharingDistributionDeclarationStatus newStatus, DateTime now, string? decisionText = null) => new()
    {
        UserId = actor,
        EntityType = nameof(ProfitSharingDistributionDeclaration),
        EntityId = declaration.Id == 0 ? $"obligation:{declaration.ProfitSharingObligationId}:period:{period.Id}" : declaration.Id.ToString(),
        Action = action,
        Changes = JsonSerializer.Serialize(new { declaration.ProfitSharingObligationId, declaration.ReportingPeriodId, declaration.EntitlementId, period.PeriodNumber, entitlement.EntitlementAmount, declaration.DeclaredAmount, declaration.Currency, previousState = previousStatus?.ToString(), newState = newStatus.ToString(), decisionText, confirmedDistributed = entitlement.EntitlementAmount - entitlement.DistributionOutstanding, pending = entitlement.PendingDistributionAmount, outstanding = entitlement.DistributionOutstanding }),
        Timestamp = now
    };

    private async Task NotifyDistributionAsync(ProfitSharingDistributionDeclaration declaration, Opportunity opportunity, ProfitSharingReportingPeriod period, string eventType, string message, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try
        {
            var recipient = eventType == "ProfitSharingDistributionDeclared" ? declaration.InvestorUserId : declaration.FounderUserId;
            await notifications.CreateEventAsync(new NotificationEventCreation(recipient, eventType, declaration.Id.ToString(), eventType == "ProfitSharingDistributionDeclared" ? "Profit Sharing distribution awaiting acknowledgement" : "Profit Sharing distribution decision recorded", message, eventType.EndsWith("Disputed", StringComparison.Ordinal) ? "warning" : "info", $"/admin/opportunities/{opportunity.Id}/room", eventType == "ProfitSharingDistributionDeclared" ? declaration.FounderUserId : declaration.InvestorUserId, opportunity.Id, "profit-sharing"), cancellationToken);
        }
        catch (Exception ex) { logger.LogWarning(ex, "Profit Sharing distribution notification failed for {DeclarationId}", declaration.Id); }
    }

    private async Task<Opportunity?> FindOpportunityForDistributionAsync(ProfitSharingDistributionDeclaration declaration)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(declaration.ParticipationId);
        return participation is null ? null : await uow.Repository<Opportunity>().GetByIdAsync(participation.OpportunityId);
    }

    private static void ValidateCommand(ProfitSharingDeclarationCreateCommand command)
    {
        if (command.Currency is null || string.IsNullOrWhiteSpace(command.Currency) || command.Currency.Trim().Length is < 3 or > 10)
            throw new BusinessValidationException("PROFIT_SHARING_CURRENCY_INVALID", "A valid declaration currency is required.");
        if (command.DeclarationDate > DateTime.UtcNow.AddMinutes(5))
            throw new BusinessValidationException("PROFIT_SHARING_DATE_INVALID", "The declaration date cannot be in the future.");
        if (command.EvidenceContent is not null && (command.EvidenceFileSize <= 0 || string.IsNullOrWhiteSpace(command.EvidenceOriginalFileName)))
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_METADATA_REQUIRED", "Supporting evidence metadata is incomplete.");
    }

    private static void ValidateDistributionCommand(ProfitSharingDistributionCreateCommand command)
    {
        if (command.DeclaredAmount <= 0m)
            throw new BusinessValidationException("PROFIT_SHARING_DISTRIBUTION_AMOUNT_INVALID", "A positive distribution amount is required.");
        if (command.Currency is null || string.IsNullOrWhiteSpace(command.Currency) || command.Currency.Trim().Length is < 3 or > 10)
            throw new BusinessValidationException("PROFIT_SHARING_CURRENCY_INVALID", "A valid distribution currency is required.");
        if (command.EvidenceContent is not null && (command.EvidenceFileSize <= 0 || string.IsNullOrWhiteSpace(command.EvidenceOriginalFileName)))
            throw new BusinessValidationException("PROFIT_SHARING_EVIDENCE_METADATA_REQUIRED", "Supporting evidence metadata is incomplete.");
    }

    private static ProfitSharingReportingPeriodStatus EffectivePeriodStatus(ProfitSharingReportingPeriod period, DateTime now) => period.Status == ProfitSharingReportingPeriodStatus.Upcoming && period.StartDate <= now ? ProfitSharingReportingPeriodStatus.Open : period.Status;
    private static string NormalizeCurrency(string value) => value.Trim().ToUpperInvariant();
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static int FrequencyMonths(string frequency) => ProfitSharingFrequencyCatalog.NormalizeOrThrow(frequency) switch
    {
        ProfitSharingFrequencyCatalog.Monthly => 1,
        ProfitSharingFrequencyCatalog.Quarterly => 3,
        ProfitSharingFrequencyCatalog.SemiAnnual => 6,
        ProfitSharingFrequencyCatalog.Annual => 12,
        _ => throw new BusinessValidationException("UNSUPPORTED_PROFIT_SHARING_FREQUENCY", "Profit Sharing frequency is unsupported.")
    };

    private static bool TryReadContractSnapshot(string json, NegotiationOffer offer, NegotiationOfferLeg leg, out Snapshot snapshot, out string reason)
    {
        snapshot = default;
        reason = string.Empty;
        if (string.IsNullOrWhiteSpace(json)) { reason = "Contract snapshot is missing."; return false; }
        try
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;
            var accepted = Property(Property(root, "acceptedOffer"), "id");
            var acceptedVersion = Property(Property(root, "acceptedOffer"), "versionNumber");
            if (Int(accepted) != offer.Id || Int(acceptedVersion) != offer.Version) { reason = "Accepted Offer version does not match the Contract snapshot."; return false; }
            var terms = Property(root, "sourceAgreedTerms");
            var candidate = terms.ValueKind == JsonValueKind.Array ? terms.EnumerateArray().FirstOrDefault(x => Int(Property(x, "offerLegId")) == leg.Id) : default;
            if (candidate.ValueKind == JsonValueKind.Undefined) { reason = "Exact Profit Sharing OfferLeg terms are missing from the Contract snapshot."; return false; }
            if (!string.Equals(Text(Property(candidate, "legType")), NegotiationOfferLegType.ProfitSharing.ToString(), StringComparison.OrdinalIgnoreCase)) { reason = "The selected Contract leg is not Profit Sharing."; return false; }
            var start = Date(Property(candidate, "contractualStartDate"));
            if (start == default) start = Date(Property(root, "acceptanceTimestamp"));
            var termMonths = Int(Property(candidate, "termMonths"));
            var end = Date(Property(candidate, "contractualEndDate"));
            if (end == default) end = Date(Property(candidate, "contractualMaturityDate"));
            if (end == default && start != default && termMonths > 0) end = start.AddMonths(termMonths);
            var frequency = ProfitSharingFrequencyCatalog.TryNormalizeCanonical(Text(Property(candidate, "reportingFrequency")), out var reportingFrequency)
                ? reportingFrequency
                : ProfitSharingFrequencyCatalog.TryNormalizeCanonical(Text(Property(candidate, "payoutFrequency")), out var payoutFrequency)
                    ? payoutFrequency
                    : null;
            if (frequency is null) { reason = "Contract snapshot does not define a supported Profit Sharing reporting frequency."; return false; }
            var percentage = Decimal(Property(candidate, "profitSharePercentage"));
            var contribution = Decimal(Property(candidate, "amount"));
            var currency = Text(Property(candidate, "currency"));
            if (string.IsNullOrWhiteSpace(currency)) currency = Text(Property(root, "currency"));
            var basisText = Text(Property(candidate, "calculationBasis"));
            var basis = Enum.TryParse<ProfitSharingCalculationBasis>(basisText, true, out var parsed) ? parsed : ProfitSharingCalculationBasis.Undefined;
            if (contribution <= 0m || percentage <= 0m || percentage > 100m || start == default || end <= start || string.IsNullOrWhiteSpace(currency)) { reason = "Contract snapshot does not contain valid Profit Sharing terms."; return false; }
            snapshot = new Snapshot(contribution, NormalizeCurrency(currency), percentage, frequency, basis, start, end, Int(Property(candidate, "legNumber")));
            return true;
        }
        catch (JsonException) { reason = "Contract snapshot is malformed."; return false; }
    }

    private static JsonElement Property(JsonElement element, string name) => element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var value) ? value : default;
    private static string Text(JsonElement value) => value.ValueKind == JsonValueKind.String ? value.GetString() ?? string.Empty : value.ToString();
    private static int Int(JsonElement value) => value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number) ? number : int.TryParse(value.ToString(), out number) ? number : 0;
    private static decimal Decimal(JsonElement value) => value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var number) ? number : decimal.TryParse(value.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out number) ? number : 0m;
    private static DateTime Date(JsonElement value) => DateTime.TryParse(Text(value), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var date) ? date : default;

    private readonly record struct Snapshot(decimal ContributionAmount, string Currency, decimal ProfitSharePercentage, string ReportingFrequency, ProfitSharingCalculationBasis CalculationBasis, DateTime ContractualStartDate, DateTime ContractualEndDate, int LegNumber);
}
