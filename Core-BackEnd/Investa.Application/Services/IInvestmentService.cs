using Investa.Domain.Entities;

namespace Investa.Application.Services;

public interface IInvestmentService
{
    Task<bool> InvestInProjectAsync(int investorId, int projectId, decimal amount);
}