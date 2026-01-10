using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class Investment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    // ProjectId removed: investments no longer reference a Project directly

    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    // Opportunity fields (merged)
    [StringLength(200)]
    public string? BusinessName { get; set; }

    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }

    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }
    public int? ProjectPhaseId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TargetFund { get; set; }

    [StringLength(200)]
    public string? Milestone { get; set; }

    [StringLength(50)]
    public string? RiskLevel { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    // Navigation properties
    [ForeignKey(nameof(InvestorId))]
    public User Investor { get; set; } = null!;

}