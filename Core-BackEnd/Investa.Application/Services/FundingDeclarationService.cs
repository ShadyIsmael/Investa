using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public sealed class FundingDeclarationService(
    IUnitOfWork uow,
    IFileUploadService fileUpload,
    IFileStorage fileStorage,
    IUserNotificationService notifications,
    ILogger<FundingDeclarationService> logger,
    ILoanObligationService? loanObligations = null,
    IProfitSharingObligationService? profitSharingObligations = null,
    IEquityPositionService? equityPositions = null) : IFundingDeclarationService
{
    private const string ProofCategory = "FUNDING_PROOF";
    private static readonly SemaphoreSlim DeclarationGate = new(1, 1);
    private static readonly string[] PaymentMethods = ["BankTransfer", "Cash", "Cheque", "Other"];
    private readonly IProfitSharingObligationService? _profitSharingObligations = profitSharingObligations;
    private readonly IEquityPositionService? _equityPositions = equityPositions;

    public async Task<FundingDeclarationDto> CreateAsync(
        Guid founderId,
        int opportunityId,
        int participationId,
        FundingDeclarationCreateCommand command,
        CancellationToken cancellationToken = default)
    {
        ValidateCommand(command);

        await DeclarationGate.WaitAsync(cancellationToken);
        FileUploadResult? uploadedProof = null;
        try
        {
            await uow.BeginTransactionAsync();
            try
            {
                var participation = await uow.Repository<OpportunityJoinRequest>()
                    .GetByIdWithIncludesAsync(participationId, r => r.Opportunity!);
                if (participation is null
                    || participation.OpportunityId != opportunityId
                    || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation
                    || participation.Status != OpportunityJoinRequestStatus.Approved)
                    throw new BusinessValidationException("PARTICIPATION_NOT_APPROVED", "Funding can only be declared for an approved Participation.");

                var opportunity = participation.Opportunity
                    ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
                if (opportunity.FounderId != founderId)
                    throw new BusinessValidationException("FUNDING_DECLARATION_FORBIDDEN", "Only the Opportunity Founder can declare received funds.");

                var canonicalCurrency = NormalizeCurrency(opportunity.FundingCurrency);
                var participationCurrency = NormalizeCurrency(participation.FundingCurrency ?? canonicalCurrency);
                if (!string.Equals(canonicalCurrency, participationCurrency, StringComparison.OrdinalIgnoreCase))
                    throw new BusinessValidationException("PARTICIPATION_CURRENCY_INVALID", "The Participation currency does not match the Opportunity funding currency.");
                if (!string.Equals(canonicalCurrency, NormalizeCurrency(command.CurrencyCode), StringComparison.OrdinalIgnoreCase))
                    throw new BusinessValidationException("FUNDING_DECLARATION_CURRENCY_MISMATCH", "Declaration currency must match the Participation funding currency.");

                var idempotencyKey = Normalize(command.IdempotencyKey);
                if (idempotencyKey is not null)
                {
                    var replay = (await uow.Repository<FundingDeclaration>().FindAsync(d =>
                        d.ParticipationId == participationId && d.IdempotencyKey == idempotencyKey)).SingleOrDefault();
                    if (replay is not null)
                    {
                        await uow.RollbackTransactionAsync();
                        return await ToDtoAsync(replay, cancellationToken);
                    }
                }

                var committedAmount = participation.FundingAmount ?? participation.RequestedAmount ?? 0m;
                if (committedAmount <= 0m)
                    throw new BusinessValidationException("PARTICIPATION_COMMITMENT_MISSING", "The approved Participation has no positive committed amount.");

                var allocationPlan = await BuildAllocationPlanAsync(
                    participation,
                    opportunity,
                    command.LegAllocations,
                    command.Amount,
                    canonicalCurrency,
                    cancellationToken);

                var existingDeclarations = await uow.Repository<FundingDeclaration>().FindAsync(d =>
                    d.ParticipationId == participationId);
                var declaredAmount = FundingSemantics.SumDeclared(existingDeclarations);
                var available = FundingSemantics.CalculateUndeclaredCommittedAmount(committedAmount, declaredAmount);
                if (command.Amount > available)
                    throw new BusinessValidationException("FUNDING_DECLARATION_EXCEEDS_COMMITMENT", $"The declaration exceeds the undeclared commitment capacity of {available:0.00} {canonicalCurrency}.");

                if (command.ProofContent is not null)
                {
                    uploadedProof = await fileUpload.UploadAsync(
                        new FileUploadCommand(
                            ProofCategory,
                            command.ProofContent,
                            command.ProofOriginalFileName ?? "funding-proof.pdf",
                            command.ProofContentType,
                            command.ProofFileSize,
                            founderId,
                            opportunity.ProjectId,
                            "FundingDeclaration",
                            $"participation:{participationId}"),
                        cancellationToken);
                }

                var now = DateTime.UtcNow;
                var declaration = new FundingDeclaration
                {
                    ParticipationId = participationId,
                    OpportunityId = opportunityId,
                    FounderId = founderId,
                    InvestorId = participation.InvestorId,
                    Amount = decimal.Round(command.Amount, 2),
                    CurrencyCode = canonicalCurrency,
                    ReceivedDate = command.ReceivedDate,
                    PaymentMethod = ParsePaymentMethod(command.PaymentMethod),
                    ExternalReference = Normalize(command.ExternalReference),
                    Notes = Normalize(command.Notes),
                    ProofFileId = uploadedProof?.FileId,
                    Status = FundingDeclarationStatus.PendingConfirmation,
                    DeclaredAt = now,
                    CreatedBy = founderId,
                    IdempotencyKey = idempotencyKey,
                    LegAllocations = allocationPlan
                };

                await uow.Repository<FundingDeclaration>().AddAsync(declaration);
                await uow.SaveChangesAsync();

                opportunity.UpdatedAt = now;
                opportunity.Events.Add(new OpportunityEvent
                {
                    OpportunityId = opportunityId,
                    EventType = "FundingDeclared",
                    Title = "Founder declared external funding received",
                    Description = "A Founder recorded funds received directly from the Investor outside FOPX One.",
                    OldValue = null,
                    NewValue = JsonSerializer.Serialize(new
                    {
                        declaration.Id,
                        declaration.ParticipationId,
                        declaration.Amount,
                        declaration.CurrencyCode,
                        declaration.ReceivedDate,
                        PaymentMethod = declaration.PaymentMethod.ToString(),
                        HasProof = declaration.ProofFileId is not null,
                        declaration.Status
                    }),
                    CreatedByUserId = founderId,
                    CreatedAt = now,
                    IsPublic = false,
                    ActorType = "Founder",
                    RelatedEntityType = "FundingDeclaration",
                    RelatedEntityId = declaration.Id.ToString(),
                    IdempotencyKey = $"funding-declaration:{declaration.Id}",
                    IsImmutableTimelineEntry = true
                });
                await uow.Repository<Opportunity>().UpdateAsync(opportunity);
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();

                await NotifyInvestorAsync(declaration, opportunity, cancellationToken);
                return await ToDtoAsync(declaration, cancellationToken);
            }
            catch
            {
                await uow.RollbackTransactionAsync();
                throw;
            }
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrent funding declaration rejected for participation {ParticipationId}", participationId);
            throw new BusinessValidationException("FUNDING_DECLARATION_CONCURRENCY", "Another declaration was submitted at the same time. Refresh and try again.");
        }
        catch (IOException ex) when (command.ProofContent is not null && uploadedProof is null)
        {
            logger.LogWarning(ex, "Funding proof upload unavailable for participation {ParticipationId}", participationId);
            throw new BusinessValidationException(
                "FUNDING_PROOF_UPLOAD_UNAVAILABLE",
                "Payment proof upload is temporarily unavailable. You can record the declaration without proof and try again later.");
        }
        catch
        {
            if (uploadedProof is not null)
                await BestEffortDeleteProofAsync(uploadedProof.FileId, uploadedProof.FileKey);
            throw;
        }
        finally
        {
            DeclarationGate.Release();
        }
    }

    public async Task<IReadOnlyList<FundingDeclarationDto>> GetForParticipationAsync(
        Guid actorId,
        int opportunityId,
        int participationId,
        bool isAdmin = false,
        CancellationToken cancellationToken = default)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationId);
        if (participation is null
            || participation.OpportunityId != opportunityId
            || participation.Status != OpportunityJoinRequestStatus.Approved
            || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation)
            throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "The Participation was not found.");
        if (!isAdmin && participation.InvestorId != actorId)
        {
            var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
            if (opportunity?.FounderId != actorId)
                throw new BusinessValidationException("FUNDING_DECLARATION_FORBIDDEN", "You are not authorized to view these funding declarations.");
        }

        var declarations = await uow.Repository<FundingDeclaration>().FindAsync(d => d.ParticipationId == participationId);
        return await ToDtosAsync(declarations.OrderByDescending(d => d.DeclaredAt), cancellationToken);
    }

    public async Task<FundingDeclarationProofDownload> DownloadProofAsync(
        Guid actorId,
        int declarationId,
        bool isAdmin = false,
        CancellationToken cancellationToken = default)
    {
        var declaration = await uow.Repository<FundingDeclaration>().GetByIdAsync(declarationId)
            ?? throw new BusinessValidationException("FUNDING_DECLARATION_NOT_FOUND", "The funding declaration was not found.");
        if (!isAdmin && declaration.FounderId != actorId && declaration.InvestorId != actorId)
            throw new BusinessValidationException("FUNDING_PROOF_FORBIDDEN", "You are not authorized to access this payment proof.");
        if (string.IsNullOrWhiteSpace(declaration.ProofFileId))
            throw new BusinessValidationException("FUNDING_PROOF_NOT_FOUND", "No payment proof was provided for this declaration.");

        var file = (await uow.Repository<StoredFile>().FindAsync(f => f.FileId == declaration.ProofFileId && !f.IsDeleted)).SingleOrDefault();
        if (file is null || !string.Equals(file.CategoryCode, ProofCategory, StringComparison.OrdinalIgnoreCase))
            throw new BusinessValidationException("FUNDING_PROOF_NOT_FOUND", "The payment proof is not available.");

        var content = await fileStorage.ReadFileAsync(file.FileKey, cancellationToken);
        return new FundingDeclarationProofDownload(content, file.OriginalFileName, file.MimeType);
    }

    public Task<FundingDeclarationDto> ConfirmAsync(
        Guid investorId,
        int declarationId,
        string? comment,
        CancellationToken cancellationToken = default) =>
        TransitionAsync(investorId, declarationId, FundingDeclarationStatus.Confirmed, comment, cancellationToken);

    public Task<FundingDeclarationDto> DisputeAsync(
        Guid investorId,
        int declarationId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new BusinessValidationException("FUNDING_DISPUTE_REASON_REQUIRED", "A dispute reason is required.");
        if (reason.Trim().Length > 2000)
            throw new BusinessValidationException("FUNDING_DISPUTE_REASON_INVALID", "The dispute reason cannot exceed 2,000 characters.");
        return TransitionAsync(investorId, declarationId, FundingDeclarationStatus.Disputed, reason, cancellationToken);
    }

    private async Task<FundingDeclarationDto> TransitionAsync(
        Guid investorId,
        int declarationId,
        FundingDeclarationStatus targetStatus,
        string? decisionText,
        CancellationToken cancellationToken)
    {
        await DeclarationGate.WaitAsync(cancellationToken);
        try
        {
            await uow.BeginTransactionAsync();
            try
            {
                var declaration = await uow.Repository<FundingDeclaration>()
                    .GetByIdWithIncludesAsync(declarationId, d => d.Participation!, d => d.Opportunity!);
                if (declaration is null)
                    throw new BusinessValidationException("FUNDING_DECLARATION_NOT_FOUND", "The funding declaration was not found.");

                var participation = declaration.Participation;
                var opportunity = declaration.Opportunity;
                if (participation is null
                    || opportunity is null
                    || participation.OpportunityId != declaration.OpportunityId
                    || participation.InvestorId != declaration.InvestorId
                    || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation
                    || participation.Status != OpportunityJoinRequestStatus.Approved
                    || opportunity.FounderId != declaration.FounderId)
                    throw new BusinessValidationException("FUNDING_DECLARATION_INVALID_RELATIONSHIP", "The funding declaration is no longer linked to a valid Participation and Opportunity relationship.");
                if (declaration.InvestorId != investorId)
                    throw new BusinessValidationException("FUNDING_DECLARATION_FORBIDDEN", "Only the Investor associated with this declaration can decide it.");

                if (declaration.Status == targetStatus)
                {
                    await uow.RollbackTransactionAsync();
                    return await ToDtoAsync(declaration, cancellationToken);
                }
                if (declaration.Status == FundingDeclarationStatus.Confirmed)
                    throw new BusinessValidationException("FUNDING_DECLARATION_ALREADY_CONFIRMED", "This funding declaration is already confirmed and cannot be changed.");
                if (declaration.Status == FundingDeclarationStatus.Disputed)
                    throw new BusinessValidationException("FUNDING_DECLARATION_ALREADY_DISPUTED", "This funding declaration is already disputed and cannot be changed.");

                var now = DateTime.UtcNow;
                var previousStatus = declaration.Status;
                if (targetStatus == FundingDeclarationStatus.Confirmed)
                {
                    await ValidateConfirmationCapacityAsync(declaration, cancellationToken);
                    declaration.Status = FundingDeclarationStatus.Confirmed;
                    declaration.ConfirmedAt = now;
                    declaration.ConfirmedByInvestorId = investorId;
                    declaration.ConfirmationComment = Normalize(decisionText);
                }
                else
                {
                    declaration.Status = FundingDeclarationStatus.Disputed;
                    declaration.DisputedAt = now;
                    declaration.DisputedByInvestorId = investorId;
                    declaration.DisputeReason = Normalize(decisionText);
                }

                await uow.Repository<FundingDeclaration>().UpdateAsync(declaration);
                opportunity.UpdatedAt = now;
                opportunity.Events.Add(new OpportunityEvent
                {
                    OpportunityId = declaration.OpportunityId,
                    EventType = targetStatus == FundingDeclarationStatus.Confirmed
                        ? "FundingDeclarationConfirmed"
                        : "FundingDeclarationDisputed",
                    Title = targetStatus == FundingDeclarationStatus.Confirmed
                        ? "Investor acknowledged the founder funding declaration"
                        : "Investor disputed the founder funding declaration",
                    Description = targetStatus == FundingDeclarationStatus.Confirmed
                        ? "The Investor acknowledged the Founder declaration. This is a party confirmation and not FOPX payment verification."
                        : "The Investor recorded a dispute about the Founder declaration. FOPX One records the dispute and does not adjudicate it.",
                    OldValue = previousStatus.ToString(),
                    NewValue = JsonSerializer.Serialize(new
                    {
                        declaration.Id,
                        declaration.ParticipationId,
                        declaration.Amount,
                        declaration.CurrencyCode,
                        PreviousStatus = previousStatus.ToString(),
                        NewStatus = declaration.Status.ToString(),
                        declaration.ConfirmedAt,
                        declaration.ConfirmedByInvestorId,
                        declaration.DisputedAt,
                        declaration.DisputedByInvestorId,
                        declaration.DisputeReason,
                        HasProof = declaration.ProofFileId is not null
                    }),
                    CreatedByUserId = investorId,
                    CreatedAt = now,
                    IsPublic = false,
                    ActorType = "Investor",
                    RelatedEntityType = "FundingDeclaration",
                    RelatedEntityId = declaration.Id.ToString(),
                    IdempotencyKey = $"funding-declaration:{declaration.Id}:{declaration.Status}",
                    IsImmutableTimelineEntry = true
                });
                if (targetStatus == FundingDeclarationStatus.Confirmed && loanObligations is not null)
                    await loanObligations.EnsureActivatedForConfirmedFundingAsync(declaration.ParticipationId, investorId, cancellationToken);
                if (targetStatus == FundingDeclarationStatus.Confirmed && _profitSharingObligations is not null)
                    await _profitSharingObligations.EnsureActivatedForConfirmedFundingAsync(declaration.ParticipationId, investorId, cancellationToken);
                if (targetStatus == FundingDeclarationStatus.Confirmed && _equityPositions is not null)
                    await _equityPositions.EnsureActivatedForConfirmedFundingAsync(declaration.ParticipationId, investorId, cancellationToken);
                await uow.Repository<Opportunity>().UpdateAsync(opportunity);
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();

                await NotifyFounderAsync(declaration, opportunity, targetStatus, cancellationToken);
                return await ToDtoAsync(declaration, cancellationToken);
            }
            catch
            {
                await uow.RollbackTransactionAsync();
                throw;
            }
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrent funding declaration decision rejected for declaration {DeclarationId}", declarationId);
            throw new BusinessValidationException("FUNDING_DECLARATION_CONCURRENCY", "This declaration was decided by another request. Refresh and review its current status.");
        }
        finally
        {
            DeclarationGate.Release();
        }
    }

    private async Task NotifyFounderAsync(
        FundingDeclaration declaration,
        Opportunity opportunity,
        FundingDeclarationStatus status,
        CancellationToken cancellationToken)
    {
        try
        {
            var confirmed = status == FundingDeclarationStatus.Confirmed;
            await notifications.CreateEventAsync(new NotificationEventCreation(
                declaration.FounderId,
                confirmed ? "FundingDeclarationConfirmed" : "FundingDeclarationDisputed",
                declaration.Id.ToString(),
                confirmed ? "Investor acknowledged a funding declaration" : "Investor disputed a funding declaration",
                confirmed
                    ? "The Investor acknowledged the Founder funding declaration. This is a party confirmation, not payment verification by FOPX One."
                    : "The Investor disputed the Founder funding declaration. FOPX One records the dispute and does not adjudicate it.",
                confirmed ? "success" : "warning",
                $"/admin/opportunities/{opportunity.Id}/room",
                declaration.InvestorId,
                opportunity.Id,
                "funding"), cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Funding declaration {DeclarationId} was saved but founder notification failed", declaration.Id);
        }
    }

    private async Task NotifyInvestorAsync(FundingDeclaration declaration, Opportunity opportunity, CancellationToken cancellationToken)
    {
        try
        {
            await notifications.CreateEventAsync(new NotificationEventCreation(
                declaration.InvestorId,
                "FundingDeclared",
                declaration.Id.ToString(),
                "Founder recorded a funding declaration",
                "The Founder recorded funds received directly from you outside FOPX One. Review this funding record and confirm or dispute it.",
                "info",
                $"/admin/opportunities/{opportunity.Id}/room",
                declaration.FounderId,
                opportunity.Id,
                "funding"), cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Funding declaration {DeclarationId} was saved but investor notification failed", declaration.Id);
        }
    }

    private async Task BestEffortDeleteProofAsync(string fileId, string fileKey)
    {
        try
        {
            await fileStorage.DeleteFileAsync(fileKey);
            var ledger = (await uow.Repository<StoredFile>().FindAsync(f => f.FileId == fileId)).SingleOrDefault();
            if (ledger is not null)
            {
                ledger.IsDeleted = true;
                ledger.DeletedAt = DateTime.UtcNow;
                await uow.Repository<StoredFile>().UpdateAsync(ledger);
                await uow.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to clean up funding proof {FileId} after declaration failure", fileId);
        }
    }

    private async Task<IReadOnlyList<FundingDeclarationDto>> ToDtosAsync(IEnumerable<FundingDeclaration> declarations, CancellationToken cancellationToken)
    {
        var result = new List<FundingDeclarationDto>();
        foreach (var declaration in declarations)
            result.Add(await ToDtoAsync(declaration, cancellationToken));
        return result;
    }

    private async Task<FundingDeclarationDto> ToDtoAsync(FundingDeclaration declaration, CancellationToken cancellationToken)
    {
        StoredFile? file = null;
        if (!string.IsNullOrWhiteSpace(declaration.ProofFileId))
            file = (await uow.Repository<StoredFile>().FindAsync(f => f.FileId == declaration.ProofFileId && !f.IsDeleted)).SingleOrDefault();
        return new FundingDeclarationDto
        {
            Id = declaration.Id,
            ParticipationId = declaration.ParticipationId,
            OpportunityId = declaration.OpportunityId,
            FounderId = declaration.FounderId,
            InvestorId = declaration.InvestorId,
            Amount = declaration.Amount,
            CurrencyCode = declaration.CurrencyCode,
            ReceivedDate = declaration.ReceivedDate,
            PaymentMethod = declaration.PaymentMethod.ToString(),
            ExternalReference = declaration.ExternalReference,
            Notes = declaration.Notes,
            ProofAvailable = file is not null,
            ProofFileName = file?.OriginalFileName,
            ProofFileSize = file?.FileSizeBytes,
            ProofMimeType = file?.MimeType,
            ProofDownloadUrl = file is null ? null : $"/api/v1/funding-declarations/{declaration.Id}/proof",
            Status = declaration.Status.ToString(),
            DeclaredAt = declaration.DeclaredAt,
            CreatedBy = declaration.CreatedBy,
            ConfirmedAt = declaration.ConfirmedAt,
            ConfirmedByInvestorId = declaration.ConfirmedByInvestorId,
            ConfirmationComment = declaration.ConfirmationComment,
            DisputedAt = declaration.DisputedAt,
            DisputedByInvestorId = declaration.DisputedByInvestorId,
            DisputeReason = declaration.DisputeReason,
            LegAllocations = (await uow.Repository<FundingDeclarationLegAllocation>().FindWithIncludesAsync(
                x => x.FundingDeclarationId == declaration.Id,
                x => x.OfferLeg!)).OrderBy(x => x.OfferLegNumber).ThenBy(x => x.Id).Select(x => new FundingDeclarationLegAllocationDto
                {
                    Id = x.Id,
                    OfferLegId = x.OfferLegId,
                    OfferLegNumber = x.OfferLegNumber,
                    LegType = x.OfferLeg?.LegType.ToString() ?? string.Empty,
                    AllocatedAmount = x.AllocatedAmount,
                    CurrencyCode = x.CurrencyCode
                }).ToList()
        };
    }

    private async Task ValidateConfirmationCapacityAsync(FundingDeclaration declaration, CancellationToken cancellationToken)
    {
        var allocations = await uow.Repository<FundingDeclarationLegAllocation>().FindAsync(x => x.ParticipationId == declaration.ParticipationId);
        if (!allocations.Any())
            return;
        var declarationIds = (await uow.Repository<FundingDeclaration>().FindAsync(x => x.ParticipationId == declaration.ParticipationId))
            .Where(x => x.Status == FundingDeclarationStatus.Confirmed || x.Id == declaration.Id)
            .Select(x => x.Id)
            .ToHashSet();
        var contract = await uow.Repository<InvestmentContract>().GetSingleAsync(
            x => x.ParticipationRequestId == declaration.ParticipationId && x.Status == InvestmentContractStatus.Active,
            x => x.Versions);
        if (contract?.AcceptedOfferId is not int offerId)
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_UNAVAILABLE", "The accepted Contract required for allocation confirmation was not found.");
        var offer = await uow.Repository<NegotiationOffer>().GetSingleAsync(x => x.Id == offerId && x.Status == NegotiationOfferStatus.Accepted, x => x.Legs);
        if (offer is null)
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_UNAVAILABLE", "The accepted Offer required for allocation confirmation was not found.");
        foreach (var leg in offer.Legs)
        {
            var confirmed = allocations.Where(x => x.OfferLegId == leg.Id && declarationIds.Contains(x.FundingDeclarationId)).Sum(x => x.AllocatedAmount);
            if (confirmed > leg.Amount)
                throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_EXCEEDS_COMMITMENT", $"Confirmed funding would exceed the committed capacity of OfferLeg {leg.Id}.");
        }
        var total = allocations.Where(x => declarationIds.Contains(x.FundingDeclarationId)).Sum(x => x.AllocatedAmount);
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(declaration.ParticipationId);
        var committed = participation?.FundingAmount ?? participation?.RequestedAmount ?? 0m;
        if (total > committed)
            throw new BusinessValidationException("FUNDING_DECLARATION_EXCEEDS_COMMITMENT", "Confirmed funding would exceed the Contract commitment.");
    }

    private async Task<List<FundingDeclarationLegAllocation>> BuildAllocationPlanAsync(
        OpportunityJoinRequest participation,
        Opportunity opportunity,
        IReadOnlyList<FundingDeclarationLegAllocationRequest>? requested,
        decimal declarationAmount,
        string currency,
        CancellationToken cancellationToken)
    {
        var contract = await uow.Repository<InvestmentContract>().GetSingleAsync(
            x => x.ParticipationRequestId == participation.Id && x.Status == InvestmentContractStatus.Active,
            x => x.Versions);
        var offer = contract?.AcceptedOfferId is int offerId
            ? await uow.Repository<NegotiationOffer>().GetSingleAsync(x => x.Id == offerId && x.Status == NegotiationOfferStatus.Accepted, x => x.Legs)
            : null;
        var legs = offer?.Legs.OrderBy(x => x.Id).ToList() ?? [];

        if (legs.Count == 0)
        {
            if (requested is { Count: > 0 })
                throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_UNAVAILABLE", "Leg allocations require an active accepted Contract with OfferLeg terms.");
            return [];
        }

        var isMixed = legs.Count > 1;
        var supplied = requested?.Where(x => x is not null).ToList() ?? [];
        if (!isMixed && supplied.Count == 0)
            supplied = [new FundingDeclarationLegAllocationRequest { OfferLegId = legs[0].Id, AllocatedAmount = declarationAmount }];
        if (isMixed && supplied.Count == 0)
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATIONS_REQUIRED", "Mixed Contracts require explicit funding allocation across their OfferLegs.");

        if (supplied.Any(x => x.AllocatedAmount <= 0m || decimal.Round(x.AllocatedAmount, 2) != x.AllocatedAmount))
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_INVALID", "Each leg allocation must be positive and use at most two decimal places.");
        if (supplied.GroupBy(x => x.OfferLegId).Any(g => g.Count() > 1))
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_DUPLICATE", "Each OfferLeg may appear only once in a funding declaration.");
        if (decimal.Round(supplied.Sum(x => x.AllocatedAmount), 2) != decimal.Round(declarationAmount, 2))
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_SUM_MISMATCH", "Leg allocations must reconcile exactly to the declaration amount.");

        var byId = legs.ToDictionary(x => x.Id);
        if (supplied.Any(x => !byId.ContainsKey(x.OfferLegId)))
            throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_LEG_INVALID", "Every allocation must target an accepted OfferLeg on this Contract.");

        var existing = await uow.Repository<FundingDeclarationLegAllocation>().FindAsync(x => x.ParticipationId == participation.Id);
        var result = new List<FundingDeclarationLegAllocation>();
        foreach (var item in supplied)
        {
            var leg = byId[item.OfferLegId];
            var used = existing.Where(x => x.OfferLegId == leg.Id).Sum(x => x.AllocatedAmount);
            if (used + item.AllocatedAmount > leg.Amount)
                throw new BusinessValidationException("FUNDING_LEG_ALLOCATION_EXCEEDS_COMMITMENT", $"The allocation for OfferLeg {leg.Id} exceeds its committed capacity.");
            result.Add(new FundingDeclarationLegAllocation
            {
                ParticipationId = participation.Id,
                ContractId = contract?.Id,
                OfferLegId = leg.Id,
                OfferLegNumber = legs.IndexOf(leg) + 1,
                AllocatedAmount = decimal.Round(item.AllocatedAmount, 2),
                CurrencyCode = currency,
                CreatedAt = DateTime.UtcNow
            });
        }
        return result;
    }

    private static void ValidateCommand(FundingDeclarationCreateCommand command)
    {
        if (command.Amount <= 0m)
            throw new BusinessValidationException("FUNDING_DECLARATION_AMOUNT_INVALID", "Amount must be greater than zero.");
        if (decimal.Round(command.Amount, 2) != command.Amount)
            throw new BusinessValidationException("FUNDING_DECLARATION_AMOUNT_INVALID", "Amount may contain at most two decimal places.");
        if (string.IsNullOrWhiteSpace(command.CurrencyCode))
            throw new BusinessValidationException("FUNDING_DECLARATION_CURRENCY_REQUIRED", "Currency is required.");
        if (command.ReceivedDate == default || command.ReceivedDate > DateTime.UtcNow.AddMinutes(5))
            throw new BusinessValidationException("FUNDING_DECLARATION_DATE_INVALID", "Received date must be a valid date that is not in the future.");
        if (command.ProofContent is not null && (command.ProofFileSize <= 0 || string.IsNullOrWhiteSpace(command.ProofOriginalFileName)))
            throw new BusinessValidationException("FUNDING_PROOF_METADATA_REQUIRED", "Payment proof metadata is incomplete.");
    }

    private static FundingPaymentMethod ParsePaymentMethod(string value)
    {
        var normalized = value?.Trim();
        if (normalized is null || !PaymentMethods.Contains(normalized, StringComparer.OrdinalIgnoreCase))
            throw new BusinessValidationException("FUNDING_PAYMENT_METHOD_INVALID", "Payment method must be BankTransfer, Cash, Cheque, or Other.");
        return Enum.Parse<FundingPaymentMethod>(normalized, true);
    }

    private static string NormalizeCurrency(string? value) => (value ?? string.Empty).Trim().ToUpperInvariant();
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
