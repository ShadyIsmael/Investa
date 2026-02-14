using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class InvestmentImage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvestmentId { get; set; }

    [Required]
    [StringLength(500)]
    public string Url { get; set; } = null!;

    [StringLength(250)]
    public string? Caption { get; set; }

    public int SortOrder { get; set; } = 0;

    public bool IsPrimary { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;
}