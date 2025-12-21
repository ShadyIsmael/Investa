using Investa.Application.DTOs;
using Investa.Domain.Entities.Enums;
using System.Collections.Generic;

namespace Investa.Application.Services;

public interface ILookupService
{
    Task<IEnumerable<LookupDto>> GetByTypeAsync(LookupType type);
    Task<IEnumerable<LookupDto>> GetAllAsync();

    Task<LookupDto> CreateAsync(CreateLookupDto dto);
    Task<bool> UpdateAsync(int id, UpdateLookupDto dto);
    Task<bool> DeleteAsync(int id);
}
