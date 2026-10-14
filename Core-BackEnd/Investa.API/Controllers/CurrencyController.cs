using Investa.Application.Interfaces;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/currency")]
public sealed class CurrencyController : ControllerBase
{
    private readonly ICurrencyConversionService _conversion;
    private readonly ApplicationDbContext _db;

    public CurrencyController(ICurrencyConversionService conversion, ApplicationDbContext db)
    {
        _conversion = conversion;
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetCurrencies(
        [FromQuery] string? purpose,
        [FromQuery] bool includeInactive,
        CancellationToken cancellationToken)
    {
        var query = _db.Currencies.AsNoTracking().AsQueryable();
        if (!includeInactive) query = query.Where(x => x.IsActive);
        query = purpose?.Trim().ToLowerInvariant() switch
        {
            "funding" => query.Where(x => x.SupportsFunding),
            "settlement" => query.Where(x => x.SupportsSettlement),
            "wallet" => query.Where(x => x.SupportsWallet),
            _ => query
        };
        return Ok(await query.OrderBy(x => x.ISOCode).ToListAsync(cancellationToken));
    }

    [HttpGet("{isoCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCurrency(string isoCode, CancellationToken cancellationToken)
    {
        var code = isoCode?.Trim().ToUpperInvariant();
        if (code?.Length != 3 || !code.All(c => c is >= 'A' and <= 'Z'))
            return BadRequest(new { code = "INVALID_CURRENCY", message = "Currency must be a three-letter ISO 4217 code." });

        var currency = await _db.Currencies.AsNoTracking().SingleOrDefaultAsync(x => x.ISOCode == code, cancellationToken);
        return currency is null ? NotFound(new { code = "CURRENCY_NOT_FOUND", message = "Currency was not found." }) : Ok(currency);
    }

    [HttpGet("display-quote")]
    [Authorize]
    public async Task<IActionResult> GetDisplayQuote(
        [FromQuery] decimal amount,
        [FromQuery] string sourceCurrency,
        [FromQuery] string targetCurrency,
        CancellationToken cancellationToken)
    {
        var result = await _conversion.ConvertForDisplayAsync(amount, sourceCurrency, targetCurrency, cancellationToken);
        return Ok(new
        {
            officialAmount = result.SourceAmount,
            officialCurrency = result.SourceCurrency,
            approximateDisplayAmount = result.ConvertedAmount,
            displayCurrency = result.TargetCurrency,
            exchangeRate = result.Snapshot.ExchangeRate,
            exchangeRateTimestamp = result.Snapshot.RateTimestamp,
            exchangeRateProvider = result.Snapshot.Provider,
            isApproximate = true
        });
    }

    [HttpGet("snapshots/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetSnapshot(Guid id, CancellationToken cancellationToken)
    {
        var snapshot = await _db.ExchangeRateSnapshots.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return snapshot == null ? NotFound() : Ok(snapshot);
    }
}
