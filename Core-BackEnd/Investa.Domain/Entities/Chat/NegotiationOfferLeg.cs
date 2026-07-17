using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities.Chat;

public class NegotiationOfferLeg
{
    public int Id { get; set; }

    public int OfferId { get; set; }

    public NegotiationOfferLegType LegType { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? EquityPercentage { get; set; }

    [StringLength(500)]
    public string? SharesTerms { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? ReturnRate { get; set; }

    public int? TermMonths { get; set; }

    [StringLength(100)]
    public string? RepaymentModel { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitSharePercentage { get; set; }

    [StringLength(1000)]
    public string? ExitTerms { get; set; }

    public NegotiationOffer? Offer { get; set; }
}
