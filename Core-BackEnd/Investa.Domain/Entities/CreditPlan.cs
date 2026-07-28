using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class CreditPlan
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)] public string Code { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string NameAr { get; set; } = string.Empty;

    public int Credits { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required, MaxLength(3)] public string Currency { get; set; } = "EGP";
    public int BonusCredits { get; set; }
    public DateTime? ActiveFrom { get; set; }
    public DateTime? ActiveUntil { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }

    /// <summary>monthly | yearly | one-time</summary>
    [MaxLength(20)]
    public string BillingPeriod { get; set; } = "monthly";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<CreditPlanPurchase> Purchases { get; set; } = new List<CreditPlanPurchase>();
}
