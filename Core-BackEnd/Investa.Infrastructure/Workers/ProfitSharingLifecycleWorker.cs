using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Workers;

public sealed class ProfitSharingLifecycleWorker(
    IServiceProvider serviceProvider,
    IOptions<ProfitSharingLifecycleOptions> options,
    ILogger<ProfitSharingLifecycleWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        var interval = TimeSpan.FromSeconds(Math.Max(30, settings.PollingIntervalSeconds));
        logger.LogInformation("ProfitSharingLifecycleWorker started (polling every {Interval})", interval);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (settings.Enabled)
                {
                    using var scope = serviceProvider.CreateScope();
                    await scope.ServiceProvider.GetRequiredService<IProfitSharingLifecycleService>().ProcessLifecycleAsync(null, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "ProfitSharingLifecycleWorker encountered an unexpected error");
            }

            await Task.Delay(interval, stoppingToken);
        }
        logger.LogInformation("ProfitSharingLifecycleWorker stopped gracefully");
    }
}
