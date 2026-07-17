using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Main finance transaction record.
/// Represents a financial movement (income, expense, transfer, etc.).
/// Company operating finance only - never investor/project/opportunity money.
/// 
/// Immutable after confirmation - any changes require reversal/cancellation.
/// Internal double-entry accounting lines are auto-generated.
/// </summary>
public class FinanceTransaction
{
    [Key]
    public int Id { get; set; }

    /// <summary>Unique transaction reference number</summary>
    [Required]
    [StringLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    /// <summary>Transaction type (MoneyIn, MoneyOut, Transfer, etc.)</summary>
    [Required]
    public FinanceTransactionType TransactionType { get; set; }

    /// <summary>Authoritative classification for company money-in transactions.</summary>
    public IncomingMoneyType? IncomingMoneyType { get; set; }

    /// <summary>Transaction status (Draft, Confirmed, Reversed, etc.)</summary>
    [Required]
    public FinanceTransactionStatus Status { get; set; } = FinanceTransactionStatus.Draft;

    /// <summary>Documentation status (FullyDocumented, MissingDocuments, etc.)</summary>
    public FinanceDocumentationStatus DocumentationStatus { get; set; } = FinanceDocumentationStatus.NoDocuments;

    /// <summary>Transaction date - when money actually moved</summary>
    [Required]
    public DateTime TransactionDate { get; set; }

    /// <summary>Posting date - when transaction affects accounting (may differ)</summary>
    public DateTime PostingDate { get; set; }

    /// <summary>Description of the transaction</summary>
    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Notes or additional information</summary>
    [StringLength(1000)]
    public string? Notes { get; set; }

    /// <summary>Transaction amount in source currency</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    /// <summary>Source currency (base: EGP)</summary>
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "EGP";

    /// <summary>Exchange rate if foreign currency used (default 1.0 for EGP)</summary>
    [Column(TypeName = "decimal(10,6)")]
    [Range(0.01, double.MaxValue)]
    public decimal ExchangeRate { get; set; } = 1.0m;

    /// <summary>Amount in base currency (EGP) - calculated from Amount * ExchangeRate</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountInBaseCurrency { get; set; }

    /// <summary>Name of payer or external source for incoming money.</summary>
    [StringLength(200)]
    public string? SourceName { get; set; }

    /// <summary>Alias for SourceName in Money In contracts.</summary>
    [NotMapped]
    public string? PayerName
    {
        get => SourceName;
        set => SourceName = value;
    }

    /// <summary>Payment method used for incoming money.</summary>
    [StringLength(100)]
    public string? PaymentMethod { get; set; }

    /// <summary>Gateway or processor fee deducted from gross amount.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PaymentGatewayFee { get; set; }

    /// <summary>Net amount actually received after gateway fees.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal NetAmountReceived { get; set; }

    // ──────────── Account References ────────────────────────────────────────
    /// <summary>Source account (where money comes from)</summary>
    public int? SourceAccountId { get; set; }
    public FinanceAccount? SourceAccount { get; set; }

    /// <summary>Destination account (where money goes)</summary>
    public int? DestinationAccountId { get; set; }
    public FinanceAccount? DestinationAccount { get; set; }

    // ──────────── Category/Supplier References ───────────────────────────────
    /// <summary>Income category (for MoneyIn transactions)</summary>
    public int? IncomeCategoryId { get; set; }
    public IncomeCategory? IncomeCategory { get; set; }

    /// <summary>Expense category (for MoneyOut, FounderPaid, etc.)</summary>
    public int? ExpenseCategoryId { get; set; }
    public ExpenseCategory? ExpenseCategory { get; set; }

    /// <summary>Supplier (for supplier payments)</summary>
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    // ──────────── Founder & Reversal Info ────────────────────────────────────
    /// <summary>Founder involved (for FounderPaid/FounderReimbursement)</summary>
    public Guid? FounderId { get; set; }

    /// <summary>If this is a reversal, links to original transaction</summary>
    public int? ReversalOfTransactionId { get; set; }

    /// <summary>Reason for reversal or cancellation</summary>
    [StringLength(500)]
    public string? ReversalCancellationReason { get; set; }

    // ──────────── Maker/Checker Workflow ─────────────────────────────────────
    /// <summary>User who created the transaction (Maker)</summary>
    public Guid? MakerId { get; set; }

    /// <summary>Timestamp when transaction was submitted for review</summary>
    public DateTime? SubmittedAt { get; set; }

    /// <summary>User who reviewed the transaction (Checker)</summary>
    public Guid? CheckerId { get; set; }

    /// <summary>Timestamp when transaction was reviewed</summary>
    public DateTime? ReviewedAt { get; set; }

    /// <summary>Review decision: Approved or Rejected</summary>
    [StringLength(50)]
    public string? ReviewDecision { get; set; }

    /// <summary>Reason for review decision (approval comment or rejection reason)</summary>
    [StringLength(500)]
    public string? ReviewReason { get; set; }

    /// <summary>Invoice number (for supplier payments and income)</summary>
    [StringLength(100)]
    public string? InvoiceNumber { get; set; }

    /// <summary>Reference to external system (e.g., bank reconciliation ID)</summary>
    [StringLength(200)]
    public string? ExternalReference { get; set; }

    // ──────────── Immutability & Audit ──────────────────────────────────────
    /// <summary>Timestamp when transaction was confirmed (locked)</summary>
    public DateTime? ConfirmedAt { get; set; }

    /// <summary>User who confirmed the transaction</summary>
    public Guid? ConfirmedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation
    public ICollection<FinanceTransactionLine> TransactionLines { get; set; } = new List<FinanceTransactionLine>();
    public ICollection<FinanceAttachment> Attachments { get; set; } = new List<FinanceAttachment>();
    public ICollection<FinanceAuditEvent> AuditEvents { get; set; } = new List<FinanceAuditEvent>();
}
