namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Decision made by checker during transaction review.
/// </summary>
public enum FinanceReviewDecision
{
    /// <summary>Transaction approved and ready for confirmation</summary>
    Approved = 1,

    /// <summary>Transaction rejected and returned to maker</summary>
    Rejected = 2
}
