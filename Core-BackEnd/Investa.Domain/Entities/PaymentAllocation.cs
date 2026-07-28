using System.ComponentModel.DataAnnotations.Schema;
namespace Investa.Domain.Entities;
public class PaymentAllocation
{
    public int Id { get; set; }
    public int PaymentTransactionId { get; set; }
    public int ParticipationRequestId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AllocatedAmount { get; set; }

    public int InstallmentNumber { get; set; }

    public PaymentTransaction PaymentTransaction { get; set; } = null!;
}
