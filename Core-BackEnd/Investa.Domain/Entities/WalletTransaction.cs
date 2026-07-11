using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;
namespace Investa.Domain.Entities;
/// <summary>
/// Immutable audit record for a single wallet balance change.
///
/// INVARIANTS:
/// - Rows are INSERT-ONLY. There is no API path that updates or deletes
///   an existing <see cref="WalletTransaction"/>.
/// - Every successful <c>Credit</c> / <c>Debit</c> on a wallet produces
///   exactly one new transaction row inside the same DB transaction
///   that updates <see cref="Wallet.CurrentBalance"/>.
/// - The pair (BalanceBefore, BalanceAfter, CreditAmount, Direction)
///   is the audit-grade record of the move.
///
/// Sprint 1 deliberately stops here:
/// - No payment-gateway integration.
/// - No company accounting integration.
/// - No pricing logic.
/// </summary>
public class WalletTransaction
{
    [Key]
    public Guid Id { get; set; }
    /// <summary>FK to the wallet affected by this transaction.</summary>
    [Required]
    public Guid WalletId { get; set; }
    /// <summary>Credit (balance up) or Debit (balance down).</summary>
    [Required]
    public WalletDirection Direction { get; set; }
    /// <summary>Business reason for the move (Purchase, Investment, ...).</summary>
    [Required]
    public WalletReason Reason { get; set; }
    /// <summary>Paid platform action code. Used with ReferenceType/ReferenceId for idempotent service charges.</summary>
    [StringLength(100)]
    public string? ActionCode { get; set; }
    /// <summary>
    /// The amount moved. Always positive regardless of <see cref="Direction"/>.
    /// Sign is implied by <see cref="Direction"/>.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal CreditAmount { get; set; }
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal BalanceBefore { get; set; }
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal BalanceAfter { get; set; }
    /// <summary>
    /// Free-form external identifier (payment intent id, investment id, ...).
    /// Combined with <see cref="ReferenceType"/> it allows any subsystem
    /// to link a wallet move back to its source without coupling.
    /// </summary>
    [StringLength(100)]
    public string? ReferenceId { get; set; }
    /// <summary>Category of the external reference (Investment, Subscription, ...).</summary>
    [Required]
    public ReferenceType ReferenceType { get; set; } = ReferenceType.None;
    /// <summary>Optional human-readable description (audit / admin UI).</summary>
    [StringLength(500)]
    public string? Description { get; set; }
    /// <summary>User id of the actor (admin) who triggered the move, if any.</summary>
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // ── Navigation ───────────────────────────────────────────────────
    public Wallet? Wallet { get; set; }
}
