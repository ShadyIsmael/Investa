using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class RiskLevelService(IUnitOfWork uow) : IRiskLevelService
{
    public async Task<IReadOnlyList<RiskLevelAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var levels = (await uow.Repository<RiskLevel>().GetAllAsync()).AsEnumerable();
        if (isActive.HasValue) levels = levels.Where(x => x.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            levels = levels.Where(x => x.Code.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameAr.Contains(term));
        }

        var ordered = levels.OrderBy(x => x.SortOrder).ThenBy(x => x.NameEn).ToList();
        var result = new List<RiskLevelAdminDto>(ordered.Count);
        foreach (var level in ordered) result.Add(await ToDtoAsync(level, cancellationToken));
        return result;
    }

    public async Task<RiskLevelAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var level = await uow.Repository<RiskLevel>().GetByIdAsync(id);
        return level is null ? null : await ToDtoAsync(level, cancellationToken);
    }

    public async Task<RiskLevelAdminDto> CreateAsync(CreateRiskLevelRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var now = DateTime.UtcNow;
        var level = new RiskLevel
        {
            Code = await GenerateCodeAsync(request.NameEn),
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
        await uow.Repository<RiskLevel>().AddAsync(level);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(level, cancellationToken);
    }

    public async Task<RiskLevelAdminDto?> UpdateAsync(int id, UpdateRiskLevelRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var level = await uow.Repository<RiskLevel>().GetByIdAsync(id);
        if (level is null) return null;
        level.NameEn = request.NameEn.Trim();
        level.NameAr = request.NameAr.Trim();
        level.DescriptionEn = Normalize(request.DescriptionEn);
        level.DescriptionAr = Normalize(request.DescriptionAr);
        level.SortOrder = request.SortOrder;
        level.UpdatedAt = DateTime.UtcNow;
        level.UpdatedByUserId = actorId;
        await uow.Repository<RiskLevel>().UpdateAsync(level);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(level, cancellationToken);
    }

    public async Task<RiskLevelAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default)
    {
        var level = await uow.Repository<RiskLevel>().GetByIdAsync(id);
        if (level is null) return null;
        // Deactivation is intentionally safe for references: records retain the
        // code and can resolve inactive metadata for historical display.
        level.IsActive = isActive;
        level.UpdatedAt = DateTime.UtcNow;
        level.UpdatedByUserId = actorId;
        await uow.Repository<RiskLevel>().UpdateAsync(level);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(level, cancellationToken);
    }

    public async Task<string?> ValidateActiveCodeAsync(string? code, bool required = false, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var normalized = NormalizeCode(code);
        if (normalized is null)
        {
            if (required) throw new BusinessValidationException("RISK_LEVEL_REQUIRED", "RiskLevel must reference an active risk level.");
            return null;
        }

        var level = await uow.Repository<RiskLevel>().GetSingleAsync(x => x.Code == normalized);
        if (level is null || !level.IsActive)
            throw new BusinessValidationException("INVALID_RISK_LEVEL", "RiskLevel must reference an active risk level.");
        return level.Code;
    }

    private async Task<string> GenerateCodeAsync(string nameEn)
    {
        var baseCode = new string(nameEn.Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(baseCode)) baseCode = "RISKLEVEL";
        baseCode = baseCode[..Math.Min(baseCode.Length, 48)];
        var existing = (await uow.Repository<RiskLevel>().GetAllAsync()).Select(x => x.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var code = baseCode;
        var suffix = 2;
        while (existing.Contains(code)) code = $"{baseCode}-{suffix++}";
        return code;
    }

    private async Task<RiskLevelAdminDto> ToDtoAsync(RiskLevel level, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var projects = (await uow.Repository<Project>().FindAsync(x => x.RiskLevel == level.Code)).Count();
        // Count each business record once even when both its assessment and
        // loan default assessment use the same level.
        var investments = (await uow.Repository<Investment>().FindAsync(x =>
            x.RiskLevel == level.Code || x.DefaultRiskLevel == level.Code)).Count();
        return new RiskLevelAdminDto
        {
            Id = level.Id, Code = level.Code, NameEn = level.NameEn, NameAr = level.NameAr,
            DescriptionEn = level.DescriptionEn, DescriptionAr = level.DescriptionAr,
            SortOrder = level.SortOrder, IsActive = level.IsActive,
            ReferenceCount = projects + investments, CreatedAt = level.CreatedAt, UpdatedAt = level.UpdatedAt,
            CreatedByUserId = level.CreatedByUserId, UpdatedByUserId = level.UpdatedByUserId
        };
    }

    private static void Validate(string nameEn, string nameAr, string? descriptionEn, string? descriptionAr)
    {
        if (string.IsNullOrWhiteSpace(nameEn) || string.IsNullOrWhiteSpace(nameAr))
            throw new BusinessValidationException("RISK_LEVEL_NAMES_REQUIRED", "English and Arabic names are required.");
        if (nameEn.Trim().Length > 120 || nameAr.Trim().Length > 120
            || descriptionEn?.Trim().Length > 500 || descriptionAr?.Trim().Length > 500)
            throw new BusinessValidationException("RISK_LEVEL_FIELDS_INVALID", "Risk level fields exceed their maximum length.");
    }

    public static string? NormalizeCode(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim().ToUpperInvariant();
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
