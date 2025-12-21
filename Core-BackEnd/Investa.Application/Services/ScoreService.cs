using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public class ScoreService : IScoreService
{
    private readonly IUnitOfWork _unitOfWork;

    public ScoreService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> GetCredibilityScoreAsync(int userId)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        return user?.CredibilityScore ?? 0;
    }

    public async Task UpdateCredibilityScoreAsync(int userId, int newScore)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user != null)
        {
            user.CredibilityScore = newScore;
            await _unitOfWork.Repository<User>().UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}