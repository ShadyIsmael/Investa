using FluentAssertions;
using Investa.Application.Services;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Xunit;

namespace Investa.UnitTests;

public sealed class FundingSemanticsTests
{
    [Fact]
    public void Approved_participations_are_commitments_not_received_funds()
    {
        var requests = new[]
        {
            Request(600m, OpportunityJoinRequestStatus.Approved),
            Request(400m, OpportunityJoinRequestStatus.Approved),
            Request(250m, OpportunityJoinRequestStatus.Pending)
        };

        var committed = FundingSemantics.SumCommitted(requests);

        committed.Should().Be(1000m);
        FundingSemantics.CalculateOutstanding(committed, 0m).Should().Be(1000m);
        FundingSemantics.CalculateFundingProgress(2000m, 0m).Should().Be(0m);
    }

    [Fact]
    public void Remaining_capacity_is_based_on_commitment_and_never_goes_negative()
    {
        FundingSemantics.CalculateRemainingCommitmentCapacity(2000m, 1500m).Should().Be(500m);
        FundingSemantics.CalculateRemainingCommitmentCapacity(2000m, 2500m).Should().Be(0m);
    }

    [Fact]
    public void Confirmed_received_amount_controls_progress_and_outstanding_amount()
    {
        FundingSemantics.CalculateOutstanding(1000m, 250m).Should().Be(750m);
        FundingSemantics.CalculateFundingProgress(1000m, 250m).Should().Be(25m);
        FundingSemantics.CalculateFundingProgress(1000m, 1250m).Should().Be(100m);
    }

    [Fact]
    public void Multiple_declarations_preserve_declared_total_and_separate_pending_confirmed_and_disputed()
    {
        var declarations = new[]
        {
            new FundingDeclaration { Amount = 750m, Status = FundingDeclarationStatus.Confirmed },
            new FundingDeclaration { Amount = 250m, Status = FundingDeclarationStatus.Disputed },
            new FundingDeclaration { Amount = 100m, Status = FundingDeclarationStatus.PendingConfirmation }
        };

        FundingSemantics.SumDeclared(declarations).Should().Be(1100m);
        FundingSemantics.SumConfirmed(declarations).Should().Be(750m);
        FundingSemantics.SumDisputed(declarations).Should().Be(250m);
        FundingSemantics.SumAwaitingConfirmation(declarations).Should().Be(100m);
        (FundingSemantics.SumConfirmed(declarations) <= FundingSemantics.SumDeclared(declarations)).Should().BeTrue();
        (FundingSemantics.SumDeclared(declarations) <= 2_000m).Should().BeTrue();
        typeof(OpportunityDto).GetProperty("FundingDeclarations").Should().BeNull();
    }

    private static OpportunityJoinRequest Request(decimal amount, OpportunityJoinRequestStatus status) => new()
    {
        Id = Guid.NewGuid().GetHashCode(),
        OpportunityId = 1,
        InvestorId = Guid.NewGuid(),
        RequestType = OpportunityJoinRequestType.InvestmentParticipation,
        Status = status,
        FundingAmount = amount
    };
}
