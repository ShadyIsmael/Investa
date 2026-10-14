using Investa.Application.DTOs;
using Investa.Domain.Entities.Company;

namespace Investa.Application.Interfaces;

public interface ICompanySalesOpportunityService
{
    Task<CompanySalesOpportunityPageDto> ListAsync(CompanySalesOpportunityListQuery query, CancellationToken cancellationToken = default);
    Task<CompanySalesOpportunityDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompanySalesOpportunityDetailDto> CreateAsync(CompanySalesOpportunityUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanySalesOpportunityDetailDto?> UpdateAsync(Guid id, CompanySalesOpportunityUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanySalesOpportunityDetailDto?> SetStageAsync(Guid id, CompanySalesOpportunityStage stage, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanySalesOpportunityDetailDto?> MarkWonAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanySalesOpportunityDetailDto?> MarkLostAsync(Guid id, string lostReason, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<IReadOnlyList<CompanySalesOpportunityCustomerLookupDto>> CustomerLookupAsync(string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanySalesOpportunityContactLookupDto>> ContactLookupAsync(Guid customerId, string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanySalesOpportunityCatalogLookupDto>> CatalogLookupAsync(string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanySalesOpportunityOwnerLookupDto>> OwnerLookupAsync(string? search, CancellationToken cancellationToken = default);
}
