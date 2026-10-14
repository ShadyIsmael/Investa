using FluentAssertions;
using Investa.API.Health;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class HealthEndpointOptionsTests
{
    [Fact]
    public void Optional_filestore_maps_degraded_readiness_to_ok()
    {
        var options = HealthEndpointOptions.CreateReadiness(fileStoreRequired: false);

        options.ResultStatusCodes[HealthStatus.Degraded].Should().Be(StatusCodes.Status200OK);
        options.ResultStatusCodes[HealthStatus.Unhealthy].Should().Be(StatusCodes.Status503ServiceUnavailable);
    }

    [Fact]
    public void Required_filestore_keeps_degraded_and_unhealthy_readiness_non_ready()
    {
        var options = HealthEndpointOptions.CreateReadiness(fileStoreRequired: true);

        options.ResultStatusCodes[HealthStatus.Degraded].Should().Be(StatusCodes.Status503ServiceUnavailable);
        options.ResultStatusCodes[HealthStatus.Unhealthy].Should().Be(StatusCodes.Status503ServiceUnavailable);
    }
}
