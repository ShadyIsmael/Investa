using Investa.Domain.Entities.Company;

namespace Investa.Application.DTOs;

public sealed class CompanyCatalogListQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public CompanyCatalogItemType? Type { get; set; }
    public CompanyCatalogItemStatus? Status { get; set; }
    public bool? SupportsLicense { get; set; }
    public bool? SupportsSubscription { get; set; }
    public bool? SupportsWorkspace { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}

public class CompanyCatalogItemListItemDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public CompanyCatalogItemType Type { get; init; }
    public string? DefaultUnit { get; init; }
    public decimal? BasePrice { get; init; }
    public string? Currency { get; init; }
    public bool SupportsLicense { get; init; }
    public bool SupportsSubscription { get; init; }
    public bool SupportsWorkspace { get; init; }
    public CompanyCatalogItemStatus Status { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CompanyCatalogItemDetailDto : CompanyCatalogItemListItemDto
{
    public string? Description { get; init; }
    public string? WorkspaceKey { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class CompanyCatalogItemUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CompanyCatalogItemType Type { get; set; } = CompanyCatalogItemType.Product;
    public string? DefaultUnit { get; set; }
    public decimal? BasePrice { get; set; }
    public string? Currency { get; set; }
    public bool SupportsLicense { get; set; }
    public bool SupportsSubscription { get; set; }
    public bool SupportsWorkspace { get; set; }
    public string? WorkspaceKey { get; set; }
}

public sealed class SetCompanyCatalogItemStatusRequest
{
    public CompanyCatalogItemStatus Status { get; set; }
}

public sealed class CompanyCatalogItemPageDto
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<CompanyCatalogItemListItemDto> Items { get; init; } = [];
}
