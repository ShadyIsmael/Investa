namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the types of investments available in the platform.
/// This enum provides an extensible type system for investment opportunities.
/// </summary>
public enum InvestmentType
{
    /// <summary>
    /// Founding investment - Initial capital contribution by the founder/business owner.
    /// This represents the founder's own investment in their business venture.
    /// </summary>
    Founding = 1,

    /// <summary>
    /// Equity investment - Share-based investment by external investors.
    /// Investors purchase shares in exchange for ownership percentage.
    /// Supports equity crowdfunding and capital raising.
    /// Exit strategy: Ownership growth, acquisition, IPO, secondary share sale.
    /// </summary>
    Equity = 2,

    /// <summary>
    /// Revenue Sharing investment - Temporary agreement where investors receive periodic returns from business revenue.
    /// Investors participate in revenue distribution for a fixed contract duration.
    /// Exit strategy: Contract completion, payout schedule completion, agreement expiration.
    /// </summary>
    RevenueSharing = 3,

    /// <summary>
    /// Loan/Debt investment - Debt-based funding where investors provide loans with interest repayment.
    /// Investors receive principal + interest according to repayment schedule.
    /// Exit strategy: Repayment schedule completion, loan maturity, or default handling.
    /// </summary>
    Loan = 4
}
