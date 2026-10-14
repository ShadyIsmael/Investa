using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class ProjectCategoryService(IUnitOfWork uow) : IProjectCategoryService
{
    public async Task<IReadOnlyList<ProjectCategoryDto>> GetAllAsync(bool includeInactive = true, string? search = null, bool? isActive = null)
    {
        var categories = (await uow.Repository<ProjectCategory>().GetAllAsync()).AsEnumerable();
        if (!includeInactive) categories = categories.Where(c => c.IsActive);
        if (isActive.HasValue) categories = categories.Where(c => c.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            categories = categories.Where(c => c.Code.Contains(term, StringComparison.OrdinalIgnoreCase)
                || c.NameEn.Contains(term, StringComparison.OrdinalIgnoreCase)
                || c.NameAr.Contains(term, StringComparison.OrdinalIgnoreCase));
        }
        return await MapManyAsync(categories.OrderBy(c => c.SortOrder).ThenBy(c => c.NameEn));
    }

    public async Task<ProjectCategoryDto?> GetByIdAsync(int id, bool includeInactive = true)
    {
        var category = await uow.Repository<ProjectCategory>().GetByIdAsync(id);
        return category == null || (!includeInactive && !category.IsActive) ? null : await MapAsync(category);
    }

    public async Task<ProjectCategoryDto> CreateAsync(CreateProjectCategoryRequest request, Guid? actorId = null)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var code = await GenerateCodeAsync(request.NameEn);
        var now = DateTime.UtcNow;
        var category = new ProjectCategory
        {
            Code = code,
            NameEn = request.NameEn.Trim(),
            NameAr = request.NameAr.Trim(),
            DescriptionEn = Normalize(request.DescriptionEn),
            DescriptionAr = Normalize(request.DescriptionAr),
            SortOrder = request.SortOrder,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedByUserId = actorId,
            UpdatedByUserId = actorId
        };
        await uow.Repository<ProjectCategory>().AddAsync(category);
        await uow.SaveChangesAsync();
        return await MapAsync(category);
    }

    public async Task<ProjectCategoryDto?> UpdateAsync(int id, UpdateProjectCategoryRequest request, Guid? actorId = null)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var category = await uow.Repository<ProjectCategory>().GetByIdAsync(id);
        if (category == null) return null;
        category.NameEn = request.NameEn.Trim();
        category.NameAr = request.NameAr.Trim();
        category.DescriptionEn = Normalize(request.DescriptionEn);
        category.DescriptionAr = Normalize(request.DescriptionAr);
        category.SortOrder = request.SortOrder;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedByUserId = actorId;
        await uow.Repository<ProjectCategory>().UpdateAsync(category);
        await uow.SaveChangesAsync();
        return await MapAsync(category);
    }

    public async Task<ProjectCategoryDto?> SetStatusAsync(int id, bool isActive, Guid? actorId = null)
    {
        var category = await uow.Repository<ProjectCategory>().GetByIdAsync(id);
        if (category == null) return null;
        category.IsActive = isActive;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedByUserId = actorId;
        await uow.Repository<ProjectCategory>().UpdateAsync(category);
        await uow.SaveChangesAsync();
        return await MapAsync(category);
    }

    private async Task<string> GenerateCodeAsync(string name)
    {
        var baseCode = new string(name.Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(baseCode)) baseCode = "CATEGORY";
        baseCode = baseCode[..Math.Min(baseCode.Length, 48)];
        var existing = (await uow.Repository<ProjectCategory>().GetAllAsync()).Select(c => c.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var code = baseCode;
        var suffix = 2;
        while (existing.Contains(code)) code = $"{baseCode}-{suffix++}";
        return code;
    }

    private async Task<IReadOnlyList<ProjectCategoryDto>> MapManyAsync(IEnumerable<ProjectCategory> categories)
    {
        var list = new List<ProjectCategoryDto>();
        foreach (var category in categories) list.Add(await MapAsync(category));
        return list;
    }

    private async Task<ProjectCategoryDto> MapAsync(ProjectCategory category)
    {
        var projectCount = (await uow.Repository<Project>().FindAsync(p => p.CategoryId == category.Id)).Count();
        var investmentCount = (await uow.Repository<Investment>().FindAsync(i => i.ProjectCategoryId == category.Id)).Count();
        var clientCount = (await uow.Repository<ClientProjectCategory>().FindAsync(c => c.ProjectCategoryId == category.Id)).Count();
        return new ProjectCategoryDto
        {
            Id = category.Id, Code = category.Code, NameEn = category.NameEn, NameAr = category.NameAr,
            DescriptionEn = category.DescriptionEn, DescriptionAr = category.DescriptionAr, SortOrder = category.SortOrder,
            IsActive = category.IsActive, ProjectCount = projectCount, InvestmentCount = investmentCount,
            ClientCount = clientCount, CreatedAt = category.CreatedAt, UpdatedAt = category.UpdatedAt,
            CreatedByUserId = category.CreatedByUserId, UpdatedByUserId = category.UpdatedByUserId
        };
    }

    private static void Validate(string nameEn, string nameAr, string? descriptionEn, string? descriptionAr)
    {
        if (string.IsNullOrWhiteSpace(nameEn) || string.IsNullOrWhiteSpace(nameAr))
            throw new BusinessValidationException("CATEGORY_NAMES_REQUIRED", "English and Arabic names are required.");
        if (nameEn.Trim().Length > 120 || nameAr.Trim().Length > 120
            || descriptionEn?.Trim().Length > 500 || descriptionAr?.Trim().Length > 500)
            throw new BusinessValidationException("CATEGORY_FIELDS_INVALID", "Category fields exceed their maximum length.");
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
