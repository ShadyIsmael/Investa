namespace Investa.Domain.Entities.Enums;
/// <summary>
/// Business reason for a wallet transaction.
/// - Credit reasons: money flowing INTO the wallet.
/// - Debit reasons: money flowing OUT of the wallet.
/// This is the canonical "why" recorded on every transaction and
/// is used to drive analytics, reporting, and reverse operations.
/// </summary>
public enum WalletReason
{
    // ── Credit reasons ────────────────────────────────────────────────
    /// <summary>Credits purchased via any payment gateway (Stripe, Paymob, Fawry, ...).</summary>
    Purchase = 1,
    /// <summary>Promotional / referral / sign-up bonus credits.</summary>
    Bonus = 2,
    /// <summary>Refund of a previous debit (e.g. failed investment, cancelled subscription).</summary>
    Refund = 3,
    /// <summary>Manual adjustment performed by an administrator (positive).</summary>
    AdminAdjustmentCredit = 4,
    // ── Debit reasons ────────────────────────────────────────────────
    /// <summary>Funds committed to an investment opportunity.</summary>
    Investment = 10,
    /// <summary>Fee charged to publish an investment opportunity.</summary>
    PublishOpportunity = 11,
    /// <summary>Fee charged to feature / promote an opportunity.</summary>
    FeaturedOpportunity = 12,
    /// <summary>Recurring or one-time platform subscription fee.</summary>
    Subscription = 13,
    /// <summary>Manual adjustment performed by an administrator (negative).</summary>
    AdminAdjustmentDebit = 14
}
