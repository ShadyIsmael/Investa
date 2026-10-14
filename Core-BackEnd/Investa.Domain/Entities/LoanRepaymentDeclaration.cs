using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Chat;

namespace Investa.Domain.Entities;

/// <summary>
/// A founder's record that an external loan repayment was made. FOPX records
/// the declaration and the investor's decision; it does not move money.
/// </summary>
public sealed class LoanRepaymentDeclaration
{
    public int Id { get; set; }
    public int LoanObligationId { get; set; }
    public int ParticipationId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int AcceptedOfferVersionNumber { get; set; }
    public int OfferLegId { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    public DateTime ExternalPaymentDate { get; set; }

    [StringLength(200)]
    public string? ExternalReference { get; set; }

    [StringLength(64)]
    public string? ProofFileId { get; set; }

    public DateTime DeclaredAt { get; set; } = DateTime.UtcNow;
    public Guid DeclaredByUserId { get; set; }
    public LoanRepaymentDeclarationStatus Status { get; set; } = LoanRepaymentDeclarationStatus.PendingConfirmation;
    public DateTime? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }

    [StringLength(2000)]
    public string? ConfirmationComment { get; set; }

    [StringLength(2000)]
    public string? DisputeReason { get; set; }

    [StringLength(100)]
    public string? IdempotencyKey { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public LoanObligation? LoanObligation { get; set; }
    public OpportunityJoinRequest? Participation { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? ContractVersion { get; set; }
    public NegotiationOffer? AcceptedOffer { get; set; }
    public NegotiationOfferLeg? OfferLeg { get; set; }
    public StoredFile? ProofFile { get; set; }
    public ICollection<LoanRepaymentDeclarationInstallment> Installments { get; set; } = new List<LoanRepaymentDeclarationInstallment>();
    public ICollection<LoanRepaymentAllocation> Allocations { get; set; } = new List<LoanRepaymentAllocation>();
}

/// <summary>Optional exact installment scope selected at declaration time.</summary>
public sealed class LoanRepaymentDeclarationInstallment
{
    public int LoanRepaymentDeclarationId { get; set; }
    public int LoanRepaymentInstallmentId { get; set; }
    public LoanRepaymentDeclaration? Declaration { get; set; }
    public LoanRepaymentInstallment? Installment { get; set; }
}

/// <summary>
/// Confirmed allocation split. Only these rows affect canonical loan balances.
/// </summary>
public sealed class LoanRepaymentAllocation
{
    public int Id { get; set; }
    public int LoanRepaymentDeclarationId { get; set; }
    public int LoanObligationId { get; set; }
    public int LoanRepaymentInstallmentId { get; set; }
    public int InstallmentNumber { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal InterestAllocated { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrincipalAllocated { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAllocated { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public LoanRepaymentDeclaration? Declaration { get; set; }
    public LoanObligation? LoanObligation { get; set; }
    public LoanRepaymentInstallment? Installment { get; set; }
}
