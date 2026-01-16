using System;
using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Domain.Entities;

public class AuthUser
{
    [Key]
    public Guid Id { get; set; }

    [EmailAddress]
    [StringLength(256)]
    public string? Email { get; set; }

    [Required]
    [StringLength(512)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserType UserType { get; set; } = UserType.Client;

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

    /// <summary>
    /// Multi-tenancy support - null for system accounts
    /// </summary>
    public Guid? TenantId { get; set; }

    // Navigation
    public Client? Client { get; set; }
    public Employee? Employee { get; set; }
    public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
}
