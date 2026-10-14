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

public sealed class LoanRepaymentService(
    IUnitOfWork uow,
    IFileUploadService fileUpload,
    IFileStorage fileStorage,
    IUserNotificationService? notifications,
    ILogger<LoanRepaymentService> logger,
    ILoanLifecycleService? lifecycle = null) : ILoanRepaymentService
{
    private const string ProofCategory = "FUNDING_PROOF";
    private static readonly SemaphoreSlim RepaymentGate = new(1, 1);

    public async Task<LoanRepaymentRecordDto> CreateAsync(
        Guid founderId,
        int opportunityId,
        int loanObligationId,
        CreateLoanRepaymentDeclarationCommand command,
        CancellationToken cancellationToken = default)
    {
        ValidateAmount(command.Amount);
        var obligation = await uow.Repository<LoanObligation>().Query()
            .Include(x => x.Installments)
            .SingleOrDefaultAsync(x => x.Id == loanObligationId, cancellationToken)
            ?? throw new BusinessValidationException("LOAN_OBLIGATION_NOT_FOUND", "The Loan obligation was not found.");
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(obligation.ParticipationRequestId)
            ?? throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "The Loan Participation was not found.");
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The Opportunity was not found.");
        if (participation.OpportunityId != opportunityId || opportunity.FounderId != founderId || obligation.FounderUserId != founderId)
            throw new BusinessValidationException("LOAN_REPAYMENT_FORBIDDEN", "Only the Founder of the Loan obligation can declare repayment.");
        if (obligation.Status != LoanObligationStatus.Active)
            throw new BusinessValidationException("LOAN_OBLIGATION_INACTIVE", "Repayment can only be declared for an active Loan obligation.");
        if (!string.Equals(NormalizeCurrency(command.Currency), obligation.Currency, StringComparison.OrdinalIgnoreCase))
            throw new BusinessValidationException("LOAN_REPAYMENT_CURRENCY_MISMATCH", "Repayment currency must match the contractual Loan currency.");

        var idempotencyKey = Normalize(command.IdempotencyKey);
        if (idempotencyKey is not null)
        {
            var replay = (await uow.Repository<LoanRepaymentDeclaration>().FindAsync(x =>
                x.LoanObligationId == loanObligationId && x.IdempotencyKey == idempotencyKey)).SingleOrDefault();
            if (replay is not null)
                return await ToDtoAsync(replay, cancellationToken);
        }

        var requestedIds = (command.InstallmentIds ?? []).ToArray();
        if (requestedIds.Distinct().Count() != requestedIds.Length)
            throw new BusinessValidationException("LOAN_REPAYMENT_INSTALLMENT_INVALID", "An installment cannot be selected more than once.");
        var targetIds = requestedIds;
        var targetInstallments = obligation.Installments
            .Where(x => targetIds.Contains(x.Id))
            .ToList();
        if (targetIds.Length != targetInstallments.Count)
            throw new BusinessValidationException("LOAN_REPAYMENT_INSTALLMENT_INVALID", "Every selected installment must belong to the exact Loan obligation.");
        if (targetInstallments.Any(x => x.Status == LoanRepaymentInstallmentStatus.Cancelled))
            throw new BusinessValidationException("LOAN_REPAYMENT_INSTALLMENT_INVALID", "A cancelled installment cannot receive repayment.");
        if (targetInstallments.Any(x => x.Status == LoanRepaymentInstallmentStatus.Paid))
            throw new BusinessValidationException("LOAN_REPAYMENT_INSTALLMENT_INVALID", "A fully paid installment cannot receive additional repayment.");

        FileUploadResult? uploadedProof = null;
        try
        {
            if (command.ProofContent is not null)
            {
                uploadedProof = await fileUpload.UploadAsync(new FileUploadCommand(
                    ProofCategory,
                    command.ProofContent,
                    command.ProofOriginalFileName ?? "loan-repayment-proof.pdf",
                    command.ProofContentType,
                    command.ProofFileSize,
                    founderId,
                    opportunity.ProjectId,
                    "LoanRepaymentDeclaration",
                    $"obligation:{loanObligationId}"), cancellationToken);
            }

            await uow.BeginTransactionAsync();
            try
            {
                var now = DateTime.UtcNow;
                var declaration = new LoanRepaymentDeclaration
                {
                    LoanObligationId = obligation.Id,
                    ParticipationId = obligation.ParticipationRequestId,
                    ContractId = obligation.ContractId,
                    ContractVersionId = obligation.ContractVersionId,
                    AcceptedOfferId = obligation.AcceptedOfferId,
                    AcceptedOfferVersionNumber = obligation.AcceptedOfferVersionNumber,
                    OfferLegId = obligation.OfferLegId,
                    FounderUserId = obligation.FounderUserId,
                    InvestorUserId = obligation.InvestorUserId,
                    Amount = decimal.Round(command.Amount, 2),
                    Currency = obligation.Currency,
                    ExternalPaymentDate = command.ExternalPaymentDate,
                    ExternalReference = Normalize(command.ExternalReference),
                    ProofFileId = uploadedProof?.FileId,
                    DeclaredAt = now,
                    DeclaredByUserId = founderId,
                    Status = LoanRepaymentDeclarationStatus.PendingConfirmation,
                    IdempotencyKey = idempotencyKey
                };
                foreach (var installment in targetInstallments)
                    declaration.Installments.Add(new LoanRepaymentDeclarationInstallment { LoanRepaymentInstallmentId = installment.Id });

                await uow.Repository<LoanRepaymentDeclaration>().AddAsync(declaration);
                await uow.Repository<AuditLog>().AddAsync(BuildAudit(
                    founderId, "Declared", declaration, new { declaration.Amount, declaration.Currency, declaration.ExternalPaymentDate, declaration.ExternalReference, targetInstallmentIds = targetIds, hasProof = uploadedProof is not null }, now));
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();
                await NotifyAsync(new NotificationEventCreation(
                    obligation.InvestorUserId,
                    "LoanRepaymentDeclared",
                    declaration.Id.ToString(),
                    "Loan repayment awaiting confirmation",
                    "The Founder declared an external Loan repayment. Please review and confirm or dispute it.",
                    "info",
                    $"/admin/opportunities/{opportunityId}/room#loan-{loanObligationId}",
                    founderId,
                    opportunityId,
                    "loan-repayment"), cancellationToken);
                return await ToDtoAsync(declaration, cancellationToken);
            }
            catch
            {
                await uow.RollbackTransactionAsync();
                throw;
            }
        }
        catch (IOException ex) when (command.ProofContent is not null && uploadedProof is null)
        {
            logger.LogWarning(ex, "Loan repayment proof upload unavailable for obligation {LoanObligationId}", loanObligationId);
            throw new BusinessValidationException("LOAN_REPAYMENT_PROOF_UPLOAD_UNAVAILABLE", "Proof upload is temporarily unavailable. You can declare the repayment without proof and try again later.");
        }
        catch
        {
            if (uploadedProof is not null)
                await BestEffortDeleteProofAsync(uploadedProof.FileKey);
            throw;
        }
    }

    public Task<LoanRepaymentRecordDto> ConfirmAsync(Guid investorId, int declarationId, string? comment, CancellationToken cancellationToken = default) =>
        TransitionAsync(investorId, declarationId, LoanRepaymentDeclarationStatus.Confirmed, Normalize(comment), cancellationToken);

    public Task<LoanRepaymentRecordDto> DisputeAsync(Guid investorId, int declarationId, string reason, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new BusinessValidationException("LOAN_REPAYMENT_DISPUTE_REASON_REQUIRED", "A dispute reason is required.");
        if (reason.Trim().Length > 2000)
            throw new BusinessValidationException("LOAN_REPAYMENT_DISPUTE_REASON_INVALID", "The dispute reason cannot exceed 2,000 characters.");
        return TransitionAsync(investorId, declarationId, LoanRepaymentDeclarationStatus.Disputed, reason.Trim(), cancellationToken);
    }

    private async Task<LoanRepaymentRecordDto> TransitionAsync(Guid investorId, int declarationId, LoanRepaymentDeclarationStatus target, string? decisionText, CancellationToken cancellationToken)
    {
        await RepaymentGate.WaitAsync(cancellationToken);
        try
        {
            await uow.BeginTransactionAsync();
            try
            {
                var declaration = await uow.Repository<LoanRepaymentDeclaration>().GetSingleAsync(
                    x => x.Id == declarationId,
                    x => x.LoanObligation!,
                    x => x.Installments!,
                    x => x.Allocations!)
                    ?? throw new BusinessValidationException("LOAN_REPAYMENT_NOT_FOUND", "The Loan repayment declaration was not found.");
                if (declaration.InvestorUserId != investorId)
                    throw new BusinessValidationException("LOAN_REPAYMENT_FORBIDDEN", "Only the Investor associated with this Loan can decide the repayment.");
                if (declaration.Status == target)
                {
                    await uow.RollbackTransactionAsync();
                    return await ToDtoAsync(declaration, cancellationToken);
                }
                if (declaration.Status == LoanRepaymentDeclarationStatus.Confirmed)
                    throw new BusinessValidationException("LOAN_REPAYMENT_ALREADY_CONFIRMED", "This repayment is already confirmed and cannot be changed.");
                if (declaration.Status == LoanRepaymentDeclarationStatus.Disputed)
                    throw new BusinessValidationException("LOAN_REPAYMENT_ALREADY_DISPUTED", "This repayment is already disputed and cannot be changed.");

                var now = DateTime.UtcNow;
                if (target == LoanRepaymentDeclarationStatus.Confirmed)
                {
                    var obligation = declaration.LoanObligation ?? throw new BusinessValidationException("LOAN_OBLIGATION_NOT_FOUND", "The Loan obligation was not found.");
                    await uow.Repository<LoanObligation>().GetByIdWithIncludesAsync(obligation.Id, x => x.Installments!);
                    var allocations = await uow.Repository<LoanRepaymentAllocation>().FindAsync(x => x.LoanObligationId == obligation.Id);
                    var confirmedOutstanding = obligation.Installments.Sum(x => x.TotalDue) - allocations.Sum(x => x.TotalAllocated);
                    if (declaration.Amount > decimal.Round(Math.Max(0m, confirmedOutstanding), 2))
                        throw new BusinessValidationException("LOAN_REPAYMENT_OVERPAYMENT", "The confirmed repayment exceeds the remaining Loan obligation balance.");

                    var explicitIds = declaration.Installments.Select(x => x.LoanRepaymentInstallmentId).ToHashSet();
                    var candidates = obligation.Installments
                        .Where(x => x.Status != LoanRepaymentInstallmentStatus.Cancelled && (explicitIds.Count == 0 || explicitIds.Contains(x.Id)))
                        .OrderBy(x => x.DueDate).ThenBy(x => x.InstallmentNumber)
                        .ToList();
                    var allocationsByInstallment = allocations.GroupBy(x => x.LoanRepaymentInstallmentId)
                        .ToDictionary(x => x.Key, x => new { Total = x.Sum(a => a.TotalAllocated), Interest = x.Sum(a => a.InterestAllocated), Principal = x.Sum(a => a.PrincipalAllocated) });
                    var targetCapacity = candidates.Sum(x => x.TotalDue - (allocationsByInstallment.TryGetValue(x.Id, out var priorAllocation) ? priorAllocation.Total : 0m));
                    if (declaration.Amount > decimal.Round(Math.Max(0m, targetCapacity), 2))
                        throw new BusinessValidationException("LOAN_REPAYMENT_SELECTED_INSTALLMENTS_INSUFFICIENT", "The selected installments cannot absorb the confirmed repayment amount.");

                    var remaining = declaration.Amount;
                    foreach (var installment in candidates)
                    {
                        if (remaining <= 0m) break;
                        var prior = allocationsByInstallment.GetValueOrDefault(installment.Id);
                        var interestNeeded = Math.Max(0m, installment.InterestDue - (prior?.Interest ?? 0m));
                        var principalNeeded = Math.Max(0m, installment.PrincipalDue - (prior?.Principal ?? 0m));
                        var interest = decimal.Round(Math.Min(remaining, interestNeeded), 2);
                        remaining -= interest;
                        var principal = decimal.Round(Math.Min(remaining, principalNeeded), 2);
                        remaining -= principal;
                        if (interest + principal > 0m)
                        {
                            var allocation = new LoanRepaymentAllocation
                            {
                                LoanRepaymentDeclarationId = declaration.Id,
                                LoanObligationId = obligation.Id,
                                LoanRepaymentInstallmentId = installment.Id,
                                InstallmentNumber = installment.InstallmentNumber,
                                InterestAllocated = interest,
                                PrincipalAllocated = principal,
                                TotalAllocated = interest + principal,
                                CreatedAt = now
                            };
                            declaration.Allocations.Add(allocation);
                            await uow.Repository<LoanRepaymentAllocation>().AddAsync(allocation);
                        }
                    }
                    declaration.Status = target;
                    declaration.ConfirmationComment = decisionText;
                    obligation.RepaymentLedgerVersion++;
                    await uow.SaveChangesAsync();
                    await RefreshInstallmentStatusesAsync(obligation, cancellationToken);
                }
                else
                {
                    declaration.Status = target;
                    declaration.DisputeReason = decisionText;
                }
                declaration.DecidedAt = now;
                declaration.DecidedByUserId = investorId;
                var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(declaration.Participation?.OpportunityId ?? 0)
                    ?? await FindOpportunityForDeclarationAsync(declaration);
                await uow.Repository<AuditLog>().AddAsync(BuildAudit(
                    investorId,
                    target == LoanRepaymentDeclarationStatus.Confirmed ? "Confirmed" : "Disputed",
                    declaration,
                    new { declaration.Amount, declaration.Currency, targetStatus = target.ToString(), decisionText },
                    now));
                await uow.SaveChangesAsync();
                await uow.CommitTransactionAsync();
                if (target == LoanRepaymentDeclarationStatus.Confirmed && lifecycle is not null)
                    await lifecycle.ProcessAsync(DateTime.UtcNow, cancellationToken);

                await NotifyAsync(new NotificationEventCreation(
                    declaration.FounderUserId,
                    target == LoanRepaymentDeclarationStatus.Confirmed ? "LoanRepaymentConfirmed" : "LoanRepaymentDisputed",
                    declaration.Id.ToString(),
                    target == LoanRepaymentDeclarationStatus.Confirmed ? "Loan repayment confirmed" : "Loan repayment disputed",
                    target == LoanRepaymentDeclarationStatus.Confirmed ? "The Investor confirmed the declared external Loan repayment." : "The Investor disputed the declared external Loan repayment.",
                    target == LoanRepaymentDeclarationStatus.Confirmed ? "success" : "warning",
                    $"/admin/opportunities/{opportunity?.Id ?? declaration.ParticipationId}/room#loan-{declaration.LoanObligationId}",
                    investorId,
                    opportunity?.Id,
                    "loan-repayment"), cancellationToken);
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
            logger.LogWarning(ex, "Concurrent Loan repayment decision for declaration {DeclarationId}", declarationId);
            throw new BusinessValidationException("LOAN_REPAYMENT_CONCURRENCY", "This repayment was decided by another request. Refresh and review its current status.");
        }
        finally
        {
            RepaymentGate.Release();
        }
    }

    public async Task<IReadOnlyList<LoanRepaymentRecordDto>> GetForParticipationAsync(Guid actorId, int opportunityId, int participationId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationId)
            ?? throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "The Loan Participation was not found.");
        if (participation.OpportunityId != opportunityId)
            throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "The Loan Participation was not found.");
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
        if (!isAdmin && actorId != opportunity?.FounderId && actorId != participation.InvestorId)
            throw new BusinessValidationException("LOAN_REPAYMENT_FORBIDDEN", "You are not authorized to view these Loan repayments.");
        var declarations = await uow.Repository<LoanRepaymentDeclaration>().Query()
            .Where(x => x.ParticipationId == participationId)
            .Include(x => x.Installments).ThenInclude(x => x.Installment)
            .Include(x => x.Allocations)
            .OrderByDescending(x => x.DeclaredAt)
            .ToListAsync(cancellationToken);
        return await ToDtosAsync(declarations, cancellationToken);
    }

    public async Task<LoanRepaymentProofDownload> DownloadProofAsync(Guid actorId, int declarationId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var declaration = await uow.Repository<LoanRepaymentDeclaration>().GetByIdAsync(declarationId)
            ?? throw new BusinessValidationException("LOAN_REPAYMENT_NOT_FOUND", "The Loan repayment declaration was not found.");
        if (!isAdmin && actorId != declaration.FounderUserId && actorId != declaration.InvestorUserId)
            throw new BusinessValidationException("LOAN_REPAYMENT_PROOF_FORBIDDEN", "You are not authorized to access this repayment proof.");
        if (string.IsNullOrWhiteSpace(declaration.ProofFileId))
            throw new BusinessValidationException("LOAN_REPAYMENT_PROOF_NOT_FOUND", "No repayment proof was provided.");
        var file = (await uow.Repository<StoredFile>().FindAsync(x => x.FileId == declaration.ProofFileId && !x.IsDeleted)).SingleOrDefault()
            ?? throw new BusinessValidationException("LOAN_REPAYMENT_PROOF_NOT_FOUND", "The repayment proof is not available.");
        if (!string.Equals(file.CategoryCode, ProofCategory, StringComparison.OrdinalIgnoreCase))
            throw new BusinessValidationException("LOAN_REPAYMENT_PROOF_NOT_FOUND", "The repayment proof is not available.");
        return new LoanRepaymentProofDownload(await fileStorage.ReadFileAsync(file.FileKey, cancellationToken), file.OriginalFileName, file.MimeType);
    }

    public async Task<IReadOnlyDictionary<int, LoanRepaymentSummaryDto>> GetSummariesByObligationAsync(IEnumerable<int> obligationIds, CancellationToken cancellationToken = default)
    {
        var ids = obligationIds.Distinct().ToHashSet();
        if (ids.Count == 0) return new Dictionary<int, LoanRepaymentSummaryDto>();
        var obligations = await uow.Repository<LoanObligation>().Query().Where(x => ids.Contains(x.Id)).Include(x => x.Installments).ToListAsync(cancellationToken);
        var declarations = await uow.Repository<LoanRepaymentDeclaration>().Query().Where(x => ids.Contains(x.LoanObligationId)).Include(x => x.Installments).ThenInclude(x => x.Installment).Include(x => x.Allocations).ToListAsync(cancellationToken);
        var lifecycleSnapshots = lifecycle is null
            ? new Dictionary<int, LoanLifecycleSnapshotDto>()
            : await lifecycle.GetSnapshotsByObligationAsync(ids, cancellationToken);
        var result = new Dictionary<int, LoanRepaymentSummaryDto>();
        foreach (var obligation in obligations)
        {
            var rows = declarations.Where(x => x.LoanObligationId == obligation.Id).OrderByDescending(x => x.DeclaredAt).ToList();
            var confirmed = rows.Where(x => x.Status == LoanRepaymentDeclarationStatus.Confirmed).ToList();
            var allocations = confirmed.SelectMany(x => x.Allocations).ToList();
            var paidByInstallment = allocations.GroupBy(x => x.LoanRepaymentInstallmentId).ToDictionary(x => x.Key, x => x.Sum(a => a.TotalAllocated));
            var next = obligation.Installments.Where(x => x.Status != LoanRepaymentInstallmentStatus.Cancelled && paidByInstallment.GetValueOrDefault(x.Id) < x.TotalDue).OrderBy(x => x.DueDate).ThenBy(x => x.InstallmentNumber).FirstOrDefault();
            lifecycleSnapshots.TryGetValue(obligation.Id, out var lifecycleSnapshot);
            result[obligation.Id] = new LoanRepaymentSummaryDto
            {
                LoanObligationId = obligation.Id,
                Currency = obligation.Currency,
                PrincipalOutstanding = Math.Max(0m, obligation.Installments.Sum(x => x.PrincipalDue) - allocations.Sum(x => x.PrincipalAllocated)),
                InterestOutstanding = Math.Max(0m, obligation.Installments.Sum(x => x.InterestDue) - allocations.Sum(x => x.InterestAllocated)),
                TotalOutstanding = Math.Max(0m, obligation.Installments.Sum(x => x.TotalDue) - allocations.Sum(x => x.TotalAllocated)),
                ConfirmedRepaidAmount = confirmed.Sum(x => x.Amount),
                PendingConfirmationAmount = rows.Where(x => x.Status == LoanRepaymentDeclarationStatus.PendingConfirmation).Sum(x => x.Amount),
                DisputedAmount = rows.Where(x => x.Status == LoanRepaymentDeclarationStatus.Disputed).Sum(x => x.Amount),
                NextDueAmount = next is null ? null : Math.Max(0m, next.TotalDue - paidByInstallment.GetValueOrDefault(next.Id)),
                NextDueDate = next?.DueDate,
                LoanLifecycleStatus = lifecycleSnapshot?.Status ?? obligation.Status.ToString(),
                MaturityDate = lifecycleSnapshot?.MaturityDate ?? obligation.ContractualMaturityDate,
                OverdueAmount = lifecycleSnapshot?.OverdueAmount ?? obligation.Installments
                    .Where(x => x.DueDate.ToUniversalTime().Date < DateTime.UtcNow.Date)
                    .Sum(x => Math.Max(0m, x.TotalDue - paidByInstallment.GetValueOrDefault(x.Id))),
                FullyRepaidAt = lifecycleSnapshot?.FullyRepaidAt,
                DefaultedAt = lifecycleSnapshot?.DefaultedAt,
                DefaultedByUserId = lifecycleSnapshot?.DefaultedByUserId,
                DefaultReason = lifecycleSnapshot?.DefaultReason,
                DefaultOutstandingPrincipal = lifecycleSnapshot?.DefaultOutstandingPrincipal,
                DefaultOutstandingInterest = lifecycleSnapshot?.DefaultOutstandingInterest,
                DefaultOutstandingTotal = lifecycleSnapshot?.DefaultOutstandingTotal,
                ClosedAt = lifecycleSnapshot?.ClosedAt,
                ClosedByUserId = lifecycleSnapshot?.ClosedByUserId,
                ClosureReason = lifecycleSnapshot?.ClosureReason,
                ClosedFinalPrincipalOutstanding = lifecycleSnapshot?.ClosedFinalPrincipalOutstanding,
                ClosedFinalInterestOutstanding = lifecycleSnapshot?.ClosedFinalInterestOutstanding,
                ClosedFinalTotalOutstanding = lifecycleSnapshot?.ClosedFinalTotalOutstanding,
                Records = await ToDtosAsync(rows, cancellationToken)
            };
        }
        return result;
    }

    private async Task RefreshInstallmentStatusesAsync(LoanObligation obligation, CancellationToken cancellationToken)
    {
        var allocations = await uow.Repository<LoanRepaymentAllocation>().FindAsync(x => x.LoanObligationId == obligation.Id);
        var paid = allocations.GroupBy(x => x.LoanRepaymentInstallmentId).ToDictionary(x => x.Key, x => x.Sum(a => a.TotalAllocated));
        var today = DateTime.UtcNow.Date;
        foreach (var installment in obligation.Installments)
        {
            if (installment.Status == LoanRepaymentInstallmentStatus.Cancelled) continue;
            var total = paid.GetValueOrDefault(installment.Id);
            installment.Status = total >= installment.TotalDue
                ? LoanRepaymentInstallmentStatus.Paid
                : total > 0m
                    ? LoanRepaymentInstallmentStatus.PartiallyPaid
                    : installment.DueDate.Date < today
                        ? LoanRepaymentInstallmentStatus.Overdue
                        : installment.DueDate.Date == today ? LoanRepaymentInstallmentStatus.Due : LoanRepaymentInstallmentStatus.Upcoming;
        }
        await uow.SaveChangesAsync();
    }

    private async Task<Opportunity?> FindOpportunityForDeclarationAsync(LoanRepaymentDeclaration declaration)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(declaration.ParticipationId);
        return participation is null ? null : await uow.Repository<Opportunity>().GetByIdAsync(participation.OpportunityId);
    }

    private async Task NotifyAsync(NotificationEventCreation creation, CancellationToken cancellationToken)
    {
        if (notifications is null) return;
        try { await notifications.CreateEventAsync(creation, cancellationToken); }
        catch (Exception ex) { logger.LogWarning(ex, "Loan repayment notification failed for {BusinessEntityId}", creation.BusinessEntityId); }
    }

    private async Task<LoanRepaymentRecordDto> ToDtoAsync(LoanRepaymentDeclaration declaration, CancellationToken cancellationToken)
    {
        var rows = await ToDtosAsync([declaration], cancellationToken);
        return rows[0];
    }

    private async Task<IReadOnlyList<LoanRepaymentRecordDto>> ToDtosAsync(IEnumerable<LoanRepaymentDeclaration> declarations, CancellationToken cancellationToken)
    {
        var rows = declarations.ToList();
        var proofIds = rows.Where(x => !string.IsNullOrWhiteSpace(x.ProofFileId)).Select(x => x.ProofFileId!).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var files = proofIds.Count == 0 ? [] : await uow.Repository<StoredFile>().FindAsync(x => proofIds.Contains(x.FileId) && !x.IsDeleted);
        var filesById = files.ToDictionary(x => x.FileId, StringComparer.OrdinalIgnoreCase);
        return rows.Select(x => new LoanRepaymentRecordDto
        {
            Id = x.Id, LoanObligationId = x.LoanObligationId, Amount = x.Amount, Currency = x.Currency,
            ExternalPaymentDate = x.ExternalPaymentDate, ExternalReference = x.ExternalReference,
            ProofAvailable = x.ProofFileId is not null && filesById.ContainsKey(x.ProofFileId),
            ProofFileName = x.ProofFileId is not null && filesById.TryGetValue(x.ProofFileId, out var file) ? file.OriginalFileName : null,
            Status = x.Status.ToString(), DeclaredAt = x.DeclaredAt, DeclaredByUserId = x.DeclaredByUserId,
            DecidedAt = x.DecidedAt, DecidedByUserId = x.DecidedByUserId, ConfirmationComment = x.ConfirmationComment, DisputeReason = x.DisputeReason,
            TargetInstallmentNumbers = x.Installments.OrderBy(i => i.Installment?.InstallmentNumber).Select(i => i.Installment?.InstallmentNumber ?? 0).Where(i => i > 0).ToList(),
            Allocations = x.Allocations.OrderBy(a => a.InstallmentNumber).Select(a => new LoanRepaymentAllocationDto { InstallmentNumber = a.InstallmentNumber, InterestAllocated = a.InterestAllocated, PrincipalAllocated = a.PrincipalAllocated, TotalAllocated = a.TotalAllocated }).ToList()
        }).ToList();
    }

    private static AuditLog BuildAudit(Guid actor, string action, LoanRepaymentDeclaration declaration, object payload, DateTime now) => new()
    {
        UserId = actor, EntityType = nameof(LoanRepaymentDeclaration), EntityId = declaration.Id.ToString(), Action = action, NewValues = JsonSerializer.Serialize(payload), Timestamp = now
    };

    private async Task BestEffortDeleteProofAsync(string fileKey)
    {
        try { await fileStorage.DeleteFileAsync(fileKey); } catch (Exception ex) { logger.LogWarning(ex, "Failed to clean up Loan repayment proof {FileKey}", fileKey); }
    }

    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0m || decimal.Round(amount, 2) != amount)
            throw new BusinessValidationException("LOAN_REPAYMENT_AMOUNT_INVALID", "Repayment amount must be positive and use no more than two decimal places.");
    }

    private static string NormalizeCurrency(string value) => value.Trim().ToUpperInvariant();
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
