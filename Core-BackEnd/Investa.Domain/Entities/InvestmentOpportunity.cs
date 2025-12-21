using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class InvestmentOpportunity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDate { get; set; }

    [StringLength(50)]
    public string RiskLevel { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TargetFund { get; set; }

    // Reference to Lookup entries
    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }

    // Founder/partner
    public int? PartnerId { get; set; }
    public Partner? Partner { get; set; }

    // Navigation
    public ICollection<InvestmentReview> Reviews { get; set; } = new List<InvestmentReview>();
    public ICollection<InvestmentUser> InvestmentUsers { get; set; } = new List<InvestmentUser>();
}
