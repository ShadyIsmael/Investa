using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Application.DTOs;

namespace Investa.Application.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IUnitOfWork _unitOfWork;

    public InvestmentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> InvestInProjectAsync(Guid investorId, int projectId, decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Investment amount must be positive.");

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            // Get investor
            var investor = await _unitOfWork.Repository<User>().GetByIdAsync(investorId);
            if (investor == null)
                throw new Exception("Investor not found.");

            // Check balance
            if (investor.WalletBalance < amount)
                throw new Exception("Insufficient balance.");

            // Get project
            var project = await _unitOfWork.Repository<Project>().GetByIdAsync(projectId);
            if (project == null)
                throw new Exception("Project not found.");

            // Deduct from wallet
            investor.WalletBalance -= amount;

            // Update project current amount
            project.CurrentAmount += amount;

            // Create investment (no longer stores ProjectId)
            var investment = new Investment
            {
                InvestorId = investorId,
                Amount = amount,
                Date = DateTime.UtcNow
            };

            // Create transaction
            var transaction = new Transaction
            {
                WalletId = investorId,
                Amount = amount,
                Type = TransactionType.Investment,
                Timestamp = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Investment>().AddAsync(investment);
            await _unitOfWork.Repository<Transaction>().AddAsync(transaction);
            await _unitOfWork.Repository<User>().UpdateAsync(investor);
            await _unitOfWork.Repository<Project>().UpdateAsync(project);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Investment> CreateAsync(CreateInvestmentDto dto)
    {
        var entity = new Investment
        {
            InvestorId = dto.InvestorId,
            Amount = dto.Amount,
            Date = DateTime.UtcNow,
            BusinessName = dto.BusinessName,
            Description = dto.Description,
            StartDate = dto.StartDate,
            BusinessStageId = dto.BusinessStageId,
            BusinessCategoryId = dto.BusinessCategoryId,
            ProjectPhaseId = dto.ProjectPhaseId,
            TargetFund = dto.TargetFund
        };

        await _unitOfWork.Repository<Investment>().AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> UpdateAsync(int id, UpdateInvestmentDto dto)
    {
        var repo = _unitOfWork.Repository<Investment>();
        var entity = await repo.GetByIdAsync(id);
        if (entity == null) return false;

        if (dto.Amount.HasValue) entity.Amount = dto.Amount.Value;
        if (dto.BusinessName != null) entity.BusinessName = dto.BusinessName;
        if (dto.Description != null) entity.Description = dto.Description;
        if (dto.StartDate.HasValue) entity.StartDate = dto.StartDate;
        if (dto.BusinessStageId.HasValue) entity.BusinessStageId = dto.BusinessStageId;
        if (dto.BusinessCategoryId.HasValue) entity.BusinessCategoryId = dto.BusinessCategoryId;
        if (dto.ProjectPhaseId.HasValue) entity.ProjectPhaseId = dto.ProjectPhaseId;
        if (dto.TargetFund.HasValue) entity.TargetFund = dto.TargetFund;

        await repo.UpdateAsync(entity);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<Investment?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Repository<Investment>().GetByIdAsync(id);
    }

    public async Task<IEnumerable<Investment>> GetByCategoryAsync(int? categoryId)
    {
        if (!categoryId.HasValue)
            return await _unitOfWork.Repository<Investment>().GetAllAsync();

        return await _unitOfWork.Repository<Investment>().FindAsync(i => i.BusinessCategoryId == categoryId);
    }
}