using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface ICountryService
{
    Task<IReadOnlyList<CountryAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<CountryAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CountryAdminDto> CreateAsync(CreateCountryRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<CountryAdminDto?> UpdateAsync(int id, UpdateCountryRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<CountryAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default);
    Task<string?> NormalizeActiveSelectionAsync(string? value, string? existingValue = null, CancellationToken cancellationToken = default);
}
