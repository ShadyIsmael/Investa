namespace Investa.Application.DTOs;

public class DashboardSummaryDto
{
    public int CredibilityScore { get; set; }
    public decimal WalletBalance { get; set; }

    // Client metrics
    public decimal ClientScore { get; set; }
    public decimal Credit { get; set; }

    // Recent transactions
    public List<CreditTransactionDto> CreditTransactions { get; set; } = new List<CreditTransactionDto>();
    public List<ScoreTransactionDto> ScoreTransactions { get; set; } = new List<ScoreTransactionDto>();

    public List<string> TopInvestmentCategories { get; set; } = new List<string>();
} 