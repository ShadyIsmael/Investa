using Investa.Application.DTOs.Trust;
using Investa.Domain.Entities;


namespace Investa.Application.Interfaces;

/// <summary>
/// Manages reputation rules, transactions, and point adjustments.
/// All reputation changes are audited via ReputationTransaction.
/// </summary>
public interface IReputationService
{
    // SourceModule is declared on ReputationTransaction entity.

    /// <summary>
    /// Adjusts a user's reputation points by a specific amount.
    /// </summary>
    Task AdjustReputationAsync(Guid userId, int points, string reason, Guid? performedByUserId = null);

    /// <summary>
    /// Engine entry point to process a reputation rule by its RuleCode.
    /// </summary>
    Task ProcessRuleAsync(
        Guid userId,
        string ruleCode,
        ReputationTransaction.SourceModule sourceModule,
        string? reason = null,
        string? referenceId = null,
        string? referenceType = null,
        Guid? performedByUserId = null);


    /// <summary>
    /// Applies a reputation rule by code.
    /// </summary>
    Task ApplyRuleAsync(Guid userId, string ruleCode, string? referenceId = null, string? referenceType = null, Guid? performedByUserId = null);

    /// <summary>
    /// Returns all reputation rules ordered by SortOrder.
    /// </summary>
    Task<List<ReputationRuleDto>> GetRulesAsync(bool includeDisabled = false);

    /// <summary>
    /// Returns a single reputation rule by id.
    /// </summary>
    Task<ReputationRuleDto?> GetRuleByIdAsync(int id);

    /// <summary>
    /// Creates a new reputation rule.
    /// </summary>
    Task<ReputationRuleDto> CreateRuleAsync(CreateReputationRuleRequest request, Guid? createdByUserId = null);

    /// <summary>
    /// Updates an existing reputation rule. RuleCode and IsSystem are immutable.
    /// </summary>
    Task<ReputationRuleDto> UpdateRuleAsync(int id, UpdateReputationRuleRequest request);

    /// <summary>
    /// Toggles the IsEnabled status of a reputation rule.
    /// </summary>
    Task<ReputationRuleDto> ToggleRuleAsync(int id);

    /// <summary>
    /// Returns all reputation transactions for a user.
    /// </summary>
    Task<List<ReputationTransactionDto>> GetUserTransactionsAsync(Guid userId);
}