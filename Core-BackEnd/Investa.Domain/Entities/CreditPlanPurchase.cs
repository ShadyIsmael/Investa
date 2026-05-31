using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    /// <summary>Credits awarded to the buyer.</summary>
    public int Credits { get; set; }

    /// <summary>Amount paid in EGP.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePaid { get; set; }

    /// <summary>Human-readable reference: yyyyMMdd-{first8charsOfUserId}.</summary>
    [Required, MaxLength(30)]
    public string ReferenceNumber { get; set; } = string.Empty;

    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation ────────────────────────────────────────────────────────
    public AuthUser? User { get; set; }
    public CreditPlan? Plan { get; set; }
}
