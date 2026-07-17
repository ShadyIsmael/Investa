using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs.Finance;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Investa.Application.Interfaces;

namespace Investa.Application.Services.Finance;

/// <summary>
/// Service for managing finance transactions.
/// Handles creation, confirmation, reversal, and accounting line generation.
/// </summary>
public interface IFinanceTransactionService
{
    // Transaction CRUD
    Task<FinanceTransactionDto> CreateTransactionAsync(CreateFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<FinanceTransactionDto> UpdateTransactionAsync(int id, UpdateFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<FinanceTransactionDto> GetTransactionAsync(int id);
    Task<List<FinanceTransactionListDto>> GetTransactionsAsync(int pageNumber = 1, int pageSize = 20);
    Task<List<FinanceTransactionListDto>> GetTransactionsByFilterAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int? accountId = null,
        int pageNumber = 1,
        int pageSize = 20);

    // Transaction Actions
    Task<FinanceTransactionDto> ConfirmTransactionAsync(int id, ConfirmFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<FinanceTransactionDto> ReverseTransactionAsync(int id, ReverseFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<FinanceTransactionDto> CancelTransactionAsync(int id, CancelFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task DeleteDraftTransactionAsync(int id, Guid userId);

    // Maker/Checker Workflow
    Task<FinanceTransactionDto> SubmitTransactionAsync(int id, SubmitFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<FinanceTransactionDto> ApproveTransactionAsync(int id, ApproveFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<FinanceTransactionDto> RejectTransactionAsync(int id, RejectFinanceTransactionDto dto, Guid userId, string? ipAddress = null);
    Task<List<FinanceTransactionListDto>> GetTransactionsAssignedToMeAsync(Guid userId, int pageNumber = 1, int pageSize = 20);
    Task<List<FinanceTransactionListDto>> GetTransactionsCreatedByMeAsync(Guid userId, int pageNumber = 1, int pageSize = 20);

    // Attachment Management
    Task<FinanceAttachmentDto> AddAttachmentAsync(int transactionId, UploadFinanceAttachmentDto dto, byte[] fileContent, Guid userId);
    Task RemoveAttachmentAsync(int attachmentId, Guid userId);
    Task<List<FinanceAttachmentDto>> GetTransactionAttachmentsAsync(int transactionId);

    // Audit Trail
    Task<TransactionAuditHistoryDto> GetAuditHistoryAsync(int transactionId);
}

/// <summary>
/// Implementation of finance transaction service.
/// </summary>
public class FinanceTransactionService : IFinanceTransactionService
{
    private readonly IFinanceRepository _repository;
    private readonly IFinanceValidationService _validationService;
    private readonly IFinanceAccountingService _accountingService;
    private readonly ICurrentUserContext _currentUser;

    public FinanceTransactionService(
        IFinanceRepository repository,
        IFinanceValidationService validationService,
        IFinanceAccountingService accountingService,
        ICurrentUserContext currentUser)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
        _accountingService = accountingService ?? throw new ArgumentNullException(nameof(accountingService));
        _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
    }

    public async Task<FinanceTransactionDto> CreateTransactionAsync(
        CreateFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        // Validate
        var (isValid, errors) = await _validationService.ValidateFinanceTransactionAsync(dto);
        if (!isValid)
            throw new InvalidOperationException($"Validation failed: {string.Join(", ", errors)}");

        // Create entity
        var transactionType = ResolveTransactionType(dto.TransactionType, dto.IncomingMoneyType);
        var incomingMoneyType = ResolveIncomingMoneyType(transactionType, dto.IncomingMoneyType);
        var paymentGatewayFee = dto.PaymentGatewayFee.GetValueOrDefault();
        var transaction = new FinanceTransaction
        {
            ReferenceNumber = await GenerateReferenceNumberAsync(),
            TransactionType = transactionType,
            IncomingMoneyType = incomingMoneyType,
            Status = FinanceTransactionStatus.Draft,
            DocumentationStatus = dto.DocumentationStatus ?? FinanceDocumentationStatus.NoDocuments,
            TransactionDate = dto.TransactionDate,
            PostingDate = dto.TransactionDate,
            Description = dto.Description,
            Notes = dto.Notes,
            Amount = dto.Amount,
            Currency = dto.Currency.Trim().ToUpperInvariant(),
            ExchangeRate = dto.ExchangeRate,
            AmountInBaseCurrency = dto.Amount * dto.ExchangeRate,
            SourceName = Normalize(dto.SourceName) ?? Normalize(dto.PayerName),
            PaymentMethod = Normalize(dto.PaymentMethod),
            PaymentGatewayFee = paymentGatewayFee,
            NetAmountReceived = CalculateNetAmount(dto.Amount, paymentGatewayFee),
            SourceAccountId = dto.SourceAccountId,
            DestinationAccountId = dto.DestinationAccountId,
            IncomeCategoryId = dto.IncomeCategoryId,
            ExpenseCategoryId = dto.ExpenseCategoryId,
            SupplierId = dto.SupplierId,
            FounderId = dto.FounderId,
            InvoiceNumber = dto.InvoiceNumber,
            ExternalReference = dto.ExternalReference,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Generate accounting lines (internal double-entry)
        var lines = await _accountingService.GenerateTransactionLinesAsync(transaction);
        transaction.TransactionLines = lines;

        await _repository.AddTransactionAsync(transaction);
        // Save
        await _repository.SaveAsync();

        // Record audit
        await RecordAuditEventAsync(
            transaction.Id,
            FinanceAuditEventType.Created,
            userId,
            "Transaction created",
            null,
            null,
            ipAddress);

        return await MapToDtoAsync(transaction);
    }

    public async Task<FinanceTransactionDto> UpdateTransactionAsync(
        int id,
        UpdateFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        if (transaction.Status != FinanceTransactionStatus.Draft && transaction.Status != FinanceTransactionStatus.Rejected)
            throw new InvalidOperationException("Only draft or rejected transactions can be updated");
        if ((transaction.MakerId ?? transaction.CreatedBy) != userId)
            throw new InvalidOperationException("Only the Maker can update this transaction");

        // Store old values for audit
        var oldTransaction = Clone(transaction);

        // Update fields
        if (dto.TransactionDate.HasValue)
            transaction.TransactionDate = dto.TransactionDate.Value;
        if (dto.IncomingMoneyType.HasValue)
        {
            transaction.IncomingMoneyType = ResolveIncomingMoneyType(transaction.TransactionType, dto.IncomingMoneyType);
            transaction.TransactionType = ResolveTransactionType(transaction.TransactionType, transaction.IncomingMoneyType);
        }
        if (!string.IsNullOrWhiteSpace(dto.Description))
            transaction.Description = dto.Description;
        if (!string.IsNullOrWhiteSpace(dto.Notes))
            transaction.Notes = dto.Notes;
        if (dto.Amount.HasValue)
            transaction.Amount = dto.Amount.Value;
        if (!string.IsNullOrWhiteSpace(dto.Currency))
            transaction.Currency = dto.Currency.Trim().ToUpperInvariant();
        if (dto.ExchangeRate.HasValue)
            transaction.ExchangeRate = dto.ExchangeRate.Value;
        if (dto.SourceName != null || dto.PayerName != null)
            transaction.SourceName = Normalize(dto.SourceName) ?? Normalize(dto.PayerName);
        if (dto.PaymentMethod != null)
            transaction.PaymentMethod = Normalize(dto.PaymentMethod);
        if (dto.PaymentGatewayFee.HasValue)
            transaction.PaymentGatewayFee = dto.PaymentGatewayFee.Value;
        if (dto.NetAmountReceived.HasValue)
            transaction.NetAmountReceived = dto.NetAmountReceived.Value;
        if (dto.DocumentationStatus.HasValue)
            transaction.DocumentationStatus = dto.DocumentationStatus.Value;

        transaction.AmountInBaseCurrency = transaction.Amount * transaction.ExchangeRate;
        transaction.NetAmountReceived = CalculateNetAmount(transaction.Amount, transaction.PaymentGatewayFee);

        // Update references
        if (dto.SourceAccountId.HasValue)
            transaction.SourceAccountId = dto.SourceAccountId;
        if (dto.DestinationAccountId.HasValue)
            transaction.DestinationAccountId = dto.DestinationAccountId;
        if (dto.IncomeCategoryId.HasValue)
            transaction.IncomeCategoryId = dto.IncomeCategoryId;
        if (dto.ExpenseCategoryId.HasValue)
            transaction.ExpenseCategoryId = dto.ExpenseCategoryId;
        if (dto.SupplierId.HasValue)
            transaction.SupplierId = dto.SupplierId;
        if (dto.FounderId.HasValue)
            transaction.FounderId = dto.FounderId;
        if (!string.IsNullOrWhiteSpace(dto.InvoiceNumber))
            transaction.InvoiceNumber = dto.InvoiceNumber;
        if (!string.IsNullOrWhiteSpace(dto.ExternalReference))
            transaction.ExternalReference = dto.ExternalReference;

        transaction.UpdatedBy = userId;
        transaction.UpdatedAt = DateTime.UtcNow;

        // Re-validate
        var createDto = MapToCreateDto(transaction);
        var (isValid, errors) = await _validationService.ValidateFinanceTransactionAsync(createDto, transaction);
        if (!isValid)
            throw new InvalidOperationException($"Validation failed: {string.Join(", ", errors)}");

        // Regenerate accounting lines. The repository explicitly deletes the tracked
        // required dependents before inserting replacements in one database transaction.
        var lines = await _accountingService.GenerateTransactionLinesAsync(transaction);
        var auditEvent = new FinanceAuditEvent
        {
            TransactionId = transaction.Id,
            EventType = FinanceAuditEventType.Edited,
            PerformedBy = userId,
            Description = "Transaction updated",
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.ReplaceTransactionLinesAsync(transaction, lines, auditEvent);

        return await MapToDtoAsync(transaction);
    }

    public async Task<FinanceTransactionDto> GetTransactionAsync(int id)
    {
        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        return await MapToDtoAsync(transaction);
    }

    public async Task<List<FinanceTransactionListDto>> GetTransactionsAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await MapToListDtoAsync((await _repository.GetTransactionsAsync(pageNumber: pageNumber, pageSize: pageSize)).ToList());
    }

    public async Task<List<FinanceTransactionListDto>> GetTransactionsByFilterAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int? accountId = null,
        int pageNumber = 1,
        int pageSize = 20)
    {
        return await MapToListDtoAsync((await _repository.GetTransactionsAsync(fromDate, toDate, status, accountId, pageNumber: pageNumber, pageSize: pageSize)).ToList());
    }

    public async Task<FinanceTransactionDto> ConfirmTransactionAsync(
        int id,
        ConfirmFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var (isValid, errors) = await _validationService.ValidateConfirmationAsync(id);
        if (!isValid)
            throw new InvalidOperationException($"Cannot confirm: {string.Join(", ", errors)}");

        var transaction = await _repository.GetTransactionByIdAsync(id);
        transaction.Status = FinanceTransactionStatus.Confirmed;
        transaction.ConfirmedAt = DateTime.UtcNow;
        transaction.ConfirmedBy = userId;
        transaction.UpdatedBy = userId;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await RecordAuditEventAsync(
            id,
            FinanceAuditEventType.Confirmed,
            userId,
            "Transaction confirmed",
            null,
            null,
            ipAddress);

        return await MapToDtoAsync(transaction);
    }

    public async Task<FinanceTransactionDto> ReverseTransactionAsync(
        int id,
        ReverseFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var (isValid, errors) = await _validationService.ValidateReversalAsync(id);
        if (!isValid)
            throw new InvalidOperationException($"Cannot reverse: {string.Join(", ", errors)}");

        var originalTransaction = await _repository.GetTransactionByIdAsync(id);

        // Create reversal transaction
        var reversalDto = new CreateFinanceTransactionDto
        {
            TransactionType = originalTransaction.TransactionType,
            TransactionDate = DateTime.UtcNow,
            Description = $"REVERSAL: {originalTransaction.Description}",
            Amount = originalTransaction.Amount,
            Currency = originalTransaction.Currency,
            ExchangeRate = originalTransaction.ExchangeRate,
            SourceAccountId = originalTransaction.DestinationAccountId,
            DestinationAccountId = originalTransaction.SourceAccountId,
            IncomeCategoryId = originalTransaction.IncomeCategoryId,
            ExpenseCategoryId = originalTransaction.ExpenseCategoryId,
            SupplierId = originalTransaction.SupplierId,
            FounderId = originalTransaction.FounderId,
            IncomingMoneyType = originalTransaction.IncomingMoneyType,
            SourceName = originalTransaction.SourceName,
            PaymentMethod = originalTransaction.PaymentMethod,
            PaymentGatewayFee = originalTransaction.PaymentGatewayFee
        };

        var reversalTransaction = await CreateTransactionAsync(reversalDto, userId, ipAddress);

        // Mark original as reversed
        originalTransaction.Status = FinanceTransactionStatus.Reversed;
        originalTransaction.ReversalCancellationReason = dto.ReversalReason;
        originalTransaction.UpdatedBy = userId;
        originalTransaction.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await RecordAuditEventAsync(
            id,
            FinanceAuditEventType.Reversed,
            userId,
            $"Transaction reversed. Reason: {dto.ReversalReason}",
            null,
            null,
            ipAddress);

        return reversalTransaction;
    }

    public async Task<FinanceTransactionDto> CancelTransactionAsync(
        int id,
        CancelFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        if (transaction.Status == FinanceTransactionStatus.Confirmed)
            throw new InvalidOperationException("Use Reverse for confirmed transactions");

        transaction.Status = FinanceTransactionStatus.Cancelled;
        transaction.ReversalCancellationReason = dto.CancellationReason;
        transaction.UpdatedBy = userId;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await RecordAuditEventAsync(
            id,
            FinanceAuditEventType.Cancelled,
            userId,
            $"Transaction cancelled. Reason: {dto.CancellationReason}",
            null,
            null,
            ipAddress);

        return await MapToDtoAsync(transaction);
    }

    public async Task DeleteDraftTransactionAsync(int id, Guid userId)
    {
        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        if (transaction.Status != FinanceTransactionStatus.Draft)
            throw new InvalidOperationException("Only draft transactions can be deleted");

        if ((transaction.MakerId ?? transaction.CreatedBy) != userId) throw new InvalidOperationException("Only the Maker can delete this transaction");
        await _repository.DeleteTransactionAsync(transaction);
        await _repository.SaveAsync();
    }

    // ────────────── Maker/Checker Workflow Methods ──────────────────────────────────

    /// <summary>
    /// Submit transaction for review (Maker action).
    /// Changes status from Draft to ReadyForReview.
    /// </summary>
    public async Task<FinanceTransactionDto> SubmitTransactionAsync(
        int id,
        SubmitFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var (isValid, errors) = await _validationService.ValidateSubmitAsync(id, userId);
        if (!isValid)
            throw new InvalidOperationException($"Cannot submit transaction: {string.Join(", ", errors)}");

        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        transaction.Status = FinanceTransactionStatus.ReadyForReview;
        transaction.SubmittedAt = DateTime.UtcNow;
        transaction.MakerId = userId;
        transaction.UpdatedBy = userId;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await RecordAuditEventAsync(
            id,
            FinanceAuditEventType.Submitted,
            userId,
            $"Transaction submitted for review. Notes: {dto.SubmissionNotes ?? "None"}",
            null,
            null,
            ipAddress);

        return await MapToDtoAsync(transaction);
    }

    /// <summary>
    /// Approve transaction (Checker action).
    /// Changes status from ReadyForReview to Confirmed.
    /// Creator cannot approve their own transaction.
    /// </summary>
    public async Task<FinanceTransactionDto> ApproveTransactionAsync(
        int id,
        ApproveFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var (isValid, errors) = await _validationService.ValidateApproveAsync(id, userId);
        if (!isValid)
            throw new InvalidOperationException($"Cannot approve transaction: {string.Join(", ", errors)}");

        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        transaction.Status = FinanceTransactionStatus.Confirmed;
        transaction.CheckerId = userId;
        transaction.ReviewedAt = DateTime.UtcNow;
        transaction.ReviewDecision = "Approved";
        transaction.ReviewReason = dto.ApprovalNotes;
        transaction.ConfirmedAt = DateTime.UtcNow;
        transaction.ConfirmedBy = userId;
        transaction.UpdatedBy = userId;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await RecordAuditEventAsync(
            id,
            FinanceAuditEventType.Approved,
            userId,
            $"Transaction approved and confirmed. Notes: {dto.ApprovalNotes ?? "None"}",
            null,
            null,
            ipAddress);

        return await MapToDtoAsync(transaction);
    }

    /// <summary>
    /// Reject transaction (Checker action).
    /// Changes status from ReadyForReview to Rejected.
    /// Returns transaction to Maker for modifications.
    /// Creator cannot reject their own transaction.
    /// </summary>
    public async Task<FinanceTransactionDto> RejectTransactionAsync(
        int id,
        RejectFinanceTransactionDto dto,
        Guid userId,
        string? ipAddress = null)
    {
        var (isValid, errors) = await _validationService.ValidateRejectAsync(id, userId);
        if (!isValid)
            throw new InvalidOperationException($"Cannot reject transaction: {string.Join(", ", errors)}");

        if (string.IsNullOrWhiteSpace(dto.RejectionReason))
            throw new InvalidOperationException("Rejection reason is required");

        var transaction = await _repository.GetTransactionByIdAsync(id);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {id} not found");

        transaction.Status = FinanceTransactionStatus.Rejected;
        transaction.CheckerId = userId;
        transaction.ReviewedAt = DateTime.UtcNow;
        transaction.ReviewDecision = "Rejected";
        transaction.ReviewReason = dto.RejectionReason;
        transaction.UpdatedBy = userId;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await RecordAuditEventAsync(
            id,
            FinanceAuditEventType.Rejected,
            userId,
            $"Transaction rejected. Reason: {dto.RejectionReason}",
            null,
            null,
            ipAddress);

        return await MapToDtoAsync(transaction);
    }

    /// <summary>
    /// Get transactions assigned to current user for review (Checker view).
    /// Shows ReadyForReview transactions not created by the current user.
    /// </summary>
    public async Task<List<FinanceTransactionListDto>> GetTransactionsAssignedToMeAsync(
        Guid userId,
        int pageNumber = 1,
        int pageSize = 20)
    {
        return await MapToListDtoAsync((await _repository.GetTransactionsAsync(status: FinanceTransactionStatus.ReadyForReview.ToString(), excludeMakerId: userId, pageNumber: pageNumber, pageSize: pageSize)).ToList());
    }

    /// <summary>
    /// Get transactions created by current user (Maker view).
    /// Shows all transactions created by the current user.
    /// </summary>
    public async Task<List<FinanceTransactionListDto>> GetTransactionsCreatedByMeAsync(
        Guid userId,
        int pageNumber = 1,
        int pageSize = 20)
    {
        return await MapToListDtoAsync((await _repository.GetTransactionsAsync(makerId: userId, pageNumber: pageNumber, pageSize: pageSize)).ToList());
    }

    public async Task<FinanceAttachmentDto> AddAttachmentAsync(
        int transactionId,
        UploadFinanceAttachmentDto dto,
        byte[] fileContent,
        Guid userId)
    {
        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
            throw new KeyNotFoundException($"Transaction {transactionId} not found");

        if (transaction.Status is not (FinanceTransactionStatus.Draft or FinanceTransactionStatus.NeedsDocuments or FinanceTransactionStatus.Rejected)) throw new InvalidOperationException("Attachments can only be changed before confirmation");
        var attachment = new FinanceAttachment { TransactionId = transactionId, FileName = $"attachment-{Guid.NewGuid():N}", FileUrl = string.Empty, DocumentType = dto.DocumentType, DocumentReference = dto.DocumentReference, Notes = dto.Notes, IsRequired = dto.IsRequired, FileSizeBytes = fileContent.LongLength, CreatedBy = userId };
        await _repository.AddAttachmentAsync(attachment); await _repository.SaveAsync();
        return new FinanceAttachmentDto { Id = attachment.Id, FileName = attachment.FileName, FileUrl = attachment.FileUrl, DocumentType = attachment.DocumentType, FileSizeBytes = attachment.FileSizeBytes, DocumentReference = attachment.DocumentReference, Notes = attachment.Notes, IsRequired = attachment.IsRequired, CreatedAt = attachment.CreatedAt };
    }

    public async Task RemoveAttachmentAsync(int attachmentId, Guid userId)
    {
        var attachment = await _repository.GetAttachmentAsync(attachmentId) ?? throw new KeyNotFoundException();
        if (attachment.Transaction?.Status is not (FinanceTransactionStatus.Draft or FinanceTransactionStatus.NeedsDocuments or FinanceTransactionStatus.Rejected)) throw new InvalidOperationException("Attachments cannot be deleted after submission");
        await _repository.DeleteAttachmentAsync(attachment); await _repository.SaveAsync();
    }

    public async Task<List<FinanceAttachmentDto>> GetTransactionAttachmentsAsync(int transactionId)
    {
        return (await _repository.GetAttachmentsAsync(transactionId)).Select(x => new FinanceAttachmentDto { Id=x.Id, FileName=x.FileName, FileUrl=x.FileUrl, DocumentType=x.DocumentType, FileSizeBytes=x.FileSizeBytes, MimeType=x.MimeType, DocumentReference=x.DocumentReference, Notes=x.Notes, IsRequired=x.IsRequired, CreatedAt=x.CreatedAt }).ToList();
    }

    public async Task<TransactionAuditHistoryDto> GetAuditHistoryAsync(int transactionId)
    {
        var transaction = await _repository.GetTransactionByIdAsync(transactionId) ?? throw new KeyNotFoundException();
        var events = await _repository.GetAuditEventsAsync(transactionId);
        return new TransactionAuditHistoryDto { TransactionId=transactionId, ReferenceNumber=transaction.ReferenceNumber, TotalEvents=events.Count, Events=events.Select(x => new FinanceAuditEventDto { Id=x.Id, TransactionId=x.TransactionId, EventType=x.EventType.ToString(), PerformedBy=x.PerformedBy, Description=x.Description, OldValues=x.OldValues, NewValues=x.NewValues, Metadata=x.Metadata, IpAddress=x.IpAddress, CreatedAt=x.CreatedAt }).ToList() };
    }

    // Helper methods
    private async Task<string> GenerateReferenceNumberAsync()
    {
        string reference; do { reference = $"FIN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..30]; } while (await _repository.ReferenceExistsAsync(reference)); return reference;
    }

    private async Task RecordAuditEventAsync(
        int transactionId,
        FinanceAuditEventType eventType,
        Guid userId,
        string description,
        string? oldValues,
        string? newValues,
        string? ipAddress)
    {
        var auditEvent = new FinanceAuditEvent
        {
            TransactionId = transactionId,
            EventType = eventType,
            PerformedBy = userId,
            Description = description,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAuditEventAsync(auditEvent);
        await _repository.SaveAsync();
    }

    private async Task<FinanceTransactionDto> MapToDtoAsync(FinanceTransaction entity)
    {
        var confirmedByDisplayName = entity.ConfirmedBy.HasValue
            ? await _repository.GetUserDisplayNameAsync(entity.ConfirmedBy.Value)
            : null;

        FinanceAuditEvent? reversedEvent = null;
        if (entity.Status == FinanceTransactionStatus.Reversed)
        {
            var auditEvents = await _repository.GetAuditEventsAsync(entity.Id);
            reversedEvent = auditEvents.LastOrDefault(x => x.EventType == FinanceAuditEventType.Reversed);
        }

        var reversedByDisplayName = reversedEvent != null
            ? await _repository.GetUserDisplayNameAsync(reversedEvent.PerformedBy)
            : null;

        return new FinanceTransactionDto
        {
            Id = entity.Id,
            ReferenceNumber = entity.ReferenceNumber,
            TransactionType = entity.TransactionType.ToString(),
            IncomingMoneyType = entity.IncomingMoneyType?.ToString(),
            Status = entity.Status.ToString(),
            DocumentationStatus = entity.DocumentationStatus.ToString(),
            TransactionDate = entity.TransactionDate,
            PostingDate = entity.PostingDate,
            Description = entity.Description,
            Notes = entity.Notes,
            Amount = entity.Amount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            AmountInBaseCurrency = entity.AmountInBaseCurrency,
            SourceName = entity.SourceName,
            PaymentMethod = entity.PaymentMethod,
            PaymentGatewayFee = entity.PaymentGatewayFee,
            NetAmountReceived = entity.NetAmountReceived,
            SourceAccountId = entity.SourceAccountId,
            SourceAccountName = entity.SourceAccount?.Name,
            DestinationAccountId = entity.DestinationAccountId,
            DestinationAccountName = entity.DestinationAccount?.Name,
            IncomeCategoryId = entity.IncomeCategoryId,
            IncomeCategoryName = entity.IncomeCategory?.Name,
            IncomeCategoryNameEn = entity.IncomeCategory?.NameEn ?? entity.IncomeCategory?.Name,
            IncomeCategoryNameAr = entity.IncomeCategory?.NameAr,
            ExpenseCategoryId = entity.ExpenseCategoryId,
            ExpenseCategoryName = entity.ExpenseCategory?.Name,
            SupplierId = entity.SupplierId,
            SupplierName = entity.Supplier?.Name,
            FounderId = entity.FounderId,
            InvoiceNumber = entity.InvoiceNumber,
            ExternalReference = entity.ExternalReference,
            AttachmentCount = entity.Attachments?.Count ?? 0,
            ConfirmedAt = entity.ConfirmedAt,
            ConfirmedBy = entity.ConfirmedBy,
            ConfirmedByDisplayName = confirmedByDisplayName,
            ReversedByDisplayName = reversedByDisplayName,
            ReversedAt = reversedEvent?.CreatedAt,
            ReversalReason = entity.ReversalCancellationReason,
            
            // Maker/Checker Workflow
            MakerId = entity.MakerId ?? entity.CreatedBy,
            MakerDisplayName = entity.MakerId.HasValue ? await _repository.GetUserDisplayNameAsync(entity.MakerId.Value) : entity.CreatedBy.HasValue ? await _repository.GetUserDisplayNameAsync(entity.CreatedBy.Value) : null,
            SubmittedAt = entity.SubmittedAt,
            CheckerId = entity.CheckerId,
            CheckerDisplayName = entity.CheckerId.HasValue ? await _repository.GetUserDisplayNameAsync(entity.CheckerId.Value) : null,
            ReviewedAt = entity.ReviewedAt,
            ReviewDecision = entity.ReviewDecision,
            ReviewReason = entity.ReviewReason,
            
            CanEdit = CanEdit(entity),
            CanSubmit = CanSubmit(entity),
            CanReview = CanReview(entity),
            CanApprove = CanConfirm(entity),
            CanReject = CanReview(entity),
            CanConfirm = CanConfirm(entity),
            CanReverse = entity.Status == FinanceTransactionStatus.Confirmed && HasPermission(SystemPermissions.FinanceReverse),
            
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private bool IsMaker(FinanceTransaction transaction) => CurrentUserId is Guid userId && (transaction.MakerId ?? transaction.CreatedBy) == userId;
    private Guid? CurrentUserId => _currentUser.UserId;
    private bool HasPermission(string permission) => _currentUser.HasPermission(permission);
    private bool IsEditable(FinanceTransaction transaction) => transaction.Status is FinanceTransactionStatus.Draft or FinanceTransactionStatus.NeedsDocuments or FinanceTransactionStatus.Rejected;
    private bool CanEdit(FinanceTransaction transaction) => IsMaker(transaction) && IsEditable(transaction) && HasPermission(SystemPermissions.FinanceEditDraft);
    private bool CanSubmit(FinanceTransaction transaction) => IsMaker(transaction) && IsEditable(transaction) && HasPermission(SystemPermissions.FinanceSubmit);
    private bool CanReview(FinanceTransaction transaction) => !IsMaker(transaction) && transaction.Status == FinanceTransactionStatus.ReadyForReview && HasPermission(SystemPermissions.FinanceReview);
    private bool CanConfirm(FinanceTransaction transaction) => !IsMaker(transaction) && transaction.Status == FinanceTransactionStatus.ReadyForReview && HasPermission(SystemPermissions.FinanceConfirm);

    private static FinanceTransactionType ResolveTransactionType(FinanceTransactionType transactionType, IncomingMoneyType? incomingMoneyType)
    {
        if (incomingMoneyType == IncomingMoneyType.InternalTransfer)
            return FinanceTransactionType.InternalTransfer;

        if (incomingMoneyType.HasValue &&
            incomingMoneyType.Value is IncomingMoneyType.CompanyRevenue or IncomingMoneyType.CapitalContribution or IncomingMoneyType.FounderLoan or IncomingMoneyType.SupplierRefund)
        {
            return FinanceTransactionType.MoneyIn;
        }

        return transactionType;
    }

    private static IncomingMoneyType? ResolveIncomingMoneyType(FinanceTransactionType transactionType, IncomingMoneyType? incomingMoneyType)
    {
        if (transactionType == FinanceTransactionType.InternalTransfer)
            return IncomingMoneyType.InternalTransfer;

        if (transactionType == FinanceTransactionType.MoneyIn)
            return incomingMoneyType ?? IncomingMoneyType.CompanyRevenue;

        return incomingMoneyType;
    }

    private static decimal CalculateNetAmount(decimal amount, decimal paymentGatewayFee)
        => amount - paymentGatewayFee;

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private CreateFinanceTransactionDto MapToCreateDto(FinanceTransaction entity)
    {
        return new CreateFinanceTransactionDto
        {
            TransactionType = entity.TransactionType,
            IncomingMoneyType = entity.IncomingMoneyType,
            TransactionDate = entity.TransactionDate,
            Description = entity.Description,
            Notes = entity.Notes,
            Amount = entity.Amount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            SourceName = entity.SourceName,
            PaymentMethod = entity.PaymentMethod,
            PaymentGatewayFee = entity.PaymentGatewayFee,
            NetAmountReceived = entity.NetAmountReceived,
            DocumentationStatus = entity.DocumentationStatus,
            SourceAccountId = entity.SourceAccountId,
            DestinationAccountId = entity.DestinationAccountId,
            IncomeCategoryId = entity.IncomeCategoryId,
            ExpenseCategoryId = entity.ExpenseCategoryId,
            SupplierId = entity.SupplierId,
            FounderId = entity.FounderId,
            InvoiceNumber = entity.InvoiceNumber,
            ExternalReference = entity.ExternalReference
        };
    }

    private FinanceTransaction Clone(FinanceTransaction source)
    {
        return new FinanceTransaction
        {
            Id = source.Id,
            ReferenceNumber = source.ReferenceNumber,
            TransactionType = source.TransactionType,
            IncomingMoneyType = source.IncomingMoneyType,
            Status = source.Status,
            Amount = source.Amount,
            Currency = source.Currency,
            ExchangeRate = source.ExchangeRate
            // ... add other important fields
        };
    }

    private async Task<List<FinanceTransactionListDto>> MapToListDtoAsync(List<FinanceTransaction> entities)
    {
        var userIds = entities.SelectMany(e => new[] { e.MakerId ?? e.CreatedBy, e.CheckerId }).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        var nameMap = new Dictionary<Guid, string?>();
        foreach (var userId in userIds)
            nameMap[userId] = await _repository.GetUserDisplayNameAsync(userId);

        return entities.Select(e => new FinanceTransactionListDto
        {
            Id = e.Id,
            ReferenceNumber = e.ReferenceNumber,
            TransactionType = e.TransactionType.ToString(),
            IncomingMoneyType = e.IncomingMoneyType?.ToString(),
            Status = e.Status.ToString(),
            DocumentationStatus = e.DocumentationStatus.ToString(),
            TransactionDate = e.TransactionDate,
            Description = e.Description,
            Amount = e.Amount,
            Currency = e.Currency,
            SourceName = e.SourceName,
            PaymentMethod = e.PaymentMethod,
            PaymentGatewayFee = e.PaymentGatewayFee,
            NetAmountReceived = e.NetAmountReceived,
            SourceAccountId = e.SourceAccountId,
            SourceAccountName = e.SourceAccount?.Name,
            DestinationAccountId = e.DestinationAccountId,
            DestinationAccountName = e.DestinationAccount?.Name,
            IncomeCategoryId = e.IncomeCategoryId,
            IncomeCategoryName = e.IncomeCategory?.Name,
            IncomeCategoryNameEn = e.IncomeCategory?.NameEn ?? e.IncomeCategory?.Name,
            IncomeCategoryNameAr = e.IncomeCategory?.NameAr,
            InvoiceNumber = e.InvoiceNumber,
            ExternalReference = e.ExternalReference,
            MakerId = e.MakerId ?? e.CreatedBy,
            MakerDisplayName = (e.MakerId ?? e.CreatedBy) is Guid makerId && nameMap.TryGetValue(makerId, out var makerName) ? makerName : null,
            SubmittedAt = e.SubmittedAt,
            CheckerId = e.CheckerId,
            CheckerDisplayName = e.CheckerId is Guid checkerId && nameMap.TryGetValue(checkerId, out var checkerName) ? checkerName : null,
            ReviewDecision = e.ReviewDecision,
            CanEdit = CanEdit(e), CanSubmit = CanSubmit(e), CanReview = CanReview(e), CanApprove = CanConfirm(e), CanConfirm = CanConfirm(e), CanReject = CanReview(e), CanReverse = e.Status == FinanceTransactionStatus.Confirmed && HasPermission(SystemPermissions.FinanceReverse)
        }).ToList();
    }
}

/// <summary>
/// Service for generating accounting lines from transactions.
/// Implements double-entry bookkeeping.
/// </summary>
public interface IFinanceAccountingService
{
    Task<List<FinanceTransactionLine>> GenerateTransactionLinesAsync(FinanceTransaction transaction);
}

/// <summary>
/// Implementation of accounting service.
/// </summary>
public class FinanceAccountingService : IFinanceAccountingService
{
    public async Task<List<FinanceTransactionLine>> GenerateTransactionLinesAsync(FinanceTransaction transaction)
    {
        var lines = new List<FinanceTransactionLine>();

        // Generate appropriate lines based on transaction type
        switch (transaction.TransactionType)
        {
            case FinanceTransactionType.MoneyIn:
                GenerateMoneyInLines(transaction, lines);
                break;
            case FinanceTransactionType.MoneyOut:
                GenerateMoneyOutLines(transaction, lines);
                break;
            case FinanceTransactionType.InternalTransfer:
                GenerateInternalTransferLines(transaction, lines);
                break;
            case FinanceTransactionType.FounderPaid:
                GenerateFounderPaidLines(transaction, lines);
                break;
            case FinanceTransactionType.FounderReimbursement:
                GenerateFounderReimbursementLines(transaction, lines);
                break;
            case FinanceTransactionType.CashAdvance:
                GenerateCashAdvanceLines(transaction, lines);
                break;
            case FinanceTransactionType.SupplierRefund:
                GenerateIncomingSupplierRefundLines(transaction, lines);
                break;
            case FinanceTransactionType.AssetPurchase:
                GenerateAssetPurchaseLines(transaction, lines);
                break;
        }

        return lines;
    }

    private void GenerateMoneyInLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        var netAmount = transaction.NetAmountReceived > 0 ? transaction.NetAmountReceived : transaction.Amount;
        var feeAmount = transaction.PaymentGatewayFee * transaction.ExchangeRate;

        // Debit receiving account by the net cash received.
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = netAmount * transaction.ExchangeRate,
            CreditAmount = 0,
            GLAccountCode = "1010", // Asset - Bank
            GLAccountDescription = transaction.DestinationAccount?.Name ?? "Receiving Account",
            Description = transaction.Description,
            LineSequence = 1
        });

        if (feeAmount > 0)
        {
            lines.Add(new FinanceTransactionLine
            {
                DebitAmount = feeAmount,
                CreditAmount = 0,
                GLAccountCode = "5150",
                GLAccountDescription = "Payment Gateway Fees",
                Description = $"Payment gateway fee - {transaction.Description}",
                LineSequence = 2
            });
        }

        var creditSequence = feeAmount > 0 ? 3 : 2;
        var incomingType = transaction.IncomingMoneyType ?? IncomingMoneyType.CompanyRevenue;
        var creditAccount = incomingType switch
        {
            IncomingMoneyType.CompanyRevenue => transaction.IncomeCategory?.GLAccountCode ?? "4100",
            IncomingMoneyType.CapitalContribution => "3100",
            IncomingMoneyType.FounderLoan => "2300",
            IncomingMoneyType.SupplierRefund => "5100-R",
            _ => transaction.IncomeCategory?.GLAccountCode ?? "4100"
        };
        var creditDescription = incomingType switch
        {
            IncomingMoneyType.CompanyRevenue => transaction.IncomeCategory?.Name ?? "Company Revenue",
            IncomingMoneyType.CapitalContribution => "Company Capital",
            IncomingMoneyType.FounderLoan => "Founder Loan Liability",
            IncomingMoneyType.SupplierRefund => "Supplier Refund Clearing",
            _ => "Incoming Money"
        };

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = creditAccount,
            GLAccountDescription = creditDescription,
            Description = transaction.Description,
            LineSequence = creditSequence
        });
    }

    private void GenerateMoneyOutLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit to expense, Credit to bank
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = transaction.ExpenseCategory?.GLAccountCode ?? "5100", // Expense
            GLAccountDescription = transaction.ExpenseCategory?.Name,
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = "1010", // Asset - Bank
            GLAccountDescription = "Bank Account",
            Description = transaction.Description,
            LineSequence = 2
        });
    }

    private void GenerateInternalTransferLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit to destination, Credit to source
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = "1010", // Bank
            GLAccountDescription = $"Transfer to {transaction.DestinationAccount?.Name}",
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = "1010", // Bank
            GLAccountDescription = $"Transfer from {transaction.SourceAccount?.Name}",
            Description = transaction.Description,
            LineSequence = 2
        });
    }

    private void GenerateFounderPaidLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit to expense, Credit to founder liability
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = transaction.ExpenseCategory?.GLAccountCode ?? "5100",
            GLAccountDescription = transaction.ExpenseCategory?.Name,
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = "2100", // Liability - Founder
            GLAccountDescription = "Founder Due",
            Description = transaction.Description,
            LineSequence = 2
        });
    }

    private void GenerateFounderReimbursementLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit to founder liability, Credit to bank
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = "2100", // Liability - Founder
            GLAccountDescription = "Founder Due",
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = "1010",
            GLAccountDescription = "Bank Account",
            Description = transaction.Description,
            LineSequence = 2
        });
    }

    private void GenerateCashAdvanceLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit to asset (due from employee), Credit to bank
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = "1200", // Asset - Cash Advance
            GLAccountDescription = "Cash Advance Receivable",
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = "1010",
            GLAccountDescription = "Bank Account",
            Description = transaction.Description,
            LineSequence = 2
        });
    }

    private void GenerateIncomingSupplierRefundLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit receiving account, credit refund clearing/reduced expense. No revenue impact.
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = "1010",
            GLAccountDescription = transaction.DestinationAccount?.Name ?? "Receiving Account",
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = transaction.ExpenseCategory?.GLAccountCode ?? "5100-R",
            GLAccountDescription = transaction.ExpenseCategory?.Name ?? "Supplier Refund Clearing",
            Description = transaction.Description,
            LineSequence = 2
        });
    }

    private void GenerateAssetPurchaseLines(FinanceTransaction transaction, List<FinanceTransactionLine> lines)
    {
        // Debit to fixed asset, Credit to bank
        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = transaction.AmountInBaseCurrency,
            CreditAmount = 0,
            GLAccountCode = "1500", // Fixed Asset
            GLAccountDescription = "Fixed Assets - Equipment",
            Description = transaction.Description,
            LineSequence = 1
        });

        lines.Add(new FinanceTransactionLine
        {
            DebitAmount = 0,
            CreditAmount = transaction.AmountInBaseCurrency,
            GLAccountCode = "1010",
            GLAccountDescription = "Bank Account",
            Description = transaction.Description,
            LineSequence = 2
        });
    }
}
