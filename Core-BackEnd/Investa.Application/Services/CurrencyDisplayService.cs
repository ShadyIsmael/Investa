using System.Globalization;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain;
using Investa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

/// <summary>
/// Default implementation of <see cref="ICurrencyDisplayService"/>.
/// All display metadata comes from the Currency Master table. Inactive records remain
/// resolvable for historical records; active-state enforcement belongs to write and
/// conversion workflows.
/// </summary>
public sealed class CurrencyDisplayService(IUnitOfWork uow) : ICurrencyDisplayService
{
    public async Task<CurrencyDisplayInfo> GetInfoAsync(string isoCode, CancellationToken cancellationToken = default)
    {
        var code = Normalize(isoCode);
        var currency = await uow.Repository<Currency>().Query()
            .FirstOrDefaultAsync(c => c.ISOCode == code, cancellationToken);
        if (currency is null)
            throw new BusinessValidationException("UNSUPPORTED_CURRENCY", $"Currency {code} does not exist in the Currency Master.");
        return CurrencyDisplayInfo.FromEntity(currency);
    }

    public async Task<string> FormatAsync(decimal amount, string isoCode, string language, CancellationToken cancellationToken = default)
    {
        var info = await GetInfoAsync(isoCode, cancellationToken);
        return Format(amount, isoCode, language, info);
    }

    public string Format(decimal amount, string isoCode, string language, CurrencyDisplayInfo info)
    {
        var code = Normalize(isoCode);
        var culture = ResolveCulture(language);
        var digits = info.DecimalDigits is >= 0 and <= 6 ? info.DecimalDigits : 2;
        var rounded = decimal.Round(amount, digits, MidpointRounding.AwayFromZero);
        var formattedNumber = rounded.ToString($"N{digits}", culture);
        if (culture.Name.StartsWith("ar", StringComparison.OrdinalIgnoreCase))
            formattedNumber = ToArabicIndic(formattedNumber);
        return string.IsNullOrWhiteSpace(info.Symbol)
            ? $"{formattedNumber} {code}"
            : $"{info.Symbol}\u00a0{formattedNumber}";
    }

    public string Normalize(string isoCode)
    {
        var value = isoCode?.Trim().ToUpperInvariant();
        if (value?.Length != 3 || !value.All(char.IsLetter))
            throw new BusinessValidationException("INVALID_CURRENCY", "Currency must be a three-letter ISO 4217 code.");
        return value;
    }

    private static string ToArabicIndic(string value)
    {
        Span<char> buffer = value.Length <= 256 ? stackalloc char[value.Length] : new char[value.Length];
        for (var i = 0; i < value.Length; i++)
        {
            buffer[i] = value[i] switch
            {
                '0' => '٠', '1' => '١', '2' => '٢', '3' => '٣', '4' => '٤',
                '5' => '٥', '6' => '٦', '7' => '٧', '8' => '٨', '9' => '٩',
                var c => c
            };
        }
        return new string(buffer);
    }

    private static CultureInfo ResolveCulture(string? language)
    {
        var lang = language?.Trim().ToLowerInvariant();
        if (lang?.StartsWith("ar", StringComparison.Ordinal) != true)
            return CultureInfo.GetCultureInfo("en-US");

        var culture = (CultureInfo)CultureInfo.GetCultureInfo("ar-EG").Clone();
        var nfi = (NumberFormatInfo)culture.NumberFormat.Clone();
        nfi.DigitSubstitution = DigitShapes.NativeNational;
        nfi.NativeDigits = new[] { "٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩" };
        culture.NumberFormat = nfi;
        return culture;
    }
}
