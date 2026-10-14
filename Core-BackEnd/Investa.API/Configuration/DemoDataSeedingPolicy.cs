namespace Investa.API.Configuration;

public static class DemoDataSeedingPolicy
{
    public static bool ShouldSeed(
        string environmentName,
        bool explicitlyEnabled,
        bool startupDataMutationsDisabled)
    {
        return string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase)
            && explicitlyEnabled
            && !startupDataMutationsDisabled;
    }
}
