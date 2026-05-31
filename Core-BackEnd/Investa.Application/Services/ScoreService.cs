using AutoMapper;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public class ScoreService : IScoreService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ScoreService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    // --- Existing helpers for credibility score (kept for backward compatibility)
    public async Task<int> GetCredibilityScoreAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(userId);
        return user?.CredibilityScore ?? 0;
    }

    public async Task UpdateCredibilityScoreAsync(Guid userId, int newScore)
    {
        var user = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(userId);
        if (user != null)
        {
            user.CredibilityScore = newScore;
            await _unitOfWork.Repository<AuthUser>().UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    // --- New API: create score transaction and update client profile score atomically
    public async Task<ScoreTransactionDto> CreateScoreTransactionAsync(Guid userId, decimal score, int transactionTypeId, Guid? reviewerId = null)
    {
        // Find client record by user id
        var client = (await _unitOfWork.Repository<Client>().FindAsync(c => c.UserId == userId)).FirstOrDefault();
        if (client == null) throw new InvalidOperationException($"Client for user id {userId} not found");

        // Validate lookup transaction type exists and is of correct LookupType
        var lookup = await _unitOfWork.Repository<Lookup>().GetByIdAsync(transactionTypeId);
        if (lookup == null || lookup.Type != LookupType.ScoreTransaction)
            throw new InvalidOperationException($"Invalid score transaction type id {transactionTypeId}");

        var st = new ScoreTransaction
        {
            UserId = userId,
            Score = score,
            TransactionTypeId = transactionTypeId,
            ReviewerId = reviewerId,
            CreatedAt = DateTime.UtcNow
        };

        // Use a transaction to ensure both insert and client update are atomic
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            await _unitOfWork.Repository<ScoreTransaction>().AddAsync(st);

            // Update client profile score (score is treated as a delta)
            client.Score += score;
            await _unitOfWork.Repository<Client>().UpdateAsync(client);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }

        return _mapper.Map<ScoreTransactionDto>(st);
    }

    public async Task<IEnumerable<ScoreTransactionDto>> GetClientScoreTransactionsAsync(Guid userId)
    {
        var transactions = await _unitOfWork.Repository<ScoreTransaction>().FindAsync(st => st.UserId == userId);
        return transactions.Select(tx => _mapper.Map<ScoreTransactionDto>(tx));
    }
}
