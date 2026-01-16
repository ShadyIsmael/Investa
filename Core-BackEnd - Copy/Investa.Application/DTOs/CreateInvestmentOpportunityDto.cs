using System;

namespace Investa.Application.DTOs;

[Obsolete("CreateInvestmentOpportunityDto is obsolete. Use CreateInvestmentDto.")]
public class CreateInvestmentOpportunityDto
{
    // Retained for compatibility; use CreateInvestmentDto instead.
    public string BusinessName { get; set; } = string.Empty;
}
