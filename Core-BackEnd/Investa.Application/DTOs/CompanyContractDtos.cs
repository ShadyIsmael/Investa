using Investa.Domain.Entities.Company;

namespace Investa.Application.DTOs;

public sealed class CompanyContractListQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public CompanyContractStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? SalesOpportunityId { get; set; }
    public string? Currency { get; set; }
    public DateOnly? EffectiveDateFrom { get; set; }
    public DateOnly? EffectiveDateTo { get; set; }
    public DateOnly? StartDateFrom { get; set; }
    public DateOnly? StartDateTo { get; set; }
    public DateOnly? EndDateFrom { get; set; }
    public DateOnly? EndDateTo { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}

public sealed class CompanyContractFromQuotationRequest
{
    public Guid SourceQuotationId { get; set; }
    public DateOnly? EffectiveDate { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly? SignedDate { get; set; }
    public string? PaymentTerms { get; set; }
    public string? CommercialTerms { get; set; }
    public string? Notes { get; set; }
}

public sealed class CompanyContractMetadataUpdateRequest
{
    public DateOnly? EffectiveDate { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly? SignedDate { get; set; }
    public string? PaymentTerms { get; set; }
    public string? CommercialTerms { get; set; }
    public string? Notes { get; set; }
}

public sealed class CompanyContractTerminateRequest
{
    public string TerminationReason { get; set; } = string.Empty;
}

public sealed class CompanyContractLineDto
{
    public Guid Id { get; init; }
    public Guid SourceQuotationLineId { get; init; }
    public int LineNumber { get; init; }
    public Guid? CatalogItemId { get; init; }
    public string? ItemCode { get; init; }
    public string ItemName { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public CompanyContractDiscountType DiscountType { get; init; }
    public decimal DiscountValue { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TaxRate { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal LineSubtotal { get; init; }
    public decimal LineTotal { get; init; }
    public bool SupportsLicense { get; init; }
    public bool SupportsSubscription { get; init; }
}

public class CompanyContractListItemDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public Guid SourceQuotationId { get; init; }
    public string SourceQuotationNumber { get; init; } = string.Empty;
    public Guid? SalesOpportunityId { get; init; }
    public string? SalesOpportunityCode { get; init; }
    public string? SalesOpportunityTitle { get; init; }
    public CompanyContractStatus Status { get; init; }
    public string Currency { get; init; } = string.Empty;
    public DateOnly? EffectiveDate { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public decimal GrandTotal { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CompanyContractDetailDto : CompanyContractListItemDto
{
    public Guid? ContactId { get; init; }
    public string? ContactName { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string CustomerCodeSnapshot { get; init; } = string.Empty;
    public string CustomerNameSnapshot { get; init; } = string.Empty;
    public string? CustomerLegalNameSnapshot { get; init; }
    public DateOnly? SignedDate { get; init; }
    public decimal Subtotal { get; init; }
    public decimal DiscountTotal { get; init; }
    public decimal TaxTotal { get; init; }
    public string? PaymentTerms { get; init; }
    public string? CommercialTerms { get; init; }
    public string? Notes { get; init; }
    public DateTime? ActivatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public DateTime? TerminatedAt { get; init; }
    public string? TerminationReason { get; init; }
    public DateTime CreatedAt { get; init; }
    public IReadOnlyList<CompanyContractLineDto> Lines { get; init; } = [];
}

public sealed class CompanyContractPageDto
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<CompanyContractListItemDto> Items { get; init; } = [];
}
