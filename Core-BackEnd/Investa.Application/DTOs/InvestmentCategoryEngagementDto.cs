using System;

namespace Investa.Application.DTOs;

public class InvestmentCategoryEngagementDto
{
    public int BusinessCategoryId { get; set; }
    public string? BusinessCategoryName { get; set; }
    public string? BusinessCategoryNameAr { get; set; }
    public decimal TotalInvestedAmount { get; set; }
    public DateTime LastInvestedAt { get; set; }
}
