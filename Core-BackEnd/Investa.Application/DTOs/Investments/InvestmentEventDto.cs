using System;

namespace Investa.Application.DTOs.Investments;

public class InvestmentEventDto
{
    public Guid Id { get; set; }
    public int InvestmentId { get; set; }
    public string EventType { get; set; } = null!;
    public string? Payload { get; set; }
    public DateTime OccurredAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? CorrelationId { get; set; }
    public int Version { get; set; }
    public string? Metadata { get; set; }
}