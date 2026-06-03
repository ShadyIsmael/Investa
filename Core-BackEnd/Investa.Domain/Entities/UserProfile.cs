using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents the extended profile information for a user.
/// Organized into 3 logical sections: Basic Info, Contact Info, and Audit & Usage.
/// </summary>
public class UserProfile
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey(nameof(AuthUser))]
    public Guid UserId { get; set; }

    #region Section 1: Basic Info

    /// <summary>
    /// User's full name
    /// </summary>
    [StringLength(200)]
    public string? FullName { get; set; }

    /// <summary>
    /// First name stored separately for easier searching and display
    /// </summary>
    [StringLength(100)]
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name stored separately for easier searching and display
    /// </summary>
    [StringLength(100)]
    public string? LastName { get; set; }

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
    /// Company name for the user's profile
    /// </summary>
    [StringLength(200)]
    public string? CompanyName { get; set; }

    /// <summary>
    /// User's date of birth
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Country selection for the user (used for dropdown selection)
    /// </summary>
    [StringLength(100)]
    public string? Country { get; set; }

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
    /// General address or location details (city, street, coordinates, etc.)
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// City associated with the contact address
    /// </summary>
    [StringLength(100)]
    public string? City { get; set; }

    /// <summary>
    /// Company address
    /// </summary>
    [StringLength(500)]
    public string? CompanyAddress { get; set; }

    /// <summary>
    /// Company email address
    /// </summary>
    [EmailAddress]
    [StringLength(150)]
    public string? CompanyEmail { get; set; }

    /// <summary>
    /// URL to the user's avatar/profile image
    /// </summary>
    [StringLength(500)]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// User's professional/business role (e.g., "CEO", "Investor", "Startup Founder").
    /// Required for Level 2 trust upgrade.
    /// </summary>
    [StringLength(200)]
    public string? BusinessRole { get; set; }

    /// <summary>
    /// Investment interests (comma-separated or JSON array as string).
    /// </summary>
    [StringLength(500)]
    public string? InvestmentInterests { get; set; }

    /// <summary>
    /// LinkedIn profile URL
    /// </summary>
    [StringLength(250)]
    public string? LinkedInUrl { get; set; }

    /// <summary>
    /// Facebook profile URL
    /// </summary>
    [StringLength(250)]
    public string? FacebookUrl { get; set; }

    #endregion

    #region Section 3: Professional Info
    /// </summary>
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.None;
    /// <summary>
    /// Current total credibility score for this user
    /// This is the accumulated sum of all CreditTransaction amounts
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentCredibilityScore { get; set; } = 0;

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
    /// Back-reference to the associated AuthUser.
    /// </summary>
    public AuthUser? AuthUser { get; set; }

    #endregion
}
