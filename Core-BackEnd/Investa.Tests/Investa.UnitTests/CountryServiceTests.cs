using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class CountryServiceTests
{
    [Fact]
    public async Task Creates_bilingual_country_and_rejects_duplicate_normalized_iso2()
    {
        await using var db = CreateDb();
        var service = new CountryService(new UnitOfWork(db));
        var request = ValidCreate("zz");

        var created = await service.CreateAsync(request, Guid.NewGuid());

        created.IsoAlpha2.Should().Be("ZZ");
        created.Code.Should().Be("TESTLAND");
        created.NameAr.Should().Be("أرض الاختبار");
        await FluentActions.Invoking(() => service.CreateAsync(request, Guid.NewGuid()))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "COUNTRY_DUPLICATE_ISO2");
    }

    [Fact]
    public async Task Keeps_alpha2_immutable_and_preserves_referenced_inactive_country()
    {
        await using var db = CreateDb();
        var service = new CountryService(new UnitOfWork(db));
        db.UserProfiles.Add(new UserProfile { UserId = Guid.NewGuid(), Country = "EG" });
        await db.SaveChangesAsync();

        var result = await service.SetStatusAsync(1, false, Guid.NewGuid());
        result!.IsoAlpha2.Should().Be("EG");
        result.IsActive.Should().BeFalse();
        result.ReferenceCount.Should().BeGreaterThan(0);
        (await service.GetAllAsync(isActive: false)).Should().Contain(x => x.IsoAlpha2 == "EG");
        await FluentActions.Invoking(() => service.NormalizeActiveSelectionAsync("EG"))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "COUNTRY_INVALID_SELECTION");
        (await service.NormalizeActiveSelectionAsync("EG", "EG")).Should().Be("EG");
    }

    [Fact]
    public async Task Accepts_only_active_canonical_selections_and_preserves_unchanged_legacy_text()
    {
        await using var db = CreateDb();
        var service = new CountryService(new UnitOfWork(db));

        (await service.NormalizeActiveSelectionAsync(" eg ")).Should().Be("EG");
        (await service.NormalizeActiveSelectionAsync("Egypt", "Egypt")).Should().Be("Egypt");
        await FluentActions.Invoking(() => service.NormalizeActiveSelectionAsync("Egypt"))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "COUNTRY_INVALID_SELECTION");
    }

    [Theory]
    [InlineData("+20", "+20")]
    [InlineData("20", "+20")]
    [InlineData("0020", "+20")]
    [InlineData("+ 20", "+20")]
    public async Task Normalizes_common_international_phone_code_input(string input, string expected)
    {
        await using var db = CreateDb();
        var service = new CountryService(new UnitOfWork(db));
        var request = ValidCreate("zz");
        request.PhoneCode = input;

        var created = await service.CreateAsync(request, Guid.NewGuid());

        created.PhoneCode.Should().Be(expected);
    }

    private static CreateCountryRequest ValidCreate(string alpha2) => new()
    {
        IsoAlpha2 = alpha2, IsoAlpha3 = "TST", NameEn = "Testland", NameAr = "أرض الاختبار", PhoneCode = "+999", SortOrder = 999, IsActive = true
    };

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
