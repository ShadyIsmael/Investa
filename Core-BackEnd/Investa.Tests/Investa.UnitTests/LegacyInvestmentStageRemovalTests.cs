using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Xunit;

namespace Investa.UnitTests;

public sealed class LegacyInvestmentStageRemovalTests
{
    [Fact]
    public void Current_investment_entity_and_contracts_do_not_expose_retired_stage_fields()
    {
        var retiredFields = new[] { "BusinessStageId", "ProjectPhaseId" };
        var currentContracts = new[]
        {
            typeof(Investment),
            typeof(CreateInvestmentDto),
            typeof(UpdateInvestmentDto),
            typeof(InvestmentDto)
        };

        foreach (var contract in currentContracts)
        {
            foreach (var retiredField in retiredFields)
            {
                contract.GetProperty(retiredField).Should().BeNull($"{contract.Name} must not expose {retiredField}");
            }
        }
    }
}
