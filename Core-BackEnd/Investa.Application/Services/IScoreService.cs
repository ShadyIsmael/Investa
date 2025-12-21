namespace Investa.Application.Services;

public interface IScoreService
{
    Task<int> GetCredibilityScoreAsync(int userId);
    Task UpdateCredibilityScoreAsync(int userId, int newScore);
}