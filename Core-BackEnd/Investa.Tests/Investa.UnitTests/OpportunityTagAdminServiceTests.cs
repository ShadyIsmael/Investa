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

public sealed class OpportunityTagAdminServiceTests
{
    [Fact]
    public async Task Generates_unique_backend_code_and_keeps_it_immutable_on_update()
    {
        await using var db = CreateDb();
        var service = new OpportunityTagAdminService(new UnitOfWork(db));

        var first = await service.CreateAsync(ValidCreate("AI Tag"), null);
        var second = await service.CreateAsync(ValidCreate("AI Tag"), null);

        first.Code.Should().Be("AITAG");
        second.Code.Should().Be("AITAG-2");

        var updated = await service.UpdateAsync(first.Id, new UpdateOpportunityTagRequest
        {
            NameEn = "Machine Learning",
            NameAr = "تعلم الآلة",
            DescriptionEn = "Updated description",
            DescriptionAr = "وصف محدث",
            SortOrder = 9
        }, null);

        updated!.Code.Should().Be(first.Code);
        updated.NameAr.Should().Be("تعلم الآلة");
    }

    [Fact]
    public async Task Deactivation_preserves_opportunity_references_and_reports_dependency_count()
    {
        await using var db = CreateDb();
        var service = new OpportunityTagAdminService(new UnitOfWork(db));
        var tag = await service.CreateAsync(ValidCreate("Historical Tag"), null);

        db.OpportunityTagAssignments.Add(new OpportunityTagAssignment
        {
            OpportunityId = 9901,
            OpportunityTagId = tag.Id
        });
        await db.SaveChangesAsync();

        var deactivated = await service.SetStatusAsync(tag.Id, false, null);

        deactivated!.IsActive.Should().BeFalse();
        deactivated.ReferenceCount.Should().Be(1);
        (await service.GetByIdAsync(tag.Id)).Should().NotBeNull();
        (await service.GetAllAsync(isActive: false)).Should().Contain(item => item.Id == tag.Id);
        (await service.GetAllAsync(isActive: true)).Should().NotContain(item => item.Id == tag.Id);
    }

    [Fact]
    public async Task Rejects_missing_bilingual_names()
    {
        await using var db = CreateDb();
        var service = new OpportunityTagAdminService(new UnitOfWork(db));

        await FluentActions.Invoking(() => service.CreateAsync(new CreateOpportunityTagRequest
        {
            NameEn = "Technology",
            NameAr = " "
        }, null))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "OPPORTUNITY_TAG_NAMES_REQUIRED");
    }

    [Fact]
    public async Task Create_sets_bilingual_fields_and_audit_timestamps()
    {
        await using var db = CreateDb();
        var service = new OpportunityTagAdminService(new UnitOfWork(db));
        var actorId = Guid.NewGuid();

        var result = await service.CreateAsync(ValidCreate("Bilingual Tag"), actorId);

        result.NameEn.Should().Be("Bilingual Tag");
        result.NameAr.Should().Be("وسم ثنائي اللغة");
        result.DescriptionEn.Should().Be("A bilingual opportunity tag.");
        result.DescriptionAr.Should().Be("وسم فرصة ثنائي اللغة.");
        result.Code.Should().NotBeNullOrWhiteSpace();
        result.IsActive.Should().BeTrue();
        result.CreatedByUserId.Should().Be(actorId);
        result.UpdatedByUserId.Should().Be(actorId);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task GetAll_filters_by_search_and_status()
    {
        await using var db = CreateDb();
        var service = new OpportunityTagAdminService(new UnitOfWork(db));

        var active = await service.CreateAsync(ValidCreate("Custom Active Tag"), null);
        var inactive = await service.CreateAsync(ValidCreate("Custom Inactive Tag"), null);
        await service.SetStatusAsync(inactive.Id, false, null);

        var all = await service.GetAllAsync();
        all.Should().Contain(t => t.Id == active.Id);
        all.Should().Contain(t => t.Id == inactive.Id);

        var activeOnly = await service.GetAllAsync(isActive: true);
        activeOnly.Should().Contain(t => t.Id == active.Id);
        activeOnly.Should().NotContain(t => t.Id == inactive.Id);

        var searched = await service.GetAllAsync(search: "Custom Active");
        searched.Should().HaveCount(1);
        searched[0].Id.Should().Be(active.Id);
    }

    private static CreateOpportunityTagRequest ValidCreate(string nameEn) => new()
    {
        NameEn = nameEn,
        NameAr = "وسم ثنائي اللغة",
        DescriptionEn = "A bilingual opportunity tag.",
        DescriptionAr = "وسم فرصة ثنائي اللغة.",
        SortOrder = 1
    };

    private static ApplicationDbContext CreateDb()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }
}
