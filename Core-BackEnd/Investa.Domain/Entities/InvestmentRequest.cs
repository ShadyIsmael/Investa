using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents an investment request sent from an investor to a founder.
/// Stored for both parties (incoming/outgoing) to support separate inboxes.
/// </summary>
public class InvestmentRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvestmentId { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public Guid FounderId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public int? Shares { get; set; }

    [Required]
    public InvestmentRequestStatus Status { get; set; } = InvestmentRequestStatus.Pending;

    [Required]
    public InvestmentRequestDirection Direction { get; set; } = InvestmentRequestDirection.Outgoing;

    // NEW: Logical request type (e.g., 'investment_request') to support single-record flow
    public string? RequestType { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    #region Navigation Properties

    public Investment? Investment { get; set; }

    #endregion
}
