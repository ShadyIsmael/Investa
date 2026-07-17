using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Double-entry accounting line item for a finance transaction.
/// Auto-generated to maintain balanced accounting.
/// Internal implementation detail - users only see transactions.
/// </summary>
public class FinanceTransactionLine
{
    [Key]
    public int Id { get; set; }

    /// <summary>Reference to the parent transaction</summary>
    [Required]
    public int TransactionId { get; set; }
    public FinanceTransaction? Transaction { get; set; }

    /// <summary>Debit amount (money out)</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal DebitAmount { get; set; } = 0m;

    /// <summary>Credit amount (money in)</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal CreditAmount { get; set; } = 0m;

    /// <summary>GL account code being affected</summary>
    [Required]
    [StringLength(50)]
    public string GLAccountCode { get; set; } = string.Empty;

    /// <summary>GL account description</summary>
    [StringLength(200)]
    public string? GLAccountDescription { get; set; }

    /// <summary>Line item description</summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>Sequence order of this line within the transaction</summary>
    public int LineSequence { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
