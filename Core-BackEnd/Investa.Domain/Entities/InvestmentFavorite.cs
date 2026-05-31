using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Tracks clients who favorited an investment opportunity.
/// </summary>
public class InvestmentFavorite
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public int InvestmentId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(InvestorId))]
    public AuthUser Investor { get; set; } = null!;

    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;
}
