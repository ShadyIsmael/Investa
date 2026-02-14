using Investa.Domain.Entities;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IInvestmentService
{
    Task<bool> PurchaseSharesAsync(Guid investorId, int investmentId, int sharesPurchased);
    Task<Investment> CreateAsync(CreateInvestmentDto dto);
    Task<bool> UpdateAsync(int id, UpdateInvestmentDto dto);
    Task<Investment?> GetByIdAsync(int id);
    Task<IEnumerable<Investment>> GetByCategoryAsync(int? categoryId);
    Task<IEnumerable<Investment>> GetMyInvestmentsAsync(Guid founderId);
    Task<IEnumerable<InvestmentParticipant>> GetParticipantsAsync(int investmentId);
}
