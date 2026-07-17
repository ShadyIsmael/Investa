using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Investa.Application.DTOs.Finance;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services.Finance;

/// <summary>
/// Validation service for finance transactions and masters.
/// Implements all business rules and validation logic.
/// </summary>
public interface IFinanceValidationService
{
    Task<(bool IsValid, List<string> Errors)> ValidateFinanceTransactionAsync(
        CreateFinanceTransactionDto dto, 
        FinanceTransaction? existingTransaction = null);

    Task<(bool IsValid, List<string> Errors)> ValidateConfirmationAsync(int transactionId);
    Task<(bool IsValid, List<string> Errors)> ValidateReversalAsync(int transactionId);
    Task<(bool IsValid, List<string> Errors)> ValidateAccountAsync(int? accountId);
    Task<(bool IsValid, List<string> Errors)> ValidateSupplierAsync(int? supplierId);

    // Maker/Checker workflow validations
    Task<(bool IsValid, List<string> Errors)> ValidateSubmitAsync(int transactionId, Guid userId);
    Task<(bool IsValid, List<string> Errors)> ValidateApproveAsync(int transactionId, Guid userId);
    Task<(bool IsValid, List<string> Errors)> ValidateRejectAsync(int transactionId, Guid userId);
    Task<(bool IsValid, List<string> Errors)> ValidateCancelAsync(int transactionId, Guid userId);
}

/// <summary>
/// Implementation of finance validation service.
/// </summary>
public class FinanceValidationService : IFinanceValidationService
{
    private readonly IFinanceRepository _repository;

    public FinanceValidationService(IFinanceRepository repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    /// <summary>
    /// Validates a finance transaction DTO before creation/update.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateFinanceTransactionAsync(
        CreateFinanceTransactionDto dto,
        FinanceTransaction? existingTransaction = null)
    {
        var errors = new List<string>();

        // Basic validations
        if (dto.Amount <= 0)
            errors.Add("Amount must be greater than 0");

        if (string.IsNullOrWhiteSpace(dto.Description))
            errors.Add("Description is required");

        if (dto.ExchangeRate <= 0)
            errors.Add("Exchange rate must be greater than 0");

        if (string.IsNullOrWhiteSpace(dto.Currency) || dto.Currency.Length != 3)
            errors.Add("Currency must be a valid 3-letter code");

        if (dto.PaymentGatewayFee.GetValueOrDefault() < 0)
            errors.Add("Payment gateway fee cannot be negative");

        if (dto.NetAmountReceived.HasValue && dto.NetAmountReceived.Value > dto.Amount)
            errors.Add("Net amount received cannot exceed amount");

        if (dto.PaymentGatewayFee.HasValue && dto.NetAmountReceived.HasValue &&
            dto.NetAmountReceived.Value != dto.Amount - dto.PaymentGatewayFee.Value)
        {
            errors.Add("Net amount received must equal amount minus payment gateway fee");
        }

        var currency = dto.Currency.Trim().ToUpperInvariant();
        if (currency != "EGP" && dto.ExchangeRate <= 1)
            errors.Add("Foreign currency transactions require an exchange rate greater than 1");

        var effectiveTransactionType = ResolveTransactionType(dto.TransactionType, dto.IncomingMoneyType);
        var incomingMoneyType = ResolveIncomingMoneyType(effectiveTransactionType, dto.IncomingMoneyType);

        // Transaction type specific validations
        if (effectiveTransactionType == FinanceTransactionType.InternalTransfer)
        {
            if (incomingMoneyType != IncomingMoneyType.InternalTransfer)
                errors.Add("Internal Transfer must use IncomingMoneyType.InternalTransfer");

            if (!dto.SourceAccountId.HasValue || !dto.DestinationAccountId.HasValue)
                errors.Add("Internal Transfer requires both source and destination accounts");

            if (dto.SourceAccountId == dto.DestinationAccountId)
                errors.Add("Cannot transfer between the same account");

            if (dto.IncomeCategoryId.HasValue || dto.ExpenseCategoryId.HasValue)
                errors.Add("Internal Transfer should not have income or expense categories");
        }

        if (effectiveTransactionType == FinanceTransactionType.MoneyIn)
        {
            if (!dto.DestinationAccountId.HasValue)
                errors.Add("MoneyIn requires a destination account");

            if (incomingMoneyType == IncomingMoneyType.CompanyRevenue)
            {
                if (string.IsNullOrWhiteSpace(dto.SourceName) && string.IsNullOrWhiteSpace(dto.PayerName))
                    errors.Add("CompanyRevenue requires payer/source name");

                if (!dto.IncomeCategoryId.HasValue)
                    errors.Add("CompanyRevenue requires an income category");
            }
            else
            {
                if (dto.IncomeCategoryId.HasValue && incomingMoneyType is IncomingMoneyType.CapitalContribution or IncomingMoneyType.FounderLoan or IncomingMoneyType.SupplierRefund)
                    errors.Add($"{incomingMoneyType} is not revenue and must not use an income category");
            }

            if (incomingMoneyType == IncomingMoneyType.InternalTransfer)
                errors.Add("InternalTransfer incoming money must use transaction type InternalTransfer");
        }

        if (effectiveTransactionType == FinanceTransactionType.MoneyOut ||
            effectiveTransactionType == FinanceTransactionType.FounderPaid ||
            effectiveTransactionType == FinanceTransactionType.SupplierRefund)
        {
            if (!dto.DestinationAccountId.HasValue)
                errors.Add($"{effectiveTransactionType} requires a destination account");

            if (!dto.ExpenseCategoryId.HasValue)
                errors.Add($"{effectiveTransactionType} requires an expense category");
        }

        if (effectiveTransactionType == FinanceTransactionType.FounderPaid ||
            effectiveTransactionType == FinanceTransactionType.FounderReimbursement)
        {
            if (!dto.FounderId.HasValue || dto.FounderId == Guid.Empty)
                errors.Add($"{effectiveTransactionType} requires a founder ID");
        }

        // Account validations
        if (dto.SourceAccountId.HasValue)
        {
            var (accountValid, accountErrors) = await ValidateAccountAsync(dto.SourceAccountId);
            if (!accountValid)
                errors.AddRange(accountErrors);
        }

        if (dto.DestinationAccountId.HasValue)
        {
            var (accountValid, accountErrors) = await ValidateAccountAsync(dto.DestinationAccountId);
            if (!accountValid)
                errors.AddRange(accountErrors);
        }

        // Supplier validation and invoice duplicate warning
        if (dto.SupplierId.HasValue)
        {
            var (supplierValid, supplierErrors) = await ValidateSupplierAsync(dto.SupplierId);
            if (!supplierValid)
                errors.AddRange(supplierErrors);

            // Check for duplicate invoices from same supplier
            if (!string.IsNullOrWhiteSpace(dto.InvoiceNumber))
            {
                var duplicateExists = await _repository.CheckDuplicateInvoiceAsync(
                    dto.SupplierId.Value, 
                    dto.InvoiceNumber,
                    existingTransaction?.Id);

                if (duplicateExists)
                    errors.Add($"Warning: Invoice '{dto.InvoiceNumber}' already exists for this supplier");
            }
        }

        return (errors.Count == 0, errors);
    }

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

