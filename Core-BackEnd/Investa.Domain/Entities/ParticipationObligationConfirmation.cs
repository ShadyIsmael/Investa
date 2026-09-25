using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public sealed class ParticipationObligationConfirmation
{
    public long Id { get; set; }
    public int ParticipationRequestId { get; set; }
    public int OpportunityId { get; set; }
    public Guid RequiredUserId { get; set; }
    public ObligationPartyRole PartyRole { get; set; }
    public ObligationConfirmationStatus Status { get; set; } = ObligationConfirmationStatus.Pending;
    public Guid? ConfirmedByUserId { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    [StringLength(1000)] public string? ConfirmationStatement { get; set; }
    [StringLength(100)] public string? IdempotencyKey { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    public OpportunityJoinRequest? ParticipationRequest { get; set; }
    public Opportunity? Opportunity { get; set; }
    public AuthUser? RequiredUser { get; set; }
    public AuthUser? ConfirmedByUser { get; set; }
}
