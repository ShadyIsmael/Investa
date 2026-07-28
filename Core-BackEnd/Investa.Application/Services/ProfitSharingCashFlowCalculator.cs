using Investa.Application.DTOs;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public static class ProfitSharingCashFlowCalculator
{
    public static ParticipationPaymentScheduleDto Calculate(int requestId, int opportunityId, string title, string? currency, decimal contribution, decimal expectedProfit, int durationMonths, string frequency, DateTime startDate, DateTime finalDate)
    {
        var interval = frequency.Trim().ToLowerInvariant() switch
        {
            "monthly" => 1,
            "quarterly" => 3,
            "semiannual" or "semi-annual" or "semiannually" or "semi-annually" => 6,
            "annual" or "annually" => 12,
            _ => throw new ArgumentException("PayoutFrequency must be Monthly, Quarterly, SemiAnnual, or Annual.", nameof(frequency))
        };
        var count = Math.Max(1, (int)Math.Ceiling(durationMonths / (decimal)interval));
        var totalProfit = Money(expectedProfit);
        var regularProfit = Money(totalProfit / count);
        var items = new List<ExpectedPaymentScheduleItemDto>(count);
        var allocatedProfit = 0m;
        var today = DateTime.UtcNow.Date;
        for (var i = 1; i <= count; i++)
        {
            var isLast = i == count;
            var profit = isLast ? totalProfit - allocatedProfit : regularProfit;
            var contributionReturn = isLast ? contribution : 0m;
            var dueDate = isLast ? finalDate.Date : startDate.Date.AddMonths(interval * i);
            allocatedProfit += profit;
            items.Add(new() { DueDate = dueDate, ExpectedInterest = profit, ExpectedPrincipal = contributionReturn, ExpectedTotal = profit + contributionReturn, ActualPaid = null, Status = dueDate <= today ? ExpectedPaymentStatus.Due : ExpectedPaymentStatus.Upcoming });
        }
        return new() { ParticipationRequestId = requestId, OpportunityId = opportunityId, OpportunityTitle = title, Currency = currency, Principal = contribution, AnnualInterestRate = 0m, DurationMonths = durationMonths, RepaymentFrequency = frequency, PrincipalRepaymentMethod = LoanPrincipalRepaymentMethod.AtMaturity, StartDate = startDate, FinalRepaymentDate = finalDate, TotalExpectedInterest = totalProfit, AverageExpectedMonthlyIncome = Money(totalProfit / durationMonths), ReceivedToDate = null, RemainingPrincipal = null, Payments = items };
    }
    private static decimal Money(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
