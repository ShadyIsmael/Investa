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

public sealed class ProjectCategoryAdminServiceTests
{
    [Fact]
    public async Task Generates_unique_backend_code_and_keeps_it_immutable_on_update()
    {
        await using var db = CreateDb();
        var service = new ProjectCategoryService(new UnitOfWork(db));

        var first = await service.CreateAsync(ValidCreate("Clean Energy"));
        var second = await service.CreateAsync(ValidCreate("Clean Energy"));

        first.Code.Should().Be("CLEANENERGY");
        second.Code.Should().Be("CLEANENERGY-2");

        var updated = await service.UpdateAsync(first.Id, new UpdateProjectCategoryRequest
        {
            NameEn = "Renewable Energy",
            NameAr = "الطاقة المتجددة",
            DescriptionEn = "Updated description",
            DescriptionAr = "وصف محدث",
            SortOrder = 9
        });

        updated!.Code.Should().Be(first.Code);
        updated.NameAr.Should().Be("الطاقة المتجددة");
    }

    [Fact]
    public async Task Deactivation_preserves_referenced_project_and_reports_dependency_count()
    {
        await using var db = CreateDb();
        var service = new ProjectCategoryService(new UnitOfWork(db));
        var category = await service.CreateAsync(ValidCreate("Historical Category"));

        db.Projects.Add(new Project
        {
            Id = 9901,
            FounderId = Guid.NewGuid(),
            DisplayName = "Historical Project",
            Slug = "historical-project",
            Summary = "Historical category reference",
            Description = "Historical category reference",
            CategoryId = category.Id
        });
        await db.SaveChangesAsync();

        var deactivated = await service.SetStatusAsync(category.Id, false);

        deactivated!.IsActive.Should().BeFalse();
        deactivated.ProjectCount.Should().Be(1);
        deactivated.ReferenceCount.Should().BeGreaterThanOrEqualTo(1);
        (await service.GetByIdAsync(category.Id)).Should().NotBeNull();
        (await service.GetAllAsync(includeInactive: false)).Should().NotContain(item => item.Id == category.Id);
    }

    [Fact]
    public async Task Rejects_missing_bilingual_names()
    {
        await using var db = CreateDb();
        var service = new ProjectCategoryService(new UnitOfWork(db));

        await FluentActions.Invoking(() => service.CreateAsync(new CreateProjectCategoryRequest
        {
            NameEn = "Technology",
            NameAr = " "
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(error => error.Code == "CATEGORY_NAMES_REQUIRED");
    }

    private static CreateProjectCategoryRequest ValidCreate(string name) => new()
    {
        NameEn = name,
        NameAr = "تصنيف تجريبي",
        DescriptionEn = "A bilingual project category.",
        DescriptionAr = "تصنيف مشاريع ثنائي اللغة.",
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
