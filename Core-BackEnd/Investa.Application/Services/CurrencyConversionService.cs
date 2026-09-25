using System.Collections.Concurrent;
using Investa.Application.Common;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class CurrencyConversionService : ICurrencyConversionService
{
    private static readonly TimeSpan DisplayCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly ConcurrentDictionary<string, (ExchangeRateQuote Quote, DateTime ExpiresAt)> DisplayCache = new();
    private static readonly ConcurrentDictionary<string, int> DecimalDigits = new(StringComparer.OrdinalIgnoreCase);
    private readonly IUnitOfWork _uow;
    private readonly IReadOnlyList<IExchangeRateProvider> _providers;

    public CurrencyConversionService(IUnitOfWork uow, IEnumerable<IExchangeRateProvider> providers)
    {
        _uow = uow;
        _providers = providers.OrderBy(p => p.Priority).ToList();
    }

    public async Task<CurrencyConversionResult> ConvertForExecutionAsync(decimal amount, string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default)
    {
        ValidateAmount(amount);
        var source = NormalizeCurrency(sourceCurrency);
        var target = NormalizeCurrency(targetCurrency);
        await ValidateCurrencyAsync(source);
        var targetDefinition = await ValidateCurrencyAsync(target);
        DecimalDigits[target] = targetDefinition.DecimalDigits;
        var quote = source == target
            ? new ExchangeRateQuote(source, target, 1m, DateTime.UtcNow, "Identity")
            : await GetFreshQuoteAsync(source, target, cancellationToken);
        var existing = (await _uow.Repository<ExchangeRateSnapshot>().FindAsync(s =>
            s.Provider == quote.Provider
            && s.SourceCurrency == quote.SourceCurrency
            && s.TargetCurrency == quote.TargetCurrency
            && s.ExchangeRate == quote.Rate
            && s.RateTimestamp == quote.Timestamp)).FirstOrDefault();
        var snapshot = existing ?? ToSnapshot(quote);
        if (existing == null)
            await _uow.Repository<ExchangeRateSnapshot>().AddAsync(snapshot);
        return ConvertUsingSnapshot(amount, snapshot);
    }

    public async Task<CurrencyConversionResult> ConvertForDisplayAsync(decimal amount, string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default)
    {
        ValidateAmount(amount);
        var source = NormalizeCurrency(sourceCurrency);
        var target = NormalizeCurrency(targetCurrency);
        await ValidateCurrencyAsync(source);
        var targetDefinition = await ValidateCurrencyAsync(target);
        DecimalDigits[target] = targetDefinition.DecimalDigits;
        if (source == target)
            return ConvertUsingSnapshot(amount, ToSnapshot(new(source, target, 1m, DateTime.UtcNow, "Identity")));

        var key = $"{source}:{target}";
        if (!DisplayCache.TryGetValue(key, out var cached) || cached.ExpiresAt <= DateTime.UtcNow)
        {
            var quote = await GetFreshQuoteAsync(source, target, cancellationToken);
            cached = (quote, DateTime.UtcNow.Add(DisplayCacheDuration));
            DisplayCache[key] = cached;
        }
        return ConvertUsingSnapshot(amount, ToSnapshot(cached.Quote));
    }

    public CurrencyConversionResult ConvertUsingSnapshot(decimal amount, ExchangeRateSnapshot snapshot)
    {
        ValidateAmount(amount);
        var converted = Round(amount * snapshot.ExchangeRate, snapshot.TargetCurrency);
        return new(amount, snapshot.SourceCurrency, converted, snapshot.TargetCurrency, snapshot);
    }

    public Task<ExchangeRateSnapshot?> GetSnapshotAsync(Guid snapshotId, CancellationToken cancellationToken = default) =>
        _uow.Repository<ExchangeRateSnapshot>().GetByIdAsync(snapshotId);

    private async Task<ExchangeRateQuote> GetFreshQuoteAsync(string source, string target, CancellationToken cancellationToken)
    {
        var failures = new List<Exception>();
        foreach (var provider in _providers)
        {
            try
            {
                var quote = await provider.GetCurrentRateAsync(source, target, cancellationToken);
                if (quote.Rate <= 0) throw new InvalidOperationException($"Provider {provider.Name} returned an invalid rate.");
                return quote;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                failures.Add(ex);
            }
        }
        throw new BusinessValidationException("FX_PROVIDER_UNAVAILABLE", $"No exchange-rate provider could quote {source}/{target}. {failures.FirstOrDefault()?.Message}");
    }

    private static ExchangeRateSnapshot ToSnapshot(ExchangeRateQuote quote) => new()
    {
        SourceCurrency = quote.SourceCurrency,
        TargetCurrency = quote.TargetCurrency,
        ExchangeRate = quote.Rate,
        RateTimestamp = quote.Timestamp,
        Provider = quote.Provider,
        ProviderQuoteId = quote.ProviderQuoteId,
        IsManualOverride = quote.IsManualOverride,
        IsOfflineFallback = quote.IsOfflineFallback
    };

    public static string NormalizeCurrency(string currency)
    {
        var value = currency?.Trim().ToUpperInvariant();
        if (value?.Length != 3 || !value.All(char.IsLetter))
            throw new BusinessValidationException("INVALID_CURRENCY", "Currency must be a three-letter ISO 4217 code.");
        return value;
    }

    private async Task<Currency> ValidateCurrencyAsync(string isoCode)
    {
        var currency = await _uow.Repository<Currency>().GetSingleAsync(x => x.ISOCode == isoCode);
        if (currency is not { IsActive: true })
            throw new BusinessValidationException("UNSUPPORTED_CURRENCY", $"Currency {isoCode} is not active.");
        return currency;
    }

    private static decimal Round(decimal amount, string currency) =>
        decimal.Round(amount, DecimalDigits.GetValueOrDefault(currency, 2), MidpointRounding.AwayFromZero);

    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0) throw new BusinessValidationException("INVALID_AMOUNT", "Amount must be greater than zero.");
    }
}
