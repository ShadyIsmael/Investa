namespace Investa.Domain.Entities.Enums;
/// <summary>
/// Type of the external entity that a wallet transaction references.
/// Stored alongside <see cref="WalletTransaction.ReferenceId"/> so
/// that any subsystem (payments, investments, subscriptions, ...)
/// can be linked to a wallet movement without coupling the wallet
/// to those subsystems.
/// </summary>
public enum ReferenceType
{
    /// <summary>No specific external reference.</summary>
    None = 0,
    /// <summary>Linked to an Investment (participation, publish, feature).</summary>
    Investment = 1,
    /// <summary>Linked to an Investment Opportunity (publish / feature fees).</summary>
    Opportunity = 2,
    /// <summary>Linked to a platform subscription.</summary>
    Subscription = 3,
    /// <summary>Linked to another wallet operation (e.g. reversal).</summary>
    Wallet = 4,
    /// <summary>Linked to an administrative action.</summary>
    Admin = 5,
    /// <summary>Linked to an internal / system process (bonus grants, scheduled jobs).</summary>
    System = 6
}
