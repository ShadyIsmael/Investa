using Investa.Application.DTOs;
using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IInvestmentContractService
{
    Task GenerateForApprovedParticipationAsync(Opportunity opportunity, OpportunityJoinRequest request, DateTime approvedAt, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InvestmentContractSummaryDto>> GetOpportunityContractsAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default, bool isAdmin = false);
    Task<InvestmentContractDetailDto> GetContractAsync(Guid userId, int contractId, CancellationToken cancellationToken = default);
    Task<InvestmentContractVersionDto> GetVersionAsync(Guid userId, int contractId, int versionNumber, CancellationToken cancellationToken = default);
    Task<InvestmentContractDocumentDto> GetDocumentAsync(Guid userId, int contractId, int versionNumber, CancellationToken cancellationToken = default);
    Task<InvestmentContractPdfDto> GetPdfAsync(Guid userId, int contractId, int versionNumber, CancellationToken cancellationToken = default);
    Task<EmailInvestmentContractResultDto> EmailContractAsync(Guid userId, int contractId, int versionNumber, string language, Guid operationId, CancellationToken cancellationToken = default);
}
