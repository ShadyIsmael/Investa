namespace Investa.Application.DTOs;

public class InvestmentCategoryCountDto
{
    public int ProjectCategoryId { get; set; }
    public string? ProjectCategoryName { get; set; }
    // English and Arabic names
    public string? ProjectCategoryNameEn { get; set; }
    public string? ProjectCategoryNameAr { get; set; }

    // Number of distinct investments in this category for the client
    public int InvestmentCount { get; set; }

    // Total share amount across all investments in this category
    public decimal TotalShareAmount { get; set; }
} 
