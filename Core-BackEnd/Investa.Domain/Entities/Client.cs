using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Client
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(500)]
    public string? PersonalImageUrl { get; set; }

    [StringLength(20)]
    public string? MobileNumber { get; set; }

    [StringLength(200)]
    public string? FirebaseUid { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? District { get; set; }

    [StringLength(500)]
    public string? Address1 { get; set; }

    [StringLength(500)]
    public string? Address2 { get; set; }

    [StringLength(50)]
    public string? NationalId { get; set; }

    public DateTime? BirthDate { get; set; }

    public int? Age { get; set; }

    [StringLength(500)]
    public string? NationalIdImageUrl { get; set; }

    [StringLength(500)]
    public string? WebsiteUrl { get; set; }

    [StringLength(250)]
    public string? LinkedInUrl { get; set; }

    [StringLength(250)]
    public string? FacebookUrl { get; set; }

    [StringLength(200)]
    public string? BusinessRole { get; set; }

    [Column(TypeName = "decimal(9,2)")]
    public decimal Score { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Credit { get; set; } = 0m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Status lookup (Active, Diactive, Suspended)
    public int StatusId { get; set; }
    public ClientStatus? Status { get; set; }

    /// <summary>
    /// Optional client classification (Investor/Founder/Both)
    /// Stored for reporting and client-specific features
    /// </summary>
    public ClientType? ClientType { get; set; }

    // Penalty duration (nullable, in days)
    public int? PenaltyDurationDays { get; set; }

    // Navigation
    public AuthUser? User { get; set; }
    // Credit transactions history
    public ICollection<CreditTransaction> CreditTransactions { get; set; } = new List<CreditTransaction>();
    // Many-to-many client categories
    public ICollection<ClientBusinessCategory> ClientBusinessCategories { get; set; } = new List<ClientBusinessCategory>();
}
