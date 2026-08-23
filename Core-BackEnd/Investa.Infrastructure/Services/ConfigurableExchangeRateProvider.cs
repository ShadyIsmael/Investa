using Investa.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Investa.Infrastructure.Services;

/// <summary>
/// Replaceable configuration-backed provider and offline fallback.
/// Rates are expressed as units of quote currency per one unit of base currency.
/// </summary>
public sealed class ConfigurableExchangeRateProvider : IExchangeRateProvider
{
    private readonly IConfiguration _configuration;
    public string Name => "ConfiguredRates";
    public int Priority => 100;

    public ConfigurableExchangeRateProvider(IConfiguration configuration) => _configuration = configuration;

    public Task<ExchangeRateQuote> GetCurrentRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default)
    {
        var rate = ReadRate(sourceCurrency, targetCurrency);
        foreach (var bridge in new[] { "EGP", "USD" })
        {
            if (rate.HasValue || bridge == sourceCurrency || bridge == targetCurrency) continue;
            var first = ReadRate(sourceCurrency, bridge);
            var second = ReadRate(bridge, targetCurrency);
            if (first is > 0 && second is > 0) rate = first.Value * second.Value;
        }
        if (rate is null or <= 0)
            throw new InvalidOperationException($"No configured exchange rate exists for {sourceCurrency}/{targetCurrency}.");
        return Task.FromResult(new ExchangeRateQuote(sourceCurrency, targetCurrency, rate.Value, DateTime.UtcNow, Name, IsOfflineFallback: true));
    }

    private decimal? ReadRate(string sourceCurrency, string targetCurrency)
    {
        var direct = _configuration.GetValue<decimal?>($"ExchangeRates:Rates:{sourceCurrency}:{targetCurrency}");
        var inverse = _configuration.GetValue<decimal?>($"ExchangeRates:Rates:{targetCurrency}:{sourceCurrency}");
        return direct ?? (inverse is > 0 ? 1m / inverse.Value : null);
    }

    public Task<ExchangeRateQuote?> GetHistoricalRateAsync(string sourceCurrency, string targetCurrency, DateTime atUtc, CancellationToken cancellationToken = default) =>
        Task.FromResult<ExchangeRateQuote?>(null);
}
