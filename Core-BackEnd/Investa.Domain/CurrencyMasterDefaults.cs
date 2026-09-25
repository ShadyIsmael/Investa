namespace Investa.Domain;

/// <summary>
/// Single source of truth for the system-wide default currency used as a fallback
/// when no explicit currency has been configured. All currency codes, symbols,
/// bilingual names, and decimal-digit rules for display MUST be resolved from the
/// Currency Master table at runtime; this constant only supplies the platform default.
/// </summary>
public static class CurrencyMasterDefaults
{
    /// <summary>Platform default ISO 4217 currency code.</summary>
    public const string DefaultCurrency = "EGP";
}
