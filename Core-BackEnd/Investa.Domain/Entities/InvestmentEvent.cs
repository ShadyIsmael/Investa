using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Append-only event representing a lifecycle or membership change for an Investment
/// </summary>
public class InvestmentEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK to the Investment (int)
    /// </summary>
    public int InvestmentId { get; set; }

    /// <summary>
    /// Type of event (StatusUpdated, ParticipantAdded, SharesUpdated, etc.)
    /// </summary>
    public string EventType { get; set; } = null!;

    /// <summary>
    /// Visibility scope for timeline consumers: Public or ParticipantOnly.
    /// </summary>
    [StringLength(32)]
    public string Visibility { get; set; } = "Public";

    /// <summary>
    /// JSON payload describing the details of the event
    /// Stored as nvarchar(max) in SQL Server
    /// </summary>
    public string? Payload { get; set; }

    /// <summary>
    /// When the event occurred
    /// </summary>
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Actor who caused the event (Auth user id)
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// Optional correlation id for multi-step operations
    /// </summary>
    public Guid? CorrelationId { get; set; }

    /// <summary>
    /// Monotonic version per investment (starts at 1)
    /// </summary>
    public int Version { get; set; }

    /// <summary>
    /// Optional metadata container
    /// </summary>
    public string? Metadata { get; set; }

    // Navigation
    public Investment Investment { get; set; } = null!;
}
