using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// The immutable contractual Loan obligation activated after a Participation's
/// external funding declarations are fully confirmed by the Investor.
/// It records obligations only; it does not represent money held or transferred by FOPX.
/// </summary>
public sealed class LoanObligation
{
    public int Id { get; set; }
    public int ParticipationRequestId { get; set; }
    public int ContractId { get; set; }
    public int ContractVersionId { get; set; }
    public int AcceptedOfferId { get; set; }
    public int AcceptedOfferVersionNumber { get; set; }
    public int OfferLegId { get; set; }
    public int OfferLegNumber { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Principal { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    [Column(TypeName = "decimal(5,2)")]
    public decimal InterestRate { get; set; }

    public int TermMonths { get; set; }

    [Required, StringLength(30)]
    public string RepaymentModel { get; set; } = string.Empty;

    public LoanPrincipalRepaymentMethod PrincipalRepaymentMethod { get; set; } = LoanPrincipalRepaymentMethod.AtMaturity;
    public DateTime ContractualStartDate { get; set; }
    public DateTime ContractualMaturityDate { get; set; }
    public LoanObligationStatus Status { get; set; } = LoanObligationStatus.Active;
    public DateTime ActivatedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? MaturedAt { get; set; }
    public DateTime? FullyRepaidAt { get; set; }
    public DateTime? DefaultedAt { get; set; }
    public Guid? DefaultedByUserId { get; set; }

    [StringLength(2000)]
    public string? DefaultReason { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DefaultOutstandingPrincipal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DefaultOutstandingInterest { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DefaultOutstandingTotal { get; set; }

    public DateTime? ClosedAt { get; set; }
    public Guid? ClosedByUserId { get; set; }

    [StringLength(2000)]
    public string? ClosureReason { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ClosedFinalPrincipalOutstanding { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ClosedFinalInterestOutstanding { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ClosedFinalTotalOutstanding { get; set; }

    /// <summary>Incremented with every confirmed repayment allocation.</summary>
    public int RepaymentLedgerVersion { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public OpportunityJoinRequest? ParticipationRequest { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? ContractVersion { get; set; }
    public NegotiationOffer? AcceptedOffer { get; set; }
    public NegotiationOfferLeg? OfferLeg { get; set; }
    public AuthUser? FounderUser { get; set; }
    public AuthUser? InvestorUser { get; set; }
    public ICollection<LoanRepaymentInstallment> Installments { get; set; } = new List<LoanRepaymentInstallment>();
    public ICollection<LoanRepaymentDeclaration> RepaymentDeclarations { get; set; } = new List<LoanRepaymentDeclaration>();
    public ICollection<LoanRepaymentAllocation> RepaymentAllocations { get; set; } = new List<LoanRepaymentAllocation>();
}

/// <summary>
/// Immutable expected contractual installment. Payment/repayment records are
/// intentionally not represented here in Phase 1.
/// </summary>
public sealed class LoanRepaymentInstallment
{
    public int Id { get; set; }
    public int LoanObligationId { get; set; }
    public int InstallmentNumber { get; set; }
    public DateTime DueDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrincipalDue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal InterestDue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDue { get; set; }

    [Required, StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    public LoanRepaymentInstallmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public LoanObligation? LoanObligation { get; set; }
}
