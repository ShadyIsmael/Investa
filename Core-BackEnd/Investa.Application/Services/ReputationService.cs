using Investa.Application.DTOs.Trust;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

/// <summary>
/// Manages the Reputation lifecycle including rules and transactions.
/// All reputation changes are audited via ReputationTransaction.
/// </summary>
public class ReputationService : IReputationService
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ReputationService> _logger;

    public ReputationService(IUnitOfWork uow, ILogger<ReputationService> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    public async Task AdjustReputationAsync(Guid userId, int points, string reason, Guid? performedByUserId = null)
    {
        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var transaction = new ReputationTransaction
        {
            UserId = userId,
            Points = points,
            Reason = reason,
            CreatedByUserId = performedByUserId,
            OccurredAt = DateTime.UtcNow,
            SourceModuleValue = ReputationTransaction.SourceModule.Admin
        };

        await _uow.Repository<ReputationTransaction>().AddAsync(transaction);

        user.ReputationScore = Math.Max(0, Math.Min(10000, user.ReputationScore + points));
        user.ActivityScore = Math.Max(0, Math.Min(10000, user.ActivityScore + Math.Max(points, 0) / 2));

        await _uow.Repository<AuthUser>().UpdateAsync(user);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Reputation adjusted for {UserId}: points={Points} reason={Reason} newScore={Score}",
            userId, points, reason, user.ReputationScore);
    }

    public async Task ApplyRuleAsync(Guid userId, string ruleCode, string? referenceId = null, string? referenceType = null, Guid? performedByUserId = null)
    {
        // Backwards-compatible wrapper (legacy). Prefer ProcessRuleAsync.
        await ProcessRuleAsync(userId, ruleCode, ReputationTransaction.SourceModule.System, null, referenceId, referenceType, performedByUserId);
    }

    public async Task ProcessRuleAsync(
        Guid userId,
        string ruleCode,
        ReputationTransaction.SourceModule sourceModule,
        string? reason = null,
        string? referenceId = null,
        string? referenceType = null,
        Guid? performedByUserId = null)
    {
        var rule = await _uow.Repository<ReputationRule>()
            .GetSingleAsync(r => r.RuleCode == ruleCode && r.IsEnabled);

        if (rule == null)
            throw new KeyNotFoundException($"Reputation rule '{ruleCode}' not found or disabled");

        if (rule.CanRepeat)
        {
            // still respect MaximumOccurrences
        }

        // Fetch existing rewards for this rule/user to enforce CanRepeat / MaximumOccurrences.
        var existingRewardsQuery = _uow.Repository<ReputationTransaction>()
            .FindAsync(t => t.UserId == userId && t.ReputationRuleId == rule.Id);

        // Repository returns IEnumerable; materialize to count.
        var existingRewards = await _uow.Repository<ReputationTransaction>()
            .FindAsync(t => t.UserId == userId && t.ReputationRuleId == rule.Id);

        var existingRewardsCount = existingRewards.Count();



        if (!rule.CanRepeat && existingRewardsCount > 0)
        {
            _logger.LogInformation("Skipping reputation rule {RuleCode} for {UserId}: duplicates not allowed", ruleCode, userId);
            return;
        }

        if (rule.MaximumOccurrences > 0 && existingRewardsCount >= rule.MaximumOccurrences)
        {
            _logger.LogInformation("Skipping reputation rule {RuleCode} for {UserId}: maximum occurrences reached", ruleCode, userId);
            return;
        }

        // Single save in one unit-of-work transaction.
        var transaction = new ReputationTransaction
        {
            UserId = userId,
            ReputationRuleId = rule.Id,
            Points = rule.Points,
            Reason = reason,
            ReferenceId = referenceId,
            ReferenceType = referenceType,
            CreatedByUserId = performedByUserId,
            SourceModuleValue = sourceModule,
            OccurredAt = DateTime.UtcNow
        };

        await _uow.Repository<ReputationTransaction>().AddAsync(transaction);

        // Update AuthUser.CurrentReputation (mapped to ReputationScore in this codebase).
        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        user.ReputationScore = Math.Max(0, Math.Min(10000, user.ReputationScore + rule.Points));
        user.ActivityScore = Math.Max(0, Math.Min(10000, user.ActivityScore + Math.Max(rule.Points, 0) / 2));

        await _uow.Repository<AuthUser>().UpdateAsync(user);

        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Processed reputation rule {RuleCode} for {UserId}: points={Points} sourceModule={SourceModule}",
            ruleCode,
            userId,
            rule.Points,
            sourceModule);
    }

    public async Task<List<ReputationRuleDto>> GetRulesAsync(bool includeDisabled = false)
    {
        var rules = includeDisabled
            ? await _uow.Repository<ReputationRule>().GetAllAsync()
            : await _uow.Repository<ReputationRule>().FindAsync(r => r.IsEnabled);

        return rules
            .OrderBy(r => r.SortOrder)
            .Select(r => new ReputationRuleDto
            {
                Id = r.Id,
                RuleCode = r.RuleCode,
                Description = r.Description,
                Points = r.Points,
                IsEnabled = r.IsEnabled,
                IsSystem = r.IsSystem,
                IsAutomatic = r.IsAutomatic,
                CanRepeat = r.CanRepeat,
                MaximumOccurrences = r.MaximumOccurrences,
                SortOrder = r.SortOrder,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();
    }

    public async Task<ReputationRuleDto?> GetRuleByIdAsync(int id)
    {
        var rule = await _uow.Repository<ReputationRule>().GetByIdAsync(id);
        if (rule == null) return null;

        return new ReputationRuleDto
        {
            Id = rule.Id,
            RuleCode = rule.RuleCode,
            Description = rule.Description,
            Points = rule.Points,
            IsEnabled = rule.IsEnabled,
            IsSystem = rule.IsSystem,
            IsAutomatic = rule.IsAutomatic,
            CanRepeat = rule.CanRepeat,
            MaximumOccurrences = rule.MaximumOccurrences,
            SortOrder = rule.SortOrder,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt
        };
    }

    public async Task<ReputationRuleDto> CreateRuleAsync(CreateReputationRuleRequest request, Guid? createdByUserId = null)
    {
        var existingRule = await _uow.Repository<ReputationRule>()
            .GetSingleAsync(r => r.RuleCode == request.RuleCode);
        if (existingRule != null)
            throw new InvalidOperationException($"Reputation rule with code '{request.RuleCode}' already exists");

        var rule = new ReputationRule
        {
            RuleCode = request.RuleCode,
            Description = request.Description,
            Points = request.Points,
            SortOrder = request.SortOrder,
            CanRepeat = request.CanRepeat,
            MaximumOccurrences = request.MaximumOccurrences,
            IsAutomatic = request.IsAutomatic,
            IsEnabled = true,
            IsSystem = false,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _uow.Repository<ReputationRule>().AddAsync(rule);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Created reputation rule {RuleCode} with id {Id}", request.RuleCode, rule.Id);

        return new ReputationRuleDto
        {
            Id = rule.Id,
            RuleCode = rule.RuleCode,
            Description = rule.Description,
            Points = rule.Points,
            IsEnabled = rule.IsEnabled,
            IsSystem = rule.IsSystem,
            IsAutomatic = rule.IsAutomatic,
            CanRepeat = rule.CanRepeat,
            MaximumOccurrences = rule.MaximumOccurrences,
            SortOrder = rule.SortOrder,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt
        };
    }

    public async Task<ReputationRuleDto> UpdateRuleAsync(int id, UpdateReputationRuleRequest request)
    {
        var rule = await _uow.Repository<ReputationRule>().GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Reputation rule with id {id} not found");

        rule.Description = request.Description;
        rule.Points = request.Points;
        rule.IsEnabled = request.IsEnabled;
        rule.SortOrder = request.SortOrder;
        rule.CanRepeat = request.CanRepeat;
        rule.MaximumOccurrences = request.MaximumOccurrences;
        rule.UpdatedAt = DateTime.UtcNow;

        await _uow.Repository<ReputationRule>().UpdateAsync(rule);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Updated reputation rule {Id}", id);

        return new ReputationRuleDto
        {
            Id = rule.Id,
            RuleCode = rule.RuleCode,
            Description = rule.Description,
            Points = rule.Points,
            IsEnabled = rule.IsEnabled,
            IsSystem = rule.IsSystem,
            IsAutomatic = rule.IsAutomatic,
            CanRepeat = rule.CanRepeat,
            MaximumOccurrences = rule.MaximumOccurrences,
            SortOrder = rule.SortOrder,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt
        };
    }

    public async Task<ReputationRuleDto> ToggleRuleAsync(int id)
    {
        var rule = await _uow.Repository<ReputationRule>().GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Reputation rule with id {id} not found");

        rule.IsEnabled = !rule.IsEnabled;
        rule.UpdatedAt = DateTime.UtcNow;

        await _uow.Repository<ReputationRule>().UpdateAsync(rule);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Toggled reputation rule {Id} to IsEnabled={IsEnabled}", id, rule.IsEnabled);

        return new ReputationRuleDto
        {
            Id = rule.Id,
            RuleCode = rule.RuleCode,
            Description = rule.Description,
            Points = rule.Points,
            IsEnabled = rule.IsEnabled,
            IsSystem = rule.IsSystem,
            IsAutomatic = rule.IsAutomatic,
            CanRepeat = rule.CanRepeat,
            MaximumOccurrences = rule.MaximumOccurrences,
            SortOrder = rule.SortOrder,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt
        };
    }

    public async Task<List<ReputationTransactionDto>> GetUserTransactionsAsync(Guid userId)
    {
        var transactions = await _uow.Repository<ReputationTransaction>()
            .FindAsync(t => t.UserId == userId);

        return transactions.Select(t => new ReputationTransactionDto
        {
            Id = t.Id,
            UserId = t.UserId,
            ReputationRuleId = t.ReputationRuleId,
            RuleCode = t.Rule?.RuleCode,
            Points = t.Points,
            Reason = t.Reason,
            ReferenceId = t.ReferenceId,
            ReferenceType = t.ReferenceType,
            SourceModuleValue = (int)t.SourceModuleValue,
            OccurredAt = t.OccurredAt
        }).ToList();
    }
}

