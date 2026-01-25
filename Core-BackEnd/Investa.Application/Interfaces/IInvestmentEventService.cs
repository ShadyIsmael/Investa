using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs.Investments;

namespace Investa.Application.Interfaces;

public interface IInvestmentEventService
{
    Task<InvestmentEventDto> AppendEventAsync(int investmentId, CreateInvestmentEventDto dto);
    Task<IEnumerable<InvestmentEventDto>> GetByInvestmentAsync(int investmentId);
}