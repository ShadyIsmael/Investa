using System.ComponentModel.DataAnnotations.Schema;
namespace Investa.Domain.Entities;
public class PaymentTransaction
{
    public int Id { get; set; }
    public int ParticipationRequestId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Reference { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsReversed { get; set; }
    public string? ReversalReason { get; set; }
    public DateTime? ReversedAt { get; set; }
    public Guid? ReversedByUserId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? ExchangeRateSnapshotId { get; set; }
    public ExchangeRateSnapshot? ExchangeRateSnapshot { get; set; }

    public OpportunityJoinRequest? ParticipationRequest { get; set; }
}
