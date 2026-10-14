using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities.Company;

public enum CompanyQuotationStatus
{
    Draft = 1,
    Sent = 2,
    Accepted = 3,
    Rejected = 4
}

public enum CompanyQuotationDiscountType
{
    None = 1,
    Percentage = 2,
    FixedAmount = 3
}

/// <summary>
/// Historical commercial offer issued by Company Core to a Company Customer.
/// This is intentionally independent from FOPX Offer/OfferVersion/OfferLeg.
/// </summary>
public sealed class CompanyQuotation
{
    public Guid Id { get; set; }
    public int NumberSequence { get; set; }

    [Required, StringLength(32)]
    public string QuotationNumber { get; set; } = string.Empty;

    public Guid CustomerId { get; set; }
    public CompanyCustomer Customer { get; set; } = null!;

    public Guid? SalesOpportunityId { get; set; }
    public CompanySalesOpportunity? SalesOpportunity { get; set; }

    public Guid? ContactId { get; set; }
    public CompanyCustomerContact? Contact { get; set; }

    [Required, StringLength(32)]
    public string CustomerCodeSnapshot { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string CustomerNameSnapshot { get; set; } = string.Empty;

    [StringLength(160)]
    public string? ContactNameSnapshot { get; set; }

    [StringLength(160)]
    public string? ContactEmailSnapshot { get; set; }

    [StringLength(40)]
    public string? ContactPhoneSnapshot { get; set; }

    public CompanyQuotationStatus Status { get; set; } = CompanyQuotationStatus.Draft;
    public DateOnly IssueDate { get; set; }
    public DateOnly? ValidUntil { get; set; }

    [Required, StringLength(3)]
    public string Currency { get; set; } = string.Empty;

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

    public DateTime? SentAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }

    [StringLength(1000)]
    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CompanyQuotationLine> Lines { get; set; } = new List<CompanyQuotationLine>();
    public CompanyContract? Contract { get; set; }
}

public sealed class CompanyQuotationLine
{
    public Guid Id { get; set; }
    public Guid QuotationId { get; set; }
    public CompanyQuotation Quotation { get; set; } = null!;

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
    public CompanyQuotationDiscountType DiscountType { get; set; } = CompanyQuotationDiscountType.None;
    public decimal DiscountValue { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineSubtotal { get; set; }
    public decimal LineTotal { get; set; }
}
