using System.Collections.Generic;
using Investa.Application.DTOs;

namespace Investa.Application.Services;

    using System;
    using System.Collections.Generic;

    [Obsolete("IInvestmentOpportunityService is obsolete. Use investment endpoints/services that operate on `Investment`.")]
    public interface IInvestmentOpportunityService
    {
        // Retained for compatibility only.
        Task<IEnumerable<Investa.Application.DTOs.InvestmentOpportunityDto>> GetAllAsync();
        Task<Investa.Application.DTOs.InvestmentOpportunityDto?> GetByIdAsync(int id);
        Task<Investa.Application.DTOs.InvestmentOpportunityDto> CreateAsync(Investa.Application.DTOs.CreateInvestmentOpportunityDto dto);
        Task<bool> UpdateAsync(int id, Investa.Application.DTOs.UpdateInvestmentOpportunityDto dto);
        Task<bool> DeleteAsync(int id); // Retained for compatibility
    }
