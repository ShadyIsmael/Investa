namespace Investa.Domain.Entities.Enums;

public enum EquityOwnershipModel
{
    PercentageBased = 1,
    ShareBased = 2
}

public enum EquityPositionStatus
{
    PendingFunding = 1,
    Active = 2,
    /// <summary>
    /// Funding is complete, but the contractual shares require an approved
    /// capitalization event before they can enter the active cap table.
    /// </summary>
    PendingCapitalization = 3,
    PartiallyExited = 4,
    FullyExited = 5,
    Closed = 6
}

public enum EquityHoldingLedgerEventType
{
    InitialActivation = 1,
    ShareIssuance = 2,
    CapitalIncrease = 3,
    ShareSplit = 4,
    ReverseSplit = 5,
    TransferIn = 6,
    TransferOut = 7,
    ExternalExit = 8
}

public enum EquityCorporateEventType
{
    ShareIssuance = 1,
    CapitalIncrease = 2,
    ShareSplit = 3,
    ReverseSplit = 4
}

public enum EquityCorporateEventStatus
{
    Draft = 1,
    PendingApproval = 2,
    Approved = 3,
    Applied = 4,
    Rejected = 5,
    Cancelled = 6
}

public enum EquityDividendStatus
{
    Declared = 1,
    EntitlementsGenerated = 2,
    Closed = 3,
    Cancelled = 4
}

public enum EquityDividendDistributionStatus
{
    PendingConfirmation = 1,
    Confirmed = 2,
    Disputed = 3
}

public enum EquityTransferType
{
    PartialTransfer = 1,
    FullTransfer = 2,
    ExternalExit = 3
}

public enum EquityTransferStatus
{
    Draft = 1,
    PendingAcknowledgement = 2,
    PendingApproval = 3,
    Applied = 4,
    Rejected = 5,
    Cancelled = 6
}
