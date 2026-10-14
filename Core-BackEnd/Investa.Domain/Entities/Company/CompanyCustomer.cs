using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities.Company;

public enum CompanyCustomerType
{
    Organization = 1,
    Individual = 2
}

public enum CompanyCustomerStatus
{
    Active = 1,
    Inactive = 2
}

/// <summary>
/// Commercial counterparty for the Company Management platform.
/// This is deliberately separate from the FOPX Client participant model.
/// </summary>
public sealed class CompanyCustomer
{
    public Guid Id { get; set; }

    /// <summary>Monotonic server-generated sequence used to form CustomerCode.</summary>
    public int CodeSequence { get; set; }

    [Required, StringLength(32)]
    public string CustomerCode { get; set; } = string.Empty;

    public CompanyCustomerType Type { get; set; } = CompanyCustomerType.Organization;

    [Required, StringLength(200)]
    public string LegalName { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [StringLength(80)]
    public string? TaxId { get; set; }

    [StringLength(80)]
    public string? CommercialRegistrationNumber { get; set; }

    [StringLength(160), EmailAddress]
    public string? PrimaryEmail { get; set; }

    [StringLength(40)]
    public string? PrimaryPhone { get; set; }

    [StringLength(250), Url]
    public string? Website { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    public CompanyCustomerStatus Status { get; set; } = CompanyCustomerStatus.Active;

    [StringLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CompanyCustomerContact> Contacts { get; set; } = new List<CompanyCustomerContact>();
}

public sealed class CompanyCustomerContact
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }

    [Required, StringLength(160)]
    public string Name { get; set; } = string.Empty;

    [StringLength(120)]
    public string? JobTitle { get; set; }

    [StringLength(160), EmailAddress]
    public string? Email { get; set; }

    [StringLength(40)]
    public string? Phone { get; set; }

    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public CompanyCustomer Customer { get; set; } = null!;
}
