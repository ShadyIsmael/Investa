using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class ScoreTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal Score { get; set; }

    // Reference to Lookups table (transaction type: review, interactive, deal)
    public int TransactionTypeId { get; set; }

    // Optional - who reviewed/triggered this score
    public Guid? ReviewerId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public Lookup? TransactionType { get; set; }
}
