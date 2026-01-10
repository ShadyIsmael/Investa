using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class CreditConfiguration
{
    [Key]
    public int Id { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
