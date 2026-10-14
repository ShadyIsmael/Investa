using Investa.API.Configuration;
using Xunit;

namespace Investa.UnitTests;

public sealed class DemoDataSeedingPolicyTests
{
    [Theory]
    [InlineData("Development", true, false, true)]
    [InlineData("development", true, false, true)]
    [InlineData("Development", false, false, false)]
    [InlineData("Development", true, true, false)]
    [InlineData("Testing", true, false, false)]
    [InlineData("Production", true, false, false)]
    public void ShouldSeed_is_explicitly_opted_in_and_development_only(
        string environmentName,
        bool explicitlyEnabled,
        bool startupDataMutationsDisabled,
        bool expected)
    {
        var result = DemoDataSeedingPolicy.ShouldSeed(
            environmentName,
            explicitlyEnabled,
            startupDataMutationsDisabled);

        Assert.Equal(expected, result);
    }
}
