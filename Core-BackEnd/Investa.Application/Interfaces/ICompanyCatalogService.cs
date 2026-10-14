using Investa.Application.DTOs;
using Investa.Domain.Entities.Company;

namespace Investa.Application.Interfaces;

public interface ICompanyCatalogService
{
    Task<CompanyCatalogItemPageDto> ListAsync(CompanyCatalogListQuery query, CancellationToken cancellationToken = default);
    Task<CompanyCatalogItemDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompanyCatalogItemDetailDto> CreateAsync(CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCatalogItemDetailDto?> UpdateAsync(Guid id, CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCatalogItemDetailDto?> SetStatusAsync(Guid id, CompanyCatalogItemStatus status, CancellationToken cancellationToken = default, Guid? actorId = null);
}
