namespace Investa.Domain.Entities.Enums;
/// <summary>
/// Direction of a wallet balance change.
/// All wallet transactions are recorded as either a Credit (money in)
/// or a Debit (money out). This enum is independent of the underlying
/// payment gateway, accounting system, or pricing engine.
/// </summary>
public enum WalletDirection
{
    /// <summary>Balance is increased (e.g. purchase, bonus, refund, admin credit).</summary>
    Credit = 1,
    /// <summary>Balance is decreased (e.g. investment, subscription, admin debit).</summary>
    Debit = 2
}
