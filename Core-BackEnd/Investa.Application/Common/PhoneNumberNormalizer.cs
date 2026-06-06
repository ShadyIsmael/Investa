using System.Text.RegularExpressions;

namespace Investa.Application.Common;

public static class PhoneNumberNormalizer
{
    private static readonly Regex NonDigitRegex = new(@"[^\d\+]+", RegexOptions.Compiled);
    private static readonly Regex DigitsOnlyRegex = new("^\\d+$", RegexOptions.Compiled);

    /// <summary>
    /// Normalizes a phone number into canonical E.164-like form.
    /// For Egyptian numbers, this returns "+20XXXXXXXXXX".
    /// </summary>
    /// <param name="value">Raw user input.</param>
    /// <param name="defaultCountryCode">Default country code used when input is local/national.</param>
    /// <returns>Normalized phone number or null when the input is invalid.</returns>
    public static string? NormalizePhoneNumber(string? value, string defaultCountryCode = "+20")
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var normalized = value.Trim();
        normalized = NonDigitRegex.Replace(normalized, string.Empty);

        if (normalized.StartsWith("00"))
            normalized = "+" + normalized.Substring(2);

        if (normalized.StartsWith("+"))
        {
            var cleaned = normalized.Substring(1);
            cleaned = NonDigitRegex.Replace(cleaned, string.Empty);
            if (!DigitsOnlyRegex.IsMatch(cleaned))
                return null;

            // Strip a redundant leading 0 after the Egyptian country code.
            // +2001022322292 (13 digits) → +201022322292 (12 digits)
            if (cleaned.StartsWith("200") && cleaned.Length == 13)
                cleaned = "20" + cleaned.Substring(3);

            return "+" + cleaned;
        }

        if (!DigitsOnlyRegex.IsMatch(normalized))
            return null;

        // Egyptian number normalization
        if (normalized.StartsWith("20") && normalized.Length == 12)
            return "+" + normalized;

        if (normalized.StartsWith("0") && normalized.Length == 11)
            return "+20" + normalized.Substring(1);

        if (normalized.Length == 10)
            return defaultCountryCode.StartsWith("+") ? defaultCountryCode + normalized : "+" + defaultCountryCode + normalized;

        if (normalized.Length > 10 && normalized.StartsWith(defaultCountryCode.TrimStart('+')))
            return "+" + normalized;

        return null;
    }

    public static IReadOnlyList<string> GetPhoneVariants(string normalizedPhone)
    {
        if (string.IsNullOrWhiteSpace(normalizedPhone))
            return Array.Empty<string>();

        var candidates = new List<string> { normalizedPhone };
        var noPlus = normalizedPhone.StartsWith("+") ? normalizedPhone.Substring(1) : normalizedPhone;
        if (!candidates.Contains(noPlus))
            candidates.Add(noPlus);

        if (normalizedPhone.StartsWith("+20") && noPlus.Length == 12)
        {
            var nationalWithoutZero = noPlus.Substring(2);
            if (!nationalWithoutZero.StartsWith("0"))
                candidates.Add("0" + nationalWithoutZero);

            candidates.Add("0020" + nationalWithoutZero);
        }

        return candidates.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }
}
