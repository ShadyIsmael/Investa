using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents the extended profile information for a user.
/// Organized into 4 logical sections: Basic Info, Contact Info, Identity & Compliance, and Audit & Usage.
/// </summary>
public class UserProfile
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    #region Section 1: Basic Info

    /// <summary>
    /// User's full name
    /// </summary>
    [StringLength(200)]
    public string? FullName { get; set; }

    /// <summary>
    /// User's gender (e.g., Male, Female, Other, Prefer not to say)
    /// </summary>
    [StringLength(50)]
    public string? Gender { get; set; }

    /// <summary>
    /// User's nationality/country
    /// </summary>
    [StringLength(100)]
    public string? Nationality { get; set; }

    /// <summary>
    /// User's biography or profile description
    /// </summary>
    [StringLength(1000)]
    public string? Bio { get; set; }

    #endregion

    #region Section 2: Contact Info

    /// <summary>
    /// Primary contact email (inherited from User entity but stored here for redundancy)
    /// </summary>
    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    /// <summary>
    /// Primary phone number
    /// </summary>
    [StringLength(20)]
    public string? Phone1 { get; set; }

    /// <summary>
    /// Secondary phone number
    /// </summary>
    [StringLength(20)]
    public string? Phone2 { get; set; }

    /// <summary>
    /// Work/Business address
    /// </summary>
    [StringLength(500)]
    public string? WorkAddress { get; set; }

    #endregion

    #region Section 3: Identity & Compliance (Future Proof - All Nullable)

    /// <summary>
    /// National ID or Passport number. Nullable to allow gradual profile completion.
    /// </summary>
    [StringLength(50)]
    public string? DocumentNumber { get; set; }

    /// <summary>
    /// Expiry date of the identity document. Nullable for optional initial registration.
    /// </summary>
    public DateTime? DocumentExpiryDate { get; set; }

    /// <summary>
    /// Current verification status of the user's identity (None, Pending, Verified)
    /// </summary>
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.None;

    /// <summary>
    /// URL/Path to the front image of the identity document (for Azure Blob Storage or local storage integration)
    /// </summary>
    [StringLength(500)]
    public string? DocumentFrontImageUrl { get; set; }

    /// <summary>
    /// URL/Path to the back image of the identity document (for Azure Blob Storage or local storage integration)
    /// </summary>
    [StringLength(500)]
    public string? DocumentBackImageUrl { get; set; }

    #endregion

    #region Section 4: Audit & Usage

    /// <summary>
    /// IP address from which the user last logged in. Captured with X-Forwarded-For support for proxies.
    /// </summary>
    [StringLength(45)]
    public string? LastLoginIP { get; set; }

    /// <summary>
    /// IP address used during user registration. Used for audit trail.
    /// </summary>
    [StringLength(45)]
    public string? RegistrationIP { get; set; }

    /// <summary>
    /// Device information (User-Agent, device type, etc.) from last login
    /// </summary>
    [StringLength(500)]
    public string? DeviceInfo { get; set; }

    /// <summary>
    /// Timestamp of the user's last login
    /// </summary>
    public DateTime? LastLoginDate { get; set; }

    #endregion

    #region Audit Timestamps

    /// <summary>
    /// Profile creation timestamp (auto-managed by database)
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Profile last update timestamp (auto-managed by database)
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Back-reference to the associated User entity
    /// </summary>
    public User? User { get; set; }

    #endregion
}
