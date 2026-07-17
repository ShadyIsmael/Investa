using System;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs.Finance;

/// <summary>DTO for Finance Audit Event (audit trail record).</summary>
public class FinanceAuditEventDto
{
    public int Id { get; set; }
    public int TransactionId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public Guid PerformedBy { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? Metadata { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>DTO for transaction audit history (paginated list).</summary>
public class TransactionAuditHistoryDto
{
    public int TransactionId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public List<FinanceAuditEventDto> Events { get; set; } = new();
    public int TotalEvents { get; set; }
}
