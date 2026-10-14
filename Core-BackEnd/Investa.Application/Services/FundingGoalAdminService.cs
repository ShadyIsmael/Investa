using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class FundingGoalAdminService(IUnitOfWork uow) : IFundingGoalAdminService
{
    public async Task<IReadOnlyList<FundingGoalAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var goals = (await uow.Repository<FundingGoal>().GetAllAsync()).AsEnumerable();
        if (isActive.HasValue) goals = goals.Where(x => x.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            goals = goals.Where(x => x.Code.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(term, StringComparison.OrdinalIgnoreCase)
                || x.NameAr.Contains(term));
        }

        var orderedGoals = goals.OrderBy(x => x.SortOrder).ThenBy(x => x.NameEn).ToList();
        var result = new List<FundingGoalAdminDto>(orderedGoals.Count);
        foreach (var goal in orderedGoals) result.Add(await ToDtoAsync(goal, cancellationToken));
        return result;
    }

    public async Task<FundingGoalAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var goal = await uow.Repository<FundingGoal>().GetByIdAsync(id);
        return goal is null ? null : await ToDtoAsync(goal, cancellationToken);
    }

    public async Task<FundingGoalAdminDto> CreateAsync(CreateFundingGoalRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var now = DateTime.UtcNow;
        var goal = new FundingGoal
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
        await uow.Repository<FundingGoal>().AddAsync(goal);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(goal, cancellationToken);
    }

    public async Task<FundingGoalAdminDto?> UpdateAsync(int id, UpdateFundingGoalRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        Validate(request.NameEn, request.NameAr, request.DescriptionEn, request.DescriptionAr);
        var goal = await uow.Repository<FundingGoal>().GetByIdAsync(id);
        if (goal is null) return null;
        goal.NameEn = request.NameEn.Trim();
        goal.NameAr = request.NameAr.Trim();
        goal.DescriptionEn = Normalize(request.DescriptionEn);
        goal.DescriptionAr = Normalize(request.DescriptionAr);
        goal.SortOrder = request.SortOrder;
        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedByUserId = actorId;
        await uow.Repository<FundingGoal>().UpdateAsync(goal);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(goal, cancellationToken);
    }

    public async Task<FundingGoalAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default)
    {
        var goal = await uow.Repository<FundingGoal>().GetByIdAsync(id);
        if (goal is null) return null;
        goal.IsActive = isActive;
        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedByUserId = actorId;
        await uow.Repository<FundingGoal>().UpdateAsync(goal);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(goal, cancellationToken);
    }

    private async Task<string> GenerateCodeAsync(string nameEn)
    {
        var baseCode = new string(nameEn.Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(baseCode)) baseCode = "FUNDINGGOAL";
        baseCode = baseCode[..Math.Min(baseCode.Length, 48)];
        var existing = (await uow.Repository<FundingGoal>().GetAllAsync()).Select(x => x.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var code = baseCode;
        var suffix = 2;
        while (existing.Contains(code)) code = $"{baseCode}-{suffix++}";
        return code;
    }

    private async Task<FundingGoalAdminDto> ToDtoAsync(FundingGoal goal, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var referenceCount = (await uow.Repository<Opportunity>().FindAsync(x => x.FundingGoalId == goal.Id)).Count();
        return new FundingGoalAdminDto
        {
            Id = goal.Id,
            Code = goal.Code,
            NameEn = goal.NameEn,
            NameAr = goal.NameAr,
            DescriptionEn = goal.DescriptionEn,
            DescriptionAr = goal.DescriptionAr,
            SortOrder = goal.SortOrder,
            IsActive = goal.IsActive,
            ReferenceCount = referenceCount,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt,
            CreatedByUserId = goal.CreatedByUserId,
            UpdatedByUserId = goal.UpdatedByUserId
        };
    }

    private static void Validate(string nameEn, string nameAr, string? descriptionEn, string? descriptionAr)
    {
        if (string.IsNullOrWhiteSpace(nameEn) || string.IsNullOrWhiteSpace(nameAr))
            throw new BusinessValidationException("FUNDING_GOAL_NAMES_REQUIRED", "English and Arabic names are required.");
        if (nameEn.Trim().Length > 120 || nameAr.Trim().Length > 120
            || descriptionEn?.Trim().Length > 500 || descriptionAr?.Trim().Length > 500)
            throw new BusinessValidationException("FUNDING_GOAL_FIELDS_INVALID", "Funding goal fields exceed their maximum length.");
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
