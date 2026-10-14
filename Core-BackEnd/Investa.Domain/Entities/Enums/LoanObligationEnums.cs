namespace Investa.Domain.Entities.Enums;

public enum LoanObligationStatus
{
    PendingFunding = 1,
    Active = 2,
    Matured = 3,
    FullyRepaid = 4,
    Defaulted = 5,
    Closed = 6
}

public enum LoanRepaymentInstallmentStatus
{
    Upcoming = 1,
    Due = 2,
    Overdue = 3,
    Cancelled = 4,
    PartiallyPaid = 5,
    Paid = 6
}
