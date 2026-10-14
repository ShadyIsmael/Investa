using Investa.Application.DTOs;
using Investa.Domain.Entities.Company;

namespace Investa.Application.Interfaces;

public interface ICompanyCustomerService
{
    Task<CompanyCustomerPageDto> ListAsync(CompanyCustomerListQuery query, CancellationToken cancellationToken = default);
    Task<CompanyCustomerDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompanyCustomerDetailDto> CreateAsync(CompanyCustomerUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCustomerDetailDto?> UpdateAsync(Guid id, CompanyCustomerUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCustomerDetailDto?> SetStatusAsync(Guid id, CompanyCustomerStatus status, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCustomerContactDto?> AddContactAsync(Guid customerId, CompanyCustomerContactRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCustomerContactDto?> UpdateContactAsync(Guid customerId, Guid contactId, CompanyCustomerContactRequest request, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCustomerContactDto?> SetContactStatusAsync(Guid customerId, Guid contactId, bool isActive, CancellationToken cancellationToken = default, Guid? actorId = null);
    Task<CompanyCustomerContactDto?> SetPrimaryContactAsync(Guid customerId, Guid contactId, CancellationToken cancellationToken = default, Guid? actorId = null);
}
