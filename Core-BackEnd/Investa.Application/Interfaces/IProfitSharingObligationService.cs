using Investa.Application.DTOs;
using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IProfitSharingObligationService
{
    Task<ProfitSharingObligation?> EnsureActivatedForConfirmedFundingAsync(int participationRequestId, Guid activatedByUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<int, IReadOnlyList<ProfitSharingObligation>>> GetByParticipationAsync(IEnumerable<int> participationRequestIds, CancellationToken cancellationToken = default);
    Task<ProfitSharingSummaryDto> GetForParticipationAsync(Guid actorId, int opportunityId, int participationId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<ProfitSharingDeclarationDto> DeclareAsync(Guid founderId, int opportunityId, int obligationId, int reportingPeriodId, ProfitSharingDeclarationCreateCommand command, CancellationToken cancellationToken = default);
    Task<ProfitSharingEvidenceDownload> DownloadEvidenceAsync(Guid actorId, int declarationId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<ProfitSharingDistributionDeclarationDto> DeclareDistributionAsync(Guid founderId, int opportunityId, int obligationId, int reportingPeriodId, ProfitSharingDistributionCreateCommand command, CancellationToken cancellationToken = default);
    Task<ProfitSharingDistributionDeclarationDto> ConfirmDistributionAsync(Guid investorId, int declarationId, string? comment, CancellationToken cancellationToken = default);
    Task<ProfitSharingDistributionDeclarationDto> DisputeDistributionAsync(Guid investorId, int declarationId, string reason, CancellationToken cancellationToken = default);
    Task<ProfitSharingEvidenceDownload> DownloadDistributionEvidenceAsync(Guid actorId, int declarationId, bool isAdmin = false, CancellationToken cancellationToken = default);
}

public interface IProfitSharingLifecycleService
{
    Task<ProfitSharingLifecycleProcessResultDto> ProcessLifecycleAsync(DateTime? asOfUtc = null, CancellationToken cancellationToken = default);
    Task<ProfitSharingObligationDto> CloseAsync(Guid actorId, int obligationId, string reason, bool isAuthorizedOperator, CancellationToken cancellationToken = default);
}
