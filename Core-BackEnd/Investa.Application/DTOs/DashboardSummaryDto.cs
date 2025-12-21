namespace Investa.Application.DTOs;

public class DashboardSummaryDto
{
    public int CredibilityScore { get; set; }
    public decimal WalletBalance { get; set; }
    public List<string> TopInvestmentCategories { get; set; } = new List<string>();
}