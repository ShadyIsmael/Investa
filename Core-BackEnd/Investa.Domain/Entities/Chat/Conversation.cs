using System;

using Investa.Domain.Entities.Enums;



namespace Investa.Domain.Entities.Chat

{

    public class Conversation

    {

        public Guid Id { get; set; }

        public string UserMobile { get; set; } = string.Empty;

        public string? AdminEmail { get; set; }

        public string? Category { get; set; }

        public Guid? ConversationRequestId { get; set; }

        public ConversationRequest? ConversationRequest { get; set; }

        public int? OpportunityId { get; set; }

        public Opportunity? Opportunity { get; set; }

        public Guid? FounderId { get; set; }

        public AuthUser? Founder { get; set; }

        public Guid? InvestorId { get; set; }

        public AuthUser? Investor { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        public bool FounderReady { get; set; }

        public bool InvestorReady { get; set; }

        public DateTime? ReadyForParticipationAt { get; set; }

        public int? ParticipationRequestId { get; set; }

        public OpportunityJoinRequest? ParticipationRequest { get; set; }

        public bool IsVisibleToFounder { get; set; } = true;

        public bool IsVisibleToInvestor { get; set; } = true;

        public DateTime? ClosedAt { get; set; }



        // New status field tracking lifecycle of the conversation (Pending, InProgress, Closed)

        public ConversationStatus Status { get; set; } = ConversationStatus.Pending;



        public ICollection<ChatMessage>? Messages { get; set; }

    }

}

