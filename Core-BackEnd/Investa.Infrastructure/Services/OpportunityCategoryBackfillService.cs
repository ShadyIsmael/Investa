using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

public sealed record OpportunityCategoryBackfillResult(
    int Scanned,
    int ValidBeforeFix,
    int Updated,
    int Skipped,
    IReadOnlyList<string> CategoriesUsed,
    IReadOnlyList<string> Errors);

public class OpportunityCategoryBackfillService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<OpportunityCategoryBackfillService> _logger;

    public OpportunityCategoryBackfillService(
        ApplicationDbContext context,
        ILogger<OpportunityCategoryBackfillService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<OpportunityCategoryBackfillResult> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var activeCategories = await _context.OpportunityCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Id)
            .ToListAsync(cancellationToken);

        var opportunities = await _context.Opportunities
            .OrderBy(o => o.Id)
            .ToListAsync(cancellationToken);

        var scanned = opportunities.Count;
        var activeIds = activeCategories.Select(c => c.Id).ToHashSet();
        var validBefore = opportunities.Count(o => o.CategoryId.HasValue && activeIds.Contains(o.CategoryId.Value));
        var errors = new List<string>();
        var categoriesUsed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (activeCategories.Count == 0)
        {
            var error = "No active OpportunityCategories found.";
            _logger.LogWarning("Opportunity category backfill skipped: {Reason}", error);
            return new OpportunityCategoryBackfillResult(scanned, validBefore, 0, scanned - validBefore, [], [error]);
        }

        var invalidOpportunities = opportunities
            .Where(o => !o.CategoryId.HasValue || !activeIds.Contains(o.CategoryId.Value))
            .ToList();

        var linkedInvestments = await GetLinkedInvestmentsAsync(invalidOpportunities.Select(o => o.Id), cancellationToken);
        var legacyCategoryMap = await GetLegacyCategoryMapAsync(cancellationToken);

        var updated = 0;
        var skipped = 0;

        foreach (var opportunity in invalidOpportunities)
        {
            try
            {
                var category = ResolveCategory(opportunity, activeCategories, linkedInvestments, legacyCategoryMap);
                opportunity.CategoryId = category.Id;
                categoriesUsed.Add(category.Name);
                updated++;

                _logger.LogInformation(
                    "Opportunity {OpportunityId} assigned category {CategoryId} ({CategoryName}).",
                    opportunity.Id,
                    category.Id,
                    category.Name);
            }
            catch (Exception ex)
            {
                skipped++;
                var error = $"Opportunity {opportunity.Id}: {ex.Message}";
                errors.Add(error);
                _logger.LogWarning(ex, "Opportunity {OpportunityId} category backfill skipped.", opportunity.Id);
            }
        }

        if (updated > 0)
            await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Opportunity category backfill completed. Scanned={Scanned}, ValidBefore={ValidBefore}, Updated={Updated}, Skipped={Skipped}, CategoriesUsed={CategoriesUsed}.",
            scanned,
            validBefore,
            updated,
            skipped,
            string.Join(", ", categoriesUsed.OrderBy(c => c)));

        return new OpportunityCategoryBackfillResult(
            scanned,
            validBefore,
            updated,
            skipped,
            categoriesUsed.OrderBy(c => c).ToList(),
            errors);
    }

    private async Task<IReadOnlyDictionary<int, Investment>> GetLinkedInvestmentsAsync(IEnumerable<int> opportunityIds, CancellationToken cancellationToken)
    {
        var ids = opportunityIds.Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<int, Investment>();

        var investments = (await _context.Investments
                .Where(i => i.OpportunityId.HasValue)
                .OrderBy(i => i.Id)
                .ToListAsync(cancellationToken))
            .Where(i => i.OpportunityId.HasValue && ids.Contains(i.OpportunityId.Value))
            .ToList();

        return investments
            .GroupBy(i => i.OpportunityId!.Value)
            .ToDictionary(g => g.Key, g => g.First());
    }

    private async Task<IReadOnlyDictionary<int, OpportunityCategory>> GetLegacyCategoryMapAsync(CancellationToken cancellationToken)
    {
        var activeOpportunityCategories = await _context.OpportunityCategories
            .Where(c => c.IsActive)
            .ToListAsync(cancellationToken);

        var opportunityCategoriesByName = activeOpportunityCategories
            .GroupBy(c => Normalize(c.Name))
            .ToDictionary(g => g.Key, g => g.OrderBy(c => c.Id).First());

        var legacyCategories = await _context.BusinessCategories
            .ToListAsync(cancellationToken);

        return legacyCategories
            .Where(c => opportunityCategoriesByName.ContainsKey(Normalize(c.Value)))
            .ToDictionary(c => c.Id, c => opportunityCategoriesByName[Normalize(c.Value)]);
    }

    private static OpportunityCategory ResolveCategory(
        Opportunity opportunity,
        IReadOnlyList<OpportunityCategory> activeCategories,
        IReadOnlyDictionary<int, Investment> linkedInvestments,
        IReadOnlyDictionary<int, OpportunityCategory> legacyCategoryMap)
    {
        if (linkedInvestments.TryGetValue(opportunity.Id, out var investment)
            && investment.BusinessCategoryId.HasValue
            && legacyCategoryMap.TryGetValue(investment.BusinessCategoryId.Value, out var mappedCategory))
        {
            return mappedCategory;
        }

        var index = Math.Abs(HashCode.Combine(opportunity.Id, opportunity.Title ?? string.Empty)) % activeCategories.Count;
        return activeCategories[index];
    }

    private static string Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToUpperInvariant();
    }
}
