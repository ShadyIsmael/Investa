using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface ICompanyContractService
{
    Task<CompanyContractPageDto> ListAsync(CompanyContractListQuery request, CancellationToken cancellationToken = default);
    Task<CompanyContractDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompanyContractDetailDto?> GetBySourceQuotationAsync(Guid quotationId, CancellationToken cancellationToken = default);
    Task<CompanyContractDetailDto> CreateFromQuotationAsync(CompanyContractFromQuotationRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyContractDetailDto?> UpdateDraftAsync(Guid id, CompanyContractMetadataUpdateRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyContractDetailDto?> ActivateAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyContractDetailDto?> CompleteAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyContractDetailDto?> TerminateAsync(Guid id, string terminationReason, CancellationToken cancellationToken = default, Guid? actorId = null);
}