    /// <summary>
    /// Validates that a transaction can be confirmed.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateConfirmationAsync(int transactionId)
    {
        var errors = new List<string>();

        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
        {
            errors.Add("Transaction not found");
            return (false, errors);
        }

        if (transaction.Status != FinanceTransactionStatus.Draft && 
            transaction.Status != FinanceTransactionStatus.NeedsDocuments &&
            transaction.Status != FinanceTransactionStatus.ReadyForReview)
        {
            errors.Add($"Cannot confirm transaction in {transaction.Status} status");
        }

        if (transaction.DocumentationStatus == FinanceDocumentationStatus.MissingDocuments)
        {
            errors.Add("Cannot confirm transaction with missing required documents");
        }

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a transaction can be reversed/cancelled.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateReversalAsync(int transactionId)
    {
        var errors = new List<string>();

        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
        {
            errors.Add("Transaction not found");
            return (false, errors);
        }

        if (transaction.Status != FinanceTransactionStatus.Confirmed)
        {
            errors.Add("Only confirmed transactions can be reversed");
        }

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a Finance Account exists and is active.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateAccountAsync(int? accountId)
    {
        var errors = new List<string>();

        if (!accountId.HasValue)
        {
            errors.Add("Account is required");
            return (false, errors);
        }

        var account = await _repository.GetAccountByIdAsync(accountId.Value);
        if (account == null)
            errors.Add($"Account with ID {accountId} not found");
        else if (!account.IsActive)
            errors.Add($"Account '{account.Name}' is not active");

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a Supplier exists and is active.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateSupplierAsync(int? supplierId)
    {
        var errors = new List<string>();

        if (!supplierId.HasValue)
            return (true, errors); // Supplier is optional

        var supplier = await _repository.GetSupplierByIdAsync(supplierId.Value);
        if (supplier == null)
            errors.Add($"Supplier with ID {supplierId} not found");
        else if (!supplier.IsActive)
            errors.Add($"Supplier '{supplier.Name}' is not active");

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a transaction can be submitted for review.
    /// Creator (Maker) can submit draft transactions for checker review.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateSubmitAsync(int transactionId, Guid userId)
    {
        var errors = new List<string>();

        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
        {
            errors.Add("Transaction not found");
            return (false, errors);
        }

        // Only creator can submit
        if ((transaction.MakerId ?? transaction.CreatedBy) != userId)
            errors.Add("Only the transaction creator can submit it for review");

        // Can only submit draft or rejected transactions
        if (transaction.Status != FinanceTransactionStatus.Draft && 
            transaction.Status != FinanceTransactionStatus.Rejected)
            errors.Add($"Cannot submit transaction in {transaction.Status} status");

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a transaction can be approved by a checker.
    /// Creator cannot approve their own transaction.
    /// Transaction must be in ReadyForReview status.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateApproveAsync(int transactionId, Guid userId)
    {
        var errors = new List<string>();

        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
        {
            errors.Add("Transaction not found");
            return (false, errors);
        }

        // Prevent self-approval
        if ((transaction.MakerId ?? transaction.CreatedBy) == userId)
            errors.Add("You cannot approve your own transaction");

        // Can only approve transactions ready for review
        if (transaction.Status != FinanceTransactionStatus.ReadyForReview)
            errors.Add($"Can only approve transactions in ReadyForReview status. Current status: {transaction.Status}");

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a transaction can be rejected by a checker.
    /// Creator cannot reject their own transaction.
    /// Transaction must be in ReadyForReview status.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateRejectAsync(int transactionId, Guid userId)
    {
        var errors = new List<string>();

        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
        {
            errors.Add("Transaction not found");
            return (false, errors);
        }

        // Prevent self-rejection
        if ((transaction.MakerId ?? transaction.CreatedBy) == userId)
            errors.Add("You cannot reject your own transaction");

        // Can only reject transactions ready for review
        if (transaction.Status != FinanceTransactionStatus.ReadyForReview)
            errors.Add($"Can only reject transactions in ReadyForReview status. Current status: {transaction.Status}");

        return (errors.Count == 0, errors);
    }

    /// <summary>
    /// Validates that a draft transaction can be cancelled.
    /// Can cancel draft or rejected transactions.
    /// </summary>
    public async Task<(bool IsValid, List<string> Errors)> ValidateCancelAsync(int transactionId, Guid userId)
    {
        var errors = new List<string>();

        var transaction = await _repository.GetTransactionByIdAsync(transactionId);
        if (transaction == null)
        {
            errors.Add("Transaction not found");
            return (false, errors);
        }

        // Can only cancel draft or rejected transactions
        if (transaction.Status != FinanceTransactionStatus.Draft && 
            transaction.Status != FinanceTransactionStatus.Rejected)
            errors.Add($"Can only cancel transactions in Draft or Rejected status. Current status: {transaction.Status}");

        return (errors.Count == 0, errors);
    }
}

/// <summary>
/// Repository interface for finance data access.
/// </summary>
public interface IFinanceRepository
{
    Task<FinanceAccount?> GetAccountByIdAsync(int id);
    Task<Supplier?> GetSupplierByIdAsync(int id);
    Task<FinanceTransaction?> GetTransactionByIdAsync(int id);
    Task<bool> CheckDuplicateInvoiceAsync(int supplierId, string invoiceNumber, int? excludeTransactionId = null);
    Task AddTransactionAsync(FinanceTransaction transaction);
    Task AddAuditEventAsync(FinanceAuditEvent auditEvent);
    Task ReplaceTransactionLinesAsync(
        FinanceTransaction transaction,
        IReadOnlyCollection<FinanceTransactionLine> replacementLines,
        FinanceAuditEvent auditEvent);
    Task<IReadOnlyList<FinanceTransaction>> GetTransactionsAsync(DateTime? fromDate = null, DateTime? toDate = null, string? status = null, int? accountId = null, Guid? makerId = null, Guid? excludeMakerId = null, int pageNumber = 1, int pageSize = 20);
    Task<IReadOnlyList<FinanceAuditEvent>> GetAuditEventsAsync(int transactionId);
    Task<string?> GetUserDisplayNameAsync(Guid userId);
    Task<bool> ReferenceExistsAsync(string referenceNumber);
    Task DeleteTransactionAsync(FinanceTransaction transaction);
    Task AddAttachmentAsync(FinanceAttachment attachment);
    Task<FinanceAttachment?> GetAttachmentAsync(int attachmentId);
    Task<IReadOnlyList<FinanceAttachment>> GetAttachmentsAsync(int transactionId);
    Task DeleteAttachmentAsync(FinanceAttachment attachment);

    // Reconciliation
    Task<FinanceReconciliation?> GetReconciliationByIdAsync(int id);
    Task<IReadOnlyList<FinanceReconciliation>> GetReconciliationsAsync(int? accountId = null, DateTime? fromDate = null, DateTime? toDate = null, FinanceReconciliationStatus? status = null, int pageNumber = 1, int pageSize = 20, string? search = null, bool? onlyWithDifference = null);
    Task AddReconciliationAsync(FinanceReconciliation reconciliation);
    void DeleteReconciliation(FinanceReconciliation reconciliation);
    Task<int> GetReconciliationCountAsync(int? accountId = null, DateTime? fromDate = null, DateTime? toDate = null, FinanceReconciliationStatus? status = null, string? search = null, bool? onlyWithDifference = null);
    Task<IReadOnlyList<FinanceTransaction>> GetConfirmedTransactionsForPeriodAsync(int accountId, DateTime periodEnd);
    Task<IReadOnlyList<FinanceAccount>> GetAccountsAsync();
    Task<Dictionary<Guid, string?>> GetUserDisplayNamesAsync(IEnumerable<Guid> userIds);

    Task SaveAsync();
}
