using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class InvestmentUser
{
    [Key]
    public int Id { get; set; }

    public int InvestmentId { get; set; }
    public Investment? Investment { get; set; }

    public Guid UserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ShareAmount { get; set; }

    public DateTime InvestedAt { get; set; } = DateTime.UtcNow;
}
