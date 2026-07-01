using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class OpportunityJoinRequest
{
    public int Id { get; set; }

    public int OpportunityId { get; set; }

    public Guid InvestorId { get; set; }

    public OpportunityJoinRequestType RequestType { get; set; } = OpportunityJoinRequestType.GeneralParticipation;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? RequestedAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? CalculatedTotalAmount { get; set; }

    [StringLength(1000)]
    public string? Message { get; set; }

    public string? TermsSnapshotJson { get; set; }

    public OpportunityJoinRequestStatus Status { get; set; } = OpportunityJoinRequestStatus.Pending;

    [StringLength(1000)]
    public string? RejectionReason { get; set; }

    public Guid? ReviewedByFounderId { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Opportunity? Opportunity { get; set; }

    public AuthUser? Investor { get; set; }

    public AuthUser? ReviewedByFounder { get; set; }
}
