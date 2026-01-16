using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IScoreService
{
    Task<ScoreTransactionDto> CreateScoreTransactionAsync(Guid userId, decimal score, int transactionTypeId, Guid? reviewerId = null);
    Task<IEnumerable<ScoreTransactionDto>> GetClientScoreTransactionsAsync(Guid userId);

    // Credibility helpers (used across API)
    Task<int> GetCredibilityScoreAsync(Guid userId);
    Task UpdateCredibilityScoreAsync(Guid userId, int newScore);
}