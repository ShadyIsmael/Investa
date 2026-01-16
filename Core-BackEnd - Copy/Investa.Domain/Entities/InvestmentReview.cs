using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class InvestmentReview
{
    [Key]
    public int Id { get; set; }

    public int InvestmentId { get; set; }
    public Investment? Investment { get; set; }

    public int ReviewerId { get; set; } // refers to User.Id

    public int Rating { get; set; } // e.g., 1-5

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
