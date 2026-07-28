using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Records every time a user buys a credit plan.
/// </summary>
public class CreditPlanPurchase
{
    [Key]
    public int Id { get; set; }

    /// <summary>Buyer – links to AuthUser.</summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>The purchased plan (kept as FK for integrity).</summary>
    public int PlanId { get; set; }

    /// <summary>Snapshot of the plan name at purchase time.</summary>
    [Required, MaxLength(100)]
    public string PlanName { get; set; } = string.Empty;

    [Required, MaxLength(50)] public string PlanCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string PlanNameAr { get; set; } = string.Empty;

    /// <summary>Credits awarded to the buyer.</summary>
    public int Credits { get; set; }
    public int BonusCredits { get; set; }

    /// <summary>Amount paid in EGP.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePaid { get; set; }
    [Required, MaxLength(3)] public string Currency { get; set; } = "EGP";

    /// <summary>Human-readable reference: yyyyMMdd-{first8charsOfUserId}.</summary>
    [Required, MaxLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    public CreditPurchaseStatus PaymentStatus { get; set; } = CreditPurchaseStatus.Pending;
    [MaxLength(100)] public string? PaymentProvider { get; set; }
    [MaxLength(200)] public string? ProviderReference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public Guid? WalletTransactionId { get; set; }

    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation ────────────────────────────────────────────────────────
    public AuthUser? User { get; set; }
    public CreditPlan? Plan { get; set; }
}
