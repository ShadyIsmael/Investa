using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface INegotiationService
{
    Task<OpportunityViewerStateDto> GetOpportunityViewerStateAsync(Guid userId, int opportunityId, Guid? conversationId = null, CancellationToken cancellationToken = default, bool isAdmin = false);
    Task<NegotiationConversationRequestDto> RequestConversationAsync(Guid investorId, int opportunityId, CreateNegotiationConversationRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationConversationRequestDto>> GetMyConversationRequestsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationConversationDto>> GetMyConversationsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationDetailDto> GetConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationMessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<int> MarkMessagesReadAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<NegotiationMessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendNegotiationMessageRequest request, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> AcceptConversationRequestAsync(Guid founderId, Guid requestId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> RejectConversationRequestAsync(Guid founderId, Guid requestId, RejectNegotiationRequest request, CancellationToken cancellationToken = default);
    Task<NegotiationConversationRequestDto> WithdrawConversationRequestAsync(Guid investorId, Guid requestId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationDto> CloseConversationAsync(Guid userId, Guid conversationId, CloseNegotiationConversationRequest request, CancellationToken cancellationToken = default);
    Task HideConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<NegotiationConversationDto> MarkReadyToProceedAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationOfferDto>> GetOffersAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> SendOfferAsync(Guid userId, Guid conversationId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> ReplaceOfferAsync(Guid userId, Guid conversationId, int offerId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default);
    Task<AcceptOfferResultDto> AcceptOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> RejectOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> WithdrawOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationOfferDto>> GetDirectOffersAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NegotiationOfferDto>> GetDirectInboxAsync(Guid userId, bool incoming, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> SubmitDirectOfferAsync(Guid userId, int opportunityId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> AcceptDirectOfferAsync(Guid userId, int opportunityId, int offerId, CancellationToken cancellationToken = default);
    Task<NegotiationOfferDto> RejectDirectOfferAsync(Guid userId, int opportunityId, int offerId, CancellationToken cancellationToken = default);
}
