using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class FileCategoryService(IUnitOfWork uow) : IFileCategoryService
{
    public async Task<IReadOnlyList<FileCategoryAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var categories = (await uow.Repository<FileCategory>().GetAllAsync()).AsEnumerable();
        if (isActive.HasValue) categories = categories.Where(x => x.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            categories = categories.Where(x => x.Code.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(term, StringComparison.OrdinalIgnoreCase) || x.NameAr.Contains(term));
        }
        var ordered = categories.OrderBy(x => x.SortOrder).ThenBy(x => x.NameEn).ToList();
        var result = new List<FileCategoryAdminDto>(ordered.Count);
        foreach (var item in ordered) result.Add(await ToDtoAsync(item, cancellationToken));
        return result;
    }

    public async Task<FileCategoryAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await uow.Repository<FileCategory>().GetByIdAsync(id);
        return item is null ? null : await ToDtoAsync(item, cancellationToken);
    }

    public async Task<FileCategoryAdminDto> CreateAsync(CreateFileCategoryRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request);
        var policy = await uow.Repository<FileStoragePolicy>().GetByIdAsync(1);
        if (policy is not null && request.MaxFileSizeBytes > policy.GlobalMaxFileSizeBytes)
            throw new BusinessValidationException("FILE_CATEGORY_LIMIT_EXCEEDS_GLOBAL", "Category maximum cannot exceed the global maximum.");
        var now = DateTime.UtcNow;
        var item = new FileCategory { Code = await GenerateCodeAsync(request.NameEn), NameEn = request.NameEn.Trim(), NameAr = request.NameAr.Trim(), DescriptionEn = Normalize(request.DescriptionEn), DescriptionAr = Normalize(request.DescriptionAr), SortOrder = request.SortOrder, IsActive = true, MaxFileSizeBytes = request.MaxFileSizeBytes, AllowedExtensions = NormalizeList(request.AllowedExtensions, true), AllowedMimeTypes = NormalizeList(request.AllowedMimeTypes, false), MaxFilesPerEntity = request.MaxFilesPerEntity, CreatedAt = now, UpdatedAt = now, CreatedByUserId = actorId, UpdatedByUserId = actorId };
        await uow.Repository<FileCategory>().AddAsync(item); await uow.SaveChangesAsync();
        return await ToDtoAsync(item, cancellationToken);
    }

    public async Task<FileCategoryAdminDto?> UpdateAsync(int id, UpdateFileCategoryRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request);
        var policy = await uow.Repository<FileStoragePolicy>().GetByIdAsync(1);
        if (policy is not null && request.MaxFileSizeBytes > policy.GlobalMaxFileSizeBytes)
            throw new BusinessValidationException("FILE_CATEGORY_LIMIT_EXCEEDS_GLOBAL", "Category maximum cannot exceed the global maximum.");
        var item = await uow.Repository<FileCategory>().GetByIdAsync(id); if (item is null) return null;
        item.NameEn = request.NameEn.Trim(); item.NameAr = request.NameAr.Trim(); item.DescriptionEn = Normalize(request.DescriptionEn); item.DescriptionAr = Normalize(request.DescriptionAr); item.SortOrder = request.SortOrder; item.MaxFileSizeBytes = request.MaxFileSizeBytes; item.AllowedExtensions = NormalizeList(request.AllowedExtensions, true); item.AllowedMimeTypes = NormalizeList(request.AllowedMimeTypes, false); item.MaxFilesPerEntity = request.MaxFilesPerEntity; item.UpdatedAt = DateTime.UtcNow; item.UpdatedByUserId = actorId;
        await uow.Repository<FileCategory>().UpdateAsync(item); await uow.SaveChangesAsync(); return await ToDtoAsync(item, cancellationToken);
    }

    public async Task<FileCategoryAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default)
    {
        var item = await uow.Repository<FileCategory>().GetByIdAsync(id); if (item is null) return null;
        item.IsActive = isActive; item.UpdatedAt = DateTime.UtcNow; item.UpdatedByUserId = actorId; await uow.Repository<FileCategory>().UpdateAsync(item); await uow.SaveChangesAsync(); return await ToDtoAsync(item, cancellationToken);
    }

    private async Task<FileCategoryAdminDto> ToDtoAsync(FileCategory item, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var references = (await uow.Repository<StoredFile>().FindAsync(x => x.CategoryCode == item.Code && !x.IsDeleted)).Count();
        return new FileCategoryAdminDto { Id = item.Id, Code = item.Code, NameEn = item.NameEn, NameAr = item.NameAr, DescriptionEn = item.DescriptionEn, DescriptionAr = item.DescriptionAr, SortOrder = item.SortOrder, IsActive = item.IsActive, MaxFileSizeBytes = item.MaxFileSizeBytes, AllowedExtensions = Split(item.AllowedExtensions), AllowedMimeTypes = Split(item.AllowedMimeTypes), MaxFilesPerEntity = item.MaxFilesPerEntity, ReferenceCount = references, CreatedAt = item.CreatedAt, UpdatedAt = item.UpdatedAt, CreatedByUserId = item.CreatedByUserId, UpdatedByUserId = item.UpdatedByUserId };
    }

    private async Task<string> GenerateCodeAsync(string nameEn)
    {
        var baseCode = new string(nameEn.Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray()); if (string.IsNullOrWhiteSpace(baseCode)) baseCode = "FILECATEGORY"; baseCode = baseCode[..Math.Min(48, baseCode.Length)];
        var existing = (await uow.Repository<FileCategory>().GetAllAsync()).Select(x => x.Code).ToHashSet(StringComparer.OrdinalIgnoreCase); var code = baseCode; var suffix = 2; while (existing.Contains(code)) code = $"{baseCode}-{suffix++}"; return code;
    }

    private static void Validate(CreateFileCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NameEn) || string.IsNullOrWhiteSpace(request.NameAr)) throw new BusinessValidationException("FILE_CATEGORY_NAMES_REQUIRED", "English and Arabic names are required.");
        if (request.MaxFileSizeBytes <= 0 || string.IsNullOrWhiteSpace(request.AllowedExtensions) || string.IsNullOrWhiteSpace(request.AllowedMimeTypes)) throw new BusinessValidationException("FILE_CATEGORY_POLICY_INVALID", "A positive file limit, extensions, and MIME types are required.");
    }

    private static string NormalizeList(string value, bool extension)
    {
        var values = Split(value).Select(x => x.Trim().ToLowerInvariant()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        if (values.Any(x => x.Length == 0 || x.Contains(' ') || (extension && !x.StartsWith('.')) || (!extension && !x.Contains('/')))) throw new BusinessValidationException("FILE_CATEGORY_POLICY_INVALID", "Extensions or MIME types are malformed.");
        return string.Join(',', values);
    }
    private static string[] Split(string? value) => (value ?? string.Empty).Split([',', ';', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
