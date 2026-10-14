using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Company;

namespace Investa.Application.DTOs;

public sealed class CompanyCustomerListQuery
{
    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public CompanyCustomerType? Type { get; set; }
    public CompanyCustomerStatus? Status { get; set; }
    public string SortBy { get; set; } = "createdAt";
    public string SortDirection { get; set; } = "desc";
}

public sealed class CompanyCustomerListItemDto
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public CompanyCustomerType Type { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string LegalName { get; init; } = string.Empty;
    public string? PrimaryContactName { get; init; }
    public string? PrimaryEmail { get; init; }
    public string? PrimaryPhone { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
    public CompanyCustomerStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CompanyCustomerContactDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? JobTitle { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public bool IsPrimary { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CompanyCustomerDetailDto
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public CompanyCustomerType Type { get; init; }
    public string LegalName { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? TaxId { get; init; }
    public string? CommercialRegistrationNumber { get; init; }
    public string? PrimaryEmail { get; init; }
    public string? PrimaryPhone { get; init; }
    public string? Website { get; init; }
    public string? Address { get; init; }
    public string? Country { get; init; }
    public string? City { get; init; }
    public CompanyCustomerStatus Status { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public IReadOnlyList<CompanyCustomerContactDto> Contacts { get; init; } = Array.Empty<CompanyCustomerContactDto>();
}

public class CompanyCustomerUpsertRequest
{
    [Required] public CompanyCustomerType Type { get; set; } = CompanyCustomerType.Organization;
    [Required, StringLength(200)] public string LegalName { get; set; } = string.Empty;
    [Required, StringLength(200)] public string DisplayName { get; set; } = string.Empty;
    [StringLength(80)] public string? TaxId { get; set; }
    [StringLength(80)] public string? CommercialRegistrationNumber { get; set; }
    [StringLength(160), EmailAddress] public string? PrimaryEmail { get; set; }
    [StringLength(40)] public string? PrimaryPhone { get; set; }
    [StringLength(250), Url] public string? Website { get; set; }
    [StringLength(500)] public string? Address { get; set; }
    [StringLength(100)] public string? Country { get; set; }
    [StringLength(100)] public string? City { get; set; }
    [StringLength(2000)] public string? Notes { get; set; }
}

public sealed class SetCompanyCustomerStatusRequest
{
    [Required] public CompanyCustomerStatus Status { get; set; }
}

public class CompanyCustomerContactRequest
{
    [Required, StringLength(160)] public string Name { get; set; } = string.Empty;
    [StringLength(120)] public string? JobTitle { get; set; }
    [StringLength(160), EmailAddress] public string? Email { get; set; }
    [StringLength(40)] public string? Phone { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class CompanyCustomerContactStatusRequest
{
    [Required] public bool IsActive { get; set; }
}

public sealed class CompanyCustomerPageDto
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<CompanyCustomerListItemDto> Items { get; init; } = Array.Empty<CompanyCustomerListItemDto>();
}
