namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Lifecycle status of a finance transaction.
/// </summary>
public enum FinanceTransactionStatus
{
    /// <summary>Transaction is being created, not yet submitted</summary>
    Draft = 1,

    /// <summary>Transaction needs required documents before review</summary>
    NeedsDocuments = 2,

    /// <summary>Transaction is ready for approval review</summary>
    ReadyForReview = 3,

    /// <summary>Transaction has been confirmed and is immutable</summary>
    Confirmed = 4,

    /// <summary>Transaction has been reversed (cancellation with reason)</summary>
    Reversed = 5,

    /// <summary>Transaction has been cancelled (rejection or user action)</summary>
    Cancelled = 6,

    /// <summary>Transaction has been rejected by reviewer, returned to maker</summary>
    Rejected = 7
}
