using FluentAssertions;
using Investa.API.Controllers;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class CurrencyAdminServiceTests
{
    [Fact]
    public async Task Creates_currency_and_rejects_duplicate_iso_case_insensitively()
    {
        await using var db = CreateDb();
        var service = new CurrencyAdminService(new UnitOfWork(db));
        var request = ValidCreate("xaf");

        var created = await service.CreateAsync(request, Guid.NewGuid());

        created.ISOCode.Should().Be("XAF");
        (await service.GetAsync("XAF")).Should().NotBeNull();
        await FluentActions.Invoking(() => service.CreateAsync(request, Guid.NewGuid()))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "CURRENCY_DUPLICATE_ISO");
    }

    [Fact]
    public async Task Updates_metadata_without_exposing_iso_code_as_mutable_data()
    {
        await using var db = CreateDb();
        var service = new CurrencyAdminService(new UnitOfWork(db));

        var updated = await service.UpdateAsync("usd", new UpdateCurrencyRequest
        {
            EnglishName = "United States Dollar",
            ArabicName = "الدولار الأمريكي",
            Symbol = "US$",
            DecimalDigits = 2,
            IsActive = true,
            SupportsFunding = true,
            SupportsSettlement = true,
            SupportsWallet = true
        }, Guid.NewGuid());

        updated.ISOCode.Should().Be("USD");
        updated.EnglishName.Should().Be("United States Dollar");
        db.Currencies.Single(currency => currency.ISOCode == "USD").ISOCode.Should().Be("USD");
    }

    [Fact]
    public async Task Deactivates_referenced_currency_without_deleting_history_and_reports_usage()
    {
        await using var db = CreateDb();
        db.Projects.Add(new Project
        {
            Id = 901,
            FounderId = Guid.NewGuid(),
            DefaultCurrency = "USD",
            DisplayName = "Referenced Project",
            Slug = "referenced-project",
            Summary = "A project used to verify currency dependencies.",
            Description = "A project used to verify currency dependencies."
        });
        await db.SaveChangesAsync();

        var service = new CurrencyAdminService(new UnitOfWork(db));
        var result = await service.SetActiveAsync("USD", false, Guid.NewGuid());

        result.IsActive.Should().BeFalse();
        result.Usage.TotalReferences.Should().BeGreaterThan(0);
        (await service.GetAsync("USD")).Should().NotBeNull();
        (await service.GetAllAsync(isActive: false)).Should().ContainSingle(currency => currency.ISOCode == "USD");
    }

    [Fact]
    public async Task Rejects_invalid_precision_and_capability_configuration()
    {
        await using var db = CreateDb();
        var service = new CurrencyAdminService(new UnitOfWork(db));
        var invalid = ValidCreate("TST");
        invalid.DecimalDigits = 7;
        invalid.SupportsFunding = false;
        invalid.SupportsSettlement = false;
        invalid.SupportsWallet = false;

        await FluentActions.Invoking(() => service.CreateAsync(invalid, Guid.NewGuid()))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "CURRENCY_INVALID_PRECISION");
    }

    [Fact]
    public async Task Public_currency_endpoint_filters_by_capability_and_active_state()
    {
        await using var db = CreateDb();
        db.Currencies.Add(new Currency
        {
            ISOCode = "ZZZ",
            EnglishName = "Inactive Funding Currency",
            ArabicName = "عملة تمويل غير نشطة",
            Symbol = "Z",
            DecimalDigits = 2,
            IsActive = false,
            SupportsFunding = true
        });
        await db.SaveChangesAsync();

        var controller = new CurrencyController(new Mock<ICurrencyConversionService>().Object, db);
        var response = await controller.GetCurrencies("funding", includeInactive: false, default);
        var currencies = ((OkObjectResult)response).Value.Should().BeAssignableTo<List<Currency>>().Subject;

        currencies.Should().NotBeEmpty();
        currencies.Should().OnlyContain(currency => currency.IsActive && currency.SupportsFunding);
    }

    private static CreateCurrencyRequest ValidCreate(string isoCode) => new()
    {
        ISOCode = isoCode,
        EnglishName = "Central African CFA Franc",
        ArabicName = "فرنك وسط أفريقيا",
        Symbol = "FCFA",
        DecimalDigits = 2,
        IsActive = true,
        SupportsFunding = true,
        SupportsSettlement = true,
        SupportsWallet = false
    };

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
