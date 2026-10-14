using Investa.Domain.Entities.Company;

namespace Investa.Application.DTOs;

public sealed class CompanySalesOpportunityListQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public CompanySalesOpportunityStage? Stage { get; set; }
    public CompanySalesOpportunityStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? CatalogItemId { get; set; }
    public Guid? SalesOwnerUserId { get; set; }
    public DateOnly? ExpectedCloseFrom { get; set; }
    public DateOnly? ExpectedCloseTo { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}

public sealed class CompanySalesOpportunityItemSummaryDto
{
    public Guid Id { get; init; }
    public Guid CatalogItemId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public CompanyCatalogItemType Type { get; init; }
}

public class CompanySalesOpportunityListItemDto
{
    public Guid Id { get; init; }
    public string OpportunityCode { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerDisplayName { get; init; } = string.Empty;
    public CompanySalesOpportunityStage Stage { get; init; }
    public CompanySalesOpportunityStatus Status { get; init; }
    public IReadOnlyList<CompanySalesOpportunityItemSummaryDto> InterestedItems { get; init; } = [];
    public decimal? ExpectedValue { get; init; }
    public string? Currency { get; init; }
    public int? Probability { get; init; }
    public DateOnly? ExpectedCloseDate { get; init; }
    public Guid? SalesOwnerUserId { get; init; }
    public string? SalesOwnerName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CompanySalesOpportunityDetailDto : CompanySalesOpportunityListItemDto
{
    public Guid? PrimaryContactId { get; init; }
    public string? PrimaryContactName { get; init; }
    public CompanySalesOpportunitySource? Source { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public string? LostReason { get; init; }
    public DateTime? WonAt { get; init; }
    public DateTime? LostAt { get; init; }
}

public sealed class CompanySalesOpportunityUpsertRequest
{
    public string Title { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public Guid? PrimaryContactId { get; set; }
    public CompanySalesOpportunityStage Stage { get; set; } = CompanySalesOpportunityStage.New;
    public decimal? ExpectedValue { get; set; }
    public string? Currency { get; set; }
    public int? Probability { get; set; }
    public DateOnly? ExpectedCloseDate { get; set; }
    public Guid? SalesOwnerUserId { get; set; }
    public CompanySalesOpportunitySource? Source { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public IReadOnlyList<Guid> CatalogItemIds { get; set; } = [];
}

public sealed class SetCompanySalesOpportunityStageRequest
{
    public CompanySalesOpportunityStage Stage { get; set; }
}

public sealed class MarkCompanySalesOpportunityLostRequest
{
    public string LostReason { get; set; } = string.Empty;
}

public sealed class CompanySalesOpportunityPageDto
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<CompanySalesOpportunityListItemDto> Items { get; init; } = [];
}

public sealed class CompanySalesOpportunityCustomerLookupDto
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}

public sealed class CompanySalesOpportunityContactLookupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
}

public sealed class CompanySalesOpportunityCatalogLookupDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public CompanyCatalogItemType Type { get; init; }
}

public sealed class CompanySalesOpportunityOwnerLookupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
}
