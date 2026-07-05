using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class CreateNegotiationConversationRequest
{
    [StringLength(1000)]
    public string? Message { get; set; }
}

public class SendNegotiationMessageRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Message { get; set; } = string.Empty;
}

public class RejectNegotiationRequest
{
    [StringLength(1000)]
    public string? Reason { get; set; }
}

public class NegotiationConversationDto
{
    public Guid Id { get; set; }
    public int OpportunityId { get; set; }
    public ConversationStatus ConversationStatus { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public Guid RequesterUserId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterRole { get; set; } = string.Empty;
    public Guid RecipientUserId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientRole { get; set; } = string.Empty;
    public Guid CounterpartyUserId { get; set; }
    public string CounterpartyName { get; set; } = string.Empty;
    public string CounterpartyRole { get; set; } = string.Empty;
    public OpportunitySummaryForNegotiationDto Opportunity { get; set; } = new();
    public NegotiationUserSummaryDto Founder { get; set; } = new();
    public NegotiationUserSummaryDto Investor { get; set; } = new();
    public bool FounderReady { get; set; }
    public bool InvestorReady { get; set; }
    public bool CanContinue { get; set; }
    public bool ProjectRoomUnlocked { get; set; }
    public OpportunityJoinRequestStatus? ParticipationStatus { get; set; }
    public int? ParticipationRequestId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class NegotiationConversationRequestDto
{
    public Guid Id { get; set; }
    public int OpportunityId { get; set; }
    public ConversationRequestStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public Guid RequesterUserId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterRole { get; set; } = string.Empty;
    public Guid RecipientUserId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientRole { get; set; } = string.Empty;
    public Guid CounterpartyUserId { get; set; }
    public string CounterpartyName { get; set; } = string.Empty;
    public string CounterpartyRole { get; set; } = string.Empty;
    public OpportunitySummaryForNegotiationDto Opportunity { get; set; } = new();
    public string? Message { get; set; }
    public bool CanAccept { get; set; }
    public bool CanReject { get; set; }
    public bool CanWithdraw { get; set; }
    public Guid? AcceptedConversationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class OpportunityViewerStateDto
{
    public int OpportunityId { get; set; }
    public bool IsFounder { get; set; }
    public bool HasConversationRequest { get; set; }
    public Guid? ConversationRequestId { get; set; }
    public ConversationRequestStatus? ConversationRequestStatus { get; set; }
    public string? ConversationRequestStatusText { get; set; }
    public bool HasConversation { get; set; }
    public Guid? ConversationId { get; set; }
    public ConversationStatus? ConversationStatus { get; set; }
    public string? ConversationStatusText { get; set; }
    public bool FounderReady { get; set; }
    public bool InvestorReady { get; set; }
    public bool CanRequestChat { get; set; }
    public bool CanContinueConversation { get; set; }
    public bool CanMarkReadyToProceed { get; set; }
    public int? ParticipationRequestId { get; set; }
    public OpportunityJoinRequestStatus? ParticipationStatus { get; set; }
    public bool HasPendingParticipationRequest { get; set; }
    public bool CanApproveParticipation { get; set; }
    public bool CanRejectParticipation { get; set; }
    public bool ProjectRoomUnlocked { get; set; }
    public bool CanOpenProjectRoom { get; set; }
}

public class NegotiationConversationDetailDto : NegotiationConversationDto
{
    public IReadOnlyList<NegotiationMessageDto> Messages { get; set; } = Array.Empty<NegotiationMessageDto>();
}

public class NegotiationMessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsEdited { get; set; }
    public DateTime? EditedAt { get; set; }
    public bool IsDeleted { get; set; }
    public string? Attachments { get; set; }
}

public class OpportunitySummaryForNegotiationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public OpportunityStatus Status { get; set; }
    public InvestmentModel InvestmentModel { get; set; }
}

public class NegotiationUserSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
