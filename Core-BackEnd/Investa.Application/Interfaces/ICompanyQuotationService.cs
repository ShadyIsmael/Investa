using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface ICompanyQuotationService
{
    Task<CompanyQuotationPageDto> ListAsync(CompanyQuotationListQuery query, CancellationToken cancellationToken = default);
    Task<CompanyQuotationDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompanyQuotationDetailDto> CreateAsync(CompanyQuotationUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyQuotationDetailDto?> UpdateAsync(Guid id, CompanyQuotationUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyQuotationDetailDto?> MarkSentAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyQuotationDetailDto?> MarkAcceptedAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyQuotationDetailDto?> MarkRejectedAsync(Guid id, string rejectionReason, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<IReadOnlyList<CompanyQuotationCustomerLookupDto>> CustomerLookupAsync(string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyQuotationContactLookupDto>> ContactLookupAsync(Guid customerId, string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyQuotationOpportunityLookupDto>> OpportunityLookupAsync(Guid? customerId, string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyQuotationCatalogLookupDto>> CatalogLookupAsync(string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyQuotationCurrencyLookupDto>> CurrencyLookupAsync(string? search, CancellationToken cancellationToken = default);
}
