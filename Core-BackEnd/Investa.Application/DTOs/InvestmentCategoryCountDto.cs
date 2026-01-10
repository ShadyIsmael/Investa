namespace Investa.Application.DTOs;

public class InvestmentCategoryCountDto
{
    public int BusinessCategoryId { get; set; }
    public string? BusinessCategoryName { get; set; }
    // English and Arabic names
    public string? BusinessCategoryNameEn { get; set; }
    public string? BusinessCategoryNameAr { get; set; }

    // Number of distinct investments in this category for the client
    public int InvestmentCount { get; set; }

    // Total share amount across all investments in this category
    public decimal TotalShareAmount { get; set; }
} 
