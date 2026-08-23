using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.Services;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class CurrencyDisplayServiceTests
{
    [Fact]
    public async Task Formats_english_amount_with_master_symbol_and_digits()
    {
        await using var db = CreateDb();
        var service = new CurrencyDisplayService(new UnitOfWork(db));

        var result = await service.FormatAsync(1250.5m, "EGP", "en");

        result.Should().Be("E£\u00a01,250.50");
    }

    [Theory]
    [InlineData("JPY", 1250.6, "¥\u00a01,251")]
    [InlineData("KWD", 12.3456, "د.ك\u00a012.346")]
    public async Task Uses_currency_specific_decimal_digits(string code, decimal amount, string expected)
    {
        await using var db = CreateDb();
        var service = new CurrencyDisplayService(new UnitOfWork(db));

        (await service.FormatAsync(amount, code, "en")).Should().Be(expected);
    }

    [Fact]
    public async Task Formats_with_arabic_digits_for_arabic_language()
    {
        await using var db = CreateDb();
        var service = new CurrencyDisplayService(new UnitOfWork(db));

        var result = await service.FormatAsync(1250.5m, "EGP", "ar");

        result.Should().StartWith("E£\u00a0");
        result.Should().Contain("١٬٢٥٠٫٥٠");
    }

    [Fact]
    public async Task Rejects_unknown_currency()
    {
        await using var db = CreateDb();
        var service = new CurrencyDisplayService(new UnitOfWork(db));

        await FluentActions.Invoking(() => service.FormatAsync(1m, "XYZ", "en"))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(e => e.Code == "UNSUPPORTED_CURRENCY");
    }

    [Fact]
    public async Task Bilingual_names_resolve_from_currency_master_only()
    {
        await using var db = CreateDb();
        var service = new CurrencyDisplayService(new UnitOfWork(db));

        var info = await service.GetInfoAsync("AED");

        info.Symbol.Should().Be("د.إ");
        info.EnglishName.Should().Be("UAE Dirham");
        info.ArabicName.Should().Be("الدرهم الإماراتي");
        info.DecimalDigits.Should().Be(2);
    }

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}