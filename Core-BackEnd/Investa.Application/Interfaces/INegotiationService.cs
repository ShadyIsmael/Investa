using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface INegotiationService
{
    Task<OpportunityViewerStateDto> GetOpportunityViewerStateAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> RequestConversationAsync(Guid investorId, int opportunityId, CreateNegotiationConversationRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationConversationRequestDto>> GetMyConversationRequestsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationConversationDto>> GetMyConversationsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationDetailDto> GetConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationMessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<NegotiationMessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendNegotiationMessageRequest request, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> AcceptConversationRequestAsync(Guid founderId, Guid requestId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> RejectConversationRequestAsync(Guid founderId, Guid requestId, RejectNegotiationRequest request, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> WithdrawConversationRequestAsync(Guid investorId, Guid requestId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationDto> CloseConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationDto> MarkReadyToProceedAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
}
