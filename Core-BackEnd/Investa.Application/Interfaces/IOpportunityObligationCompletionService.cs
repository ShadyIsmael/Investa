using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IOpportunityObligationCompletionService
{
    Task<OpportunityObligationCompletionDto> GetAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<OpportunityObligationCompletionDto> InitiateAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<OpportunityObligationCompletionDto> ConfirmAsync(Guid actorId, int opportunityId, int participationRequestId, ConfirmObligationCompletionRequest request, CancellationToken cancellationToken = default);
}
