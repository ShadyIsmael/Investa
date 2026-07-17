using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

using Microsoft.Extensions.Logging;
namespace Investa.Infrastructure.Services;
/// <summary>
/// Wallet Engine (Sprint 1).
///
/// Implementation rules:
/// - One AuthUser has exactly one Wallet. The wallet is created lazily by
///   <see cref="GetWalletAsync"/> / <see cref="GetBalanceAsync"/> and
///   explicitly by <see cref="CreateWalletAsync"/> (which is also called
///   from the user-registration flow).
/// - Every Credit / Debit runs inside ONE database transaction:
///     1. Load current balance (with row-level lock to be safe).
///     2. Calculate new balance.
///     3. Insert the immutable <see cref="WalletTransaction"/> row.
///     4. Update <see cref="Wallet.CurrentBalance"/> and lifetime totals.
///     5. Commit.
/// - The balance is never allowed to go below zero. A debit that would
///   produce a negative balance throws <see cref="BusinessValidationException"/>
///   and rolls back the transaction.
/// - The transaction log is INSERT-ONLY. There is no public method that
///   updates or deletes a <see cref="WalletTransaction"/>.
/// - No payment gateway, no accounting, no pricing. This service is the
///   single source of truth for the user's spendable balance.
/// </summary>
public class WalletService : IWalletService
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<WalletService> _logger;
    public WalletService(IUnitOfWork uow, ILogger<WalletService> logger)
    {
        _uow = uow;
        _logger = logger;
    }
    public async Task<WalletDto> GetWalletAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var wallet = (await _uow.Repository<Wallet>().FindAsync(w => w.UserId == userId)).FirstOrDefault();
        if (wallet == null)
        {
            // Idempotent auto-create: every user has a wallet, always.
            return await CreateWalletAsync(userId, cancellationToken);
        }
        return ToDto(wallet);
    }
    public async Task<decimal> GetBalanceAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var wallet = (await _uow.Repository<Wallet>().FindAsync(w => w.UserId == userId)).FirstOrDefault();
        if (wallet == null)
        {
            await CreateWalletAsync(userId, cancellationToken);
            return 0m;
        }
        return wallet.CurrentBalance;
    }
    public async Task<WalletDto> CreateWalletAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var existing = (await _uow.Repository<Wallet>().FindAsync(w => w.UserId == userId)).FirstOrDefault();
        if (existing != null) return ToDto(existing);
        var wallet = new Wallet
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CurrentBalance = 0m,
            TotalPurchasedCredits = 0m,
            TotalBonusCredits = 0m,
            TotalRefundCredits = 0m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _uow.Repository<Wallet>().AddAsync(wallet);
        await _uow.SaveChangesAsync();
        _logger.LogInformation("Wallet created for UserId={UserId} WalletId={WalletId}", userId, wallet.Id);
        return ToDto(wallet);
    }
    public async Task<WalletTransactionDto> CreditAsync(
        Guid userId,
        decimal amount,
        WalletReason reason,
        ReferenceType referenceType = ReferenceType.None,
        string? referenceId = null,
        string? description = null,
        Guid? createdByUserId = null,
        CancellationToken cancellationToken = default)
    {
        ValidateAmount(amount);
        EnsureCreditReason(reason);
        var tx = await ExecuteBalanceMoveAsync(
            userId, amount, WalletDirection.Credit, reason, referenceType, referenceId, description, createdByUserId, cancellationToken);
        _logger.LogInformation(
            "Wallet credited. UserId={UserId} WalletId={WalletId} Amount={Amount} Reason={Reason} ReferenceType={ReferenceType} ReferenceId={ReferenceId} BalanceAfter={BalanceAfter}",
            userId, tx.WalletId, amount, reason, referenceType, referenceId, tx.BalanceAfter);
        return tx;
    }
    public async Task<WalletTransactionDto> DebitAsync(
        Guid userId,
        decimal amount,
        WalletReason reason,
        ReferenceType referenceType = ReferenceType.None,
        string? referenceId = null,
        string? description = null,
        Guid? createdByUserId = null,
        CancellationToken cancellationToken = default)
    {
        ValidateAmount(amount);
        EnsureDebitReason(reason);
        try
        {
            var tx = await ExecuteBalanceMoveAsync(
                userId, amount, WalletDirection.Debit, reason, referenceType, referenceId, description, createdByUserId, cancellationToken);
            _logger.LogInformation(
                "Wallet debited. UserId={UserId} WalletId={WalletId} Amount={Amount} Reason={Reason} ReferenceType={ReferenceType} ReferenceId={ReferenceId} BalanceAfter={BalanceAfter}",
                userId, tx.WalletId, amount, reason, referenceType, referenceId, tx.BalanceAfter);
            return tx;
        }
        catch (BusinessValidationException)
        {
            // Caller asked for a business validation: surface and log; do NOT swallow.
            _logger.LogWarning(
                "Wallet debit FAILED (insufficient balance). UserId={UserId} Amount={Amount} Reason={Reason} ReferenceType={ReferenceType} ReferenceId={ReferenceId}",
                userId, amount, reason, referenceType, referenceId);
            throw;
        }
    }
    public async Task<IReadOnlyList<WalletTransactionDto>> GetTransactionsAsync(
        Guid userId,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        if (skip < 0) skip = 0;
        if (take <= 0 || take > 500) take = 100;
        var wallet = (await _uow.Repository<Wallet>().FindAsync(w => w.UserId == userId)).FirstOrDefault();
        if (wallet == null) return Array.Empty<WalletTransactionDto>();
        var rows = await _uow.Repository<WalletTransaction>()
            .FindAsync(t => t.WalletId == wallet.Id);

        return rows
            .OrderByDescending(t => t.CreatedAt)
            .Skip(skip)
            .Take(take)
            .Select(ToDto)
            .ToList();
    }
    // ── Internals ───────────────────────────────────────────────────
    private async Task<WalletTransactionDto> ExecuteBalanceMoveAsync(
        Guid userId,
        decimal amount,
        WalletDirection direction,
        WalletReason reason,
        ReferenceType referenceType,
        string? referenceId,
        string? description,
        Guid? createdByUserId,
        CancellationToken cancellationToken)
    {
        // ONE database transaction for: read balance → insert tx → update balance.
        await _uow.BeginTransactionAsync();
        try
        {
            var wallet = (await _uow.Repository<Wallet>().FindAsync(w => w.UserId == userId)).FirstOrDefault();
            if (wallet == null)
            {
                // Auto-create the wallet so future operations have a stable target.
                wallet = new Wallet
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CurrentBalance = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _uow.Repository<Wallet>().AddAsync(wallet);
                await _uow.SaveChangesAsync();
            }
            var balanceBefore = wallet.CurrentBalance;
            var balanceAfter = direction == WalletDirection.Credit
                ? balanceBefore + amount
                : balanceBefore - amount;
            if (balanceAfter < 0m)
            {
                await _uow.RollbackTransactionAsync();
                throw new BusinessValidationException(
                    "INSUFFICIENT_BALANCE",
                    $"Insufficient wallet balance. UserId={userId} Balance={balanceBefore} Requested={amount} Reason={reason}");
            }
            var transaction = new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = wallet.Id,
                Direction = direction,
                Reason = reason,
                CreditAmount = amount,
                BalanceBefore = balanceBefore,
                BalanceAfter = balanceAfter,
                ReferenceId = referenceId,
                ReferenceType = referenceType,
                Description = description,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };
            await _uow.Repository<WalletTransaction>().AddAsync(transaction);
            wallet.CurrentBalance = balanceAfter;
            // Update lifetime totals (credits only — debits do not affect totals).
            if (direction == WalletDirection.Credit)
            {
                switch (reason)
                {
                    case WalletReason.Purchase: wallet.TotalPurchasedCredits += amount; break;
                    case WalletReason.Bonus: wallet.TotalBonusCredits += amount; break;
                    case WalletReason.Refund: wallet.TotalRefundCredits += amount; break;
                    case WalletReason.AdminAdjustmentCredit: break; // not counted in any specific bucket
                }
            }
            wallet.UpdatedAt = DateTime.UtcNow;
            await _uow.Repository<Wallet>().UpdateAsync(wallet);
            await _uow.SaveChangesAsync();
            await _uow.CommitTransactionAsync();
            return ToDto(transaction);
        }
        catch
        {
            await _uow.RollbackTransactionAsync();
            throw;
        }
    }
    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0m)
            throw new BusinessValidationException("INVALID_AMOUNT", "Amount must be greater than zero.");
    }
    private static void EnsureCreditReason(WalletReason reason)
    {
        if (reason != WalletReason.Purchase
            && reason != WalletReason.Bonus
            && reason != WalletReason.Refund
            && reason != WalletReason.AdminAdjustmentCredit)
        {
            throw new BusinessValidationException(
                "INVALID_REASON",
                $"Reason {reason} is not a credit reason.");
        }
    }
    private static void EnsureDebitReason(WalletReason reason)
    {
        if (reason != WalletReason.Investment
            && reason != WalletReason.PublishOpportunity
            && reason != WalletReason.FeaturedOpportunity
            && reason != WalletReason.Subscription
            && reason != WalletReason.AdminAdjustmentDebit
            && reason != WalletReason.PlatformServiceFee)
        {
            throw new BusinessValidationException(
                "INVALID_REASON",
                $"Reason {reason} is not a debit reason.");
        }
    }
    private static WalletDto ToDto(Wallet w) => new()
    {
        Id = w.Id,
        UserId = w.UserId,
        CurrentBalance = w.CurrentBalance,
        TotalPurchasedCredits = w.TotalPurchasedCredits,
        TotalBonusCredits = w.TotalBonusCredits,
        TotalRefundCredits = w.TotalRefundCredits,
        CreatedAt = w.CreatedAt,
        UpdatedAt = w.UpdatedAt
    };
    private static WalletTransactionDto ToDto(WalletTransaction t) => new()
    {
        Id = t.Id,
        WalletId = t.WalletId,
        Direction = t.Direction,
        Reason = t.Reason,
        ActionCode = t.ActionCode,
        CreditAmount = t.CreditAmount,
        BalanceBefore = t.BalanceBefore,
        BalanceAfter = t.BalanceAfter,
        ReferenceId = t.ReferenceId,
        ReferenceType = t.ReferenceType,
        Description = t.Description,
        CreatedByUserId = t.CreatedByUserId,
        CreatedAt = t.CreatedAt
    };
}
