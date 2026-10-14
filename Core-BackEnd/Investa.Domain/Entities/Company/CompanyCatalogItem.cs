namespace Investa.Domain.Entities.Company;

public enum CompanyCatalogItemType
{
    Product = 1,
    Service = 2
}

public enum CompanyCatalogItemStatus
{
    Active = 1,
    Inactive = 2
}

/// <summary>
/// Commercial Company Core catalog item. This is deliberately separate from
/// FOPX operational pricing and from future sales/licensing records.
/// </summary>
public sealed class CompanyCatalogItem
{
    public Guid Id { get; set; }
    public int CodeSequence { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CompanyCatalogItemType Type { get; set; }
    public CompanyCatalogItemStatus Status { get; set; }
    public bool SupportsLicense { get; set; }
    public bool SupportsSubscription { get; set; }
    public bool SupportsWorkspace { get; set; }
    public string? WorkspaceKey { get; set; }
    public string? DefaultUnit { get; set; }
    public decimal? BasePrice { get; set; }
    public string? Currency { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
