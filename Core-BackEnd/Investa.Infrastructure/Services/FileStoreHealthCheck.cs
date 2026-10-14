using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;

namespace Investa.Infrastructure.Services;

public sealed class FileStoreHealthCheck(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    IHostEnvironment environment) : IHealthCheck
{
    private bool IsRequired => configuration.GetValue<bool?>("FileStore:Required") ?? !environment.IsDevelopment();

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var baseUrl = configuration["FileStore:BaseUrl"]?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
            return Unavailable("FileStore base URL is not configured.");

        try
        {
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeout.CancelAfter(TimeSpan.FromSeconds(3));
            using var response = await httpClientFactory.CreateClient().GetAsync($"{baseUrl}/health", timeout.Token);
            return response.IsSuccessStatusCode
                ? HealthCheckResult.Healthy("FileStore is reachable.")
                : Unavailable($"FileStore returned {(int)response.StatusCode}.");
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            return Unavailable("FileStore is unavailable.", ex);
        }
    }

    private HealthCheckResult Unavailable(string description, Exception? exception = null) =>
        IsRequired
            ? HealthCheckResult.Unhealthy(description, exception)
            : HealthCheckResult.Degraded(description, exception);
}
