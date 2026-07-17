using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Supplier master record for company operating finance.
/// Represents vendors, contractors, and service providers.
/// </summary>
public class Supplier
{
    [Key]
    public int Id { get; set; }

    /// <summary>Server-generated supplier code/reference number</summary>
    [Required]
    [StringLength(50)]
    public string SupplierCode { get; set; } = string.Empty;

    /// <summary>Display supplier name</summary>
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Supplier type classification</summary>
    public SupplierType SupplierType { get; set; }

    /// <summary>Service category provided by the supplier</summary>
    [Required]
    [StringLength(100)]
    public string ServiceCategory { get; set; } = string.Empty;

    /// <summary>Legal or registered supplier name, when applicable</summary>
    [StringLength(200)]
    public string? LegalName { get; set; }

    /// <summary>Supplier country, when known</summary>
    [StringLength(100)]
    public string? Country { get; set; }

    /// <summary>Contact person name</summary>
    [StringLength(100)]
    public string? ContactPerson { get; set; }

    /// <summary>Email address</summary>
    [EmailAddress]
    [StringLength(100)]
    public string? Email { get; set; }

    /// <summary>Phone number</summary>
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>Alias for the supplier phone number in the finance contract.</summary>
    [NotMapped]
    public string? Phone
    {
        get => PhoneNumber;
        set => PhoneNumber = value;
    }

    /// <summary>Full business address</summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>Tax identification number</summary>
    [StringLength(50)]
    public string? TaxId { get; set; }

    /// <summary>Alias for the supplier tax number in the finance contract.</summary>
    [NotMapped]
    public string? TaxNumber
    {
        get => TaxId;
        set => TaxId = value;
    }

    /// <summary>Supplier category (e.g., "Services", "Materials", "Equipment")</summary>
    [StringLength(50)]
    public string? Category { get; set; }

    /// <summary>Payment terms (e.g., "Net 30", "Cash on Delivery")</summary>
    [StringLength(100)]
    public string? PaymentTerms { get; set; }

    /// <summary>Supplier payment details, when provided.</summary>
    [StringLength(500)]
    public string? PaymentDetails { get; set; }

    /// <summary>Internal notes about the supplier.</summary>
    [StringLength(1000)]
    public string? Notes { get; set; }

    /// <summary>Currency for transactions with this supplier</summary>
    [StringLength(3)]
    public string Currency { get; set; } = "EGP";

    /// <summary>Whether supplier is currently active</summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    // Navigation
    public ICollection<FinanceTransaction> Transactions { get; set; } = new List<FinanceTransaction>();
}
