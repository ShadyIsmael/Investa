using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Investa.Application.Services;

[Obsolete("InvestmentOpportunityService is obsolete. Use investment services operating on `Investment`.")]
public class InvestmentOpportunityService : IInvestmentOpportunityService
{
    public Task<IEnumerable<Investa.Application.DTOs.InvestmentOpportunityDto>> GetAllAsync()
        => Task.FromResult<IEnumerable<Investa.Application.DTOs.InvestmentOpportunityDto>>(Array.Empty<Investa.Application.DTOs.InvestmentOpportunityDto>());

    public Task<Investa.Application.DTOs.InvestmentOpportunityDto?> GetByIdAsync(int id)
        => Task.FromResult<Investa.Application.DTOs.InvestmentOpportunityDto?>(null);

    public Task<Investa.Application.DTOs.InvestmentOpportunityDto> CreateAsync(Investa.Application.DTOs.CreateInvestmentOpportunityDto dto)
        => Task.FromException<Investa.Application.DTOs.InvestmentOpportunityDto>(new NotSupportedException("InvestmentOpportunity creation is deprecated. Use Investment endpoints."));

    public Task<bool> UpdateAsync(int id, Investa.Application.DTOs.UpdateInvestmentOpportunityDto dto)
        => Task.FromResult(false);

    public Task<bool> DeleteAsync(int id)
        => Task.FromResult(false);
}
