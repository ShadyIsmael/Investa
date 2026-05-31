using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Tracks individual investor participation in an investment opportunity
/// Represents the many-to-many relationship between Users (investors) and Investments
/// </summary>
public class InvestmentParticipant
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvestmentId { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Shares purchased must be at least 1")]
    public int SharesPurchased { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue, ErrorMessage = "Amount invested must be positive")]
    public decimal AmountInvested { get; set; }

    [Required]
    public DateTime InvestmentDate { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = "Confirmed";  // Pending, Confirmed, Cancelled

    public bool IsAnonymous { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;

    [ForeignKey(nameof(InvestorId))]
    public AuthUser Investor { get; set; } = null!;
}
