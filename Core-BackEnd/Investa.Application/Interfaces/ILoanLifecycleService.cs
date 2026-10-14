using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface ILoanLifecycleService
{
    Task<LoanLifecycleProcessResultDto> ProcessAsync(DateTime? asOfUtc = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<int, LoanLifecycleSnapshotDto>> GetSnapshotsByObligationAsync(IEnumerable<int> obligationIds, CancellationToken cancellationToken = default);
    Task<LoanLifecycleSnapshotDto> MarkDefaultAsync(Guid actorId, int loanObligationId, string reason, bool isAuthorizedOperator, CancellationToken cancellationToken = default);
    Task<LoanLifecycleSnapshotDto> CloseAsync(Guid actorId, int loanObligationId, string reason, bool isAuthorizedOperator, CancellationToken cancellationToken = default);
}
