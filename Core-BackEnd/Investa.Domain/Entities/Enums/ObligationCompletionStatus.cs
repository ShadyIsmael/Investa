namespace Investa.Domain.Entities.Enums;

public enum ObligationCompletionStatus
{
    NotStarted = 0,
    AwaitingConfirmations = 1,
    Completed = 2
}

public enum ObligationPartyRole
{
    Founder = 1,
    Investor = 2
}

public enum ObligationConfirmationStatus
{
    Pending = 0,
    Confirmed = 1
}
