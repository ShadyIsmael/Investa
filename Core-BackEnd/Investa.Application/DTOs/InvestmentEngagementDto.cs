using System;

namespace Investa.Application.DTOs;

public class InvestmentEngagementDto
{
    public int InvestmentId { get; set; }
    public string? BusinessName { get; set; }
    public decimal TotalShareAmount { get; set; }
    public DateTime LastInvestedAt { get; set; }
}
