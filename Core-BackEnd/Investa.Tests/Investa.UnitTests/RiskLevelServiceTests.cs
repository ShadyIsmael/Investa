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

public sealed class RiskLevelServiceTests
{
    [Fact]
    public async Task Creates_bilingual_level_with_unique_immutable_code()
    {
        await using var db = CreateDb();
        var service = new RiskLevelService(new UnitOfWork(db));
        var first = await service.CreateAsync(ValidCreate("Operational Risk"), Guid.NewGuid());
        var second = await service.CreateAsync(ValidCreate("Operational Risk"), Guid.NewGuid());
        var updated = await service.UpdateAsync(first.Id, new UpdateRiskLevelRequest { NameEn = "Operational Exposure", NameAr = "مخاطر تشغيلية", SortOrder = 8 }, Guid.NewGuid());

        first.Code.Should().Be("OPERATIONALRISK");
        second.Code.Should().Be("OPERATIONALRISK-2");
        updated!.Code.Should().Be(first.Code);
        updated.NameAr.Should().Be("مخاطر تشغيلية");
    }

    [Fact]
    public async Task Validates_active_codes_and_preserves_inactive_history()
    {
        await using var db = CreateDb();
        var service = new RiskLevelService(new UnitOfWork(db));
        var level = await service.CreateAsync(ValidCreate("Historical Risk"), null);
        await service.SetStatusAsync(level.Id, false, null);

        await FluentActions.Invoking(() => service.ValidateActiveCodeAsync(level.Code, required: true))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "INVALID_RISK_LEVEL");
        (await service.GetByIdAsync(level.Id)).Should().NotBeNull();
        (await service.GetAllAsync(isActive: true)).Should().NotContain(item => item.Id == level.Id);
    }

    [Fact]
    public async Task Reports_project_and_investment_references()
    {
        await using var db = CreateDb();
        var service = new RiskLevelService(new UnitOfWork(db));
        var level = await service.CreateAsync(ValidCreate("Referenced Risk"), null);
        db.Projects.Add(new Project { Id = 7781, FounderId = Guid.NewGuid(), DisplayName = "Risk project", Slug = "risk-project", Summary = "A sufficiently long project summary", Description = "A sufficiently long project description", RiskLevel = level.Code });
        db.Investments.Add(new Investment { Id = 7782, FounderId = Guid.NewGuid(), BusinessName = "Risk investment", Description = "A historical investment", RiskLevel = level.Code, DefaultRiskLevel = level.Code });
        await db.SaveChangesAsync();

        var referenced = (await service.GetByIdAsync(level.Id))!;
        referenced.ReferenceCount.Should().Be(2);
    }

    private static CreateRiskLevelRequest ValidCreate(string nameEn) => new() { NameEn = nameEn, NameAr = "مستوى مخاطر تجريبي", DescriptionEn = "A bilingual risk level.", DescriptionAr = "مستوى مخاطر ثنائي اللغة.", SortOrder = 1 };
    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
