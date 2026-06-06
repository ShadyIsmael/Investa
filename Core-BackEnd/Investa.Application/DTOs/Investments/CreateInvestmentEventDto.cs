using System;

namespace Investa.Application.DTOs.Investments;

public class CreateInvestmentEventDto
{
    public string EventType { get; set; } = null!;
    public string Visibility { get; set; } = "Public";
    public string? Payload { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? CorrelationId { get; set; }
    public string? Metadata { get; set; }
}
