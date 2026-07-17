using System;
using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

/// <summary>
/// Audit trail event for finance transactions.
/// Records create, edit, confirm, reverse, cancel with full change history.
/// </summary>
public class FinanceAuditEvent
{
    [Key]
    public int Id { get; set; }

    /// <summary>Reference to the transaction being audited</summary>
    [Required]
    public int TransactionId { get; set; }
    public FinanceTransaction? Transaction { get; set; }

    /// <summary>Type of event that occurred</summary>
    [Required]
    public FinanceAuditEventType EventType { get; set; }

    /// <summary>User who performed the action</summary>
    [Required]
    public Guid PerformedBy { get; set; }

    /// <summary>Description of the event</summary>
    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Old values (JSON snapshot before change)</summary>
    public string? OldValues { get; set; }

    /// <summary>New values (JSON snapshot after change)</summary>
    public string? NewValues { get; set; }

    /// <summary>Additional metadata as JSON</summary>
    public string? Metadata { get; set; }

    /// <summary>IP address of the user performing the action</summary>
    [StringLength(45)]
    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
