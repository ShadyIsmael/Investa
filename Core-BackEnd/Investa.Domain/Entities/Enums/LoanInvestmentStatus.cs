namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the lifecycle status for loan/debt investments.
/// Loan investments follow a repayment schedule path.
/// </summary>
public enum LoanInvestmentStatus
{
    /// <summary>
    /// Investment opportunity is being drafted by founder
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Investment opportunity is live and accepting investors
    /// </summary>
    Active = 1,

    /// <summary>
    /// Repayment phase - borrower is making scheduled repayments
    /// </summary>
    Repayment = 2,

    /// <summary>
    /// Loan completed successfully, all repayments made
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Loan is in default - borrower failed to make payments
    /// </summary>
    Defaulted = 4,

    /// <summary>
    /// Investment opportunity closed without full funding
    /// </summary>
    Closed = 5
}
