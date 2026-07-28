using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Workers;

public sealed class EmailDispatcherWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailDispatcherWorker> _logger;
    private readonly int _pollingIntervalSeconds;

    public EmailDispatcherWorker(
        IServiceProvider serviceProvider,
        IOptions<EmailOptions> options,
        ILogger<EmailDispatcherWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _pollingIntervalSeconds = options.Value.Queue.PollingIntervalSeconds;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailDispatcherWorker started (polling every {Interval}s)", _pollingIntervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dispatcher = scope.ServiceProvider.GetRequiredService<IEmailDispatcher>();
                await dispatcher.DispatchAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "EmailDispatcherWorker encountered an unexpected error");
            }

            await Task.Delay(TimeSpan.FromSeconds(_pollingIntervalSeconds), stoppingToken);
        }

        _logger.LogInformation("EmailDispatcherWorker stopped gracefully");
    }
}
