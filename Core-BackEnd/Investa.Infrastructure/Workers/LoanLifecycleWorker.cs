using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Workers;

/// <summary>
/// Reconciles persisted Loan due dates and lifecycle states. It never moves
/// money and never confirms a repayment declaration.
/// </summary>
public sealed class LoanLifecycleWorker(
    IServiceProvider serviceProvider,
    IOptions<LoanLifecycleOptions> options,
    ILogger<LoanLifecycleWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        var interval = TimeSpan.FromSeconds(Math.Max(30, settings.PollingIntervalSeconds));
        logger.LogInformation("LoanLifecycleWorker started (polling every {Interval})", interval);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (settings.Enabled)
                {
                    using var scope = serviceProvider.CreateScope();
                    await scope.ServiceProvider.GetRequiredService<ILoanLifecycleService>().ProcessAsync(null, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "LoanLifecycleWorker encountered an unexpected error");
            }

            await Task.Delay(interval, stoppingToken);
        }
        logger.LogInformation("LoanLifecycleWorker stopped gracefully");
    }
}
