namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the possible exit strategies for equity investments.
/// Equity investors exit through ownership monetization events.
/// </summary>
public enum EquityExitType
{
    /// <summary>
    /// Company is acquired by another entity
    /// </summary>
    Acquisition = 1,

    /// <summary>
    /// Strategic buyout by investors or larger company
    /// </summary>
    StrategicBuyout = 2,

    /// <summary>
    /// Secondary market sale of shares to other investors
    /// </summary>
    SecondaryShareSale = 3,

    /// <summary>
    /// Initial Public Offering - company goes public
    /// </summary>
    IPO = 4,

    /// <summary>
    /// Founder buys back shares from investors
    /// </summary>
    FounderBuyback = 5,

    /// <summary>
    /// Exit strategy not yet determined
    /// </summary>
    Undetermined = 6
}
