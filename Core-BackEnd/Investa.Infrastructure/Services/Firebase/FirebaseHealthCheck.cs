using FirebaseAdmin;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class FirebaseHealthCheck : IHealthCheck
{
    private readonly Investa.Application.DTOs.FirebaseOptions _options;

    public FirebaseHealthCheck(IOptions<Investa.Application.DTOs.FirebaseOptions> options)
    {
        _options = options.Value;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return Task.FromResult(HealthCheckResult.Healthy("Disabled"));
        }

        if (string.IsNullOrWhiteSpace(_options.ProjectId) ||
            string.IsNullOrWhiteSpace(_options.CredentialsPath) ||
            !File.Exists(_options.CredentialsPath))
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Misconfigured"));
        }

        if (FirebaseApp.DefaultInstance == null)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Unavailable"));
        }

        return Task.FromResult(HealthCheckResult.Healthy("Healthy configuration"));
    }
}