using Investa.Application.Common;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public class PaidActionService : IPaidActionService
{
    private readonly IUnitOfWork _uow;

    public PaidActionService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<PaidActionQuoteDto> GetQuoteAsync(
        Guid userId,
        PricingAction action,
        CancellationToken cancellationToken = default)
    {
        var rule = await GetActiveRuleAsync(action);
        var wallet = await GetOrCreateWalletAsync(userId);
        var balanceAfter = wallet.CurrentBalance - rule.CreditCost;

        return new PaidActionQuoteDto
        {
            ActionCode = rule.ActionCode,
            CreditCost = rule.CreditCost,
            CurrentBalance = wallet.CurrentBalance,
            BalanceAfter = balanceAfter,
            HasSufficientCredit = balanceAfter >= 0m
        };
    }

    public async Task ChargeAsync(
        Guid userId,
        PricingAction action,
        ReferenceType referenceType,
        string referenceId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(referenceId))
            throw new BusinessValidationException("PAID_ACTION_REFERENCE_REQUIRED", "Paid action reference is required.");

        var actionCode = action.ToString();
        var rule = await GetActiveRuleAsync(action);
        var wallet = await GetOrCreateWalletAsync(userId);

        var existingCharge = (await _uow.Repository<WalletTransaction>().FindAsync(t =>
                t.WalletId == wallet.Id
                && t.Direction == WalletDirection.Debit
                && t.ActionCode == actionCode
                && t.ReferenceType == referenceType
                && t.ReferenceId == referenceId))
            .FirstOrDefault();

        if (existingCharge != null)
            return;

        if (rule.CreditCost == 0m)
            return;

        var balanceBefore = wallet.CurrentBalance;
        var balanceAfter = balanceBefore - rule.CreditCost;

        if (balanceAfter < 0m)
            throw new BusinessValidationException("INSUFFICIENT_CREDIT", $"Insufficient CREDIT balance for {actionCode}. Required={rule.CreditCost}, Balance={balanceBefore}.");

        var transaction = new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            Direction = WalletDirection.Debit,
            Reason = WalletReason.PlatformServiceFee,
            ActionCode = actionCode,
            CreditAmount = rule.CreditCost,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceId = referenceId,
            ReferenceType = referenceType,
            Description = $"{actionCode} platform service fee",
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _uow.Repository<WalletTransaction>().AddAsync(transaction);
        wallet.CurrentBalance = balanceAfter;
        wallet.UpdatedAt = DateTime.UtcNow;
        await _uow.Repository<Wallet>().UpdateAsync(wallet);
        await _uow.SaveChangesAsync();
    }

    private async Task<PricingRule> GetActiveRuleAsync(PricingAction action)
    {
        var actionCode = action.ToString();
        var rule = (await _uow.Repository<PricingRule>().FindAsync(r =>
                r.Action == action
                && r.ActionCode == actionCode
                && r.IsActive))
            .FirstOrDefault();

        if (rule == null)
            throw new BusinessValidationException("PRICING_RULE_NOT_AVAILABLE", $"Pricing rule for action {actionCode} is not available.");

        if (rule.CreditCost < 0m)
            throw new BusinessValidationException("INVALID_PRICING_RULE", $"Pricing rule for action {actionCode} cannot be negative.");

        return rule;
    }

    private async Task<Wallet> GetOrCreateWalletAsync(Guid userId)
    {
        var wallet = (await _uow.Repository<Wallet>().FindAsync(w => w.UserId == userId)).FirstOrDefault();
        if (wallet != null)
            return wallet;

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
        return wallet;
    }
}
