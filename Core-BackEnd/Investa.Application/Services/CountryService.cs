using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class CountryService(IUnitOfWork uow) : ICountryService
{
    public async Task<IReadOnlyList<CountryAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<Country>().Query();
        if (isActive.HasValue) query = query.Where(x => x.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var upper = term.ToUpperInvariant();
            query = query.Where(x => x.Code.ToUpper().Contains(upper)
                || x.IsoAlpha2.Contains(upper)
                || (x.IsoAlpha3 != null && x.IsoAlpha3.Contains(upper))
                || x.NameEn.ToUpper().Contains(upper)
                || x.NameAr.Contains(term));
        }

        var countries = query.OrderBy(x => x.SortOrder).ThenBy(x => x.NameEn).ToList();
        var result = new List<CountryAdminDto>(countries.Count);
        foreach (var country in countries) result.Add(await ToDtoAsync(country, cancellationToken));
        return result;
    }

    public async Task<CountryAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var country = await uow.Repository<Country>().GetByIdAsync(id);
        return country is null ? null : await ToDtoAsync(country, cancellationToken);
    }

    public async Task<CountryAdminDto> CreateAsync(CreateCountryRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        var alpha2 = NormalizeAlpha2(request.IsoAlpha2);
        Validate(request.NameEn, request.NameAr, request.IsoAlpha3, request.PhoneCode, request.SortOrder);
        if (await uow.Repository<Country>().ExistsAsync(x => x.IsoAlpha2 == alpha2))
            throw new BusinessValidationException("COUNTRY_DUPLICATE_ISO2", $"Country {alpha2} already exists.");

        var now = DateTime.UtcNow;
        var country = new Country
        {
            Code = await GenerateCodeAsync(request.NameEn),
            IsoAlpha2 = alpha2,
            IsoAlpha3 = NormalizeOptionalAlpha3(request.IsoAlpha3),
            NameEn = request.NameEn.Trim(),
            NameAr = request.NameAr.Trim(),
            PhoneCode = NormalizePhoneCode(request.PhoneCode),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedByUserId = actorId,
            UpdatedByUserId = actorId
        };
        await uow.Repository<Country>().AddAsync(country);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(country, cancellationToken);
    }

    public async Task<CountryAdminDto?> UpdateAsync(int id, UpdateCountryRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.IsoAlpha3, request.PhoneCode, request.SortOrder);
        var country = await uow.Repository<Country>().GetByIdAsync(id);
        if (country is null) return null;
        country.IsoAlpha3 = NormalizeOptionalAlpha3(request.IsoAlpha3);
        country.NameEn = request.NameEn.Trim();
        country.NameAr = request.NameAr.Trim();
        country.PhoneCode = NormalizePhoneCode(request.PhoneCode);
        country.SortOrder = request.SortOrder;
        country.IsActive = request.IsActive;
        country.UpdatedAt = DateTime.UtcNow;
        country.UpdatedByUserId = actorId;
        await uow.Repository<Country>().UpdateAsync(country);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(country, cancellationToken);
    }

    public async Task<CountryAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default)
    {
        var country = await uow.Repository<Country>().GetByIdAsync(id);
        if (country is null) return null;
        country.IsActive = isActive;
        country.UpdatedAt = DateTime.UtcNow;
        country.UpdatedByUserId = actorId;
        await uow.Repository<Country>().UpdateAsync(country);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(country, cancellationToken);
    }

    public async Task<string?> NormalizeActiveSelectionAsync(string? value, string? existingValue = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        var normalized = trimmed.ToUpperInvariant();
        var country = normalized.Length == 2 && normalized.All(c => c is >= 'A' and <= 'Z')
            ? await uow.Repository<Country>().GetSingleAsync(x => x.IsoAlpha2 == normalized)
            : null;
        if (country is { IsActive: true }) return country.IsoAlpha2;

        // An unchanged legacy value is preserved for historical display. Any new or changed
        // controlled selection must be an active canonical country.
        if (!string.IsNullOrWhiteSpace(existingValue) && string.Equals(trimmed, existingValue.Trim(), StringComparison.OrdinalIgnoreCase))
            return existingValue.Trim();

        throw new BusinessValidationException("COUNTRY_INVALID_SELECTION", "Country must reference an active Country Master record.");
    }

    private async Task<string> GenerateCodeAsync(string nameEn)
    {
        var baseCode = new string(nameEn.Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(baseCode)) baseCode = "COUNTRY";
        baseCode = baseCode[..Math.Min(baseCode.Length, 64)];
        var existing = (await uow.Repository<Country>().GetAllAsync()).Select(x => x.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var code = baseCode;
        var suffix = 2;
        while (existing.Contains(code)) code = $"{baseCode}-{suffix++}";
        return code;
    }

    private async Task<CountryAdminDto> ToDtoAsync(Country country, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var code = country.IsoAlpha2;
        var references = 0;
        references += uow.Repository<UserProfile>().Query().Count(x => x.Country == code || x.Nationality == code);
        references += uow.Repository<Client>().Query().Count(x => x.Country == code);
        return new CountryAdminDto
        {
            Id = country.Id, Code = country.Code, IsoAlpha2 = country.IsoAlpha2, IsoAlpha3 = country.IsoAlpha3,
            NameEn = country.NameEn, NameAr = country.NameAr, PhoneCode = country.PhoneCode,
            SortOrder = country.SortOrder, IsActive = country.IsActive, ReferenceCount = references,
            CreatedAt = country.CreatedAt, UpdatedAt = country.UpdatedAt,
            CreatedByUserId = country.CreatedByUserId, UpdatedByUserId = country.UpdatedByUserId
        };
    }

    private static void Validate(string nameEn, string nameAr, string? alpha3, string? phoneCode, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(nameEn) || string.IsNullOrWhiteSpace(nameAr))
            throw new BusinessValidationException("COUNTRY_NAMES_REQUIRED", "English and Arabic names are required.");
        if (nameEn.Trim().Length > 120 || nameAr.Trim().Length > 120)
            throw new BusinessValidationException("COUNTRY_INVALID_NAME", "Country names must be at most 120 characters.");
        if (!string.IsNullOrWhiteSpace(alpha3)) _ = NormalizeOptionalAlpha3(alpha3);
        if (!string.IsNullOrWhiteSpace(phoneCode)) _ = NormalizePhoneCode(phoneCode);
        if (sortOrder < 0) throw new BusinessValidationException("COUNTRY_INVALID_SORT_ORDER", "Sort order cannot be negative.");
    }

    private static string NormalizeAlpha2(string? value)
    {
        var code = value?.Trim().ToUpperInvariant();
        if (code?.Length != 2 || !code.All(c => c is >= 'A' and <= 'Z'))
            throw new BusinessValidationException("COUNTRY_INVALID_ISO2", "ISO Alpha-2 code must be exactly two ASCII letters.");
        return code;
    }

    private static string? NormalizeOptionalAlpha3(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var code = value.Trim().ToUpperInvariant();
        if (code.Length != 3 || !code.All(c => c is >= 'A' and <= 'Z'))
            throw new BusinessValidationException("COUNTRY_INVALID_ISO3", "ISO Alpha-3 code must be exactly three ASCII letters.");
        return code;
    }

    private static string? NormalizePhoneCode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var code = value.Trim().Replace(" ", string.Empty).Replace("-", string.Empty).Replace("(", string.Empty).Replace(")", string.Empty);
        if (code.StartsWith("00", StringComparison.Ordinal)) code = $"+{code[2..]}";
        else if (!code.StartsWith('+')) code = $"+{code}";

        var digits = code.Length > 1 ? code[1..] : string.Empty;
        if (digits.Length is < 1 or > 15 || (digits.Length > 0 && digits[0] == '0') || !digits.All(c => c is >= '0' and <= '9'))
            throw new BusinessValidationException("COUNTRY_INVALID_PHONE_CODE", "Phone code must be a valid international dialing code.");
        return code;
    }
}
