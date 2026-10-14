namespace Investa.Application.Common;

/// <summary>
/// Canonical repayment model values persisted in accepted offer terms.
/// Display labels belong to the client and are intentionally not accepted here.
/// </summary>
public static class RepaymentModelCatalog
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
            "UNSUPPORTED_REPAYMENT_MODEL",
            $"Repayment model is unsupported. Use one of: {string.Join(", ", Supported)}.");
    }
}
