using System;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs.Finance;

/// <summary>DTO for Finance Transaction (user-facing simplified view).</summary>
public class FinanceTransactionDto
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public string? IncomingMoneyType { get; set; }
    public string Status { get; set; } = string.Empty;
    public string DocumentationStatus { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public DateTime PostingDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public decimal ExchangeRate { get; set; } = 1.0m;
    public decimal AmountInBaseCurrency { get; set; }
    public string? SourceName { get; set; }
    public string? PayerName => SourceName;
    public string? PaymentMethod { get; set; }
    public decimal PaymentGatewayFee { get; set; }
    public decimal NetAmountReceived { get; set; }

    // Account info
    public int? SourceAccountId { get; set; }
    public string? SourceAccountName { get; set; }
    public int? DestinationAccountId { get; set; }
    public string? DestinationAccountName { get; set; }

    // Category/Supplier info
    public int? IncomeCategoryId { get; set; }
    public string? IncomeCategoryName { get; set; }
    public string? IncomeCategoryNameEn { get; set; }
    public string? IncomeCategoryNameAr { get; set; }
    public int? ExpenseCategoryId { get; set; }
    public string? ExpenseCategoryName { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }

    // Additional info
    public Guid? FounderId { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? ExternalReference { get; set; }
    public int AttachmentCount { get; set; }

    // Confirmation info
    public DateTime? ConfirmedAt { get; set; }
    public Guid? ConfirmedBy { get; set; }
    public string? ConfirmedByDisplayName { get; set; }

    // Reversal info is sourced from the persisted transaction and audit event.
    public string? ReversedByDisplayName { get; set; }
    public DateTime? ReversedAt { get; set; }
    public string? ReversalReason { get; set; }

    // Maker/Checker Workflow Info
    public Guid? MakerId { get; set; }
    public string? MakerDisplayName { get; set; }
    public DateTime? SubmittedAt { get; set; }

    public Guid? CheckerId { get; set; }
    public string? CheckerDisplayName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewDecision { get; set; }
    public string? ReviewReason { get; set; }

    // UI Workflow Flags (calculated by service based on user permissions)
    public bool CanEdit { get; set; }
    public bool CanSubmit { get; set; }
    public bool CanReview { get; set; }
    public bool CanApprove { get; set; }
    public bool CanReject { get; set; }
    public bool CanConfirm { get; set; }
    public bool CanReverse { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>DTO for creating a Finance Transaction (draft).</summary>
public class CreateFinanceTransactionDto
{
    public FinanceTransactionType TransactionType { get; set; }
    public IncomingMoneyType? IncomingMoneyType { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }

    /// <summary>Transaction amount in original currency</summary>
    public decimal Amount { get; set; }

    /// <summary>Currency (default EGP)</summary>
    public string Currency { get; set; } = "EGP";

    /// <summary>Exchange rate if foreign currency (default 1.0)</summary>
    public decimal ExchangeRate { get; set; } = 1.0m;
    public string? SourceName { get; set; }
    public string? PayerName { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal? PaymentGatewayFee { get; set; }
    public decimal? NetAmountReceived { get; set; }
    public FinanceDocumentationStatus? DocumentationStatus { get; set; }

    // Accounts (required for most transaction types)
    public int? SourceAccountId { get; set; }
    public int? DestinationAccountId { get; set; }

    // Categories/Supplier (contextual)
    public int? IncomeCategoryId { get; set; }
    public int? ExpenseCategoryId { get; set; }
    public int? SupplierId { get; set; }

    // Optional
    public Guid? FounderId { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? ExternalReference { get; set; }
}

/// <summary>DTO for updating a Finance Transaction (draft only).</summary>
public class UpdateFinanceTransactionDto
{
    public DateTime? TransactionDate { get; set; }
    public IncomingMoneyType? IncomingMoneyType { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public decimal? ExchangeRate { get; set; }
    public string? SourceName { get; set; }
    public string? PayerName { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal? PaymentGatewayFee { get; set; }
    public decimal? NetAmountReceived { get; set; }
    public FinanceDocumentationStatus? DocumentationStatus { get; set; }
    public int? SourceAccountId { get; set; }
    public int? DestinationAccountId { get; set; }
    public int? IncomeCategoryId { get; set; }
    public int? ExpenseCategoryId { get; set; }
    public int? SupplierId { get; set; }
    public Guid? FounderId { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? ExternalReference { get; set; }
}

/// <summary>DTO for confirming a Finance Transaction.</summary>
public class ConfirmFinanceTransactionDto
{
    public string? Note { get; set; }
}

/// <summary>DTO for reversing/cancelling a Finance Transaction.</summary>
public class ReverseFinanceTransactionDto
{
    public string ReversalReason { get; set; } = string.Empty;
}

/// <summary>DTO for cancelling a Finance Transaction.</summary>
public class CancelFinanceTransactionDto
{
    public string CancellationReason { get; set; } = string.Empty;
}

/// <summary>DTO for listing Finance Transactions.</summary>
public class FinanceTransactionListDto
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public string? IncomingMoneyType { get; set; }
    public string Status { get; set; } = string.Empty;
    public string DocumentationStatus { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public string? SourceName { get; set; }
    public string? PayerName => SourceName;
    public string? PaymentMethod { get; set; }
    public decimal PaymentGatewayFee { get; set; }
    public decimal NetAmountReceived { get; set; }
    public int? SourceAccountId { get; set; }
    public string? SourceAccountName { get; set; }
    public int? DestinationAccountId { get; set; }
    public string? DestinationAccountName { get; set; }
    public int? IncomeCategoryId { get; set; }
    public string? IncomeCategoryName { get; set; }
    public string? IncomeCategoryNameEn { get; set; }
    public string? IncomeCategoryNameAr { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? ExternalReference { get; set; }
    public Guid? MakerId { get; set; }
    public string? MakerDisplayName { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public Guid? CheckerId { get; set; }
    public string? CheckerDisplayName { get; set; }
    public string? ReviewDecision { get; set; }
    public bool CanEdit { get; set; }
    public bool CanSubmit { get; set; }
    public bool CanReview { get; set; }
    public bool CanApprove { get; set; }
    public bool CanConfirm { get; set; }
    public bool CanReject { get; set; }
    public bool CanReverse { get; set; }
}
