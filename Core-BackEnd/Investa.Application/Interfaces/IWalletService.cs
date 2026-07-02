using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Enums;
namespace Investa.Application.Interfaces;
/// <summary>
/// Wallet Engine (Sprint 1).
///
/// Public surface that any future subsystem (payment gateways, accounting,
/// pricing, subscriptions, investments, ...) will consume to mutate or
/// query a user's spendable balance. All public methods are designed to
/// remain stable; future integrations must NOT extend or change this
/// interface — they should only call it.
///
/// Invariants enforced by the implementation:
/// - Every AuthUser has at most one Wallet (1:1).
/// - Every successful Credit / Debit produces exactly one immutable
///   WalletTransaction row inside the same database transaction that
///   updates <see cref="WalletDto.CurrentBalance"/>.
/// - The balance is never allowed to go below zero.
/// </summary>
public interface IWalletService
{
    /// <summary>Returns the wallet for the given user. Creates an empty wallet if none exists yet.</summary>
    Task<WalletDto> GetWalletAsync(Guid userId, CancellationToken cancellationToken = default);
    /// <summary>Returns the current spendable balance for the given user. Creates an empty wallet if none exists yet.</summary>
    Task<decimal> GetBalanceAsync(Guid userId, CancellationToken cancellationToken = default);
    /// <summary>Explicitly creates an empty wallet for the given user. No-op if one already exists.</summary>
    Task<WalletDto> CreateWalletAsync(Guid userId, CancellationToken cancellationToken = default);
    /// <summary>Credits the wallet and records an immutable WalletTransaction row.</summary>
    Task<WalletTransactionDto> CreditAsync(
        Guid userId,
        decimal amount,
        WalletReason reason,
        ReferenceType referenceType = ReferenceType.None,
        string? referenceId = null,
        string? description = null,
        Guid? createdByUserId = null,
        CancellationToken cancellationToken = default);
    /// <summary>
    /// Debits the wallet and records an immutable WalletTransaction row.
    /// Throws <see cref="Investa.Application.Common.BusinessValidationException"/>
    /// when the resulting balance would go below zero.
    /// </summary>
    Task<WalletTransactionDto> DebitAsync(
        Guid userId,
        decimal amount,
        WalletReason reason,
        ReferenceType referenceType = ReferenceType.None,
        string? referenceId = null,
        string? description = null,
        Guid? createdByUserId = null,
        CancellationToken cancellationToken = default);
    /// <summary>Returns the immutable transaction history for the given user, newest first.</summary>
    Task<IReadOnlyList<WalletTransactionDto>> GetTransactionsAsync(
        Guid userId,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);
}
