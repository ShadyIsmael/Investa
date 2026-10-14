using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;

namespace Investa.API.Controllers
{
    /// <summary>
    /// Health check controller for monitoring and discovery
    /// Provides the dependency-aware health summary consumed by Central Admin.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;
        private readonly HealthCheckService _healthChecks;
        private readonly bool _fileStoreRequired;

        public HealthController(
            ILogger<HealthController> logger,
            HealthCheckService healthChecks,
            IConfiguration configuration,
            IHostEnvironment environment)
        {
            _logger = logger;
            _healthChecks = healthChecks;
            _fileStoreRequired = configuration.GetValue<bool?>("FileStore:Required") ?? !environment.IsDevelopment();
        }

        /// <summary>
        /// GET /api/health
        /// Returns process reachability plus individual dependency states.
        /// </summary>
        /// <returns>Health status response</returns>
        [HttpGet]
        public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
        {
            var report = await _healthChecks.CheckHealthAsync(cancellationToken);
            var status = report.Status == HealthStatus.Healthy ? "Healthy" : "Degraded";
            var ready = report.Status == HealthStatus.Healthy
                || (!_fileStoreRequired
                    && report.Status == HealthStatus.Degraded
                    && report.Entries.TryGetValue("database", out var database)
                    && database.Status == HealthStatus.Healthy);
            _logger.LogDebug("Central Admin health requested with status {Status}.", status);

            return Ok(new
            {
                status,
                api = "Healthy",
                ready,
                checks = report.Entries.ToDictionary(
                    entry => entry.Key,
                    entry => new
                    {
                        status = entry.Value.Status.ToString(),
                        description = entry.Value.Description,
                    }),
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                version = typeof(HealthController).Assembly.GetName().Version?.ToString() ?? "unknown",
            });
        }

        /// <summary>
        /// GET /api/health/ping
        /// Simple ping endpoint for quick availability checks
        /// </summary>
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new
            {
                pong = true,
                server = Environment.MachineName,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
