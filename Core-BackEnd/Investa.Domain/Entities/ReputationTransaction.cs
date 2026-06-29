using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents a reputation transaction for audit trail.
/// All reputation changes (system, user activity, or admin) are stored here.
/// </summary>
public class ReputationTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    public int? ReputationRuleId { get; set; }

    [Required]
    public int Points { get; set; }

    public string? Reason { get; set; }

    public string? ReferenceId { get; set; }

    public string? ReferenceType { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public Guid? CreatedByUserId { get; set; }

    public ReputationRule? Rule { get; set; }

    public AuthUser? User { get; set; }

    public AuthUser? CreatedBy { get; set; }
}