using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class OpportunityTagAdminService(IUnitOfWork uow) : IOpportunityTagAdminService
{
    public async Task<IReadOnlyList<OpportunityTagAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<OpportunityTag>().Query();
        if (isActive.HasValue) query = query.Where(x => x.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.Code.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameAr.Contains(term));
        }

        var tags = query.OrderBy(x => x.SortOrder).ThenBy(x => x.NameEn).ToList();
        var result = new List<OpportunityTagAdminDto>(tags.Count);
        foreach (var tag in tags)
            result.Add(await ToDtoAsync(tag, cancellationToken));
        return result;
    }

    public async Task<OpportunityTagAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var tag = await uow.Repository<OpportunityTag>().GetByIdAsync(id);
        return tag is null ? null : await ToDtoAsync(tag, cancellationToken);
    }

    public async Task<OpportunityTagAdminDto> CreateAsync(CreateOpportunityTagRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var code = await GenerateCodeAsync(request.NameEn);
        var now = DateTime.UtcNow;
        var tag = new OpportunityTag
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
        await uow.Repository<OpportunityTag>().AddAsync(tag);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(tag, cancellationToken);
    }

    public async Task<OpportunityTagAdminDto?> UpdateAsync(int id, UpdateOpportunityTagRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var tag = await uow.Repository<OpportunityTag>().GetByIdAsync(id);
        if (tag is null) return null;
        tag.NameEn = request.NameEn.Trim();
        tag.NameAr = request.NameAr.Trim();
        tag.DescriptionEn = Normalize(request.DescriptionEn);
        tag.DescriptionAr = Normalize(request.DescriptionAr);
        tag.SortOrder = request.SortOrder;
        tag.UpdatedAt = DateTime.UtcNow;
        tag.UpdatedByUserId = actorId;
        await uow.Repository<OpportunityTag>().UpdateAsync(tag);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(tag, cancellationToken);
    }

    public async Task<OpportunityTagAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default)
    {
        var tag = await uow.Repository<OpportunityTag>().GetByIdAsync(id);
        if (tag is null) return null;
        tag.IsActive = isActive;
        tag.UpdatedAt = DateTime.UtcNow;
        tag.UpdatedByUserId = actorId;
        await uow.Repository<OpportunityTag>().UpdateAsync(tag);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(tag, cancellationToken);
    }

    private async Task<string> GenerateCodeAsync(string nameEn)
    {
        var baseCode = new string(nameEn.Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(baseCode)) baseCode = "TAG";
        baseCode = baseCode[..Math.Min(baseCode.Length, 48)];
        var existing = (await uow.Repository<OpportunityTag>().GetAllAsync()).Select(t => t.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var code = baseCode;
        var suffix = 2;
        while (existing.Contains(code)) code = $"{baseCode}-{suffix++}";
        return code;
    }

    private async Task<OpportunityTagAdminDto> ToDtoAsync(OpportunityTag tag, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var referenceCount = (await uow.Repository<OpportunityTagAssignment>()
            .FindAsync(a => a.OpportunityTagId == tag.Id)).Count();
        return new OpportunityTagAdminDto
        {
            Id = tag.Id,
            Code = tag.Code,
            NameEn = tag.NameEn,
            NameAr = tag.NameAr,
            DescriptionEn = tag.DescriptionEn,
            DescriptionAr = tag.DescriptionAr,
            SortOrder = tag.SortOrder,
            IsActive = tag.IsActive,
            ReferenceCount = referenceCount,
            CreatedAt = tag.CreatedAt,
            UpdatedAt = tag.UpdatedAt,
            CreatedByUserId = tag.CreatedByUserId,
            UpdatedByUserId = tag.UpdatedByUserId
        };
    }

    private static void Validate(string nameEn, string nameAr, string? descriptionEn, string? descriptionAr)
    {
        if (string.IsNullOrWhiteSpace(nameEn) || string.IsNullOrWhiteSpace(nameAr))
            throw new BusinessValidationException("OPPORTUNITY_TAG_NAMES_REQUIRED", "English and Arabic names are required.");
        if (nameEn.Trim().Length > 120 || nameAr.Trim().Length > 120
            || descriptionEn?.Trim().Length > 500 || descriptionAr?.Trim().Length > 500)
            throw new BusinessValidationException("OPPORTUNITY_TAG_FIELDS_INVALID", "Tag fields exceed their maximum length.");
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
