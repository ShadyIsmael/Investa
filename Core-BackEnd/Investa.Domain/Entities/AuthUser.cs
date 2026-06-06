using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Domain.Entities;

/// <summary>
/// Master user table. Every person who can log in has one AuthUser record.
/// - Clients (Founders / Investors / Partners) use the Flutter apps → UserType.Client
/// - Internal staff / admins use the Admin Portal → UserType.OrgUser
/// OrgUsers need RBAC roles but do NOT need a ClientProfile or UserProfile.
/// </summary>
public class AuthUser
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>Display name for the user.</summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(256)]
    public string? Email { get; set; }

    [Required]
    [StringLength(512)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserType UserType { get; set; } = UserType.Client;

    /// <summary>
    /// Client sub-type (Investor / Founder / Both).
    /// Ignored for OrgUser accounts.
    /// </summary>
    public ClientType ClientType { get; set; } = ClientType.Investor;

    public bool Status { get; set; } = true;

    /// <summary>
    /// Firebase user id obtained after client-side OTP verification.
    /// Stored to correlate Identity/AuthUser with Firebase accounts.
    /// </summary>
    [StringLength(128)]
    public string? FirebaseUid { get; set; }

    // Suspended until (nullable) - when set, the account is temporarily suspended
    public DateTime? SuspendedUntil { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Multi-tenancy support - null for system accounts.</summary>
    public Guid? TenantId { get; set; }

    // ── Wallet / credibility (relevant for Client accounts) ──────────────────
    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal WalletBalance { get; set; } = 0m;

    public int CredibilityScore { get; set; } = 3500;

    // ── Navigation ────────────────────────────────────────────────────────────
    /// <summary>Optional extended profile. Only present for Client accounts.</summary>
    public UserProfile? Profile { get; set; }

    /// <summary>Optional client business profile. Only present for Client accounts.</summary>
    public Client? Client { get; set; }

    // ── Progressive Trust System ─────────────────────────────────────────────

    /// <summary>Verification eligibility score (0-100). Controls access to advanced actions.</summary>
    [Range(0, 100)]
    public int VerificationTrustScore { get; set; } = 0;

    /// <summary>Current trust level controlling what the user can do on the platform.</summary>
    public TrustLevel TrustLevel { get; set; } = TrustLevel.Registered;

    /// <summary>Dynamic reputation score (0–10000). Increases with positive activity.</summary>
    [Range(0, 10000)]
    public int ReputationScore { get; set; } = 0;

    /// <summary>Activity contribution score (0-10000). Tracks meaningful platform participation.</summary>
    [Range(0, 10000)]
    public int ActivityScore { get; set; } = 0;

    /// <summary>Human-readable reputation level used by product surfaces.</summary>
    [StringLength(80)]
    public string ReputationLevel { get; set; } = "Rising Member";

    /// <summary>Profile completion percentage (0–100). Drives trust-level upgrades.</summary>
    [Range(0, 100)]
    public int ProfileCompletionPercentage { get; set; } = 0;

    /// <summary>Phone number has been verified via OTP.</summary>
    public bool IsPhoneVerified { get; set; } = false;

    /// <summary>Email address has been verified.</summary>
    public bool IsEmailVerified { get; set; } = false;

    /// <summary>
    /// Comma-separated risk flags (e.g., "repeated_failures,report_flag").
    /// Used by fraud/compliance checks.
    /// </summary>
    [StringLength(500)]
    public string? RiskFlags { get; set; }

    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<CreditTransaction> CreditTransactions { get; set; } = new List<CreditTransaction>();
    public ICollection<CreditPlanPurchase> CreditPlanPurchases { get; set; } = new List<CreditPlanPurchase>();
    public ICollection<ScoreTransaction> ScoreTransactions { get; set; } = new List<ScoreTransaction>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
    public ICollection<UserVerification> Verifications { get; set; } = new List<UserVerification>();
}
