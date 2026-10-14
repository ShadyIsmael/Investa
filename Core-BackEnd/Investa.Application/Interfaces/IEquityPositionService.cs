using Investa.Application.DTOs;
using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IEquityPositionService
{
    Task<EquityPosition?> EnsurePendingForAcceptedContractAsync(int participationRequestId, Guid actorUserId, CancellationToken cancellationToken = default);
    Task<EquityPosition?> EnsureActivatedForConfirmedFundingAsync(int participationRequestId, Guid activatedByUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<int, IReadOnlyList<EquityPosition>>> GetByParticipationAsync(IEnumerable<int> participationRequestIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EquityPositionDto>> GetForParticipationAsync(Guid actorId, int opportunityId, int participationId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EquityHoldingLedgerEntryDto>> GetHistoryAsync(Guid actorId, int positionId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<EquityOwnershipAtDateDto> GetOwnershipAtDateAsync(Guid actorId, int positionId, DateTime asOf, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EquityPositionDto>> GetCapitalizationAsync(Guid actorId, int opportunityId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<EquityCorporateEventDto> CreateCorporateEventAsync(Guid actorId, CreateEquityCorporateEventRequest request, bool isAdmin, CancellationToken cancellationToken = default);
    Task<EquityCorporateEventDto> SubmitCorporateEventAsync(Guid actorId, int eventId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<EquityCorporateEventDto> ApproveCorporateEventAsync(Guid actorId, int eventId, bool isAdmin, bool approve, string? reason, CancellationToken cancellationToken = default);
    Task<EquityCorporateEventDto> ApplyCorporateEventAsync(Guid actorId, int eventId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EquityCorporateEventDto>> GetCorporateEventsAsync(Guid actorId, int opportunityId, bool isAdmin = false, CancellationToken cancellationToken = default);
}
