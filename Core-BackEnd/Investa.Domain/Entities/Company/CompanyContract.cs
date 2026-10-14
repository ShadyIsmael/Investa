using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities.Company;

public enum CompanyContractStatus
{
    Draft = 1,
    Active = 2,
    Completed = 3,
    Terminated = 4
}

public enum CompanyContractDiscountType
{
    None = 1,
    Percentage = 2,
    FixedAmount = 3
}

/// <summary>
/// Commercial agreement created only from an Accepted CompanyQuotation.
/// This is deliberately independent from FOPX InvestmentContract and its versions/events.
/// </summary>
public sealed class CompanyContract
{
    public Guid Id { get; set; }
    public int NumberSequence { get; set; }

    [Required, StringLength(32)]
    public string ContractNumber { get; set; } = string.Empty;

    public Guid CustomerId { get; set; }
    public CompanyCustomer Customer { get; set; } = null!;

    public Guid SourceQuotationId { get; set; }
    public CompanyQuotation SourceQuotation { get; set; } = null!;

    public Guid? SalesOpportunityId { get; set; }
    public CompanySalesOpportunity? SalesOpportunity { get; set; }

    public Guid? ContactId { get; set; }
    public CompanyCustomerContact? Contact { get; set; }

    [Required, StringLength(32)]
    public string CustomerCodeSnapshot { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string CustomerNameSnapshot { get; set; } = string.Empty;

    [StringLength(200)]
    public string? CustomerLegalNameSnapshot { get; set; }

    [StringLength(160)]
    public string? ContactNameSnapshot { get; set; }

    [StringLength(160)]
    public string? ContactEmailSnapshot { get; set; }

    [StringLength(40)]
    public string? ContactPhoneSnapshot { get; set; }

    public CompanyContractStatus Status { get; set; } = CompanyContractStatus.Draft;

    [Required, StringLength(3)]
    public string Currency { get; set; } = string.Empty;

    public DateOnly? EffectiveDate { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly? SignedDate { get; set; }

    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }

    [StringLength(4000)]
    public string? PaymentTerms { get; set; }

    [StringLength(4000)]
    public string? CommercialTerms { get; set; }

    [StringLength(4000)]
    public string? Notes { get; set; }

    public DateTime? ActivatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? TerminatedAt { get; set; }

    [StringLength(1000)]
    public string? TerminationReason { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CompanyContractLine> Lines { get; set; } = new List<CompanyContractLine>();
}

public sealed class CompanyContractLine
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public CompanyContract Contract { get; set; } = null!;

    public Guid SourceQuotationLineId { get; set; }
    public CompanyQuotationLine SourceQuotationLine { get; set; } = null!;

    public int LineNumber { get; set; }
    public int SortOrder { get; set; }
    public Guid? CatalogItemId { get; set; }
    public CompanyCatalogItem? CatalogItem { get; set; }

    [StringLength(32)]
    public string? ItemCodeSnapshot { get; set; }

    [Required, StringLength(200)]
    public string ItemNameSnapshot { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required, StringLength(32)]
    public string Unit { get; set; } = "Unit";

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public CompanyContractDiscountType DiscountType { get; set; } = CompanyContractDiscountType.None;
    public decimal DiscountValue { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineSubtotal { get; set; }
    public decimal LineTotal { get; set; }

    /// <summary>
    /// Capability relevant to later fulfillment, snapshotted at contract creation.
    /// It does not provision an entitlement.
    /// </summary>
    public bool SupportsLicenseSnapshot { get; set; }
    public bool SupportsSubscriptionSnapshot { get; set; }
}
