using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Immutable attribution of one external funding declaration to one accepted
/// Contract OfferLeg. This is a contractual record only; it is not a payment
/// transaction or wallet movement.
/// </summary>
public sealed class FundingDeclarationLegAllocation
{
    public int Id { get; set; }

    [Required]
    public int FundingDeclarationId { get; set; }

    [Required]
    public int ParticipationId { get; set; }

    public int? ContractId { get; set; }

    [Required]
    public int OfferLegId { get; set; }

    [Required]
    public int OfferLegNumber { get; set; }

    [Required, Column(TypeName = "decimal(18,2)")]
    public decimal AllocatedAmount { get; set; }

    [Required, StringLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public FundingDeclaration? FundingDeclaration { get; set; }
    public OpportunityJoinRequest? Participation { get; set; }
    public InvestmentContract? Contract { get; set; }
    public Chat.NegotiationOfferLeg? OfferLeg { get; set; }
}
