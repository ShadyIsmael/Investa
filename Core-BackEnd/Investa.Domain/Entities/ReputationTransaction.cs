using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents a reputation transaction for audit trail.
/// All reputation changes (system, user activity, or admin) are stored here.
/// </summary>
public class ReputationTransaction
{
    /// <summary>
    /// Where the reputation change originated.
    /// </summary>
    public enum SourceModule
    {
        Profile = 0,
        Verification = 1,
        Investment = 2,
        Wallet = 3,
        Compliance = 4,
        Admin = 5,
        System = 6
    }
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    public int? ReputationRuleId { get; set; }

    [Required]
    [StringLength(100)]
    public string ActivityCode { get; set; } = string.Empty;

    [Required]
    public int Points { get; set; }

    public string? Reason { get; set; }

    public string? ReferenceId { get; set; }

    public string? ReferenceType { get; set; }

    public SourceModule SourceModuleValue { get; set; } = SourceModule.System;

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    public Guid? CreatedByUserId { get; set; }

    public ReputationRule? Rule { get; set; }

    public AuthUser? User { get; set; }

    public AuthUser? CreatedBy { get; set; }
}
