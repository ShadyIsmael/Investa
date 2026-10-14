using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class EquityPhase3Service(
    IUnitOfWork uow) : IEquityPhase3Service
{
    private static readonly SemaphoreSlim DividendGate = new(1, 1);
    private static readonly SemaphoreSlim TransferGate = new(1, 1);

    // ===== DIVIDENDS =====

    public async Task<EquityDividendDeclarationDto> CreateDividendDeclarationAsync(Guid actorId, CreateDividendDeclarationRequest request, bool isAdmin, CancellationToken ct = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_DIVIDEND_FORBIDDEN", "Only Admin or Operations can create dividend declarations.");
        if (request.DividendPerShare is null && request.TotalDeclaredAmount is null)
            throw new BusinessValidationException("EQUITY_DIVIDEND_AMOUNT_REQUIRED", "Either DividendPerShare or TotalDeclaredAmount must be provided.");
        if (request.RecordDate < request.DeclarationDate)
            throw new BusinessValidationException("EQUITY_DIVIDEND_RECORD_DATE_INVALID", "Record date must not precede declaration date.");

        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(request.OpportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
        var project = await uow.Repository<Project>().GetByIdAsync(opportunity.ProjectId)
            ?? throw new BusinessValidationException("PROJECT_NOT_FOUND", "The Project was not found.");

        var declaration = new EquityDividendDeclaration
        {
            ProjectId = project.Id,
            OpportunityId = opportunity.Id,
            DeclarationDate = request.DeclarationDate,
            RecordDate = request.RecordDate,
            PaymentDueDate = request.PaymentDueDate,
            Currency = request.Currency.Trim().ToUpperInvariant(),
            DividendPerShare = request.DividendPerShare,
            TotalDeclaredAmount = request.TotalDeclaredAmount,
            Reason = request.Reason.Trim(),
            Notes = request.Notes?.Trim(),
            DeclaredByUserId = actorId,
            Status = EquityDividendStatus.Declared
        };

        await uow.Repository<EquityDividendDeclaration>().AddAsync(declaration);
        await uow.SaveChangesAsync();
        return await LoadDividendDtoAsync(declaration.Id, ct);
    }

    public async Task<EquityDividendDeclarationDto> GenerateEntitlementsAsync(Guid actorId, int declarationId, bool isAdmin, CancellationToken ct = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_DIVIDEND_FORBIDDEN", "Only Admin or Operations can generate entitlements.");
        await DividendGate.WaitAsync(ct);
        try
        {
            var declaration = await uow.Repository<EquityDividendDeclaration>().Query()
                .AsTracking()
                .Where(x => x.Id == declarationId)
                .Include(x => x.Entitlements)
                .FirstOrDefaultAsync(ct)
                ?? throw new BusinessValidationException("EQUITY_DIVIDEND_NOT_FOUND", "The dividend declaration was not found.");

            if (declaration.Status != EquityDividendStatus.Declared)
                throw new BusinessValidationException("EQUITY_DIVIDEND_INVALID_STATE", "Entitlements can only be generated for Declared dividends.");
            if (declaration.Entitlements.Any())
                throw new BusinessValidationException("EQUITY_DIVIDEND_ENTITLEMENTS_EXIST", "Entitlements have already been generated.");

            var activePositions = await uow.Repository<EquityPosition>().Query()
                .Where(x => x.ProjectId == declaration.ProjectId
                    && (x.Status == EquityPositionStatus.Active || x.Status == EquityPositionStatus.PartiallyExited)
                    && x.OwnershipModel == EquityOwnershipModel.ShareBased)
                .Include(x => x.LedgerEntries)
                .Include(x => x.InitialHoldingSnapshot)
                .ToListAsync(ct);

            if (!activePositions.Any())
                throw new BusinessValidationException("EQUITY_DIVIDEND_NO_POSITIONS", "No active ShareBased positions found for this issuer.");

            var totalAmount = 0m;
            foreach (var position in activePositions)
            {
                var ownership = ResolveOwnershipAtDate(position, declaration.RecordDate);
                if (ownership.Shares <= 0m) continue;

                var entitlementAmount = declaration.DividendPerShare.HasValue
                    ? decimal.Round(ownership.Shares * declaration.DividendPerShare.Value, 2)
                    : 0m;

                if (declaration.TotalDeclaredAmount.HasValue && declaration.DividendPerShare is null)
                {
                    if (declaration.Entitlements.Any()) continue;
                    entitlementAmount = 0m;
                }

                var entitlement = new EquityDividendEntitlement
                {
                    DividendDeclarationId = declarationId,
                    EquityPositionId = position.Id,
                    InvestorUserId = position.InvestorUserId,
                    ContractId = position.ContractId,
                    ContractVersionId = position.ContractVersionId,
                    AcceptedOfferId = position.AcceptedOfferId,
                    OfferLegId = position.OfferLegId,
                    EligibleShares = ownership.Shares,
                    EligibleOwnershipPercentage = ownership.Ownership,
                    TotalIssuedSharesAtRecordDate = ownership.Total,
                    EntitlementAmount = entitlementAmount,
                    Currency = declaration.Currency
                };
                declaration.Entitlements.Add(entitlement);
                totalAmount += entitlementAmount;
            }

            if (declaration.TotalDeclaredAmount.HasValue && declaration.DividendPerShare is null && declaration.Entitlements.Any())
            {
                var totalEligibleShares = declaration.Entitlements.Sum(e => e.EligibleShares);
                if (totalEligibleShares > 0m)
                {
                    var perShare = declaration.TotalDeclaredAmount.Value / totalEligibleShares;
                    foreach (var entitlement in declaration.Entitlements)
                    {
                        entitlement.EntitlementAmount = decimal.Round(entitlement.EligibleShares * perShare, 2);
                    }
                    totalAmount = declaration.Entitlements.Sum(e => e.EntitlementAmount);
                }
            }

            declaration.Status = EquityDividendStatus.EntitlementsGenerated;
            await uow.Repository<EquityDividendDeclaration>().UpdateAsync(declaration);
            await uow.SaveChangesAsync();
            return await LoadDividendDtoAsync(declarationId, ct);
        }
        finally { DividendGate.Release(); }
    }

    public async Task<IReadOnlyList<EquityDividendDeclarationDto>> GetDividendDeclarationsAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken ct = default)
    {
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");

        HashSet<int>? visiblePositionIds = null;
        if (!isAdmin && opportunity.FounderId != actorId)
        {
            visiblePositionIds = (await uow.Repository<EquityPosition>().Query()
                .Where(x => x.OpportunityId == opportunityId && x.InvestorUserId == actorId)
                .Select(x => x.Id)
                .ToListAsync(ct)).ToHashSet();
            if (visiblePositionIds.Count == 0)
                throw new BusinessValidationException("EQUITY_DIVIDEND_FORBIDDEN", "You are not authorized to view dividends for this Opportunity.");
        }

        var declarations = await uow.Repository<EquityDividendDeclaration>().Query()
            .Where(x => x.OpportunityId == opportunityId)
            .Include(x => x.Entitlements).ThenInclude(x => x.Distributions).ThenInclude(x => x.Confirmations)
            .OrderByDescending(x => x.DeclarationDate)
            .ToListAsync(ct);

        return declarations.Select(x => ToDividendDto(x, visiblePositionIds)).ToList();
    }

    public async Task<EquityDividendEntitlementDto> GetDividendEntitlementAsync(Guid actorId, int entitlementId, CancellationToken ct = default)
    {
        var entitlement = await uow.Repository<EquityDividendEntitlement>().Query()
            .Where(x => x.Id == entitlementId)
            .Include(x => x.Distributions).ThenInclude(x => x.Confirmations)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessValidationException("EQUITY_DIVIDEND_ENTITLEMENT_NOT_FOUND", "The dividend entitlement was not found.");

        var position = await uow.Repository<EquityPosition>().GetByIdAsync(entitlement.EquityPositionId);
        if (position?.InvestorUserId != actorId)
        {
            var isAdmin = await IsAdminUser(actorId);
            if (!isAdmin) throw new BusinessValidationException("EQUITY_DIVIDEND_FORBIDDEN", "Access denied.");
        }

        return ToEntitlementDto(entitlement);
    }

    public async Task<EquityDividendDistributionDto> DeclareDistributionAsync(Guid actorId, DeclareExternalDistributionRequest request, bool isAdmin, CancellationToken ct = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_DIVIDEND_FORBIDDEN", "Only Admin or Operations can declare external distributions.");

        var entitlement = await uow.Repository<EquityDividendEntitlement>().Query()
            .AsTracking()
            .Where(x => x.Id == request.EntitlementId)
            .Include(x => x.Distributions)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessValidationException("EQUITY_DIVIDEND_ENTITLEMENT_NOT_FOUND", "The dividend entitlement was not found.");

        var confirmed = entitlement.Distributions
            .Where(x => x.Status == EquityDividendDistributionStatus.Confirmed)
            .Sum(x => x.Amount);
        if (confirmed + request.Amount > entitlement.EntitlementAmount)
            throw new BusinessValidationException("EQUITY_DIVIDEND_OVERDISTRIBUTION", $"Distribution would exceed entitlement. Outstanding: {entitlement.EntitlementAmount - confirmed}");

        var distribution = new EquityDividendDistributionDeclaration
        {
            DividendDeclarationId = entitlement.DividendDeclarationId,
            DividendEntitlementId = request.EntitlementId,
            DeclaredByUserId = actorId,
            Amount = request.Amount,
            Currency = entitlement.Currency,
            Notes = request.Notes?.Trim(),
            Status = EquityDividendDistributionStatus.PendingConfirmation
        };

        await uow.Repository<EquityDividendDistributionDeclaration>().AddAsync(distribution);
        await uow.SaveChangesAsync();
        return ToDistributionDto(distribution);
    }

    public async Task<EquityDividendDistributionDto> ConfirmDistributionAsync(Guid actorId, ConfirmDistributionRequest request, CancellationToken ct = default)
    {
        var distribution = await uow.Repository<EquityDividendDistributionDeclaration>().Query()
            .AsTracking()
            .Where(x => x.Id == request.DistributionId)
            .Include(x => x.DividendEntitlement)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessValidationException("EQUITY_DIVIDEND_DISTRIBUTION_NOT_FOUND", "The distribution declaration was not found.");

        var position = await uow.Repository<EquityPosition>().GetByIdAsync(distribution.DividendEntitlement!.EquityPositionId);
        if (position?.InvestorUserId != actorId)
            throw new BusinessValidationException("EQUITY_DIVIDEND_FORBIDDEN", "Only the entitled investor can confirm or dispute their distribution.");

        if (distribution.Status != EquityDividendDistributionStatus.PendingConfirmation)
            throw new BusinessValidationException("EQUITY_DIVIDEND_DISTRIBUTION_INVALID_STATE", "Only pending distributions can be confirmed or disputed.");

        var confirmation = new EquityDividendDistributionConfirmation
        {
            DistributionDeclarationId = request.DistributionId,
            ConfirmedByUserId = actorId,
            IsConfirmed = request.IsConfirmed,
            Reason = request.Reason?.Trim()
        };

        distribution.Status = request.IsConfirmed
            ? EquityDividendDistributionStatus.Confirmed
            : EquityDividendDistributionStatus.Disputed;

        await uow.Repository<EquityDividendDistributionConfirmation>().AddAsync(confirmation);
        await uow.Repository<EquityDividendDistributionDeclaration>().UpdateAsync(distribution);
        await uow.SaveChangesAsync();
        return ToDistributionDto(distribution);
    }

    // ===== TRANSFERS =====

    public async Task<EquityTransferDto> CreateTransferAsync(Guid actorId, CreateTransferRequest request, bool isAdmin, CancellationToken ct = default)
    {
        if (request.Quantity <= 0m) throw new BusinessValidationException("EQUITY_TRANSFER_QUANTITY_INVALID", "Transfer quantity must be positive.");
        if (string.IsNullOrWhiteSpace(request.Reason)) throw new BusinessValidationException("EQUITY_TRANSFER_REASON_REQUIRED", "A transfer reason is required.");

        var sourcePosition = await uow.Repository<EquityPosition>().Query()
            .AsTracking()
            .Where(x => x.Id == request.SourcePositionId)
            .Include(x => x.LedgerEntries)
            .Include(x => x.InitialHoldingSnapshot)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessValidationException("EQUITY_TRANSFER_POSITION_NOT_FOUND", "The source position was not found.");

        if (sourcePosition.OwnershipModel != EquityOwnershipModel.ShareBased)
            throw new BusinessValidationException("EQUITY_TRANSFER_SHARES_ONLY", "Transfers are currently supported only for ShareBased positions.");

        var sourceState = CurrentState(sourcePosition);
        if (sourceState.Shares <= 0m)
            throw new BusinessValidationException("EQUITY_TRANSFER_NO_HOLDING", "The source position has no shares to transfer.");

        if (!isAdmin && sourcePosition.InvestorUserId != actorId)
            throw new BusinessValidationException("EQUITY_TRANSFER_FORBIDDEN", "Only the source investor or an admin can initiate a transfer.");

        if (request.TransferType == EquityTransferType.FullTransfer && request.Quantity != sourceState.Shares)
            throw new BusinessValidationException("EQUITY_TRANSFER_FULL_QUANTITY_MISMATCH", "A full transfer must transfer all current shares.");

        if (request.TransferType == EquityTransferType.PartialTransfer && request.Quantity >= sourceState.Shares)
            throw new BusinessValidationException("EQUITY_TRANSFER_PARTIAL_EXCEEDS", "A partial transfer quantity must be less than current shares.");

        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(request.OpportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");

        var transfer = new EquityTransfer
        {
            ProjectId = sourcePosition.ProjectId ?? 0,
            OpportunityId = opportunity.Id,
            SourcePositionId = sourcePosition.Id,
            SourceInvestorUserId = sourcePosition.InvestorUserId,
            DestinationInvestorUserId = request.DestinationInvestorUserId,
            TransferType = request.TransferType,
            Quantity = request.Quantity,
            EffectiveDate = request.EffectiveDate,
            InitiatedByUserId = actorId,
            Reason = request.Reason.Trim(),
            Notes = request.Notes?.Trim(),
            ExternalReference = request.ExternalReference?.Trim(),
            SourceSharesBefore = sourceState.Shares,
            SourceOwnershipBefore = sourceState.Ownership,
            Status = EquityTransferStatus.Draft
        };

        await uow.Repository<EquityTransfer>().AddAsync(transfer);
        await uow.SaveChangesAsync();
        return await LoadTransferDtoAsync(transfer.Id, ct);
    }

    public async Task<EquityTransferDto> SubmitTransferAsync(Guid actorId, int transferId, bool isAdmin, CancellationToken ct = default)
    {
        var transfer = await LoadTransferEntityAsync(transferId, ct)
            ?? throw new BusinessValidationException("EQUITY_TRANSFER_NOT_FOUND", "The transfer was not found.");
        if (transfer.Status != EquityTransferStatus.Draft)
            throw new BusinessValidationException("EQUITY_TRANSFER_INVALID_STATE", "Only Draft transfers can be submitted.");
        if (!isAdmin && transfer.InitiatedByUserId != actorId)
            throw new BusinessValidationException("EQUITY_TRANSFER_FORBIDDEN", "You are not authorized to submit this transfer.");

        transfer.Status = EquityTransferStatus.PendingAcknowledgement;
        await uow.Repository<EquityTransfer>().UpdateAsync(transfer);
        await uow.SaveChangesAsync();
        return await LoadTransferDtoAsync(transferId, ct);
    }

    public async Task<EquityTransferDto> AcknowledgeTransferAsync(Guid actorId, int transferId, bool approve, string? reason, CancellationToken ct = default)
    {
        var transfer = await LoadTransferEntityAsync(transferId, ct)
            ?? throw new BusinessValidationException("EQUITY_TRANSFER_NOT_FOUND", "The transfer was not found.");

        if (transfer.DestinationInvestorUserId != actorId)
            throw new BusinessValidationException("EQUITY_TRANSFER_FORBIDDEN", "Only the destination investor can acknowledge this transfer.");

        if (transfer.Status != EquityTransferStatus.PendingAcknowledgement)
            throw new BusinessValidationException("EQUITY_TRANSFER_INVALID_STATE", "Only PendingAcknowledgement transfers can be acknowledged.");

        if (transfer.DestinationInvestorUserId == actorId && approve)
        {
            transfer.Status = EquityTransferStatus.PendingApproval;
            transfer.Notes = string.IsNullOrWhiteSpace(transfer.Notes) ? reason?.Trim() : $"{transfer.Notes}\n{reason?.Trim()}";
        }
        else
        {
            transfer.Status = EquityTransferStatus.Rejected;
            transfer.Notes = string.IsNullOrWhiteSpace(transfer.Notes) ? reason?.Trim() : $"{transfer.Notes}\n{reason?.Trim()}";
        }

        await uow.Repository<EquityTransfer>().UpdateAsync(transfer);
        await uow.SaveChangesAsync();
        return await LoadTransferDtoAsync(transferId, ct);
    }

    public async Task<EquityTransferDto> ApplyTransferAsync(Guid actorId, int transferId, bool isAdmin, CancellationToken ct = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_TRANSFER_APPLICATION_FORBIDDEN", "Only Admin or Operations can apply transfers.");
        await TransferGate.WaitAsync(ct);
        var transactionStarted = false;
        try
        {
            var transfer = await LoadTransferEntityAsync(transferId, ct)
                ?? throw new BusinessValidationException("EQUITY_TRANSFER_NOT_FOUND", "The transfer was not found.");
            if (transfer.Status == EquityTransferStatus.Applied) return await LoadTransferDtoAsync(transferId, ct);
            if (transfer.Status != EquityTransferStatus.PendingApproval && transfer.Status != EquityTransferStatus.PendingAcknowledgement)
                throw new BusinessValidationException("EQUITY_TRANSFER_INVALID_STATE", "Only PendingApproval or PendingAcknowledgement transfers can be applied.");

            await uow.BeginTransactionAsync();
            transactionStarted = true;

            var sourcePosition = await LoadPositionWithEntriesAsync(transfer.SourcePositionId, ct)
                ?? throw new BusinessValidationException("EQUITY_TRANSFER_POSITION_NOT_FOUND", "Source position not found.");

            var sourceState = CurrentState(sourcePosition);
            if (transfer.SourceSharesBefore != sourceState.Shares)
                throw new BusinessValidationException("EQUITY_TRANSFER_STALE_BASELINE", "Source holding changed since transfer was prepared.");
            if (sourceState.Shares < transfer.Quantity)
                throw new BusinessValidationException("EQUITY_TRANSFER_INSUFFICIENT", "Insufficient shares to complete transfer.");

            var now = DateTime.UtcNow;
            var newSourceShares = sourceState.Shares - transfer.Quantity;
            var newTotal = sourceState.Total;
            var newSourceOwnership = newTotal > 0m ? decimal.Round(newSourceShares / newTotal * 100m, 6) : 0m;

            transfer.SourceSharesAfter = newSourceShares;
            transfer.SourceOwnershipAfter = newSourceOwnership;
            transfer.AppliedByUserId = actorId;
            transfer.AppliedAt = now;

            sourcePosition.LedgerEntries.Add(new EquityHoldingLedgerEntry
            {
                EquityPosition = sourcePosition,
                EventType = transfer.TransferType == EquityTransferType.ExternalExit ? EquityHoldingLedgerEventType.ExternalExit : EquityHoldingLedgerEventType.TransferOut,
                EffectiveDate = transfer.EffectiveDate,
                PreviousInvestorShares = sourceState.Shares,
                ShareDelta = -transfer.Quantity,
                ResultingInvestorShares = newSourceShares,
                PreviousTotalIssuedShares = newTotal,
                ResultingTotalIssuedShares = newTotal,
                PreviousOwnershipPercentage = sourceState.Ownership,
                ResultingOwnershipPercentage = newSourceOwnership,
                ContractualOwnershipPercentage = sourcePosition.ContractualOwnershipPercentage,
                ContractId = sourcePosition.ContractId,
                ContractVersionId = sourcePosition.ContractVersionId,
                AcceptedOfferId = sourcePosition.AcceptedOfferId,
                OfferLegId = sourcePosition.OfferLegId,
                ActorUserId = actorId,
                ActorType = "Admin",
                CorrelationId = $"equity-transfer:{transfer.Id}",
                ShareClass = sourcePosition.ShareClass
            });

            if (newSourceShares <= 0m)
                sourcePosition.Status = EquityPositionStatus.FullyExited;
            else if (newSourceShares < sourceState.Shares)
                sourcePosition.Status = EquityPositionStatus.PartiallyExited;

            if (transfer.TransferType == EquityTransferType.ExternalExit || !transfer.DestinationInvestorUserId.HasValue)
            {
                transfer.DestinationPositionId = null;
                transfer.DestinationSharesAfter = null;
                transfer.DestinationOwnershipAfter = null;
            }
            else if (transfer.DestinationInvestorUserId.HasValue)
            {
                var destPosition = new EquityPosition
                {
                    ParticipationRequestId = sourcePosition.ParticipationRequestId,
                    ContractId = sourcePosition.ContractId,
                    ContractVersionId = sourcePosition.ContractVersionId,
                    AcceptedOfferId = sourcePosition.AcceptedOfferId,
                    AcceptedOfferVersionNumber = sourcePosition.AcceptedOfferVersionNumber,
                    OfferLegId = sourcePosition.OfferLegId,
                    OfferLegNumber = sourcePosition.OfferLegNumber,
                    OpportunityId = sourcePosition.OpportunityId,
                    ProjectId = sourcePosition.ProjectId,
                    FounderUserId = sourcePosition.FounderUserId,
                    InvestorUserId = transfer.DestinationInvestorUserId.Value,
                    InvestmentAmount = 0m,
                    Currency = sourcePosition.Currency,
                    OwnershipModel = EquityOwnershipModel.ShareBased,
                    InvestorShareCount = transfer.Quantity,
                    TotalIssuedShares = newTotal,
                    ShareClass = sourcePosition.ShareClass,
                    Status = EquityPositionStatus.Active,
                    ActivatedAt = now,
                    EffectiveOwnershipDate = transfer.EffectiveDate
                };

                destPosition.InitialHoldingSnapshot = new EquityHoldingSnapshot
                {
                    OwnershipModel = EquityOwnershipModel.ShareBased,
                    EffectiveDate = transfer.EffectiveDate,
                    InvestorShareCount = transfer.Quantity,
                    TotalIssuedShares = newTotal,
                    DerivedOwnershipPercentage = newTotal > 0m
                        ? decimal.Round(transfer.Quantity / newTotal * 100m, 6)
                        : 0m,
                    ShareClass = sourcePosition.ShareClass,
                    PricePerShare = sourcePosition.PricePerShare,
                    PreMoneyValuation = sourcePosition.PreMoneyValuation,
                    PostMoneyValuation = sourcePosition.PostMoneyValuation,
                    ContractualOwnershipPercentage = null,
                    ContractId = sourcePosition.ContractId,
                    ContractVersionId = sourcePosition.ContractVersionId,
                    AcceptedOfferId = sourcePosition.AcceptedOfferId,
                    OfferLegId = sourcePosition.OfferLegId
                };

                await uow.Repository<EquityPosition>().AddAsync(destPosition);
                await uow.SaveChangesAsync();

                destPosition.LedgerEntries.Add(new EquityHoldingLedgerEntry
                {
                    EquityPositionId = destPosition.Id,
                    EventType = EquityHoldingLedgerEventType.TransferIn,
                    EffectiveDate = transfer.EffectiveDate,
                    PreviousInvestorShares = 0m,
                    ShareDelta = transfer.Quantity,
                    ResultingInvestorShares = transfer.Quantity,
                    PreviousTotalIssuedShares = newTotal,
                    ResultingTotalIssuedShares = newTotal,
                    PreviousOwnershipPercentage = 0m,
                    ResultingOwnershipPercentage = newTotal > 0m ? decimal.Round(transfer.Quantity / newTotal * 100m, 6) : 0m,
                    ContractId = sourcePosition.ContractId,
                    ContractVersionId = sourcePosition.ContractVersionId,
                    AcceptedOfferId = sourcePosition.AcceptedOfferId,
                    OfferLegId = sourcePosition.OfferLegId,
                    ActorUserId = actorId,
                    ActorType = "Admin",
                    CorrelationId = $"equity-transfer:{transfer.Id}",
                    ShareClass = sourcePosition.ShareClass
                });

                transfer.DestinationPositionId = destPosition.Id;
                transfer.DestinationSharesAfter = transfer.Quantity;
                transfer.DestinationOwnershipAfter = newTotal > 0m ? decimal.Round(transfer.Quantity / newTotal * 100m, 6) : 0m;
            }

            transfer.Status = EquityTransferStatus.Applied;
            await uow.Repository<EquityTransfer>().UpdateAsync(transfer);
            await uow.Repository<EquityPosition>().UpdateAsync(sourcePosition);
            await uow.SaveChangesAsync();
            await uow.CommitTransactionAsync();
            transactionStarted = false;
            return await LoadTransferDtoAsync(transferId, ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (transactionStarted) await uow.RollbackTransactionAsync();
            throw new BusinessValidationException("EQUITY_TRANSFER_CONCURRENCY", "Another operation changed this transfer. Refresh and retry.");
        }
        catch
        {
            if (transactionStarted) await uow.RollbackTransactionAsync();
            throw;
        }
        finally { TransferGate.Release(); }
    }

    public async Task<IReadOnlyList<EquityTransferDto>> GetTransfersAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken ct = default)
    {
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
        var isFounder = opportunity.FounderId == actorId;
        if (!isAdmin && !isFounder)
        {
            var hasPosition = await uow.Repository<EquityPosition>().Query()
                .AnyAsync(x => x.OpportunityId == opportunityId && x.InvestorUserId == actorId, ct);
            if (!hasPosition)
                throw new BusinessValidationException("EQUITY_TRANSFER_FORBIDDEN", "You are not authorized to view transfers for this Opportunity.");
        }

        var transfers = await uow.Repository<EquityTransfer>().Query()
            .Where(x => x.OpportunityId == opportunityId)
            .Include(x => x.SourcePosition).Include(x => x.DestinationPosition)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        if (!isAdmin && !isFounder)
        {
            transfers = transfers.Where(x => x.SourceInvestorUserId == actorId || x.DestinationInvestorUserId == actorId).ToList();
        }

        return transfers.Select(ToTransferDto).ToList();
    }

    // ===== CLOSURE =====

    public async Task<EquityClosureSnapshotDto> ClosePositionAsync(Guid actorId, int positionId, ClosePositionRequest request, bool isAdmin, CancellationToken ct = default)
    {
        if (!isAdmin) throw new BusinessValidationException("EQUITY_CLOSURE_FORBIDDEN", "Only Admin or Operations can close equity positions.");
        if (string.IsNullOrWhiteSpace(request.Reason)) throw new BusinessValidationException("EQUITY_CLOSURE_REASON_REQUIRED", "A closure reason is required.");

        var position = await LoadPositionWithEntriesAsync(positionId, ct)
            ?? throw new BusinessValidationException("EQUITY_CLOSURE_POSITION_NOT_FOUND", "The equity position was not found.");

        if (position.Status != EquityPositionStatus.FullyExited)
            throw new BusinessValidationException("EQUITY_CLOSURE_NOT_ELIGIBLE", "Only FullyExited positions can be closed.");

        var pendingTransfers = await uow.Repository<EquityTransfer>().Query()
            .AnyAsync(x => x.SourcePositionId == positionId && (x.Status == EquityTransferStatus.PendingAcknowledgement || x.Status == EquityTransferStatus.PendingApproval || x.Status == EquityTransferStatus.Draft), ct);
        if (pendingTransfers)
            throw new BusinessValidationException("EQUITY_CLOSURE_BLOCKED", "Pending transfers must be resolved before closure.");

        var pendingDistributions = await uow.Repository<EquityDividendDistributionDeclaration>().Query()
            .AnyAsync(x => x.Status == EquityDividendDistributionStatus.PendingConfirmation
                && x.DividendEntitlement != null
                && x.DividendEntitlement.EquityPositionId == positionId, ct);
        if (pendingDistributions)
            throw new BusinessValidationException("EQUITY_CLOSURE_BLOCKED", "Pending dividend confirmations must be resolved before closure.");

        var state = CurrentState(position);
        var initialSnapshot = position.InitialHoldingSnapshot;
        var fullyExitedEntry = position.LedgerEntries
            .Where(x => x.EventType == EquityHoldingLedgerEventType.ExternalExit && x.ResultingInvestorShares <= 0m)
            .OrderByDescending(x => x.EffectiveDate)
            .ThenByDescending(x => x.Id)
            .FirstOrDefault();

        var confirmedDistributions = await uow.Repository<EquityDividendDistributionDeclaration>().Query()
            .Where(x => x.DividendEntitlement != null && x.DividendEntitlement.EquityPositionId == positionId && x.Status == EquityDividendDistributionStatus.Confirmed)
            .SumAsync(x => x.Amount, ct);

        var now = DateTime.UtcNow;
        var closureSnapshot = new EquityClosureSnapshot
        {
            EquityPositionId = positionId,
            ContractId = position.ContractId,
            ContractVersionId = position.ContractVersionId,
            InvestorUserId = position.InvestorUserId,
            ProjectId = position.ProjectId ?? 0,
            OpportunityId = position.OpportunityId,
            InitialOwnershipPercentage = initialSnapshot?.DerivedOwnershipPercentage,
            FinalOwnershipPercentage = state.Ownership,
            InitialInvestorShares = initialSnapshot?.InvestorShareCount,
            FinalInvestorShares = state.Shares,
            TotalIssuedSharesAtClosure = state.Total,
            TotalDistributionsConfirmed = confirmedDistributions,
            FullyExitedAt = fullyExitedEntry?.CreatedAt ?? now,
            ClosedAt = now,
            ClosedByUserId = actorId,
            ClosureReason = request.Reason.Trim(),
            SnapshotHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { positionId, position.ContractId, position.InvestorUserId, state.Shares, state.Total, confirmedDistributions, now })))).ToLowerInvariant()
        };

        position.Status = EquityPositionStatus.Closed;
        position.ClosedAt = now;

        await uow.Repository<EquityClosureSnapshot>().AddAsync(closureSnapshot);
        await uow.Repository<EquityPosition>().UpdateAsync(position);
        await uow.SaveChangesAsync();

        return new EquityClosureSnapshotDto
        {
            Id = closureSnapshot.Id,
            EquityPositionId = closureSnapshot.EquityPositionId,
            ContractId = closureSnapshot.ContractId,
            InvestorUserId = closureSnapshot.InvestorUserId,
            ProjectId = closureSnapshot.ProjectId,
            InitialOwnershipPercentage = closureSnapshot.InitialOwnershipPercentage,
            FinalOwnershipPercentage = closureSnapshot.FinalOwnershipPercentage,
            InitialInvestorShares = closureSnapshot.InitialInvestorShares,
            FinalInvestorShares = closureSnapshot.FinalInvestorShares,
            TotalIssuedSharesAtClosure = closureSnapshot.TotalIssuedSharesAtClosure,
            TotalDistributionsConfirmed = closureSnapshot.TotalDistributionsConfirmed,
            FullyExitedAt = closureSnapshot.FullyExitedAt,
            ClosedAt = closureSnapshot.ClosedAt,
            ClosedByUserId = closureSnapshot.ClosedByUserId,
            ClosureReason = closureSnapshot.ClosureReason
        };
    }

    public async Task<EquityClosureSnapshotDto?> GetClosureSnapshotAsync(Guid actorId, int positionId, bool isAdmin, CancellationToken ct = default)
    {
        var position = await uow.Repository<EquityPosition>().GetByIdAsync(positionId)
            ?? throw new BusinessValidationException("EQUITY_CLOSURE_POSITION_NOT_FOUND", "The equity position was not found.");
        if (!isAdmin && actorId != position.FounderUserId && actorId != position.InvestorUserId)
            throw new BusinessValidationException("EQUITY_CLOSURE_FORBIDDEN", "You are not authorized to view this equity closure.");

        var snapshot = await uow.Repository<EquityClosureSnapshot>().Query()
            .Where(x => x.EquityPositionId == positionId)
            .SingleOrDefaultAsync(ct);
        if (snapshot is null) return null;
        return new EquityClosureSnapshotDto
        {
            Id = snapshot.Id,
            EquityPositionId = snapshot.EquityPositionId,
            ContractId = snapshot.ContractId,
            InvestorUserId = snapshot.InvestorUserId,
            ProjectId = snapshot.ProjectId,
            InitialOwnershipPercentage = snapshot.InitialOwnershipPercentage,
            FinalOwnershipPercentage = snapshot.FinalOwnershipPercentage,
            InitialInvestorShares = snapshot.InitialInvestorShares,
            FinalInvestorShares = snapshot.FinalInvestorShares,
            TotalIssuedSharesAtClosure = snapshot.TotalIssuedSharesAtClosure,
            TotalDistributionsConfirmed = snapshot.TotalDistributionsConfirmed,
            FullyExitedAt = snapshot.FullyExitedAt,
            ClosedAt = snapshot.ClosedAt,
            ClosedByUserId = snapshot.ClosedByUserId,
            ClosureReason = snapshot.ClosureReason
        };
    }

    // ===== PRIVATE HELPERS =====

    private async Task<bool> IsAdminUser(Guid userId)
    {
        var authUser = await uow.Repository<AuthUser>().GetByIdAsync(userId);
        return authUser?.UserType == UserType.OrgUser;
    }

    private static (decimal Shares, decimal Total, decimal Ownership) CurrentState(EquityPosition position)
    {
        // Current state follows the latest applied ledger result. Historical
        // as-of reads use ResolveOwnershipAtDate below, which applies the
        // EffectiveDate filter independently.
        var latest = position.LedgerEntries.OrderByDescending(x => x.EffectiveDate).ThenByDescending(x => x.Id).FirstOrDefault();
        var shares = latest?.ResultingInvestorShares ?? position.InitialHoldingSnapshot?.InvestorShareCount ?? position.InvestorShareCount ?? 0m;
        var total = latest?.ResultingTotalIssuedShares ?? position.InitialHoldingSnapshot?.TotalIssuedShares ?? position.TotalIssuedShares ?? 0m;
        var ownership = latest?.ResultingOwnershipPercentage ?? position.InitialHoldingSnapshot?.DerivedOwnershipPercentage ?? (total > 0m ? decimal.Round(shares / total * 100m, 6) : 0m);
        return (shares, total, ownership);
    }

    private static (decimal Shares, decimal Total, decimal Ownership) ResolveOwnershipAtDate(EquityPosition position, DateTime asOf)
    {
        var entries = position.LedgerEntries
            .Where(x => x.EffectiveDate <= asOf)
            .OrderByDescending(x => x.EffectiveDate).ThenByDescending(x => x.Id)
            .ToList();
        var latest = entries.FirstOrDefault();
        var shares = latest?.ResultingInvestorShares ?? position.InitialHoldingSnapshot?.InvestorShareCount ?? position.InvestorShareCount ?? 0m;
        var total = latest?.ResultingTotalIssuedShares ?? position.InitialHoldingSnapshot?.TotalIssuedShares ?? position.TotalIssuedShares ?? 0m;
        var ownership = latest?.ResultingOwnershipPercentage ?? position.InitialHoldingSnapshot?.DerivedOwnershipPercentage ?? (total > 0m ? decimal.Round(shares / total * 100m, 6) : 0m);
        return (shares, total, ownership);
    }

    private async Task<EquityPosition?> LoadPositionWithEntriesAsync(int positionId, CancellationToken ct) =>
        await uow.Repository<EquityPosition>().Query().AsTracking()
            .Where(x => x.Id == positionId)
            .Include(x => x.LedgerEntries).Include(x => x.InitialHoldingSnapshot)
            .FirstOrDefaultAsync(ct);

    private async Task<EquityTransfer?> LoadTransferEntityAsync(int transferId, CancellationToken ct) =>
        await uow.Repository<EquityTransfer>().Query().AsTracking()
            .Where(x => x.Id == transferId)
            .Include(x => x.SourcePosition).Include(x => x.DestinationPosition)
            .FirstOrDefaultAsync(ct);

    private async Task<EquityDividendDeclarationDto> LoadDividendDtoAsync(int declarationId, CancellationToken ct)
    {
        var declaration = await uow.Repository<EquityDividendDeclaration>().Query()
            .Where(x => x.Id == declarationId)
            .Include(x => x.Entitlements).ThenInclude(x => x.Distributions).ThenInclude(x => x.Confirmations)
            .SingleAsync(ct);
        return ToDividendDto(declaration);
    }

    private static EquityDividendDeclarationDto ToDividendDto(EquityDividendDeclaration d, HashSet<int>? visiblePositionIds = null) => new()
    {
        Id = d.Id, ProjectId = d.ProjectId, OpportunityId = d.OpportunityId, Status = d.Status,
        DeclarationDate = d.DeclarationDate, RecordDate = d.RecordDate, PaymentDueDate = d.PaymentDueDate,
        Currency = d.Currency, DistributionBasis = d.DistributionBasis, DividendPerShare = d.DividendPerShare,
        TotalDeclaredAmount = d.TotalDeclaredAmount, Reason = d.Reason, Notes = d.Notes,
        DeclaredByUserId = d.DeclaredByUserId, CreatedAt = d.CreatedAt,
        Entitlements = d.Entitlements
            .Where(x => visiblePositionIds is null || visiblePositionIds.Contains(x.EquityPositionId))
            .Select(ToEntitlementDto)
            .ToList()
    };

    private static EquityDividendEntitlementDto ToEntitlementDto(EquityDividendEntitlement e)
    {
        var confirmed = e.Distributions.Where(x => x.Status == EquityDividendDistributionStatus.Confirmed).Sum(x => x.Amount);
        var pending = e.Distributions.Where(x => x.Status == EquityDividendDistributionStatus.PendingConfirmation).Sum(x => x.Amount);
        var disputed = e.Distributions.Where(x => x.Status == EquityDividendDistributionStatus.Disputed).Sum(x => x.Amount);
        return new()
        {
            Id = e.Id, DividendDeclarationId = e.DividendDeclarationId, EquityPositionId = e.EquityPositionId,
            InvestorUserId = e.InvestorUserId, EligibleShares = e.EligibleShares,
            EligibleOwnershipPercentage = e.EligibleOwnershipPercentage,
            TotalIssuedSharesAtRecordDate = e.TotalIssuedSharesAtRecordDate,
            EntitlementAmount = e.EntitlementAmount, Currency = e.Currency,
            ConfirmedDistributed = confirmed, PendingConfirmation = pending,
            DisputedAmount = disputed, Outstanding = e.EntitlementAmount - confirmed,
            Distributions = e.Distributions.Select(ToDistributionDto).ToList()
        };
    }

    private static EquityDividendDistributionDto ToDistributionDto(EquityDividendDistributionDeclaration d) => new()
    {
        Id = d.Id, DividendDeclarationId = d.DividendDeclarationId,
        DividendEntitlementId = d.DividendEntitlementId, DeclaredByUserId = d.DeclaredByUserId,
        Amount = d.Amount, Currency = d.Currency, Notes = d.Notes, Status = d.Status,
        DeclaredAt = d.DeclaredAt,
        IsConfirmed = d.Confirmations.FirstOrDefault()?.IsConfirmed ?? false,
        ConfirmationReason = d.Confirmations.FirstOrDefault()?.Reason
    };

    private async Task<EquityTransferDto> LoadTransferDtoAsync(int transferId, CancellationToken ct)
    {
        var transfer = await uow.Repository<EquityTransfer>().Query()
            .Where(x => x.Id == transferId)
            .Include(x => x.SourcePosition).Include(x => x.DestinationPosition)
            .SingleAsync(ct);
        return ToTransferDto(transfer);
    }

    private static EquityTransferDto ToTransferDto(EquityTransfer t) => new()
    {
        Id = t.Id, ProjectId = t.ProjectId, OpportunityId = t.OpportunityId,
        SourcePositionId = t.SourcePositionId, SourceInvestorUserId = t.SourceInvestorUserId,
        DestinationPositionId = t.DestinationPositionId, DestinationInvestorUserId = t.DestinationInvestorUserId,
        TransferType = t.TransferType, Status = t.Status, Quantity = t.Quantity,
        EffectiveDate = t.EffectiveDate, InitiatedByUserId = t.InitiatedByUserId,
        Reason = t.Reason, Notes = t.Notes, ExternalReference = t.ExternalReference,
        SourceSharesBefore = t.SourceSharesBefore, SourceSharesAfter = t.SourceSharesAfter,
        DestinationSharesAfter = t.DestinationSharesAfter, SourceOwnershipBefore = t.SourceOwnershipBefore,
        SourceOwnershipAfter = t.SourceOwnershipAfter, DestinationOwnershipAfter = t.DestinationOwnershipAfter,
        CreatedAt = t.CreatedAt, AppliedAt = t.AppliedAt
    };
}
