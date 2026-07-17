using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public class NegotiationService : INegotiationService
{
    private static readonly OpportunityStatus[] JoinEligibleStatuses =
    {
        OpportunityStatus.Published,
        OpportunityStatus.Funding,
        OpportunityStatus.FullyFunded,
        OpportunityStatus.InProgress
    };

    private readonly IUnitOfWork _uow;
    private readonly IPaidActionService _paidActionService;
    private readonly IReputationService _reputationService;

    public NegotiationService(IUnitOfWork uow, IPaidActionService paidActionService, IReputationService reputationService)
    {
        _uow = uow;
        _paidActionService = paidActionService;
        _reputationService = reputationService;
    }

    public async Task<OpportunityViewerStateDto> GetOpportunityViewerStateAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view opportunity state.");
        var opportunity = await GetOpportunityAsync(opportunityId);
        var isFounder = opportunity.FounderId == userId;

        var conversations = (await _uow.Repository<Conversation>().FindWithIncludesAsync(
                c => c.OpportunityId == opportunityId
                     && (c.FounderId == userId || c.InvestorId == userId),
                c => c.ParticipationRequest!))
            .Where(c => c.Status != ConversationStatus.Requested
                        && ((c.FounderId == userId && c.IsVisibleToFounder) || (c.InvestorId == userId && c.IsVisibleToInvestor)))
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .ToList();

        var conversation = conversations.FirstOrDefault();
        var conversationRequests = await _uow.Repository<ConversationRequest>().FindAsync(r =>
            r.OpportunityId == opportunityId
            && (r.RequesterUserId == userId || r.RecipientUserId == userId));

        var conversationRequest = conversationRequests
            .OrderByDescending(r => r.UpdatedAt ?? r.RespondedAt ?? r.CreatedAt)
            .FirstOrDefault();
        var participationRequest = conversation?.ParticipationRequest;

        if (participationRequest == null)
        {
            var requestCandidates = await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId
                && (isFounder || r.InvestorId == userId)
                && (isFounder ? r.IsVisibleToFounder : r.IsVisibleToInvestor));

            participationRequest = requestCandidates
                .OrderByDescending(r => r.UpdatedAt)
                .FirstOrDefault();
        }

        var participationStatus = participationRequest?.Status;
        var isApprovedParticipant = !isFounder && participationStatus == OpportunityJoinRequestStatus.Approved;
        var canContinueConversation = conversation != null && CanContinue(conversation);
        var hasActiveConversation = conversation is { IsActive: true };
        var hasActiveParticipation = participationStatus is OpportunityJoinRequestStatus.Pending or OpportunityJoinRequestStatus.Approved;
        var hasPendingConversationRequest = conversationRequest?.Status == ConversationRequestStatus.Pending;

        return new OpportunityViewerStateDto
        {
            OpportunityId = opportunityId,
            IsFounder = isFounder,
            HasConversationRequest = conversationRequest != null,
            ConversationRequestId = conversationRequest?.Id,
            ConversationRequestStatus = conversationRequest?.Status,
            ConversationRequestStatusText = conversationRequest == null ? null : ToRequestStatusText(conversationRequest.Status),
            HasConversation = conversation != null,
            ConversationId = conversation?.Id,
            ConversationStatus = conversation?.Status,
            ConversationStatusText = conversation == null ? null : ToStatusText(conversation.Status, participationStatus),
            FounderReady = conversation?.FounderReady ?? false,
            InvestorReady = conversation?.InvestorReady ?? false,
            CanRequestChat = !isFounder
                && JoinEligibleStatuses.Contains(opportunity.Status)
                && !hasActiveConversation
                && !hasPendingConversationRequest
                && !hasActiveParticipation,
            CanContinueConversation = canContinueConversation,
            CanMarkReadyToProceed = canContinueConversation
                && conversation!.Status is ConversationStatus.Negotiation or ConversationStatus.Accepted,
            ParticipationRequestId = participationRequest?.Id,
            ParticipationStatus = participationStatus,
            HasPendingParticipationRequest = participationStatus == OpportunityJoinRequestStatus.Pending,
            CanApproveParticipation = isFounder && participationStatus == OpportunityJoinRequestStatus.Pending,
            CanRejectParticipation = isFounder && participationStatus == OpportunityJoinRequestStatus.Pending,
            ProjectRoomUnlocked = isFounder || isApprovedParticipant,
            CanOpenProjectRoom = isFounder || isApprovedParticipant
        };
    }

    public async Task<NegotiationConversationRequestDto> RequestConversationAsync(Guid investorId, int opportunityId, CreateNegotiationConversationRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(investorId, "Only authenticated clients can request a negotiation.");
        var opportunity = await GetOpportunityAsync(opportunityId);

        if (opportunity.FounderId == investorId)
            throw new BusinessValidationException("FOUNDER_CANNOT_REQUEST_NEGOTIATION", "Founder cannot request negotiation for their own opportunity.");

        if (!JoinEligibleStatuses.Contains(opportunity.Status))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for negotiation requests.");

        var existingConversation = (await _uow.Repository<Conversation>().FindAsync(c =>
                c.OpportunityId == opportunityId
                && c.FounderId == opportunity.FounderId
                && c.InvestorId == investorId
                && c.IsActive
                && c.Status != ConversationStatus.Requested))
            .FirstOrDefault();

        if (existingConversation != null)
            throw new BusinessValidationException("DUPLICATE_ACTIVE_CONVERSATION", "An active negotiation conversation already exists for this opportunity.");

        var existingRequest = (await _uow.Repository<ConversationRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId
                && r.RequesterUserId == investorId
                && r.RecipientUserId == opportunity.FounderId
                && r.Status == ConversationRequestStatus.Pending))
            .FirstOrDefault();

        if (existingRequest != null)
            throw new BusinessValidationException("DUPLICATE_PENDING_CONVERSATION_REQUEST", "A pending conversation request already exists for this opportunity.");

        var now = DateTime.UtcNow;
        var conversationRequest = new ConversationRequest
        {
            Id = Guid.NewGuid(),
            OpportunityId = opportunityId,
            RequesterUserId = investorId,
            RecipientUserId = opportunity.FounderId,
            Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
            Status = ConversationRequestStatus.Pending
        };

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _paidActionService.ChargeAsync(
                    investorId,
                    PricingAction.SendConversationRequest,
                    ReferenceType.ConversationRequest,
                    conversationRequest.Id.ToString(),
                    cancellationToken);

                await _uow.Repository<ConversationRequest>().AddAsync(conversationRequest);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    investorId,
                    "SendConversationRequest",
                    "ConversationRequest",
                    conversationRequest.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        return await GetConversationRequestSummaryAsync(conversationRequest.Id, investorId);
    }

    public async Task<IReadOnlyList<NegotiationConversationRequestDto>> GetMyConversationRequestsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view negotiation requests.");
        var requests = await _uow.Repository<ConversationRequest>().FindWithIncludesAsync(
            r => r.RequesterUserId == userId || r.RecipientUserId == userId,
            r => r.Opportunity!,
            r => r.Requester!,
            r => r.Recipient!);

        return requests
            .OrderByDescending(r => r.UpdatedAt ?? r.RespondedAt ?? r.CreatedAt)
            .Select(r => ToConversationRequestDto(r, userId))
            .ToList();
    }

    public async Task<IReadOnlyList<NegotiationConversationDto>> GetMyConversationsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view negotiations.");
        var conversations = await _uow.Repository<Conversation>().FindWithIncludesAsync(
            c => c.Status != ConversationStatus.Requested
                 && ((c.FounderId == userId && c.IsVisibleToFounder) || (c.InvestorId == userId && c.IsVisibleToInvestor)),
            c => c.Opportunity!,
            c => c.Founder!,
            c => c.Investor!,
            c => c.ParticipationRequest!);

        return conversations
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .Select(c => ToConversationDto(c, userId))
            .ToList();
    }

    public async Task<NegotiationConversationDetailDto> GetConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        var dto = ToConversationDetailDto(conversation, userId);
        dto.Messages = await GetMessagesAsync(userId, conversationId, cancellationToken);
        return dto;
    }

    public async Task<IReadOnlyList<NegotiationMessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        await GetAuthorizedConversationAsync(userId, conversationId);
        var messages = await _uow.Repository<ChatMessage>().FindAsync(m => m.ConversationId == conversationId);
        return messages
            .OrderBy(m => m.Timestamp)
            .Select(ToMessageDto)
            .ToList();
    }

    public async Task<NegotiationMessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendNegotiationMessageRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        if (!CanContinue(conversation))
            throw new BusinessValidationException("CONVERSATION_READ_ONLY", "This conversation is read-only.");

        var now = DateTime.UtcNow;
        var message = await AddMessageAsync(conversation.Id, userId, request.Message.Trim(), now);
        conversation.UpdatedAt = now;
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();
        return ToMessageDto(message);
    }

    public async Task<NegotiationConversationRequestDto> AcceptConversationRequestAsync(Guid founderId, Guid requestId, CancellationToken cancellationToken = default)
    {
        var conversationRequest = await GetAuthorizedConversationRequestAsync(founderId, requestId);
        EnsureRecipient(conversationRequest, founderId);

        if (conversationRequest.Status == ConversationRequestStatus.Accepted && conversationRequest.AcceptedConversationId.HasValue)
            return await GetConversationRequestSummaryAsync(conversationRequest.Id, founderId);

        if (conversationRequest.Status != ConversationRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_CONVERSATION_REQUEST_STATUS", "Only pending conversation requests can be accepted.");

        var existingConversation = (await _uow.Repository<Conversation>().FindAsync(c =>
                c.ConversationRequestId == conversationRequest.Id
                || (c.OpportunityId == conversationRequest.OpportunityId
                    && c.FounderId == conversationRequest.RecipientUserId
                    && c.InvestorId == conversationRequest.RequesterUserId
                    && c.IsActive
                    && c.Status != ConversationStatus.Requested)))
            .FirstOrDefault();

        var now = DateTime.UtcNow;
        if (existingConversation == null)
        {
            existingConversation = new Conversation
            {
                Id = Guid.NewGuid(),
                ConversationRequestId = conversationRequest.Id,
                UserMobile = $"{conversationRequest.OpportunityId}:{conversationRequest.RecipientUserId}:{conversationRequest.RequesterUserId}",
                Category = "Opportunity Negotiation",
                OpportunityId = conversationRequest.OpportunityId,
                FounderId = conversationRequest.RecipientUserId,
                InvestorId = conversationRequest.RequesterUserId,
                CreatedAt = now,
                UpdatedAt = now,
                Status = ConversationStatus.Negotiation,
                IsActive = true,
                IsVisibleToFounder = true,
                IsVisibleToInvestor = true
            };

            await _uow.Repository<Conversation>().AddAsync(existingConversation);
            await AddParticipantAsync(existingConversation.Id, conversationRequest.RecipientUserId, role: 1);
            await AddParticipantAsync(existingConversation.Id, conversationRequest.RequesterUserId, role: 0);
        }

        conversationRequest.Status = ConversationRequestStatus.Accepted;
        conversationRequest.AcceptedConversationId = existingConversation.Id;
        conversationRequest.RespondedAt = now;
        conversationRequest.UpdatedAt = now;
        await _uow.Repository<ConversationRequest>().UpdateAsync(conversationRequest);
        await _uow.SaveChangesAsync();
        await ApplyReputationActivitySafeAsync(
            founderId,
            "AcceptConversationRequest",
            "ConversationRequest",
            conversationRequest.Id.ToString());
        return await GetConversationRequestSummaryAsync(conversationRequest.Id, founderId);
    }

    public async Task<NegotiationConversationRequestDto> RejectConversationRequestAsync(Guid founderId, Guid requestId, RejectNegotiationRequest request, CancellationToken cancellationToken = default)
    {
        var conversationRequest = await GetAuthorizedConversationRequestAsync(founderId, requestId);
        EnsureRecipient(conversationRequest, founderId);
        if (conversationRequest.Status != ConversationRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_CONVERSATION_REQUEST_STATUS", "Only pending conversation requests can be rejected.");

        var now = DateTime.UtcNow;
        conversationRequest.Status = ConversationRequestStatus.Rejected;
        conversationRequest.RespondedAt = now;
        conversationRequest.UpdatedAt = now;
        await _uow.Repository<ConversationRequest>().UpdateAsync(conversationRequest);
        await _uow.SaveChangesAsync();
        return await GetConversationRequestSummaryAsync(conversationRequest.Id, founderId);
    }

    public async Task<NegotiationConversationRequestDto> WithdrawConversationRequestAsync(Guid investorId, Guid requestId, CancellationToken cancellationToken = default)
    {
        var conversationRequest = await GetAuthorizedConversationRequestAsync(investorId, requestId);
        EnsureRequester(conversationRequest, investorId);
        if (conversationRequest.Status != ConversationRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_CONVERSATION_REQUEST_STATUS", "Only pending conversation requests can be withdrawn.");

        var now = DateTime.UtcNow;
        conversationRequest.Status = ConversationRequestStatus.Withdrawn;
        conversationRequest.RespondedAt = now;
        conversationRequest.UpdatedAt = now;
        await _uow.Repository<ConversationRequest>().UpdateAsync(conversationRequest);
        await _uow.SaveChangesAsync();
        return await GetConversationRequestSummaryAsync(conversationRequest.Id, investorId);
    }

    public async Task<NegotiationConversationDto> CloseConversationAsync(Guid userId, Guid conversationId, CloseNegotiationConversationRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        if (!CanContinue(conversation))
            throw new BusinessValidationException("CONVERSATION_READ_ONLY", "This conversation is already read-only.");

        conversation.Status = conversation.FounderId == userId ? ConversationStatus.ClosedByFounder : ConversationStatus.ClosedByInvestor;
        conversation.IsActive = false;
        conversation.ClosedByUserId = userId;
        conversation.CloseReason = string.IsNullOrWhiteSpace(request.Reason) ? null : request.Reason.Trim();
        conversation.ClosedAt = DateTime.UtcNow;
        conversation.UpdatedAt = conversation.ClosedAt;
        conversation.IsVisibleToFounder = true;
        conversation.IsVisibleToInvestor = true;
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();
        return await GetConversationSummaryAsync(conversation.Id, userId);
    }

    public async Task HideConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);

        if (conversation.FounderId == userId)
            conversation.IsVisibleToFounder = false;
        else if (conversation.InvestorId == userId)
            conversation.IsVisibleToInvestor = false;
        else
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "Only conversation participants can hide this conversation.");

        conversation.UpdatedAt = DateTime.UtcNow;
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();
    }

    public async Task<NegotiationConversationDto> MarkReadyToProceedAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        if (conversation.Status != ConversationStatus.Negotiation && conversation.Status != ConversationStatus.Accepted)
            throw new BusinessValidationException("INVALID_CONVERSATION_STATUS", "Only active negotiation conversations can be marked ready.");

        if (conversation.FounderId == userId)
            conversation.FounderReady = true;
        else if (conversation.InvestorId == userId)
            conversation.InvestorReady = true;
        else
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "Only conversation participants can mark readiness.");

        var now = DateTime.UtcNow;
        conversation.UpdatedAt = now;

        if (conversation.FounderReady && conversation.InvestorReady)
        {
            conversation.Status = ConversationStatus.ReadyForParticipation;
            conversation.ReadyForParticipationAt = now;
        }

        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();
        return await GetConversationSummaryAsync(conversation.Id, userId);
    }

    public async Task<IReadOnlyList<NegotiationOfferDto>> GetOffersAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        await GetAuthorizedConversationAsync(userId, conversationId);
        var offers = await GetConversationOffersAsync(conversationId);
        return offers
            .OrderByDescending(o => o.Version)
            .ThenByDescending(o => o.CreatedAt)
            .Select(ToOfferDto)
            .ToList();
    }

    public async Task<NegotiationOfferDto> SendOfferAsync(Guid userId, Guid conversationId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        ValidateOfferRequest(request);
        await EnsureNoActiveOfferAsync(conversationId);

        var version = await GetNextOfferVersionAsync(conversationId);
        var offer = BuildOffer(conversationId, userId, version, parentOfferId: null, request);
        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _paidActionService.ChargeAsync(
                    userId,
                    PricingAction.SendFirstOffer,
                    ReferenceType.Conversation,
                    conversationId.ToString(),
                    cancellationToken);

                await _uow.Repository<NegotiationOffer>().AddAsync(offer);
                conversation.UpdatedAt = offer.CreatedAt;
                await _uow.Repository<Conversation>().UpdateAsync(conversation);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    userId,
                    "SendStructuredOffer",
                    "NegotiationOffer",
                    offer.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        return await GetOfferDtoAsync(userId, conversationId, offer.Id);
    }

    public async Task<NegotiationOfferDto> CounterOfferAsync(Guid userId, Guid conversationId, int offerId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        ValidateOfferRequest(request);
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);

        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending offers can be countered.");

        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_COUNTER_FORBIDDEN", "Only the receiving participant can counter this offer.");

        offer.Status = NegotiationOfferStatus.Countered;
        var counter = BuildOffer(conversationId, userId, await GetNextOfferVersionAsync(conversationId), offer.Id, request);
        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _paidActionService.ChargeAsync(
                    userId,
                    PricingAction.SendCounterOffer,
                    ReferenceType.Conversation,
                    $"{conversationId}:{offerId}",
                    cancellationToken);

                await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
                await _uow.Repository<NegotiationOffer>().AddAsync(counter);
                conversation.UpdatedAt = counter.CreatedAt;
                await _uow.Repository<Conversation>().UpdateAsync(conversation);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    userId,
                    "SendStructuredOffer",
                    "NegotiationOffer",
                    counter.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        return await GetOfferDtoAsync(userId, conversationId, counter.Id);
    }

    public async Task<NegotiationOfferDto> AcceptOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);

        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending offers can be accepted.");

        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_ACCEPT_FORBIDDEN", "Offer creator cannot accept their own offer.");

        offer.Status = NegotiationOfferStatus.Accepted;
        conversation.UpdatedAt = DateTime.UtcNow;
        await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();
        await ApplyReputationActivitySafeAsync(
            userId,
            "AcceptStructuredOffer",
            "NegotiationOffer",
            offer.Id.ToString());

        return await GetOfferDtoAsync(userId, conversationId, offer.Id);
    }

    private async Task ApplyReputationActivitySafeAsync(Guid userId, string activityCode, string referenceType, string referenceId)
    {
        try
        {
            await _reputationService.ApplyActivityAsync(userId, activityCode, referenceType, referenceId, userId);
        }
        catch
        {
            // Reputation is non-authoritative for the product action; leave the main action intact.
        }
    }

    public async Task<NegotiationOfferDto> RejectOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);

        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending offers can be rejected.");

        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_REJECT_FORBIDDEN", "Offer creator cannot reject their own offer.");

        offer.Status = NegotiationOfferStatus.Rejected;
        conversation.UpdatedAt = DateTime.UtcNow;
        await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();

        return await GetOfferDtoAsync(userId, conversationId, offer.Id);
    }

    public async Task<NegotiationOfferDto> WithdrawOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);

        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending offers can be withdrawn.");

        if (offer.CreatedByUserId != userId)
            throw new BusinessValidationException("OFFER_WITHDRAW_FORBIDDEN", "Only the offer creator can withdraw this offer.");

        offer.Status = NegotiationOfferStatus.Withdrawn;
        conversation.UpdatedAt = DateTime.UtcNow;
        await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
        await _uow.SaveChangesAsync();

        return await GetOfferDtoAsync(userId, conversationId, offer.Id);
    }

    private async Task<Conversation> GetAuthorizedActiveConversationAsync(Guid userId, Guid conversationId)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        if (!CanContinue(conversation))
            throw new BusinessValidationException("CONVERSATION_READ_ONLY", "Offers can only be managed in an active conversation.");

        return conversation;
    }

    private async Task<IReadOnlyList<NegotiationOffer>> GetConversationOffersAsync(Guid conversationId)
    {
        return (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(
            o => o.ConversationId == conversationId,
            o => o.Legs,
            o => o.CreatedByUser!))
            .ToList();
    }

    private async Task<NegotiationOffer> GetAuthorizedOfferAsync(Guid userId, Guid conversationId, int offerId)
    {
        await GetAuthorizedConversationAsync(userId, conversationId);
        var offer = (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(
                o => o.Id == offerId && o.ConversationId == conversationId,
                o => o.Legs,
                o => o.CreatedByUser!))
            .FirstOrDefault();

        if (offer == null)
            throw new BusinessValidationException("OFFER_NOT_FOUND", "Negotiation offer was not found.");

        return offer;
    }

    private async Task<NegotiationOfferDto> GetOfferDtoAsync(Guid userId, Guid conversationId, int offerId)
    {
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);
        return ToOfferDto(offer);
    }

    private async Task EnsureNoActiveOfferAsync(Guid conversationId)
    {
        var hasActiveOffer = await _uow.Repository<NegotiationOffer>().ExistsAsync(o =>
            o.ConversationId == conversationId && o.Status == NegotiationOfferStatus.Pending);

        if (hasActiveOffer)
            throw new BusinessValidationException("ACTIVE_OFFER_EXISTS", "Only one active offer is allowed per conversation.");
    }

    private async Task<int> GetNextOfferVersionAsync(Guid conversationId)
    {
        var offers = (await _uow.Repository<NegotiationOffer>().FindAsync(o => o.ConversationId == conversationId)).ToList();
        return offers.Count == 0 ? 1 : offers.Max(o => o.Version) + 1;
    }

    private static NegotiationOffer BuildOffer(Guid conversationId, Guid createdByUserId, int version, int? parentOfferId, CreateNegotiationOfferRequest request)
    {
        var now = DateTime.UtcNow;
        var offer = new NegotiationOffer
        {
            ConversationId = conversationId,
            CreatedByUserId = createdByUserId,
            Version = version,
            ParentOfferId = parentOfferId,
            Status = NegotiationOfferStatus.Pending,
            Note = Normalize(request.Note),
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? "Credits" : request.Currency.Trim().ToUpperInvariant(),
            CreatedAt = now
        };

        foreach (var leg in request.Legs)
        {
            offer.Legs.Add(new NegotiationOfferLeg
            {
                LegType = leg.LegType!.Value,
                Amount = leg.Amount,
                EquityPercentage = leg.EquityPercentage,
                SharesTerms = Normalize(leg.SharesTerms),
                ReturnRate = leg.ReturnRate,
                TermMonths = leg.TermMonths,
                RepaymentModel = Normalize(leg.RepaymentModel),
                ProfitSharePercentage = leg.ProfitSharePercentage,
                ExitTerms = Normalize(leg.ExitTerms)
            });
        }

        return offer;
    }

    private static void ValidateOfferRequest(CreateNegotiationOfferRequest request)
    {
        if (request.Legs == null || request.Legs.Count == 0)
            throw new BusinessValidationException("OFFER_LEGS_REQUIRED", "At least one offer leg is required.");

        foreach (var leg in request.Legs)
        {
            if (!leg.LegType.HasValue || !Enum.IsDefined(leg.LegType.Value))
                throw new BusinessValidationException("INVALID_OFFER_LEG_TYPE", "Offer leg type is invalid.");

            if (leg.Amount <= 0)
                throw new BusinessValidationException("INVALID_OFFER_AMOUNT", "Offer leg amount must be greater than zero.");

            switch (leg.LegType.Value)
            {
                case NegotiationOfferLegType.Equity:
                    if (!leg.EquityPercentage.HasValue && string.IsNullOrWhiteSpace(leg.SharesTerms))
                        throw new BusinessValidationException("EQUITY_TERMS_REQUIRED", "Equity offers require EquityPercentage or SharesTerms.");
                    ValidatePercentage(leg.EquityPercentage, "INVALID_EQUITY_PERCENTAGE", "EquityPercentage must be between 0.01 and 100.");
                    break;

                case NegotiationOfferLegType.Loan:
                    ValidatePercentage(leg.ReturnRate, "INVALID_RETURN_RATE", "Loan offers require ReturnRate between 0.01 and 100.");
                    if (!leg.TermMonths.HasValue || leg.TermMonths.Value <= 0)
                        throw new BusinessValidationException("LOAN_TERM_REQUIRED", "Loan offers require TermMonths greater than zero.");
                    if (string.IsNullOrWhiteSpace(leg.RepaymentModel))
                        throw new BusinessValidationException("REPAYMENT_MODEL_REQUIRED", "Loan offers require RepaymentModel.");
                    break;

                case NegotiationOfferLegType.ProfitSharing:
                    ValidatePercentage(leg.ProfitSharePercentage, "INVALID_PROFIT_SHARE_PERCENTAGE", "Profit Sharing offers require ProfitSharePercentage between 0.01 and 100.");
                    if (!leg.TermMonths.HasValue || leg.TermMonths.Value <= 0)
                        throw new BusinessValidationException("PROFIT_SHARING_TERM_REQUIRED", "Profit Sharing offers require TermMonths greater than zero.");
                    if (string.IsNullOrWhiteSpace(leg.ExitTerms))
                        throw new BusinessValidationException("EXIT_TERMS_REQUIRED", "Profit Sharing offers require ExitTerms.");
                    break;
            }
        }
    }

    private static void ValidatePercentage(decimal? value, string code, string message)
    {
        if (!value.HasValue || value.Value <= 0 || value.Value > 100)
            throw new BusinessValidationException(code, message);
    }

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private async Task AddParticipantAsync(Guid conversationId, Guid userId, byte role)
    {
        await _uow.Repository<ConversationParticipant>().AddAsync(new ConversationParticipant
        {
            ConversationId = conversationId,
            UserId = userId,
            Role = role,
            JoinedAt = DateTimeOffset.UtcNow
        });
    }

    private async Task<ChatMessage> AddMessageAsync(Guid conversationId, Guid senderId, string text, DateTime now)
    {
        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId = senderId.ToString(),
            SenderUserId = senderId,
            MessageText = text,
            Timestamp = now,
            IsRead = false
        };

        await _uow.Repository<ChatMessage>().AddAsync(message);
        return message;
    }

    private async Task<Conversation> GetAuthorizedConversationAsync(Guid userId, Guid conversationId)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can access negotiations.");
        var conversation = await _uow.Repository<Conversation>().GetSingleAsync(
            c => c.Id == conversationId,
            c => c.Opportunity!,
            c => c.Founder!,
            c => c.Investor!,
            c => c.ParticipationRequest!);

        if (conversation == null)
            throw new BusinessValidationException("CONVERSATION_NOT_FOUND", "Conversation was not found.");

        var isFounder = conversation.FounderId == userId && conversation.IsVisibleToFounder;
        var isInvestor = conversation.InvestorId == userId && conversation.IsVisibleToInvestor;
        if (!isFounder && !isInvestor)
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "You are not allowed to access this conversation.");

        return conversation;
    }

    private async Task<ConversationRequest> GetAuthorizedConversationRequestAsync(Guid userId, Guid requestId)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can access negotiation requests.");
        var conversationRequest = await _uow.Repository<ConversationRequest>().GetSingleAsync(
            r => r.Id == requestId,
            r => r.Opportunity!,
            r => r.Requester!,
            r => r.Recipient!,
            r => r.AcceptedConversation!);

        if (conversationRequest == null)
            throw new BusinessValidationException("CONVERSATION_REQUEST_NOT_FOUND", "Conversation request was not found.");

        if (conversationRequest.RequesterUserId != userId && conversationRequest.RecipientUserId != userId)
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "You are not allowed to access this conversation request.");

        return conversationRequest;
    }

    private async Task<Opportunity> GetOpportunityAsync(int opportunityId)
    {
        var opportunity = await _uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

        return opportunity;
    }

    private async Task ValidateClientAsync(Guid userId, string message)
    {
        if (userId == Guid.Empty)
            throw new BusinessValidationException("USER_REQUIRED", "Authenticated user is required.");

        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId);
        if (user == null || user.UserType != UserType.Client)
            throw new BusinessValidationException("CLIENT_REQUIRED", message);
    }

    private async Task<NegotiationConversationDto> GetConversationSummaryAsync(Guid conversationId, Guid viewerUserId)
    {
        var conversation = await _uow.Repository<Conversation>().GetSingleAsync(
            c => c.Id == conversationId,
            c => c.Opportunity!,
            c => c.Founder!,
            c => c.Investor!,
            c => c.ParticipationRequest!);

        if (conversation == null)
            throw new BusinessValidationException("CONVERSATION_NOT_FOUND", "Conversation was not found.");

        return ToConversationDto(conversation, viewerUserId);
    }

    private async Task<NegotiationConversationRequestDto> GetConversationRequestSummaryAsync(Guid requestId, Guid viewerUserId)
    {
        var conversationRequest = await _uow.Repository<ConversationRequest>().GetSingleAsync(
            r => r.Id == requestId,
            r => r.Opportunity!,
            r => r.Requester!,
            r => r.Recipient!,
            r => r.AcceptedConversation!);

        if (conversationRequest == null)
            throw new BusinessValidationException("CONVERSATION_REQUEST_NOT_FOUND", "Conversation request was not found.");

        return ToConversationRequestDto(conversationRequest, viewerUserId);
    }

    private static void EnsureFounder(Conversation conversation, Guid founderId)
    {
        if (conversation.FounderId != founderId)
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "Only the founder can perform this action.");
    }

    private static void EnsureInvestor(Conversation conversation, Guid investorId)
    {
        if (conversation.InvestorId != investorId)
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "Only the investor can perform this action.");
    }

    private static void EnsureRecipient(ConversationRequest conversationRequest, Guid recipientId)
    {
        if (conversationRequest.RecipientUserId != recipientId)
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "Only the request recipient can perform this action.");
    }

    private static void EnsureRequester(ConversationRequest conversationRequest, Guid requesterId)
    {
        if (conversationRequest.RequesterUserId != requesterId)
            throw new BusinessValidationException("CONVERSATION_FORBIDDEN", "Only the request sender can perform this action.");
    }

    private static bool CanContinue(Conversation conversation)
    {
        return conversation.Status is ConversationStatus.Accepted or ConversationStatus.Negotiation or ConversationStatus.ReadyForParticipation
            && conversation.IsActive;
    }

    private static NegotiationConversationRequestDto ToConversationRequestDto(ConversationRequest conversationRequest, Guid viewerUserId)
    {
        var requester = ToUserSummary(conversationRequest.Requester, conversationRequest.RequesterUserId, "Investor");
        var recipient = ToUserSummary(conversationRequest.Recipient, conversationRequest.RecipientUserId, "Founder");
        var isRequester = conversationRequest.RequesterUserId == viewerUserId;
        var isRecipient = conversationRequest.RecipientUserId == viewerUserId;
        var direction = isRequester ? "Outgoing" : isRecipient ? "Incoming" : "Unknown";
        var counterparty = isRequester ? recipient : isRecipient ? requester : new NegotiationUserSummaryDto();
        var isPending = conversationRequest.Status == ConversationRequestStatus.Pending;

        return new NegotiationConversationRequestDto
        {
            Id = conversationRequest.Id,
            OpportunityId = conversationRequest.OpportunityId,
            Status = conversationRequest.Status,
            StatusText = ToRequestStatusText(conversationRequest.Status),
            Direction = direction,
            RequesterUserId = requester.Id,
            RequesterName = requester.Name,
            RequesterRole = requester.Role,
            RecipientUserId = recipient.Id,
            RecipientName = recipient.Name,
            RecipientRole = recipient.Role,
            CounterpartyUserId = counterparty.Id,
            CounterpartyName = counterparty.Name,
            CounterpartyRole = counterparty.Role,
            Opportunity = new OpportunitySummaryForNegotiationDto
            {
                Id = conversationRequest.OpportunityId,
                Title = conversationRequest.Opportunity?.Title ?? "Opportunity",
                Status = conversationRequest.Opportunity?.Status ?? OpportunityStatus.Draft,
                InvestmentModel = conversationRequest.Opportunity?.InvestmentModel ?? InvestmentModel.Equity
            },
            Message = conversationRequest.Message,
            CanAccept = isPending && isRecipient,
            CanReject = isPending && isRecipient,
            CanWithdraw = isPending && isRequester,
            AcceptedConversationId = conversationRequest.AcceptedConversationId,
            CreatedAt = conversationRequest.CreatedAt,
            RespondedAt = conversationRequest.RespondedAt,
            UpdatedAt = conversationRequest.UpdatedAt
        };
    }

    private static NegotiationConversationDetailDto ToConversationDetailDto(Conversation conversation, Guid viewerUserId)
    {
        var summary = ToConversationDto(conversation, viewerUserId);
        return new NegotiationConversationDetailDto
        {
            Id = summary.Id,
            OpportunityId = summary.OpportunityId,
            ConversationStatus = summary.ConversationStatus,
            StatusText = summary.StatusText,
            Direction = summary.Direction,
            RequesterUserId = summary.RequesterUserId,
            RequesterName = summary.RequesterName,
            RequesterRole = summary.RequesterRole,
            RecipientUserId = summary.RecipientUserId,
            RecipientName = summary.RecipientName,
            RecipientRole = summary.RecipientRole,
            CounterpartyUserId = summary.CounterpartyUserId,
            CounterpartyName = summary.CounterpartyName,
            CounterpartyRole = summary.CounterpartyRole,
            Opportunity = summary.Opportunity,
            Founder = summary.Founder,
            Investor = summary.Investor,
            FounderReady = summary.FounderReady,
            InvestorReady = summary.InvestorReady,
            CanContinue = summary.CanContinue,
            ProjectRoomUnlocked = summary.ProjectRoomUnlocked,
            ParticipationStatus = summary.ParticipationStatus,
            ParticipationRequestId = summary.ParticipationRequestId,
            CreatedAt = summary.CreatedAt,
            UpdatedAt = summary.UpdatedAt
        };
    }

    private static NegotiationConversationDto ToConversationDto(Conversation conversation, Guid viewerUserId)
    {
        var participationStatus = conversation.ParticipationRequest?.Status;
        var requester = ToUserSummary(conversation.Investor, conversation.InvestorId, "Investor");
        var recipient = ToUserSummary(conversation.Founder, conversation.FounderId, "Founder");
        var isRequester = requester.Id == viewerUserId;
        var isRecipient = recipient.Id == viewerUserId;
        var direction = isRequester ? "Outgoing" : isRecipient ? "Incoming" : "Unknown";
        var counterparty = isRequester ? recipient : isRecipient ? requester : new NegotiationUserSummaryDto();
        var isVisibleToCurrentUser = isRequester
            ? conversation.IsVisibleToInvestor
            : isRecipient && conversation.IsVisibleToFounder;

        return new NegotiationConversationDto
        {
            Id = conversation.Id,
            OpportunityId = conversation.OpportunityId ?? 0,
            ConversationStatus = conversation.Status,
            StatusText = ToStatusText(conversation.Status, participationStatus),
            Direction = direction,
            RequesterUserId = requester.Id,
            RequesterName = requester.Name,
            RequesterRole = requester.Role,
            RecipientUserId = recipient.Id,
            RecipientName = recipient.Name,
            RecipientRole = recipient.Role,
            CounterpartyUserId = counterparty.Id,
            CounterpartyName = counterparty.Name,
            CounterpartyRole = counterparty.Role,
            Opportunity = new OpportunitySummaryForNegotiationDto
            {
                Id = conversation.OpportunityId ?? 0,
                Title = conversation.Opportunity?.Title ?? conversation.Category ?? "Opportunity",
                Status = conversation.Opportunity?.Status ?? OpportunityStatus.Draft,
                InvestmentModel = conversation.Opportunity?.InvestmentModel ?? InvestmentModel.Equity
            },
            Founder = recipient,
            Investor = requester,
            FounderReady = conversation.FounderReady,
            InvestorReady = conversation.InvestorReady,
            CanContinue = CanContinue(conversation),
            ProjectRoomUnlocked = participationStatus == OpportunityJoinRequestStatus.Approved,
            ParticipationStatus = participationStatus,
            ParticipationRequestId = conversation.ParticipationRequestId,
            IsVisibleToCurrentUser = isVisibleToCurrentUser,
            ClosedByUserId = conversation.ClosedByUserId,
            CloseReason = conversation.CloseReason,
            ClosedAt = conversation.ClosedAt,
            CreatedAt = conversation.CreatedAt,
            UpdatedAt = conversation.UpdatedAt
        };
    }

    private static NegotiationOfferDto ToOfferDto(NegotiationOffer offer) => new()
    {
        Id = offer.Id,
        ConversationId = offer.ConversationId,
        CreatedByUserId = offer.CreatedByUserId,
        CreatedByName = ToUserSummary(offer.CreatedByUser, offer.CreatedByUserId, "Participant").Name,
        Version = offer.Version,
        ParentOfferId = offer.ParentOfferId,
        Status = offer.Status,
        Note = offer.Note,
        Currency = offer.Currency,
        CreatedAt = offer.CreatedAt,
        Legs = offer.Legs
            .OrderBy(l => l.Id)
            .Select(ToOfferLegDto)
            .ToList()
    };

    private static NegotiationOfferLegDto ToOfferLegDto(NegotiationOfferLeg leg) => new()
    {
        Id = leg.Id,
        LegType = leg.LegType,
        Amount = leg.Amount,
        EquityPercentage = leg.EquityPercentage,
        SharesTerms = leg.SharesTerms,
        ReturnRate = leg.ReturnRate,
        TermMonths = leg.TermMonths,
        RepaymentModel = leg.RepaymentModel,
        ProfitSharePercentage = leg.ProfitSharePercentage,
        ExitTerms = leg.ExitTerms
    };

    private static NegotiationUserSummaryDto ToUserSummary(AuthUser? user, Guid? id, string role) => new()
    {
        Id = id ?? Guid.Empty,
        Name = user?.Profile?.FullName ?? user?.Name ?? user?.Email ?? "Unknown",
        Role = role
    };

    private static NegotiationMessageDto ToMessageDto(ChatMessage message) => new()
    {
        Id = message.Id,
        ConversationId = message.ConversationId ?? Guid.Empty,
        SenderId = message.SenderUserId ?? (Guid.TryParse(message.SenderId, out var senderId) ? senderId : Guid.Empty),
        Message = message.IsDeleted ? string.Empty : message.MessageText,
        SentAt = message.Timestamp,
        IsEdited = message.IsEdited,
        EditedAt = message.EditedAt,
        IsDeleted = message.IsDeleted,
        Attachments = message.AttachmentsJson
    };

    private static string ToStatusText(ConversationStatus status, OpportunityJoinRequestStatus? participationStatus)
    {
        if (participationStatus == OpportunityJoinRequestStatus.Approved)
            return "Participation approved";

        if (participationStatus == OpportunityJoinRequestStatus.Rejected)
            return "Participation rejected";

        return status switch
        {
            ConversationStatus.Requested => "Waiting for founder response",
            ConversationStatus.Negotiation or ConversationStatus.Accepted => "Negotiation in progress",
            ConversationStatus.ReadyForParticipation or ConversationStatus.ParticipationCreated => "Ready for participation",
            ConversationStatus.ParticipationApproved => "Participation approved",
            ConversationStatus.ParticipationRejected => "Participation rejected",
            ConversationStatus.DeclinedByFounder => "Declined by Founder",
            ConversationStatus.Cancelled => "Discussion cancelled",
            ConversationStatus.ClosedByFounder or ConversationStatus.ClosedByInvestor or ConversationStatus.Completed => "Discussion closed",
            _ => status.ToString()
        };
    }

    private static string ToRequestStatusText(ConversationRequestStatus status)
    {
        return status switch
        {
            ConversationRequestStatus.Pending => "Waiting for founder response",
            ConversationRequestStatus.Accepted => "Accepted",
            ConversationRequestStatus.Rejected => "Rejected",
            ConversationRequestStatus.Withdrawn => "Withdrawn",
            _ => status.ToString()
        };
    }
}
