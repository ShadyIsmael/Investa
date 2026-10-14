using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IOpportunityTagAdminService
{
    Task<IReadOnlyList<OpportunityTagAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<OpportunityTagAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<OpportunityTagAdminDto> CreateAsync(CreateOpportunityTagRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<OpportunityTagAdminDto?> UpdateAsync(int id, UpdateOpportunityTagRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<OpportunityTagAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default);
}
