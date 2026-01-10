namespace Investa.Application.Services;

public interface ICredibilityService
{
    Task<int> GetCredibilityScoreAsync(Guid userId);
    Task UpdateCredibilityScoreAsync(Guid userId, int newScore);
}