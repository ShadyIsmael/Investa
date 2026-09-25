using FluentAssertions;
using Investa.API.Configuration;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class SecurityConfigurationStartupTests
{
    [Fact]
    public void MissingJwtSecret_BlocksStartupValidation()
    {
        var configuration = Configuration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = string.Empty
        });

        var action = () => StartupSecurityConfiguration.RequireJwtSigningKey(configuration);

        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*Jwt:Key*");
    }

    [Fact]
    public void MissingFileStoreCredential_WhenFileStoreIsActive_BlocksStartupValidation()
    {
        var configuration = Configuration(new Dictionary<string, string?>
        {
            ["FileStore:BaseUrl"] = "http://localhost:5240",
            ["FileStore:ApiKey"] = string.Empty
        });

        var action = () => StartupSecurityConfiguration.ValidateActiveFileStore(configuration);

        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*FileStore:ApiKey*");
    }

    private static IConfiguration Configuration(
        IReadOnlyDictionary<string, string?> settings) =>
        new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
}
