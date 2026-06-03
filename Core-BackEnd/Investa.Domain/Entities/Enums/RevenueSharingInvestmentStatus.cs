namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the lifecycle status for revenue sharing investments.
/// Revenue sharing investments follow a fixed-duration contract path.
/// </summary>
public enum RevenueSharingInvestmentStatus
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
    /// Revenue distribution phase - periodic payouts to investors
    /// </summary>
    RevenueDistribution = 2,

    /// <summary>
    /// Contract completed successfully, all payouts distributed
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Contract expired before completion
    /// </summary>
    Expired = 4,

    /// <summary>
    /// Investment opportunity closed without full funding
    /// </summary>
    Closed = 5
}
