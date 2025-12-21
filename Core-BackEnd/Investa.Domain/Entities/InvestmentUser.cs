using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class InvestmentUser
{
    [Key]
    public int Id { get; set; }

    public int InvestmentOpportunityId { get; set; }
    public InvestmentOpportunity? InvestmentOpportunity { get; set; }

    public int UserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ShareAmount { get; set; }

    public DateTime InvestedAt { get; set; } = DateTime.UtcNow;
}
