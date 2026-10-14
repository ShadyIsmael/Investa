using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface ICurrencyAdminService
{
    Task<IReadOnlyList<CurrencyAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<CurrencyAdminDto?> GetAsync(string isoCode, CancellationToken cancellationToken = default);
    Task<CurrencyAdminDto> CreateAsync(CreateCurrencyRequest request, Guid actorId, CancellationToken cancellationToken = default);
    Task<CurrencyAdminDto> UpdateAsync(string isoCode, UpdateCurrencyRequest request, Guid actorId, CancellationToken cancellationToken = default);
    Task<CurrencyAdminDto> SetActiveAsync(string isoCode, bool isActive, Guid actorId, CancellationToken cancellationToken = default);
}
