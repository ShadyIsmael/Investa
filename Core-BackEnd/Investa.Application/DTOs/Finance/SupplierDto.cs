using System;
using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs.Finance;

/// <summary>DTO for Supplier master record.</summary>
public class SupplierDto
{
    public int Id { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string Code => SupplierCode;
    public string Name { get; set; } = string.Empty;
    public SupplierType SupplierType { get; set; }
    public string ServiceCategory { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Phone => PhoneNumber;
    public string? Address { get; set; }
    public string? TaxId { get; set; }
    public string? TaxNumber => TaxId;
    public string? Category { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PaymentDetails { get; set; }
    public string? Notes { get; set; }
    public string Currency { get; set; } = "EGP";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>DTO for creating or updating a Supplier.</summary>
public class CreateUpdateSupplierDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public SupplierType SupplierType { get; set; }

    [Required]
    [StringLength(100)]
    public string ServiceCategory { get; set; } = string.Empty;

    [StringLength(200)]
    public string? LegalName { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    public string? ContactPerson { get; set; }

    [EmailAddress]
    [StringLength(100)]
    public string? Email { get; set; }

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [Phone]
    [StringLength(20)]
    public string? Phone { get; set; }

    public string? Address { get; set; }

    [StringLength(50)]
    public string? TaxId { get; set; }

    [StringLength(50)]
    public string? TaxNumber { get; set; }

    public string? Category { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PaymentDetails { get; set; }
    public string? Notes { get; set; }
    public string Currency { get; set; } = "EGP";
    public bool IsActive { get; set; } = true;
}

/// <summary>DTO for listing Suppliers with basic info.</summary>
public class SupplierListDto
{
    public int Id { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string Code => SupplierCode;
    public string Name { get; set; } = string.Empty;
    public SupplierType SupplierType { get; set; }
    public string ServiceCategory { get; set; } = string.Empty;
    public string? Category { get; set; }
    public bool IsActive { get; set; }
}
