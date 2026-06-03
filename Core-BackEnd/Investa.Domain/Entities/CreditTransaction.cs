using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents a credibility score transaction for audit trail and transparency.
/// Every change in user's credibility score must be logged through this table.
/// </summary>
public class CreditTransaction
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Reference to the user whose credibility score is being modified
    /// </summary>
    [Required]
    [ForeignKey(nameof(User))]
    public Guid UserId { get; set; }

    /// <summary>
    /// The amount of credibility points added (+) or deducted (-)
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Justification for this transaction in Arabic
    /// </summary>
    [Required]
    [StringLength(500)]
    public string JustificationAr { get; set; } = string.Empty;

    /// <summary>
    /// Justification for this transaction in English
    /// </summary>
    [Required]
    [StringLength(500)]
    public string JustificationEn { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when this transaction was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional reference to the admin who manually triggered this transaction
    /// Null if the transaction was system-generated
    /// </summary>
    [ForeignKey(nameof(Admin))]
    public Guid? AdminId { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Navigation property to the user
    /// </summary>
    public AuthUser? User { get; set; }

    /// <summary>
    /// Navigation property to the admin (if manually triggered)
    /// </summary>
    public AuthUser? Admin { get; set; }

    #endregion
}
