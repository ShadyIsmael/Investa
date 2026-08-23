using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging;

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
    private readonly IUserNotificationService _userNotificationService;
    private readonly IRealtimeEventPublisher _realtimeEventPublisher;
    private readonly IConversationPresenceService _conversationPresence;
    private readonly IInvestmentContractService _investmentContractService;
    private readonly ILogger<NegotiationService> _logger;

    public NegotiationService(
        IUnitOfWork uow,
        IPaidActionService paidActionService,
        IReputationService reputationService,
        IUserNotificationService userNotificationService,
        IRealtimeEventPublisher realtimeEventPublisher,
        IConversationPresenceService conversationPresence,
        IInvestmentContractService investmentContractService,
        ILogger<NegotiationService> logger)
    {
        _uow = uow;
        _paidActionService = paidActionService;
        _reputationService = reputationService;
        _userNotificationService = userNotificationService;
        _realtimeEventPublisher = realtimeEventPublisher;
        _conversationPresence = conversationPresence;
        _investmentContractService = investmentContractService;
        _logger = logger;
    }

    public async Task<OpportunityViewerStateDto> GetOpportunityViewerStateAsync(
        Guid userId,
        int opportunityId,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default,
        bool isAdmin = false)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view opportunity state.");
        var opportunity = await GetOpportunityAsync(opportunityId);
        var isFounder = opportunity.FounderId == userId;

        if (opportunity.Status == OpportunityStatus.Draft)
        {
            if (!isFounder && !isAdmin)
                throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

            return new OpportunityViewerStateDto
            {
                OpportunityId = opportunityId,
                IsFounder = isFounder,
                CanViewAuthorizedDetails = true,
                CanRequestChat = false,
                CanContinueConversation = false,
                CanMarkReadyToProceed = false,
                CanSubmitDirectOffer = false,
                CanApproveParticipation = false,
                CanRejectParticipation = false,
                ProjectRoomUnlocked = false,
                CanOpenProjectRoom = false,
                ContractAvailable = false
            };
        }
        var directOffers = (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(
                o => o.OpportunityId == opportunityId
                     && o.ConversationId == null
                     && (isFounder || o.CreatedByUserId == userId),
                o => o.Legs,
                o => o.CreatedByUser!))
            .OrderByDescending(o => o.CreatedAt)
            .ToList();
        var directOffer = directOffers.FirstOrDefault();

        var conversations = (await _uow.Repository<Conversation>().FindWithIncludesAsync(
                c => c.OpportunityId == opportunityId
                     && (c.FounderId == userId || c.InvestorId == userId),
                c => c.ParticipationRequest!))
            .Where(c => c.Status != ConversationStatus.Requested
                        && ((c.FounderId == userId && c.IsVisibleToFounder) || (c.InvestorId == userId && c.IsVisibleToInvestor)))
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .ToList();

        var conversation = conversationId.HasValue
            ? conversations.FirstOrDefault(candidate => candidate.Id == conversationId.Value)
            : conversations.FirstOrDefault();
        if (conversationId.HasValue && conversation == null)
            throw new BusinessValidationException("CONVERSATION_NOT_FOUND", "Conversation was not found for this opportunity.");
        var conversationRequests = await _uow.Repository<ConversationRequest>().FindAsync(r =>
            r.OpportunityId == opportunityId
            && (r.RequesterUserId == userId || r.RecipientUserId == userId));

        var conversationRequest = conversationRequests
            .OrderByDescending(r => r.UpdatedAt ?? r.RespondedAt ?? r.CreatedAt)
            .FirstOrDefault();
        var participationRequest = conversation?.ParticipationRequest;

        if (participationRequest == null && conversation == null && !isFounder && directOffer?.Status == NegotiationOfferStatus.Accepted)
        {
            var requestCandidates = await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId
                && r.InvestorId == userId
                && r.AcceptedOfferId == directOffer.Id
                && r.IsVisibleToInvestor);

            participationRequest = requestCandidates
                .OrderByDescending(r => r.UpdatedAt)
                .FirstOrDefault();
        }

        var participationStatus = participationRequest?.Status;
        var hasApprovedParticipation = participationStatus == OpportunityJoinRequestStatus.Approved;
        var canContinueConversation = conversation != null && CanContinue(conversation);
        var hasActiveConversation = conversation is { IsActive: true };
        var hasActiveParticipation = participationStatus is OpportunityJoinRequestStatus.Pending or OpportunityJoinRequestStatus.Approved;
        var hasPendingConversationRequest = conversationRequest?.Status == ConversationRequestStatus.Pending;
        var contract = participationRequest?.Status == OpportunityJoinRequestStatus.Approved
            ? (await _uow.Repository<InvestmentContract>().FindAsync(c =>
                c.OpportunityId == opportunityId && c.InvestorUserId == userId)).OrderByDescending(c => c.UpdatedAt).FirstOrDefault()
            : null;

        return new OpportunityViewerStateDto
        {
            OpportunityId = opportunityId,
            IsFounder = isFounder,
            CanViewAuthorizedDetails = isFounder || isAdmin,
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
            ProjectRoomUnlocked = hasApprovedParticipation,
            CanOpenProjectRoom = hasApprovedParticipation
                ,CanSubmitDirectOffer = !isFounder
                    && JoinEligibleStatuses.Contains(opportunity.Status)
                    && directOffer == null
                    && !hasActiveConversation
                    && !hasActiveParticipation
                    && !hasPendingConversationRequest,
            DirectOfferStatus = directOffer?.Status,
            DirectOfferId = directOffer?.Id,
            DirectOfferVersion = directOffer?.Version,
            ContractAvailable = contract != null,
            ContractId = contract?.Id
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

        var requesterUser = await _uow.Repository<AuthUser>().GetByIdAsync(investorId);
        var requesterName = requesterUser?.Profile?.FullName ?? requesterUser?.Name ?? "A user";
        await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
            conversationRequest.RecipientUserId,
            "ConversationRequestCreated",
            conversationRequest.Id.ToString(),
            "New conversation request",
            $"{requesterName} sent a conversation request for {opportunity.Title}.",
            "info",
            "/admin/requests",
            investorId,
            opportunity.Id), cancellationToken);

        return await GetConversationRequestSummaryAsync(conversationRequest.Id, investorId);
    }

    public async Task<IReadOnlyList<NegotiationConversationRequestDto>> GetMyConversationRequestsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view negotiation requests.");
        var requests = await _uow.Repository<ConversationRequest>().FindWithIncludesAsync(
            r => r.RequesterUserId == userId || r.RecipientUserId == userId,
            r => r.Opportunity!,
            r => r.Requester!,
            r => r.Requester!.Profile!,
            r => r.Recipient!,
            r => r.Recipient!.Profile!);

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

        var conversationIds = conversations.Select(c => c.Id).ToList();
        var unreadMessages = conversationIds.Count == 0
            ? Array.Empty<ChatMessage>()
            : (await _uow.Repository<ChatMessage>().FindAsync(
                message => message.ConversationId.HasValue
                           && conversationIds.Contains(message.ConversationId.Value)
                           && message.SenderUserId != userId
                           && !message.IsRead)).ToArray();
        var unreadCounts = unreadMessages
            .GroupBy(message => message.ConversationId!.Value)
            .ToDictionary(group => group.Key, group => group.Count());

        return conversations
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .Select(c => ToConversationDto(c, userId, unreadCounts.GetValueOrDefault(c.Id)))
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
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        var messages = await _uow.Repository<ChatMessage>().FindAsync(m => m.ConversationId == conversationId);
        return messages
            .OrderBy(m => m.Timestamp)
            .ThenBy(m => m.Id)
            .Select(message => ToMessageDto(message, conversation))
            .ToList();
    }

    public async Task<int> MarkMessagesReadAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        await GetAuthorizedConversationAsync(userId, conversationId);
        var unreadMessages = await _uow.Repository<ChatMessage>().FindAsync(
            message => message.ConversationId == conversationId
                       && message.SenderUserId != userId
                       && !message.IsRead);

        var updatedCount = 0;
        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
            await _uow.Repository<ChatMessage>().UpdateAsync(message);
            updatedCount++;
        }

        if (updatedCount > 0)
            await _uow.SaveChangesAsync();

        return updatedCount;
    }

    public async Task<NegotiationMessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendNegotiationMessageRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedConversationAsync(userId, conversationId);
        if (!CanContinue(conversation))
            throw new BusinessValidationException("CONVERSATION_READ_ONLY", "This conversation is read-only.");

        var now = DateTime.UtcNow;
        var message = request.ClientMessageId.HasValue
            ? await _uow.Repository<ChatMessage>().GetByIdAsync(request.ClientMessageId.Value)
            : null;
        var isNewMessage = message == null;

        if (message != null
            && (message.ConversationId != conversationId || message.SenderUserId != userId))
        {
            throw new BusinessValidationException(
                "CLIENT_MESSAGE_ID_CONFLICT",
                "The client message identifier is already used by another message.");
        }

        if (isNewMessage)
        {
            message = await AddMessageAsync(
                conversation.Id,
                userId,
                request.Message.Trim(),
                now,
                request.ClientMessageId);
            conversation.UpdatedAt = now;
            await _uow.Repository<Conversation>().UpdateAsync(conversation);
            await _uow.SaveChangesAsync();
        }

        var participantIds = (await _uow.Repository<ConversationParticipant>().FindAsync(
                participant => participant.ConversationId == conversationId))
            .Select(participant => participant.UserId)
            .Append(userId)
            .Where(participantId => participantId != Guid.Empty)
            .Distinct()
            .ToList();
        var recipientId = participantIds
            .Where(participantId => participantId != userId)
            .Cast<Guid?>()
            .FirstOrDefault();

        var savedMessage = ToMessageDto(message!, conversation);
        var realtimeData = new Dictionary<string, object?>
        {
            ["messageId"] = savedMessage.Id.ToString("D"),
            ["conversationId"] = savedMessage.ConversationId.ToString("D"),
            ["senderUserId"] = savedMessage.SenderId.ToString("D"),
            ["senderName"] = savedMessage.SenderName,
            ["senderRole"] = savedMessage.SenderRole,
            ["body"] = savedMessage.Message,
            ["createdAt"] = savedMessage.SentAt,
            ["isRead"] = message!.IsRead
        };

        try
        {
            foreach (var realtimeRecipient in participantIds)
            {
                await _realtimeEventPublisher.PublishToUserAsync(
                    realtimeRecipient,
                    "ConversationMessageSaved",
                    savedMessage.Id,
                    realtimeData,
                    cancellationToken);
            }
            _logger.LogDebug(
                "Published message {MessageId} to conversation {ConversationId} participants {ParticipantIds}",
                savedMessage.Id,
                conversationId,
                participantIds);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Message {MessageId} was saved but realtime publication failed for conversation {ConversationId}",
                savedMessage.Id,
                conversationId);
        }

        if (isNewMessage
            && recipientId.HasValue
            && !_conversationPresence.IsActive(recipientId.Value, conversationId))
        {
            var senderName = conversation.FounderId == userId
                ? conversation.Founder?.Profile?.FullName ?? conversation.Founder?.Name ?? "Founder"
                : conversation.Investor?.Profile?.FullName ?? conversation.Investor?.Name ?? "Investor";
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                recipientId.Value,
                "NewConversationMessage",
                message.Id.ToString(),
                $"New message from {senderName}",
                BuildSafeMessagePreview(request.Message),
                "info",
                $"/admin/chat?conversationId={conversationId:D}",
                userId,
                conversation.OpportunityId));
        }

        if (isNewMessage)
        {
            var totalMessages = (await _uow.Repository<ChatMessage>()
                .FindAsync(m => m.ConversationId == conversationId)).Count();
            if (totalMessages == 1)
            {
                await ApplyReputationActivitySafeAsync(
                    userId,
                    "SendMessageAfterAcceptance",
                    "Conversation",
                    conversationId.ToString());
            }
        }

        return savedMessage;
    }

    private static string BuildSafeMessagePreview(string value)
    {
        var plain = System.Text.RegularExpressions.Regex.Replace(value, "<[^>]+>", " ");
        plain = System.Text.RegularExpressions.Regex.Replace(plain, @"\s+", " ").Trim();
        return plain.Length <= 120 ? plain : $"{plain[..117]}...";
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

        await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
            conversationRequest.RequesterUserId,
            "ConversationRequestApproved",
            conversationRequest.Id.ToString(),
            "Conversation request accepted",
            $"Your conversation request for {conversationRequest.Opportunity?.Title ?? "Opportunity"} was accepted.",
            "success",
            $"/admin/chat?conversationId={existingConversation.Id}",
            founderId,
            conversationRequest.OpportunityId), cancellationToken);
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

        await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
            conversationRequest.RequesterUserId,
            "ConversationRequestRejected",
            conversationRequest.Id.ToString(),
            "Conversation request rejected",
            $"Your conversation request for {conversationRequest.Opportunity?.Title ?? "Opportunity"} was rejected.",
            "warning",
            "/admin/requests",
            founderId,
            conversationRequest.OpportunityId), cancellationToken);
        return await GetConversationRequestSummaryAsync(conversationRequest.Id, founderId);
    }

    public async Task<NegotiationConversationRequestDto> WithdrawConversationRequestAsync(Guid investorId, Guid requestId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[TRACE] WithdrawConversationRequestAsync ENTERED — investorId={InvestorId}, requestId={RequestId}", investorId, requestId);

        var conversationRequest = await GetAuthorizedConversationRequestAsync(investorId, requestId);
        _logger.LogInformation("[TRACE] Request loaded — Id={Id}, RecipientUserId={RecipientUserId}, RequesterUserId={RequesterUserId}, Status={Status}", 
            conversationRequest.Id, conversationRequest.RecipientUserId, conversationRequest.RequesterUserId, conversationRequest.Status);

        EnsureRequester(conversationRequest, investorId);
        if (conversationRequest.Status != ConversationRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_CONVERSATION_REQUEST_STATUS", "Only pending conversation requests can be withdrawn.");

        var now = DateTime.UtcNow;
        conversationRequest.Status = ConversationRequestStatus.Withdrawn;
        conversationRequest.RespondedAt = now;
        conversationRequest.UpdatedAt = now;
        await _uow.Repository<ConversationRequest>().UpdateAsync(conversationRequest);
        await _uow.SaveChangesAsync();
        _logger.LogInformation("[TRACE] Status saved as Withdrawn for request {RequestId}", conversationRequest.Id);

        var requesterName = conversationRequest.Requester?.Profile?.FullName
                            ?? conversationRequest.Requester?.Name
                            ?? "A user";
        await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
            conversationRequest.RecipientUserId,
            "ConversationRequestWithdrawn",
            conversationRequest.Id.ToString(),
            "Conversation request withdrawn",
            $"{requesterName} withdrew the conversation request for {conversationRequest.Opportunity?.Title ?? "Opportunity"}.",
            "info",
            "/admin/requests",
            investorId,
            conversationRequest.OpportunityId), cancellationToken);

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
            .Select(offer => ToOfferDto(offer, userId))
            .ToList();
    }

    public async Task<IReadOnlyList<NegotiationOfferDto>> GetDirectOffersAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view offers.");
        var opportunity = await GetOpportunityAsync(opportunityId);
        var isFounder = opportunity.FounderId == userId;
        var offers = (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(
                o => o.OpportunityId == opportunityId
                     && o.ConversationId == null
                     && (isFounder || o.CreatedByUserId == userId),
                o => o.Legs,
                o => o.CreatedByUser!,
                o => o.Opportunity!))
            .OrderByDescending(o => o.Version)
            .ThenByDescending(o => o.CreatedAt)
            .ToList();

        if (!isFounder && offers.Count == 0)
            throw new BusinessValidationException("OFFER_FORBIDDEN", "You are not allowed to view direct offers for this opportunity.");

        return offers.Select(offer => ToOfferDto(offer, userId)).ToList();
    }

    public async Task<IReadOnlyList<NegotiationOfferDto>> GetDirectInboxAsync(Guid userId, bool incoming, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view offers.");
        var offers = await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(
            o => o.ConversationId == null
                 && (incoming ? o.Opportunity!.FounderId == userId : o.CreatedByUserId == userId),
            o => o.Legs,
            o => o.CreatedByUser!,
            o => o.Opportunity!);

        return offers
            .OrderByDescending(o => o.CreatedAt)
            .Select(offer => ToOfferDto(offer, userId))
            .ToList();
    }

    public async Task<NegotiationOfferDto> SubmitDirectOfferAsync(Guid userId, int opportunityId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can submit offers.");
        var opportunity = await GetOpportunityAsync(opportunityId);
        if (opportunity.FounderId == userId)
            throw new BusinessValidationException("FOUNDER_CANNOT_SUBMIT_DIRECT_OFFER", "A founder cannot submit an offer to their own opportunity.");
        if (!JoinEligibleStatuses.Contains(opportunity.Status))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for direct offers.");

        ValidateOfferRequest(request);
        var existing = (await _uow.Repository<NegotiationOffer>().FindAsync(o =>
                o.OpportunityId == opportunityId && o.ConversationId == null && o.CreatedByUserId == userId))
            .FirstOrDefault();
        if (existing != null)
            throw new BusinessValidationException("DIRECT_OFFER_ALREADY_EXISTS", "A direct offer already exists for this opportunity.");

        var offer = BuildOffer(null, opportunityId, userId, 1, null, request);
        await _uow.Repository<NegotiationOffer>().AddAsync(offer);
        await _uow.SaveChangesAsync();
        var saved = await GetAuthorizedDirectOfferAsync(userId, opportunityId, offer.Id);
        return ToOfferDto(saved, userId);
    }

    public async Task<NegotiationOfferDto> AcceptDirectOfferAsync(Guid userId, int opportunityId, int offerId, CancellationToken cancellationToken = default)
    {
        var offer = await GetAuthorizedDirectOfferAsync(userId, opportunityId, offerId, founderOnly: true);
        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending direct offers can be accepted.");
        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_ACCEPT_FORBIDDEN", "The offer creator cannot accept their own offer.");

        var opportunity = offer.Opportunity ?? await GetOpportunityAsync(opportunityId);
        if (!IsEligibleForFunding(opportunity))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for participation.");

        var existingParticipation = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r => r.AcceptedOfferId == offer.Id)).FirstOrDefault();
        if (existingParticipation != null)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "This direct offer has already been finalized.");

        var termsJson = JsonSerializer.Serialize(offer.Legs.Select(l => new
        {
            l.LegType, l.Amount, l.EquityPercentage, l.SharesTerms, l.ReturnRate,
            l.TermMonths, l.RepaymentModel, l.ProfitSharePercentage, l.ExitTerms
        }));
        var totalAmount = offer.Legs.Sum(l => l.Amount);
        var sequence = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId && r.InvestorId == offer.CreatedByUserId
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation))
            .Select(r => r.ParticipationSequence).DefaultIfEmpty(0).Max() + 1;

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                var now = DateTime.UtcNow;
                var joinRequest = new OpportunityJoinRequest
                {
                    OpportunityId = opportunityId,
                    InvestorId = offer.CreatedByUserId,
                    ParticipationSequence = sequence,
                    IdempotencyKey = $"direct-offer:{offer.Id}",
                    RequestType = OpportunityJoinRequestType.InvestmentParticipation,
                    RequestedAmount = totalAmount,
                    FundingAmount = totalAmount,
                    FundingCurrency = opportunity.FundingCurrency,
                    CalculatedTotalAmount = totalAmount,
                    TermsSnapshotJson = termsJson,
                    Status = OpportunityJoinRequestStatus.Approved,
                    AcceptedOfferId = offer.Id,
                    IsVisibleToFounder = true,
                    IsVisibleToInvestor = true,
                    ReviewedByFounderId = userId,
                    ReviewedAt = now,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                await _uow.Repository<OpportunityJoinRequest>().AddAsync(joinRequest);
                await _uow.SaveChangesAsync();

                offer.Status = NegotiationOfferStatus.Accepted;
                await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
                if (!opportunity.FirstInvestorJoinedAt.HasValue)
                {
                    opportunity.FirstInvestorJoinedAt = now;
                    opportunity.IsLockedForEditing = true;
                    await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
                }
                // Flush the exact accepted offer state inside the transaction before
                // contract generation resolves the immutable source offer snapshot.
                await _uow.SaveChangesAsync();
                opportunity.Events ??= new List<OpportunityEvent>();
                await _investmentContractService.GenerateForApprovedParticipationAsync(opportunity, joinRequest, now, cancellationToken);
                await _uow.SaveChangesAsync();
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        var accepted = await GetAuthorizedDirectOfferAsync(userId, opportunityId, offerId);
        return ToOfferDto(accepted, userId);
    }

    public async Task<NegotiationOfferDto> RejectDirectOfferAsync(Guid userId, int opportunityId, int offerId, CancellationToken cancellationToken = default)
    {
        var offer = await GetAuthorizedDirectOfferAsync(userId, opportunityId, offerId, founderOnly: true);
        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending direct offers can be rejected.");
        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_REJECT_FORBIDDEN", "The offer creator cannot reject their own offer.");

        offer.Status = NegotiationOfferStatus.Rejected;
        await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
        await _uow.SaveChangesAsync();
        return ToOfferDto(offer, userId);
    }

    public async Task<NegotiationOfferDto> SendOfferAsync(Guid userId, Guid conversationId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        ValidateOfferRequest(request);
        await EnsureNoActiveOfferAsync(conversationId);

        var version = await GetNextOfferVersionAsync(conversationId);
        var offer = BuildOffer(conversationId, conversation.OpportunityId, userId, version, null, request);
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

        var offerDto = await GetOfferDtoAsync(userId, conversationId, offer.Id);
        await PublishOfferChangedAsync(
            conversation,
            userId,
            offerDto,
            "Created",
            cancellationToken);
        await NotifyOfferRecipientIfAwayAsync(
            conversation,
            userId,
            offerDto,
            isReplacement: false,
            cancellationToken);
        return offerDto;
    }

    public async Task<NegotiationOfferDto> ReplaceOfferAsync(Guid userId, Guid conversationId, int offerId, CreateNegotiationOfferRequest request, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        ValidateOfferRequest(request);
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);

        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending offer versions can be replaced.");

        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_REPLACEMENT_FORBIDDEN", "Only the receiving participant can replace this offer version.");

        offer.Status = NegotiationOfferStatus.Replaced;
        var replacement = BuildOffer(conversationId, conversation.OpportunityId, userId, await GetNextOfferVersionAsync(conversationId), offer.Id, request);
        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _paidActionService.ChargeAsync(
                    userId,
                    PricingAction.SendOfferReplacement,
                    ReferenceType.Conversation,
                    $"{conversationId}:{offerId}",
                    cancellationToken);

                await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
                await _uow.Repository<NegotiationOffer>().AddAsync(replacement);
                conversation.UpdatedAt = replacement.CreatedAt;
                await _uow.Repository<Conversation>().UpdateAsync(conversation);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    userId,
                    "SendStructuredOffer",
                    "NegotiationOffer",
                    replacement.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        var replacementDto = await GetOfferDtoAsync(userId, conversationId, replacement.Id);
        await PublishOfferChangedAsync(
            conversation,
            userId,
            replacementDto,
            "Replaced",
            cancellationToken);
        await NotifyOfferRecipientIfAwayAsync(
            conversation,
            userId,
            replacementDto,
            isReplacement: true,
            cancellationToken);
        return replacementDto;
    }

    public async Task<AcceptOfferResultDto> AcceptOfferAsync(Guid userId, Guid conversationId, int offerId, CancellationToken cancellationToken = default)
    {
        var conversation = await GetAuthorizedActiveConversationAsync(userId, conversationId);
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);

        if (offer.Status != NegotiationOfferStatus.Pending)
            throw new BusinessValidationException("OFFER_NOT_ACTIVE", "Only pending offers can be accepted.");

        if (offer.CreatedByUserId == userId)
            throw new BusinessValidationException("OFFER_ACCEPT_FORBIDDEN", "Offer creator cannot accept their own offer.");

        // Idempotency: if participation was already created for this conversation, return existing result
        if (conversation.ParticipationRequestId.HasValue
            && conversation.ParticipationRequest?.Status == OpportunityJoinRequestStatus.Approved)
        {
            offer.Status = NegotiationOfferStatus.Accepted;
            await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);
            await _uow.SaveChangesAsync();

            var existingResult = new AcceptOfferResultDto
            {
                Offer = ToOfferDto(offer, userId),
                ParticipationRequestId = conversation.ParticipationRequestId.Value
            };
            await PublishOfferChangedAsync(
                conversation,
                userId,
                existingResult.Offer,
                "Accepted",
                cancellationToken);
            return existingResult;
        }

        var opportunity = conversation.Opportunity;
        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "The opportunity associated with this conversation was not found.");

        if (!IsEligibleForFunding(opportunity))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for participation.");

        var isFirstInvestor = !opportunity.FirstInvestorJoinedAt.HasValue;
        AcceptOfferResultDto result = null!;

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {

                // Serialize offer legs as immutable JSON terms snapshot
                var termsJson = JsonSerializer.Serialize(offer.Legs.Select(l => new
                {
                    l.LegType,
                    l.Amount,
                    l.EquityPercentage,
                    l.SharesTerms,
                    l.ReturnRate,
                    l.TermMonths,
                    l.RepaymentModel,
                    l.ProfitSharePercentage,
                    l.ExitTerms
                }));

                var totalAmount = offer.Legs.Sum(l => l.Amount);
                var participationSequence = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                        r.OpportunityId == opportunity.Id
                        && r.InvestorId == conversation.InvestorId.Value
                        && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation))
                    .Select(r => r.ParticipationSequence)
                    .DefaultIfEmpty(0)
                    .Max() + 1;

                // Create approved OpportunityJoinRequest
                var joinRequest = new OpportunityJoinRequest
                {
                    OpportunityId = opportunity.Id,
                    InvestorId = conversation.InvestorId!.Value,
                    ParticipationSequence = participationSequence,
                    IdempotencyKey = $"negotiation-offer:{offer.Id}",
                    RequestType = OpportunityJoinRequestType.InvestmentParticipation,
                    RequestedAmount = totalAmount,
                    FundingAmount = totalAmount,
                    FundingCurrency = opportunity.FundingCurrency,
                    CalculatedTotalAmount = totalAmount,
                    TermsSnapshotJson = termsJson,
                    Status = OpportunityJoinRequestStatus.Approved,
                    SourceConversationId = conversationId,
                    AcceptedOfferId = offer.Id,
                    IsVisibleToFounder = true,
                    IsVisibleToInvestor = true
                };

                await _uow.Repository<OpportunityJoinRequest>().AddAsync(joinRequest);
                await _uow.SaveChangesAsync(); // obtain Id within transaction

                // Link participation on conversation
                conversation.ParticipationRequestId = joinRequest.Id;
                conversation.Status = ConversationStatus.ParticipationCreated;
                conversation.UpdatedAt = DateTime.UtcNow;

                // Mark offer as accepted
                offer.Status = NegotiationOfferStatus.Accepted;

                await _uow.Repository<Conversation>().UpdateAsync(conversation);
                await _uow.Repository<NegotiationOffer>().UpdateAsync(offer);

                // Lock opportunity for first investor
                if (isFirstInvestor)
                {
                    opportunity.FirstInvestorJoinedAt = DateTime.UtcNow;
                    opportunity.IsLockedForEditing = true;
                    await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
                }

                // Flush the exact accepted offer state inside the transaction before
                // contract generation resolves the immutable source offer snapshot.
                await _uow.SaveChangesAsync();

                // Log opportunity events
                var investorName = conversation.Investor?.Profile?.FullName ?? conversation.Investor?.Name ?? "Investor";

                await _uow.Repository<OpportunityEvent>().AddAsync(new OpportunityEvent
                {
                    OpportunityId = opportunity.Id,
                    EventType = "NegotiationOfferAccepted",
                    Title = $"Offer #{offer.Id} Accepted",
                    Description = $"Investor {investorName} accepted negotiation offer #{offer.Id} for {totalAmount:F2}",
                    NewValue = offer.Id.ToString(),
                    CreatedByUserId = userId,
                    IsPublic = false
                });

                await _uow.Repository<OpportunityEvent>().AddAsync(new OpportunityEvent
                {
                    OpportunityId = opportunity.Id,
                    EventType = "InvestmentParticipationCreated",
                    Title = "Investment Participation Created",
                    Description = $"Investment participation of {totalAmount:F2} created from accepted offer #{offer.Id}",
                    NewValue = totalAmount.ToString("F2"),
                    CreatedByUserId = userId,
                    IsPublic = true
                });

                // Ensure opportunity Events are loaded for contract timeline entry
                opportunity.Events ??= new List<OpportunityEvent>();

                await _investmentContractService.GenerateForApprovedParticipationAsync(opportunity, joinRequest, DateTime.UtcNow, cancellationToken);

                await _uow.SaveChangesAsync();
                await _uow.CommitTransactionAsync();

                result = new AcceptOfferResultDto
                {
                    Offer = ToOfferDto(offer, userId),
                    ParticipationRequestId = joinRequest.Id
                };
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        // Reputation activities (non-authoritative; outside transaction)
        await ApplyReputationActivitySafeAsync(userId, "AcceptStructuredOffer", "NegotiationOffer", offer.Id.ToString());

        if (isFirstInvestor)
        {
            await ApplyReputationActivitySafeAsync(userId, "FirstInvestment", "Opportunity", opportunity.Id.ToString());
        }

        var outcomeRecipients = new[] { conversation.FounderId, conversation.InvestorId }
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .Select(recipientId => new NotificationEventCreation(
                recipientId,
                "ParticipationApprovedFromAcceptedOffer",
                offer.Id.ToString(),
                "Participation approved",
                $"Participation in {opportunity.Title} has been approved based on the accepted offer.",
                "success",
                $"/admin/opportunities/{opportunity.Id}/room",
                userId,
                opportunity.Id));
        await _userNotificationService.CreateEventRangeAsync(outcomeRecipients, cancellationToken);
        await PublishOfferChangedAsync(
            conversation,
            userId,
            result.Offer,
            "Accepted",
            cancellationToken);

        return result;
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

        var rejectedOfferDto = await GetOfferDtoAsync(userId, conversationId, offer.Id);
        await PublishOfferChangedAsync(
            conversation,
            userId,
            rejectedOfferDto,
            "Rejected",
            cancellationToken);
        return rejectedOfferDto;
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

        var withdrawnOfferDto = await GetOfferDtoAsync(userId, conversationId, offer.Id);
        await PublishOfferChangedAsync(
            conversation,
            userId,
            withdrawnOfferDto,
            "Withdrawn",
            cancellationToken);
        return withdrawnOfferDto;
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
            o => o.CreatedByUser!,
            o => o.Conversation!,
            o => o.Opportunity!))
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

    private async Task<NegotiationOffer> GetAuthorizedDirectOfferAsync(Guid userId, int opportunityId, int offerId, bool founderOnly = false)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can access offers.");
        var opportunity = await GetOpportunityAsync(opportunityId);
        var isFounder = opportunity.FounderId == userId;
        if (founderOnly && !isFounder)
            throw new BusinessValidationException("OFFER_FORBIDDEN", "Only the opportunity founder can perform this action.");

        var offer = (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(
                o => o.Id == offerId
                     && o.OpportunityId == opportunityId
                     && o.ConversationId == null
                     && (isFounder || o.CreatedByUserId == userId),
                o => o.Legs,
                o => o.CreatedByUser!,
                o => o.Opportunity!))
            .FirstOrDefault();
        if (offer == null)
            throw new BusinessValidationException("OFFER_NOT_FOUND", "Direct offer was not found.");
        return offer;
    }

    private async Task<NegotiationOfferDto> GetOfferDtoAsync(Guid userId, Guid conversationId, int offerId)
    {
        var offer = await GetAuthorizedOfferAsync(userId, conversationId, offerId);
        return ToOfferDto(offer, userId);
    }

    private async Task PublishOfferChangedAsync(
        Conversation conversation,
        Guid actorUserId,
        NegotiationOfferDto offer,
        string action,
        CancellationToken cancellationToken)
    {
        var recipientId = conversation.FounderId == actorUserId
            ? conversation.InvestorId
            : conversation.FounderId;
        if (!recipientId.HasValue || recipientId.Value == Guid.Empty)
            return;

        var data = new Dictionary<string, object?>
        {
            ["conversationId"] = conversation.Id.ToString("D"),
            ["offerId"] = offer.Id,
            ["replacesOfferId"] = offer.ReplacesOfferId,
            ["version"] = offer.Version,
            ["status"] = offer.Status.ToString(),
            ["action"] = action,
            ["actorUserId"] = actorUserId.ToString("D")
        };

        try
        {
            await _realtimeEventPublisher.PublishToUserAsync(
                recipientId.Value,
                "ConversationOffersChanged",
                conversation.Id,
                data,
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Offer {OfferId} was saved but realtime publication failed for conversation {ConversationId}",
                offer.Id,
                conversation.Id);
        }
    }

    private async Task NotifyOfferRecipientIfAwayAsync(
        Conversation conversation,
        Guid actorUserId,
        NegotiationOfferDto offer,
        bool isReplacement,
        CancellationToken cancellationToken)
    {
        var recipientId = conversation.FounderId == actorUserId
            ? conversation.InvestorId
            : conversation.FounderId;
        if (!recipientId.HasValue
            || recipientId.Value == Guid.Empty
            || _conversationPresence.IsActive(recipientId.Value, conversation.Id))
            return;

        var actorName = conversation.FounderId == actorUserId
            ? conversation.Founder?.Profile?.FullName ?? conversation.Founder?.Name ?? "Founder"
            : conversation.Investor?.Profile?.FullName ?? conversation.Investor?.Name ?? "Investor";
        var opportunityTitle = conversation.Opportunity?.Title ?? conversation.Category ?? "opportunity";

        try
        {
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                recipientId.Value,
                isReplacement ? "NegotiationOfferReplacementReceived" : "NegotiationOfferReceived",
                offer.Id.ToString(),
                isReplacement
                    ? $"Offer replacement from {actorName}"
                    : $"New offer from {actorName}",
                $"A formal offer was sent for {opportunityTitle}.",
                "info",
                $"/admin/chat?conversationId={conversation.Id:D}",
                actorUserId,
                conversation.OpportunityId), cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Offer {OfferId} was saved but recipient notification failed for conversation {ConversationId}",
                offer.Id,
                conversation.Id);
        }
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

    private static NegotiationOffer BuildOffer(Guid? conversationId, int? opportunityId, Guid createdByUserId, int version, int? replacesOfferId, CreateNegotiationOfferRequest request)
    {
        var now = DateTime.UtcNow;
        var offer = new NegotiationOffer
        {
            ConversationId = conversationId,
            CreatedByUserId = createdByUserId,
            Version = version,
            OpportunityId = opportunityId,
            ReplacesOfferId = replacesOfferId,
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

    private async Task<ChatMessage> AddMessageAsync(
        Guid conversationId,
        Guid senderId,
        string text,
        DateTime now,
        Guid? clientMessageId = null)
    {
        var message = new ChatMessage
        {
            Id = clientMessageId ?? Guid.NewGuid(),
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
            r => r.Requester!.Profile!,
            r => r.Recipient!,
            r => r.Recipient!.Profile!,
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

    private static NegotiationConversationDto ToConversationDto(Conversation conversation, Guid viewerUserId, int unreadCount = 0)
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
            UpdatedAt = conversation.UpdatedAt,
            UnreadCount = unreadCount
        };
    }

    private NegotiationOfferDto ToOfferDto(NegotiationOffer offer, Guid? viewerId = null) => new()
    {
        Id = offer.Id,
        ConversationId = offer.ConversationId,
        OpportunityId = offer.OpportunityId,
        OpportunityTitle = offer.Opportunity?.Title,
        CreatedByUserId = offer.CreatedByUserId,
        CreatedByName = ToUserSummary(offer.CreatedByUser, offer.CreatedByUserId, "Participant").Name,
        CreatedByRole = offer.Opportunity?.FounderId == offer.CreatedByUserId ? "Founder" : "Investor",
        Version = offer.Version,
        ReplacesOfferId = offer.ReplacesOfferId,
        Status = offer.Status,
        Note = offer.Note,
        Currency = offer.Currency,
        CreatedAt = offer.CreatedAt,
        Legs = offer.Legs
            .OrderBy(l => l.Id)
            .Select(ToOfferLegDto)
            .ToList(),
        CanAccept = offer.Status == NegotiationOfferStatus.Pending
            && viewerId.HasValue
            && offer.CreatedByUserId != viewerId.Value
            && ((offer.ConversationId.HasValue && offer.Conversation?.FounderId == viewerId.Value)
                || (offer.OpportunityId.HasValue && offer.Opportunity?.FounderId == viewerId.Value)),
        CanReject = offer.Status == NegotiationOfferStatus.Pending
            && viewerId.HasValue
            && offer.CreatedByUserId != viewerId.Value
            && ((offer.ConversationId.HasValue && offer.Conversation?.FounderId == viewerId.Value)
                || (offer.OpportunityId.HasValue && offer.Opportunity?.FounderId == viewerId.Value)),
        CanRespond = offer.Status == NegotiationOfferStatus.Pending
            && offer.ConversationId.HasValue
            && viewerId.HasValue
            && offer.CreatedByUserId != viewerId.Value,
        CanWithdraw = offer.Status == NegotiationOfferStatus.Pending
            && viewerId.HasValue
            && offer.CreatedByUserId == viewerId.Value
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

    private static NegotiationMessageDto ToMessageDto(ChatMessage message, Conversation conversation)
    {
        var sender = ResolveMessageSender(message, conversation);
        return new NegotiationMessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId ?? Guid.Empty,
            SenderId = message.SenderUserId ?? (Guid.TryParse(message.SenderId, out var senderId) ? senderId : Guid.Empty),
            SenderName = sender.Name,
            SenderRole = sender.Role,
            Message = message.IsDeleted ? string.Empty : message.MessageText,
            SentAt = message.Timestamp,
            IsEdited = message.IsEdited,
            EditedAt = message.EditedAt,
            IsDeleted = message.IsDeleted,
            Attachments = message.AttachmentsJson,
            IsRead = message.IsRead
        };
    }

    private static NegotiationUserSummaryDto ResolveMessageSender(ChatMessage message, Conversation conversation)
    {
        var senderId = message.SenderUserId
            ?? (Guid.TryParse(message.SenderId, out var parsedSenderId) ? parsedSenderId : Guid.Empty);

        if (senderId == conversation.FounderId)
            return ToUserSummary(conversation.Founder, conversation.FounderId, "Founder");

        if (senderId == conversation.InvestorId)
            return ToUserSummary(conversation.Investor, conversation.InvestorId, "Investor");

        return ToUserSummary(null, senderId, "Participant");
    }

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

    private static bool IsEligibleForFunding(Opportunity opportunity)
    {
        var fundingStatus = EffectiveFundingStatus(opportunity);
        return fundingStatus == OpportunityFundingStatus.Open
            && (!opportunity.FundingOpensAt.HasValue || opportunity.FundingOpensAt <= DateTime.UtcNow)
            && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > DateTime.UtcNow);
    }

    private static OpportunityFundingStatus EffectiveFundingStatus(Opportunity opportunity)
    {
        var now = DateTime.UtcNow;
        if (opportunity.FundingStatus == OpportunityFundingStatus.Scheduled
            && opportunity.FundingOpensAt <= now
            && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > now))
            return OpportunityFundingStatus.Open;
        if (opportunity.FundingStatus == OpportunityFundingStatus.Open
            && opportunity.FundingClosesAt.HasValue && opportunity.FundingClosesAt <= now)
            return OpportunityFundingStatus.Closed;
        return opportunity.FundingStatus == OpportunityFundingStatus.NotScheduled
            && opportunity.Status is OpportunityStatus.Published or OpportunityStatus.Funding or OpportunityStatus.FullyFunded or OpportunityStatus.InProgress
                ? OpportunityFundingStatus.Open
                : opportunity.FundingStatus;
    }
}
