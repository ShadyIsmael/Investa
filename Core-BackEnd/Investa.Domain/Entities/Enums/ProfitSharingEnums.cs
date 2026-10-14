namespace Investa.Domain.Entities.Enums;

public enum ProfitSharingObligationStatus
{
    PendingFunding = 1,
    Active = 2,
    Matured = 3,
    Settled = 4,
    Closed = 5
}

public enum ProfitSharingReportingPeriodStatus
{
    Upcoming = 1,
    Open = 2,
    Declared = 3,
    NoEntitlement = 4,
    EntitlementCalculated = 5,
    PartiallyDistributed = 6,
    Distributed = 7
}

public enum ProfitSharingDeclarationStatus
{
    Declared = 1
}

public enum ProfitSharingDistributionDeclarationStatus
{
    PendingConfirmation = 1,
    Confirmed = 2,
    Disputed = 3
}

public enum ProfitSharingCalculationBasis
{
    Undefined = 0,
    Profit = 1,
    Revenue = 2
}
