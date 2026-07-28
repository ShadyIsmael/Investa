using FluentAssertions;
using Investa.Application.Services;
using Investa.Domain.Entities.Enums;
using Xunit;

namespace Investa.LoanCashFlow.Tests;

public class LoanCashFlowCalculatorTests
{
    [Fact]
    public void SemiAnnualAtMaturity_UsesFlatSimpleInterest_AndRepaysPrincipalAtEnd()
    {
        var start = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = LoanCashFlowCalculator.Calculate(1, 2, "Test loan", "EGP", 100_000m, 12m, 24, "SemiAnnual", start, start.AddMonths(24));

        result.TotalExpectedInterest.Should().Be(24_000m);
        result.AverageExpectedMonthlyIncome.Should().Be(1_000m);
        result.Payments.Should().HaveCount(4);
        result.Payments.Should().OnlyContain(x => x.ExpectedInterest == 6_000m);
        result.Payments.Take(3).Should().OnlyContain(x => x.ExpectedPrincipal == 0m && x.ExpectedTotal == 6_000m);
        result.Payments[^1].ExpectedPrincipal.Should().Be(100_000m);
        result.Payments[^1].ExpectedTotal.Should().Be(106_000m);
        result.PrincipalRepaymentMethod.Should().Be(LoanPrincipalRepaymentMethod.AtMaturity);
        result.Payments.Should().OnlyContain(x => x.ActualPaid == null);
    }

    [Fact]
    public void ProfitSharing_Quarterly_DistributesProfitAndReturnsContributionAtEnd()
    {
        var start = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = ProfitSharingCashFlowCalculator.Calculate(2, 4, "Profit sharing", "EGP", 30_000m, 4_500m, 12, "Quarterly", start, start.AddMonths(12));

        result.TotalExpectedInterest.Should().Be(4_500m);
        result.Payments.Should().HaveCount(4);
        result.Payments.Should().OnlyContain(x => x.ExpectedInterest == 1_125m);
        result.Payments.Take(3).Should().OnlyContain(x => x.ExpectedPrincipal == 0m);
        result.Payments[^1].ExpectedPrincipal.Should().Be(30_000m);
        result.Payments[^1].ExpectedTotal.Should().Be(31_125m);
        result.Payments.Sum(x => x.ExpectedTotal).Should().Be(34_500m);
    }
}
