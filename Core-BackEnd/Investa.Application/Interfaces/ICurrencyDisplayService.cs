using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

/// <summary>
/// System-wide shared currency display formatter. Currency symbol, bilingual names,
/// decimal-digit rules, and supported capabilities are resolved ONLY from the active
/// Currency Master table. All screens, contracts, emails, notifications, dashboards,
/// reports, and cash flows MUST route currency display through this service.
/// </summary>
public interface ICurrencyDisplayService
{
    /// <summary>Resolves display metadata for an active Currency Master record.</summary>
    Task<CurrencyDisplayInfo> GetInfoAsync(string isoCode, CancellationToken cancellationToken = default);

    /// <summary>Formats an amount using currency metadata resolved from the Currency Master.</summary>
    Task<string> FormatAsync(decimal amount, string isoCode, string language, CancellationToken cancellationToken = default);

    /// <summary>Formats an amount from already-resolved Currency Master metadata (no DB hit).</summary>
    string Format(decimal amount, string isoCode, string language, CurrencyDisplayInfo info);

    /// <summary>Normalizes and validates a 3-letter ISO 4217 code.</summary>
    string Normalize(string isoCode);
}