using System;

namespace Investa.Application.DTOs;

public class InvestmentCategoryEngagementDto
{
    public int ProjectCategoryId { get; set; }
    public string? ProjectCategoryName { get; set; }
    public string? ProjectCategoryNameAr { get; set; }
    public decimal TotalInvestedAmount { get; set; }
    public DateTime LastInvestedAt { get; set; }
}
