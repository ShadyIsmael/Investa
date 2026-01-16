using Investa.Domain.Entities;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IInvestmentService
{
    Task<bool> InvestInProjectAsync(Guid investorId, int projectId, decimal amount);
    Task<Investment> CreateAsync(CreateInvestmentDto dto);
    Task<bool> UpdateAsync(int id, UpdateInvestmentDto dto);
    Task<Investment?> GetByIdAsync(int id);
    Task<IEnumerable<Investment>> GetByCategoryAsync(int? categoryId);
}
