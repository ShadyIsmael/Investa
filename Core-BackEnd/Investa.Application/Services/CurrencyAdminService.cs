using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class CurrencyAdminService(IUnitOfWork uow) : ICurrencyAdminService
{
    public async Task<IReadOnlyList<CurrencyAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<Currency>().Query();
        if (isActive.HasValue) query = query.Where(x => x.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToUpperInvariant();
            query = query.Where(x => x.ISOCode.Contains(term) || x.EnglishName.ToUpper().Contains(term) || x.ArabicName.Contains(search.Trim()));
        }

        var currencies = query.OrderBy(x => x.ISOCode).ToList();
        var result = new List<CurrencyAdminDto>(currencies.Count);
        foreach (var currency in currencies)
            result.Add(await ToDtoAsync(currency, cancellationToken));
        return result;
    }

    public async Task<CurrencyAdminDto?> GetAsync(string isoCode, CancellationToken cancellationToken = default)
    {
        var code = NormalizeIsoCode(isoCode);
        var currency = await uow.Repository<Currency>().GetSingleAsync(x => x.ISOCode == code);
        return currency is null ? null : await ToDtoAsync(currency, cancellationToken);
    }

    public async Task<CurrencyAdminDto> CreateAsync(CreateCurrencyRequest request, Guid actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.ISOCode, request.EnglishName, request.ArabicName, request.Symbol, request.DecimalDigits, request.SupportsFunding, request.SupportsSettlement, request.SupportsWallet);
        var code = NormalizeIsoCode(request.ISOCode);
        if (await uow.Repository<Currency>().ExistsAsync(x => x.ISOCode == code))
            throw new BusinessValidationException("CURRENCY_DUPLICATE_ISO", $"Currency {code} already exists.");

        var now = DateTime.UtcNow;
        var currency = new Currency
        {
            ISOCode = code,
            EnglishName = request.EnglishName.Trim(),
            ArabicName = request.ArabicName.Trim(),
            Symbol = request.Symbol.Trim(),
            DecimalDigits = request.DecimalDigits,
            IsActive = request.IsActive,
            SupportsFunding = request.SupportsFunding,
            SupportsSettlement = request.SupportsSettlement,
            SupportsWallet = request.SupportsWallet,
            CreatedAt = now,
            CreatedByUserId = actorId
        };
        await uow.Repository<Currency>().AddAsync(currency);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(currency, cancellationToken);
    }

    public async Task<CurrencyAdminDto> UpdateAsync(string isoCode, UpdateCurrencyRequest request, Guid actorId, CancellationToken cancellationToken = default)
    {
        var code = NormalizeIsoCode(isoCode);
        Validate(code, request.EnglishName, request.ArabicName, request.Symbol, request.DecimalDigits, request.SupportsFunding, request.SupportsSettlement, request.SupportsWallet);
        var currency = await uow.Repository<Currency>().GetSingleAsync(x => x.ISOCode == code)
            ?? throw new BusinessValidationException("CURRENCY_NOT_FOUND", $"Currency {code} was not found.");

        currency.EnglishName = request.EnglishName.Trim();
        currency.ArabicName = request.ArabicName.Trim();
        currency.Symbol = request.Symbol.Trim();
        currency.DecimalDigits = request.DecimalDigits;
        currency.IsActive = request.IsActive;
        currency.SupportsFunding = request.SupportsFunding;
        currency.SupportsSettlement = request.SupportsSettlement;
        currency.SupportsWallet = request.SupportsWallet;
        currency.UpdatedAt = DateTime.UtcNow;
        currency.UpdatedByUserId = actorId;
        await uow.Repository<Currency>().UpdateAsync(currency);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(currency, cancellationToken);
    }

    public async Task<CurrencyAdminDto> SetActiveAsync(string isoCode, bool isActive, Guid actorId, CancellationToken cancellationToken = default)
    {
        var code = NormalizeIsoCode(isoCode);
        var currency = await uow.Repository<Currency>().GetSingleAsync(x => x.ISOCode == code)
            ?? throw new BusinessValidationException("CURRENCY_NOT_FOUND", $"Currency {code} was not found.");

        currency.IsActive = isActive;
        currency.UpdatedAt = DateTime.UtcNow;
        currency.UpdatedByUserId = actorId;
        await uow.Repository<Currency>().UpdateAsync(currency);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(currency, cancellationToken);
    }

    private async Task<CurrencyAdminDto> ToDtoAsync(Currency currency, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var code = currency.ISOCode;
        var usage = 0;
        usage += uow.Repository<UserProfile>().Query().Count(x => x.PreferredCurrency == code);
        usage += uow.Repository<Project>().Query().Count(x => x.DefaultCurrency == code);
        usage += uow.Repository<Opportunity>().Query().Count(x => x.FundingCurrency == code);
        usage += uow.Repository<Investment>().Query().Count(x => x.Currency == code);
        usage += uow.Repository<OpportunityJoinRequest>().Query().Count(x => x.EnteredCurrency == code || x.FundingCurrency == code);
        usage += uow.Repository<CreditPlan>().Query().Count(x => x.Currency == code);
        usage += uow.Repository<CreditPlanPurchase>().Query().Count(x => x.Currency == code);
        usage += uow.Repository<FinanceAccount>().Query().Count(x => x.Currency == code);
        usage += uow.Repository<Supplier>().Query().Count(x => x.Currency == code);
        usage += uow.Repository<FinanceTransaction>().Query().Count(x => x.Currency == code);
        usage += uow.Repository<ExchangeRateSnapshot>().Query().Count(x => x.SourceCurrency == code || x.TargetCurrency == code);

        return new CurrencyAdminDto
        {
            ISOCode = currency.ISOCode,
            EnglishName = currency.EnglishName,
            ArabicName = currency.ArabicName,
            Symbol = currency.Symbol,
            DecimalDigits = currency.DecimalDigits,
            IsActive = currency.IsActive,
            SupportsFunding = currency.SupportsFunding,
            SupportsSettlement = currency.SupportsSettlement,
            SupportsWallet = currency.SupportsWallet,
            CreatedAt = currency.CreatedAt,
            UpdatedAt = currency.UpdatedAt,
            CreatedByUserId = currency.CreatedByUserId,
            UpdatedByUserId = currency.UpdatedByUserId,
            Usage = new CurrencyUsageDto { TotalReferences = usage }
        };
    }

    private static void Validate(string isoCode, string englishName, string arabicName, string symbol, int decimalDigits, bool supportsFunding, bool supportsSettlement, bool supportsWallet)
    {
        _ = NormalizeIsoCode(isoCode);
        if (string.IsNullOrWhiteSpace(englishName) || englishName.Trim().Length > 100)
            throw new BusinessValidationException("CURRENCY_INVALID_NAME", "English name is required and must be at most 100 characters.");
        if (string.IsNullOrWhiteSpace(arabicName) || arabicName.Trim().Length > 100)
            throw new BusinessValidationException("CURRENCY_INVALID_NAME", "Arabic name is required and must be at most 100 characters.");
        if (string.IsNullOrWhiteSpace(symbol) || symbol.Trim().Length > 10)
            throw new BusinessValidationException("CURRENCY_INVALID_SYMBOL", "Symbol is required and must be at most 10 characters.");
        if (decimalDigits is < 0 or > 6)
            throw new BusinessValidationException("CURRENCY_INVALID_PRECISION", "Decimal digits must be between 0 and 6.");
        if (!supportsFunding && !supportsSettlement && !supportsWallet)
            throw new BusinessValidationException("CURRENCY_NO_CAPABILITY", "At least one currency capability must be enabled.");
    }

    private static string NormalizeIsoCode(string? value)
    {
        var code = value?.Trim().ToUpperInvariant();
        if (code?.Length != 3 || !code.All(c => c is >= 'A' and <= 'Z'))
            throw new BusinessValidationException("CURRENCY_INVALID_ISO", "ISO code must be exactly three ASCII letters.");
        return code;
    }
}
