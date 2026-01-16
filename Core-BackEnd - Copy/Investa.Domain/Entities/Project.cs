using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class Project
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal TargetAmount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal CurrentAmount { get; set; }

    [Required]
    [StringLength(50)]
    public string RiskLevel { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
}