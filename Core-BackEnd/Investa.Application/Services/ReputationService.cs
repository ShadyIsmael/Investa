using Investa.Application.DTOs.Trust;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

/// <summary>
/// Manages the Reputation lifecycle including rules, transactions, and point adjustments.
/// All reputation changes are stored in ReputationTransaction for audit purposes.
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
            OccurredAt = DateTime.UtcNow
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
        var rule = await _uow.Repository<ReputationRule>()
            .GetSingleAsync(r => r.RuleCode == ruleCode && r.IsEnabled)
            ?? throw new KeyNotFoundException($"Reputation rule '{ruleCode}' not found or disabled");

        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var transaction = new ReputationTransaction
        {
            UserId = userId,
            ReputationRuleId = rule.Id,
            Points = rule.Points,
            ReferenceId = referenceId,
            ReferenceType = referenceType,
            CreatedByUserId = performedByUserId,
            OccurredAt = DateTime.UtcNow
        };

        await _uow.Repository<ReputationTransaction>().AddAsync(transaction);

        user.ReputationScore = Math.Max(0, Math.Min(10000, user.ReputationScore + rule.Points));
        user.ActivityScore = Math.Max(0, Math.Min(10000, user.ActivityScore + Math.Max(rule.Points, 0) / 2));

        await _uow.Repository<AuthUser>().UpdateAsync(user);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Reputation rule '{RuleCode}' applied for {UserId}: points={Points} newScore={Score}",
            ruleCode, userId, rule.Points, user.ReputationScore);
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
            OccurredAt = t.OccurredAt
        }).ToList();
    }
}