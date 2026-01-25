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
    /// </summary>
    Equity = 2
}
