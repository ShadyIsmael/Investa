namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the lifecycle status for equity investments.
/// Equity investments follow a long-term ownership growth path.
/// </summary>
public enum EquityInvestmentStatus
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
    /// Funding round completed, company is scaling operations
    /// </summary>
    Funded = 2,

    /// <summary>
    /// Company is in growth/scaling phase
    /// </summary>
    Scaling = 3,

    /// <summary>
    /// Exit event completed (acquisition, IPO, buyback, etc.)
    /// </summary>
    Exited = 4,

    /// <summary>
    /// Company was acquired by another entity
    /// </summary>
    Acquired = 5,

    /// <summary>
    /// Investment opportunity closed without full funding
    /// </summary>
    Closed = 6
}
