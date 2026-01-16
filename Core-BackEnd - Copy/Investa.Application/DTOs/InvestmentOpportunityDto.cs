using System;

namespace Investa.Application.DTOs;

[Obsolete("InvestmentOpportunityDto is obsolete. Use InvestmentDto.")]
public class InvestmentOpportunityDto
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
}
