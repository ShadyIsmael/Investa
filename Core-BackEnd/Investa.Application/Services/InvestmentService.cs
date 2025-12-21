using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IUnitOfWork _unitOfWork;

    public InvestmentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> InvestInProjectAsync(int investorId, int projectId, decimal amount)
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

            // Create investment
            var investment = new Investment
            {
                InvestorId = investorId,
                ProjectId = projectId,
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
}