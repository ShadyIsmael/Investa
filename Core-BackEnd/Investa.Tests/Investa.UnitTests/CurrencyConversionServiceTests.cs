using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class CurrencyConversionServiceTests
{
    [Fact]
    public async Task Execution_conversion_persists_exact_cross_currency_snapshot()
    {
        await using var db = CreateDb();
        var provider = new FakeProvider(0.02m);
        var uow = new UnitOfWork(db);
        var service = new CurrencyConversionService(uow, [provider]);

        var result = await service.ConvertForExecutionAsync(1_000m, "EGP", "USD");
        await uow.SaveChangesAsync();

        result.ConvertedAmount.Should().Be(20m);
        result.SourceCurrency.Should().Be("EGP");
        result.TargetCurrency.Should().Be("USD");
        result.Snapshot.Provider.Should().Be("TestProvider");
        (await db.ExchangeRateSnapshots.SingleAsync()).Id.Should().Be(result.Snapshot.Id);
    }

    [Fact]
    public async Task Historical_amount_never_changes_when_provider_rate_changes()
    {
        await using var db = CreateDb();
        var provider = new FakeProvider(0.02m);
        var service = new CurrencyConversionService(new UnitOfWork(db), [provider]);
        var executed = await service.ConvertForExecutionAsync(1_000m, "EGP", "USD");

        provider.Rate = 0.03m;
        var historical = service.ConvertUsingSnapshot(1_000m, executed.Snapshot);

        historical.ConvertedAmount.Should().Be(20m);
        historical.Snapshot.Id.Should().Be(executed.Snapshot.Id);
    }

    [Theory]
    [InlineData("USD", 12.345, 1.0, 12.35)]
    [InlineData("JPY", 12.6, 1.0, 13)]
    [InlineData("KWD", 12.3456, 1.0, 12.346)]
    public async Task Uses_currency_specific_away_from_zero_rounding(string target, decimal amount, decimal rate, decimal expected)
    {
        await using var db = CreateDb();
        var service = new CurrencyConversionService(new UnitOfWork(db), [new FakeProvider(rate)]);
        var result = await service.ConvertForExecutionAsync(amount, "EGP", target);
        result.ConvertedAmount.Should().Be(expected);
    }

    [Fact]
    public async Task Display_quotes_are_cached_but_execution_quotes_are_always_fresh()
    {
        await using var db = CreateDb();
        var provider = new FakeProvider(2m);
        var service = new CurrencyConversionService(new UnitOfWork(db), [provider]);

        await service.ConvertForDisplayAsync(10m, "USD", "EUR");
        await service.ConvertForDisplayAsync(20m, "USD", "EUR");
        await service.ConvertForExecutionAsync(10m, "USD", "EUR");
        await service.ConvertForExecutionAsync(10m, "USD", "EUR");

        provider.CallCount.Should().Be(3);
    }

    [Fact]
    public async Task Identical_provider_pair_rate_and_timestamp_reuse_one_snapshot()
    {
        await using var db = CreateDb();
        var provider = new FakeProvider(0.02m) { Timestamp = new DateTime(2026, 7, 29, 10, 0, 0, DateTimeKind.Utc) };
        var uow = new UnitOfWork(db);
        var service = new CurrencyConversionService(uow, [provider]);

        var first = await service.ConvertForExecutionAsync(1_000m, "EGP", "USD");
        await uow.SaveChangesAsync();
        var second = await service.ConvertForExecutionAsync(2_000m, "EGP", "USD");
        await uow.SaveChangesAsync();

        second.Snapshot.Id.Should().Be(first.Snapshot.Id);
        (await db.ExchangeRateSnapshots.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task Falls_through_multiple_providers_and_reports_total_failure()
    {
        await using var db = CreateDb();
        var service = new CurrencyConversionService(new UnitOfWork(db),
            [new FailingProvider(1), new FakeProvider(3m, priority: 2)]);
        (await service.ConvertForExecutionAsync(5m, "USD", "AED")).ConvertedAmount.Should().Be(15m);

        var failed = new CurrencyConversionService(new UnitOfWork(db), [new FailingProvider(1)]);
        var action = () => failed.ConvertForExecutionAsync(5m, "USD", "AED");
        await action.Should().ThrowAsync<BusinessValidationException>()
            .Where(ex => ex.Code == "FX_PROVIDER_UNAVAILABLE");
    }

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }

    private sealed class FakeProvider(decimal rate, int priority = 1) : IExchangeRateProvider
    {
        public decimal Rate { get; set; } = rate;
        public DateTime? Timestamp { get; set; }
        public int CallCount { get; private set; }
        public string Name => "TestProvider";
        public int Priority => priority;
        public Task<ExchangeRateQuote> GetCurrentRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default)
        {
            CallCount++;
            return Task.FromResult(new ExchangeRateQuote(sourceCurrency, targetCurrency, Rate, Timestamp ?? DateTime.UtcNow, Name, Guid.NewGuid().ToString()));
        }
        public Task<ExchangeRateQuote?> GetHistoricalRateAsync(string sourceCurrency, string targetCurrency, DateTime atUtc, CancellationToken cancellationToken = default) =>
            Task.FromResult<ExchangeRateQuote?>(new(sourceCurrency, targetCurrency, Rate, atUtc, Name));
    }

    private sealed class FailingProvider(int priority) : IExchangeRateProvider
    {
        public string Name => "Failing";
        public int Priority => priority;
        public Task<ExchangeRateQuote> GetCurrentRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default) =>
            throw new HttpRequestException("Provider unavailable.");
        public Task<ExchangeRateQuote?> GetHistoricalRateAsync(string sourceCurrency, string targetCurrency, DateTime atUtc, CancellationToken cancellationToken = default) =>
            Task.FromResult<ExchangeRateQuote?>(null);
    }
}
