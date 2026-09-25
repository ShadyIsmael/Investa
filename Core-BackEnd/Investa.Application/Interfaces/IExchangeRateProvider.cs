namespace Investa.Application.Interfaces;

public sealed record ExchangeRateQuote(
    string SourceCurrency,
    string TargetCurrency,
    decimal Rate,
    DateTime Timestamp,
    string Provider,
    string? ProviderQuoteId = null,
    bool IsManualOverride = false,
    bool IsOfflineFallback = false);

public interface IExchangeRateProvider
{
    string Name { get; }
    int Priority { get; }
    Task<ExchangeRateQuote> GetCurrentRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default);
    Task<ExchangeRateQuote?> GetHistoricalRateAsync(string sourceCurrency, string targetCurrency, DateTime atUtc, CancellationToken cancellationToken = default);
}
