using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities;

namespace Investa.Domain.Entities.Company;

public enum CompanySalesOpportunityStage
{
    New = 1,
    Qualified = 2,
    Proposal = 3,
    Negotiation = 4
}

public enum CompanySalesOpportunityStatus
{
    Open = 1,
    Won = 2,
    Lost = 3
}

public enum CompanySalesOpportunitySource
{
    Referral = 1,
    Website = 2,
    Direct = 3,
    ExistingCustomer = 4,
    Partner = 5,
    Other = 6
}

/// <summary>
/// Company Core sales pipeline record. This is intentionally independent from
/// the FOPX Opportunity participant/funding lifecycle.
/// </summary>
public sealed class CompanySalesOpportunity
{
    public Guid Id { get; set; }
    public int CodeSequence { get; set; }

    [Required, StringLength(32)]
    public string OpportunityCode { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public Guid CustomerId { get; set; }
    public CompanyCustomer Customer { get; set; } = null!;

    public Guid? PrimaryContactId { get; set; }
    public CompanyCustomerContact? PrimaryContact { get; set; }

    public CompanySalesOpportunityStage Stage { get; set; } = CompanySalesOpportunityStage.New;
    public CompanySalesOpportunityStatus Status { get; set; } = CompanySalesOpportunityStatus.Open;

    [Range(0, double.MaxValue)]
    public decimal? ExpectedValue { get; set; }

    [StringLength(3)]
    public string? Currency { get; set; }

    [Range(0, 100)]
    public int? Probability { get; set; }

    public DateOnly? ExpectedCloseDate { get; set; }
    public Guid? SalesOwnerUserId { get; set; }
    public AuthUser? SalesOwnerUser { get; set; }
    public CompanySalesOpportunitySource? Source { get; set; }

    [StringLength(4000)]
    public string? Description { get; set; }

    [StringLength(4000)]
    public string? Notes { get; set; }

    [StringLength(1000)]
    public string? LostReason { get; set; }

    public DateTime? WonAt { get; set; }
    public DateTime? LostAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CompanySalesOpportunityItem> InterestedItems { get; set; } = new List<CompanySalesOpportunityItem>();
}

public sealed class CompanySalesOpportunityItem
{
    public Guid Id { get; set; }
    public Guid SalesOpportunityId { get; set; }
    public CompanySalesOpportunity SalesOpportunity { get; set; } = null!;
    public Guid CatalogItemId { get; set; }
    public CompanyCatalogItem CatalogItem { get; set; } = null!;
    [StringLength(500)] public string? Notes { get; set; }
}
