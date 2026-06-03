using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Records verification attempts for a user (email, phone, LinkedIn, address, legal agreement).
/// One row per (UserId, VerificationType) attempt — multiple rows can exist per type.
/// </summary>
public class UserVerification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public VerificationType VerificationType { get; set; }

    [Required]
    public VerificationStatus Status { get; set; } = VerificationStatus.Pending;

    /// <summary>External provider used (Firebase, manual, etc.)</summary>
    [StringLength(100)]
    public string? Provider { get; set; }

    /// <summary>Reference ID returned by the provider (e.g., Firebase verification ID).</summary>
    [StringLength(256)]
    public string? ProviderReferenceId { get; set; }

    /// <summary>URL or storage key of the submitted document.</summary>
    [StringLength(512)]
    public string? DocumentUrl { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public DateTime? VerifiedAt { get; set; }

    public DateTime? ExpirationDate { get; set; }

    /// <summary>Admin or system note about the verification decision.</summary>
    [StringLength(1000)]
    public string? Notes { get; set; }

    // Navigation
    public AuthUser? User { get; set; }
}
