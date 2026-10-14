using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IFundingGoalAdminService
{
    Task<IReadOnlyList<FundingGoalAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<FundingGoalAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<FundingGoalAdminDto> CreateAsync(CreateFundingGoalRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<FundingGoalAdminDto?> UpdateAsync(int id, UpdateFundingGoalRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<FundingGoalAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default);
}
