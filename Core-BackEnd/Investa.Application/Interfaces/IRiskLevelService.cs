using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IRiskLevelService
{
    Task<IReadOnlyList<RiskLevelAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<RiskLevelAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<RiskLevelAdminDto> CreateAsync(CreateRiskLevelRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<RiskLevelAdminDto?> UpdateAsync(int id, UpdateRiskLevelRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<RiskLevelAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default);
    Task<string?> ValidateActiveCodeAsync(string? code, bool required = false, CancellationToken cancellationToken = default);
}
