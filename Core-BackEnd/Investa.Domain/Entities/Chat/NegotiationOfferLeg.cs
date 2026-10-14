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

    /// <summary>Explicit ownership model for new Equity offers. Null is retained only for historical offers.</summary>
    public EquityOwnershipModel? EquityOwnershipModel { get; set; }

    [Column(TypeName = "decimal(18,6)")]
    public decimal? InvestorShareCount { get; set; }

    [Column(TypeName = "decimal(18,6)")]
    public decimal? TotalIssuedShares { get; set; }

    [StringLength(100)]
    public string? ShareClass { get; set; }

    [Column(TypeName = "decimal(18,6)")]
    public decimal? PricePerShare { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PreMoneyValuation { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PostMoneyValuation { get; set; }

    public DateTime? EffectiveOwnershipDate { get; set; }

    [StringLength(500)]
    public string? SharesTerms { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? ReturnRate { get; set; }

    public int? TermMonths { get; set; }

    [StringLength(100)]
    public string? RepaymentModel { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitSharePercentage { get; set; }

    /// <summary>
    /// Canonical Profit Sharing reporting/payout frequency selected for this exact OfferLeg.
    /// Nullable for historical offers created before the field was introduced.
    /// </summary>
    [StringLength(30)]
    public string? ProfitSharingPayoutFrequency { get; set; }

    [StringLength(1000)]
    public string? ExitTerms { get; set; }

    public NegotiationOffer? Offer { get; set; }
}
