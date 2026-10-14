using Investa.Domain.Entities.Company;

namespace Investa.Application.DTOs;

public sealed class CompanyQuotationListQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public CompanyQuotationStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? SalesOpportunityId { get; set; }
    public string? Currency { get; set; }
    public DateOnly? IssueDateFrom { get; set; }
    public DateOnly? IssueDateTo { get; set; }
    public DateOnly? ValidUntilFrom { get; set; }
    public DateOnly? ValidUntilTo { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}

public sealed class CompanyQuotationLineInput
{
    public Guid? CatalogItemId { get; set; }
    public string? ItemName { get; set; }
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public string? Unit { get; set; }
    public decimal? UnitPrice { get; set; }
    public CompanyQuotationDiscountType DiscountType { get; set; } = CompanyQuotationDiscountType.None;
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }
    public int? SortOrder { get; set; }
}

public sealed class CompanyQuotationUpsertRequest
{
    public Guid CustomerId { get; set; }
    public Guid? SalesOpportunityId { get; set; }
    public Guid? ContactId { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly? ValidUntil { get; set; }
    public string? Currency { get; set; }
    public string? PaymentTerms { get; set; }
    public string? CommercialTerms { get; set; }
    public string? Notes { get; set; }
    public IReadOnlyList<CompanyQuotationLineInput> Lines { get; set; } = [];
}

public sealed class CompanyQuotationRejectRequest
{
    public string RejectionReason { get; set; } = string.Empty;
}

public sealed class CompanyQuotationLineDto
{
    public Guid Id { get; init; }
    public int LineNumber { get; init; }
    public Guid? CatalogItemId { get; init; }
    public string? ItemCode { get; init; }
    public string ItemName { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public CompanyQuotationDiscountType DiscountType { get; init; }
    public decimal DiscountValue { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TaxRate { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal LineSubtotal { get; init; }
    public decimal LineTotal { get; init; }
}

public class CompanyQuotationListItemDto
{
    public Guid Id { get; init; }
    public string QuotationNumber { get; init; } = string.Empty;
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public Guid? SalesOpportunityId { get; init; }
    public string? SalesOpportunityCode { get; init; }
    public string? SalesOpportunityTitle { get; init; }
    public CompanyQuotationStatus Status { get; init; }
    public DateOnly IssueDate { get; init; }
    public DateOnly? ValidUntil { get; init; }
    public bool IsExpired { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal Subtotal { get; init; }
    public decimal DiscountTotal { get; init; }
    public decimal TaxTotal { get; init; }
    public decimal GrandTotal { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CompanyQuotationDetailDto : CompanyQuotationListItemDto
{
    public Guid? ContractId { get; init; }
    public Guid? ContactId { get; init; }
    public string? ContactName { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? CustomerNameSnapshot { get; init; }
    public string? CustomerCodeSnapshot { get; init; }
    public string? PaymentTerms { get; init; }
    public string? CommercialTerms { get; init; }
    public string? Notes { get; init; }
    public DateTime? SentAt { get; init; }
    public DateTime? AcceptedAt { get; init; }
    public DateTime? RejectedAt { get; init; }
    public string? RejectionReason { get; init; }
    public DateTime CreatedAt { get; init; }
    public IReadOnlyList<CompanyQuotationLineDto> Lines { get; init; } = [];
}

public sealed class CompanyQuotationPageDto
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<CompanyQuotationListItemDto> Items { get; init; } = [];
}

public sealed class CompanyQuotationCustomerLookupDto
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}

public sealed class CompanyQuotationContactLookupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Phone { get; init; }
}

public sealed class CompanyQuotationOpportunityLookupDto
{
    public Guid Id { get; init; }
    public string OpportunityCode { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public Guid CustomerId { get; init; }
    public Guid? ContactId { get; init; }
    public string CustomerDisplayName { get; init; } = string.Empty;
    public CompanySalesOpportunityStatus Status { get; init; }
    public string? Currency { get; init; }
    public IReadOnlyList<Guid> InterestedCatalogItemIds { get; init; } = [];
}

public sealed class CompanyQuotationCatalogLookupDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public CompanyCatalogItemType Type { get; init; }
    public string? DefaultUnit { get; init; }
    public decimal? BasePrice { get; init; }
    public string? Currency { get; init; }
    public bool SupportsLicense { get; init; }
    public bool SupportsSubscription { get; init; }
}

public sealed class CompanyQuotationCurrencyLookupDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Symbol { get; init; } = string.Empty;
}
