using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

/// <summary>
/// Sprint 1 financial semantics. An approved participation is a commitment,
/// not proof that money was received by the founder or by FOPX One.
/// </summary>
public static class FundingSemantics
{
    public static decimal SumCommitted(IEnumerable<OpportunityJoinRequest> requests) =>
        requests
            .Where(request => request.Status == OpportunityJoinRequestStatus.Approved
                && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
            .Sum(request => request.FundingAmount ?? request.RequestedAmount ?? 0m);

    public static decimal SumDeclared(IEnumerable<FundingDeclaration> declarations) =>
        declarations.Sum(declaration => declaration.Amount);

    public static decimal SumConfirmed(IEnumerable<FundingDeclaration> declarations) =>
        declarations
            .Where(declaration => declaration.Status == FundingDeclarationStatus.Confirmed)
            .Sum(declaration => declaration.Amount);

    public static decimal SumDisputed(IEnumerable<FundingDeclaration> declarations) =>
        declarations
            .Where(declaration => declaration.Status == FundingDeclarationStatus.Disputed)
            .Sum(declaration => declaration.Amount);

    public static decimal SumAwaitingConfirmation(IEnumerable<FundingDeclaration> declarations) =>
        declarations
            .Where(declaration => declaration.Status == FundingDeclarationStatus.PendingConfirmation)
            .Sum(declaration => declaration.Amount);

    public static decimal CalculateUndeclaredCommittedAmount(decimal committedAmount, decimal declaredReceivedAmount) =>
        Math.Max(committedAmount - declaredReceivedAmount, 0m);

    public static decimal CalculateAwaitingConfirmationAmount(decimal declaredReceivedAmount, decimal confirmedReceivedAmount) =>
        Math.Max(declaredReceivedAmount - confirmedReceivedAmount, 0m);

    public static decimal CalculateOutstanding(decimal committedAmount, decimal confirmedReceivedAmount) =>
        Math.Max(committedAmount - confirmedReceivedAmount, 0m);

    public static decimal CalculateRemainingCommitmentCapacity(decimal fundingTarget, decimal committedAmount) =>
        Math.Max(fundingTarget - committedAmount, 0m);

    public static decimal CalculateFundingProgress(decimal fundingTarget, decimal confirmedReceivedAmount) =>
        fundingTarget <= 0m
            ? 0m
            : Math.Min(decimal.Round(confirmedReceivedAmount / fundingTarget * 100m, 2), 100m);
}
