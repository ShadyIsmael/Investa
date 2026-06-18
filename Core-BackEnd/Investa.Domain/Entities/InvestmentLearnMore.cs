using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Tracks when users click "Learn More" on investment opportunities for analytics
/// </summary>
public class InvestmentLearnMore
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvestmentId { get; set; }

    public Guid? UserId { get; set; }

    [Required]
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;

    [StringLength(45)]
    public string? UserIp { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    #region Navigation Properties

    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;

    #endregion
}
