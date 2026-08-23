using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public sealed record CurrencyConversionResult(
    decimal SourceAmount,
    string SourceCurrency,
    decimal ConvertedAmount,
    string TargetCurrency,
    ExchangeRateSnapshot Snapshot);

public interface ICurrencyConversionService
{
    Task<CurrencyConversionResult> ConvertForExecutionAsync(decimal amount, string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default);
    Task<CurrencyConversionResult> ConvertForDisplayAsync(decimal amount, string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default);
    CurrencyConversionResult ConvertUsingSnapshot(decimal amount, ExchangeRateSnapshot snapshot);
    Task<ExchangeRateSnapshot?> GetSnapshotAsync(Guid snapshotId, CancellationToken cancellationToken = default);
}
