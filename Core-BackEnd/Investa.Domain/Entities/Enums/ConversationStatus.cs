using System;

namespace Investa.Domain.Entities.Enums
{
    public enum ConversationStatus
    {
        Requested = 0,
        Pending = Requested,
        Accepted = 1,
        Negotiation = 2,
        InProgress = Negotiation,
        ClosedByFounder = 3,
        ClosedByInvestor = 4,
        Cancelled = 5,
        Completed = 6,
        Closed = Completed,
        ReadyForParticipation = 7,
        ParticipationCreated = 8,
        ParticipationApproved = 9,
        ParticipationRejected = 10,
        DeclinedByFounder = 11
    }
}
