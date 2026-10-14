namespace Investa.Application.Common;

/// <summary>
/// Canonical Profit Sharing reporting/payout frequency values persisted in OfferLeg
/// and immutable Contract terms. Display labels belong to the client.
/// </summary>
public static class ProfitSharingFrequencyCatalog
{
    public const string Monthly = "Monthly";
    public const string Quarterly = "Quarterly";
    public const string SemiAnnual = "SemiAnnual";
    public const string Annual = "Annual";

    public static IReadOnlyList<string> Supported { get; } =
        [Monthly, Quarterly, SemiAnnual, Annual];

    public static bool TryNormalizeCanonical(string? value, out string canonical)
    {
        canonical = string.Empty;
        var candidate = value?.Trim();
        if (string.IsNullOrWhiteSpace(candidate))
            return false;

        canonical = candidate.ToUpperInvariant() switch
        {
            "MONTHLY" => Monthly,
            "QUARTERLY" => Quarterly,
            "SEMIANNUAL" => SemiAnnual,
            "ANNUAL" => Annual,
            _ => string.Empty
        };
        return canonical.Length > 0;
    }

    public static string NormalizeOrThrow(string? value)
    {
        if (TryNormalizeCanonical(value, out var canonical))
            return canonical;

        throw new BusinessValidationException(
            "UNSUPPORTED_PROFIT_SHARING_FREQUENCY",
            $"Profit Sharing reporting frequency is unsupported. Use one of: {string.Join(", ", Supported)}.");
    }
}
