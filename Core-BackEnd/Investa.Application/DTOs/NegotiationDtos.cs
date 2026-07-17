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

public class CloseNegotiationConversationRequest
{
    [StringLength(1000)]
    public string? Reason { get; set; }
}

public class CreateNegotiationOfferRequest
{
    [StringLength(1000)]
    public string? Note { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    [Required]
    public IReadOnlyList<CreateNegotiationOfferLegRequest> Legs { get; set; } = Array.Empty<CreateNegotiationOfferLegRequest>();
}

public class CreateNegotiationOfferLegRequest
{
    [Required]
    public NegotiationOfferLegType? LegType { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Range(0.01, 100, ErrorMessage = "EquityPercentage must be between 0.01 and 100.")]
    public decimal? EquityPercentage { get; set; }

    [StringLength(500)]
    public string? SharesTerms { get; set; }

    [Range(0.01, 100, ErrorMessage = "ReturnRate must be between 0.01 and 100.")]
    public decimal? ReturnRate { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "TermMonths must be greater than zero.")]
    public int? TermMonths { get; set; }

    [StringLength(100)]
    public string? RepaymentModel { get; set; }

    [Range(0.01, 100, ErrorMessage = "ProfitSharePercentage must be between 0.01 and 100.")]
    public decimal? ProfitSharePercentage { get; set; }

    [StringLength(1000)]
    public string? ExitTerms { get; set; }
}

public class NegotiationOfferDto
{
    public int Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public int Version { get; set; }
    public int? ParentOfferId { get; set; }
    public NegotiationOfferStatus Status { get; set; }
    public string? Note { get; set; }
    public string Currency { get; set; } = "Credits";
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<NegotiationOfferLegDto> Legs { get; set; } = Array.Empty<NegotiationOfferLegDto>();
}

public class NegotiationOfferLegDto
{
    public int Id { get; set; }
    public NegotiationOfferLegType LegType { get; set; }
    public decimal Amount { get; set; }
    public decimal? EquityPercentage { get; set; }
    public string? SharesTerms { get; set; }
    public decimal? ReturnRate { get; set; }
    public int? TermMonths { get; set; }
    public string? RepaymentModel { get; set; }
    public decimal? ProfitSharePercentage { get; set; }
    public string? ExitTerms { get; set; }
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
    public bool IsVisibleToCurrentUser { get; set; }
    public Guid? ClosedByUserId { get; set; }
    public string? CloseReason { get; set; }
    public DateTime? ClosedAt { get; set; }
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
