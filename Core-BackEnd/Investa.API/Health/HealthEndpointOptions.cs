using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Investa.API.Health;

public static class HealthEndpointOptions
{
    public static HealthCheckOptions CreateReadiness(bool fileStoreRequired) => new()
    {
        Predicate = check => check.Tags.Contains("readiness"),
        ResponseWriter = HealthResponseWriter.WriteAsync,
        ResultStatusCodes = CreateStatusCodes(fileStoreRequired),
    };

    public static HealthCheckOptions CreateDependencies(bool fileStoreRequired) => new()
    {
        Predicate = check => check.Tags.Contains("dependency"),
        ResponseWriter = HealthResponseWriter.WriteAsync,
        ResultStatusCodes = CreateStatusCodes(fileStoreRequired),
    };

    private static IDictionary<HealthStatus, int> CreateStatusCodes(bool fileStoreRequired) =>
        new Dictionary<HealthStatus, int>
        {
            [HealthStatus.Healthy] = StatusCodes.Status200OK,
            [HealthStatus.Degraded] = fileStoreRequired
                ? StatusCodes.Status503ServiceUnavailable
                : StatusCodes.Status200OK,
            [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable,
        };
}
