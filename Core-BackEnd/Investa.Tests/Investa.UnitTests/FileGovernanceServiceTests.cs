using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class FileGovernanceServiceTests
{
    [Fact]
    public async Task Creates_bilingual_category_with_generated_immutable_code()
    {
        await using var db = CreateDb();
        var service = new FileCategoryService(new UnitOfWork(db));
        var first = await service.CreateAsync(ValidCreate("Pitch Deck"), Guid.NewGuid());
        var second = await service.CreateAsync(ValidCreate("Pitch Deck"), Guid.NewGuid());
        var updated = await service.UpdateAsync(first.Id, new UpdateFileCategoryRequest { NameEn = "Updated deck", NameAr = "عرض محدث", MaxFileSizeBytes = first.MaxFileSizeBytes, AllowedExtensions = ".pdf", AllowedMimeTypes = "application/pdf" }, null);

        first.Code.Should().Be("PITCHDECK");
        second.Code.Should().Be("PITCHDECK-2");
        updated!.Code.Should().Be(first.Code);
        updated.NameAr.Should().Be("عرض محدث");
    }

    [Fact]
    public async Task Rejects_inactive_categories_and_category_limits_above_global_policy()
    {
        await using var db = CreateDb();
        var categoryService = new FileCategoryService(new UnitOfWork(db));
        await FluentActions.Invoking(() => categoryService.CreateAsync(ValidCreate("Too large", maxFileSizeBytes: 60 * 1024 * 1024), null))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "FILE_CATEGORY_LIMIT_EXCEEDS_GLOBAL");
        var category = await categoryService.CreateAsync(ValidCreate("Images"), null);
        await categoryService.SetStatusAsync(category.Id, false, null);
        var upload = new FileUploadService(new UnitOfWork(db), Mock.Of<IFileStorage>());
        await FluentActions.Invoking(() => upload.UploadAsync(new FileUploadCommand(category.Code, new MemoryStream(new byte[] { 1 }), "x.jpg", "image/jpeg", 1, Guid.NewGuid())))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "FILE_CATEGORY_INACTIVE");
    }

    [Fact]
    public async Task Enforces_extension_mime_and_historical_reference_count()
    {
        await using var db = CreateDb();
        var categoryService = new FileCategoryService(new UnitOfWork(db));
        var category = await categoryService.CreateAsync(ValidCreate("Documents", allowedExtensions: ".pdf", allowedMimeTypes: "application/pdf"), null);
        var user = Guid.NewGuid();
        var storage = new Mock<IFileStorage>();
        storage.Setup(x => x.UploadWithPolicyAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<FileStoreUploadPolicy>(), It.IsAny<FileStoreUploadContext>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string code, string name, Stream _, string mime, long size, FileStoreUploadPolicy _, FileStoreUploadContext _, CancellationToken _) => new FileStoreUploadResult("id", $"{code}/file.pdf", "file.pdf", name, ".pdf", mime, size, code, "/storage/file.pdf", null, null));
        var upload = new FileUploadService(new UnitOfWork(db), storage.Object);
        await FluentActions.Invoking(() => upload.UploadAsync(new FileUploadCommand(category.Code, new MemoryStream(new byte[] { 1 }), "x.jpg", "image/jpeg", 1, user)))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "FILE_EXTENSION_NOT_ALLOWED");
        await upload.UploadAsync(new FileUploadCommand(category.Code, new MemoryStream(new byte[] { 1 }), "x.pdf", "application/pdf", 1, user));
        (await categoryService.GetByIdAsync(category.Id))!.ReferenceCount.Should().Be(1);
    }

    private static CreateFileCategoryRequest ValidCreate(string name, long? maxFileSizeBytes = null, string? allowedExtensions = null, string? allowedMimeTypes = null) => new() { NameEn = name, NameAr = "بيانات ثنائية", DescriptionEn = "Managed file category", DescriptionAr = "فئة ملفات مركزية", MaxFileSizeBytes = maxFileSizeBytes ?? 25 * 1024 * 1024, AllowedExtensions = allowedExtensions ?? ".jpg,.png", AllowedMimeTypes = allowedMimeTypes ?? "image/jpeg,image/png", SortOrder = 1 };
    private static ApplicationDbContext CreateDb() { var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options); db.Database.EnsureCreated(); return db; }
}
