using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// An immutable Founder statement that money was received directly from an
/// Investor outside FOPX One. This is deliberately separate from
/// PaymentTransaction, which represents repayment/schedule activity.
/// </summary>
public sealed class FundingDeclaration
{
    public int Id { get; set; }

    [Required]
    public int ParticipationId { get; set; }

    [Required]
    public int OpportunityId { get; set; }

    [Required]
    public Guid FounderId { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required, StringLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;

    [Required]
    public DateTime ReceivedDate { get; set; }

    [Required]
    public FundingPaymentMethod PaymentMethod { get; set; }

    [StringLength(200)]
    public string? ExternalReference { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    /// <summary>References StoredFile.FileId; no physical storage path is persisted.</summary>
    [StringLength(64)]
    public string? ProofFileId { get; set; }

    [Required]
    public FundingDeclarationStatus Status { get; set; } = FundingDeclarationStatus.PendingConfirmation;

    public DateTime? ConfirmedAt { get; set; }

    public Guid? ConfirmedByInvestorId { get; set; }

    [StringLength(2000)]
    public string? ConfirmationComment { get; set; }

    public DateTime? DisputedAt { get; set; }

    public Guid? DisputedByInvestorId { get; set; }

    [StringLength(2000)]
    public string? DisputeReason { get; set; }

    public DateTime DeclaredAt { get; set; } = DateTime.UtcNow;

    [Required]
    public Guid CreatedBy { get; set; }

    [StringLength(100)]
    public string? IdempotencyKey { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public OpportunityJoinRequest? Participation { get; set; }
    public Opportunity? Opportunity { get; set; }
    public StoredFile? ProofFile { get; set; }
    public ICollection<FundingDeclarationLegAllocation> LegAllocations { get; set; } = new List<FundingDeclarationLegAllocation>();
}
