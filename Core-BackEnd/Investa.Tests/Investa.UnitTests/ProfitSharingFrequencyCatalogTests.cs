using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.Services;
using Xunit;

namespace Investa.UnitTests;

public sealed class ProfitSharingFrequencyCatalogTests
{
    [Theory]
    [InlineData("Monthly")]
    [InlineData("Quarterly")]
    [InlineData("SemiAnnual")]
    [InlineData("Annual")]
    public void Supported_frequency_is_normalized_to_the_canonical_value(string value)
    {
        ProfitSharingFrequencyCatalog.TryNormalizeCanonical(value, out var canonical).Should().BeTrue();
        canonical.Should().Be(value);
    }

    [Theory]
    [InlineData("EveryMonth")]
    [InlineData("Semi-Annually")]
    [InlineData("")]
    [InlineData(null)]
    public void Unsupported_frequency_is_rejected(string? value)
    {
        ProfitSharingFrequencyCatalog.TryNormalizeCanonical(value, out _).Should().BeFalse();
        FluentActions.Invoking(() => ProfitSharingFrequencyCatalog.NormalizeOrThrow(value))
            .Should().Throw<BusinessValidationException>()
            .Which.Code.Should().Be("UNSUPPORTED_PROFIT_SHARING_FREQUENCY");
    }
}
