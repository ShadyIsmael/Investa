using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Investa.Domain.Entities;
/// <summary>
/// A user's wallet. Every AuthUser has exactly one Wallet.
/// The wallet is the single source of truth for the user's spendable
/// balance. All balance changes must be performed through the
/// WalletService and recorded as immutable <see cref="WalletTransaction"/>
/// rows.
///
/// Sprint 1 deliberately stops here:
/// - No payment-gateway integration.
/// - No company accounting integration.
/// - No pricing logic.
///
/// Future integrations (Stripe, Paymob, Fawry, accounting, pricing, ...)
/// must consume the WalletService public interface and never mutate
/// the wallet or its transactions directly.
/// </summary>
public class Wallet
{
    [Key]
    public Guid Id { get; set; }
    /// <summary>FK to the owning AuthUser. Unique: one wallet per user.</summary>
    [Required]
    public Guid UserId { get; set; }
    /// <summary>Current spendable balance. Never negative.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal CurrentBalance { get; set; } = 0m;
    /// <summary>Lifetime sum of credits originating from purchases.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal TotalPurchasedCredits { get; set; } = 0m;
    /// <summary>Lifetime sum of credits originating from bonuses.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal TotalBonusCredits { get; set; } = 0m;
    /// <summary>Lifetime sum of credits originating from refunds.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal TotalRefundCredits { get; set; } = 0m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    // ── Navigation ───────────────────────────────────────────────────
    public AuthUser? User { get; set; }
    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
