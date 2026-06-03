namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Progressive trust levels governing what a user can do on the platform.
/// Each level unlocks additional capabilities.
/// </summary>
public enum TrustLevel
{
    /// <summary>
    /// Level 0 — Visitor / Unauthenticated.
    /// Can browse public opportunity cards only.
    /// </summary>
    Visitor = 0,

    /// <summary>
    /// Level 1 — Registered. Phone + email verified, country set.
    /// Can view opportunity details, save opportunities, follow users.
    /// </summary>
    Registered = 1,

    /// <summary>
    /// Level 2 — Interactive. Profile image + bio + professional info complete.
    /// Can comment, request joining opportunities, participate in discussions.
    /// </summary>
    Interactive = 2,

    /// <summary>
    /// Level 3 — Trusted Active. Earned through account age, activity quality, 
    /// profile completion, engagement, and community reputation.
    /// Founders can publish opportunities. Investors can join verified deals.
    /// </summary>
    TrustedActive = 3
}
