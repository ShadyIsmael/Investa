using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface ILoanObligationService
{
    /// <summary>
    /// Adds the immutable contractual obligation when confirmed external funding
    /// first makes the accepted Loan participation trackable. Partial funding
    /// creates a PendingFunding obligation without installments; full confirmed
    /// funding activates it and persists the schedule exactly once. Unsupported
    /// mixed-leg Participations remain a no-op.
    /// </summary>
    Task<LoanObligation?> EnsureActivatedForConfirmedFundingAsync(
        int participationRequestId,
        Guid activatedByUserId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<int, IReadOnlyList<LoanObligation>>> GetByParticipationAsync(
        IEnumerable<int> participationRequestIds,
        CancellationToken cancellationToken = default);
}
