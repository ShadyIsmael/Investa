using System.Text.RegularExpressions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

public sealed record OpportunityProductFieldsBackfillResult(
    int Scanned,
    int ShortDescriptionPopulated,
    int UseOfFundsPopulated,
    int EquityOfferedPercentageCalculated,
    int Skipped,
    IReadOnlyList<string> Errors);

public class OpportunityProductFieldsBackfillService
{
    private static readonly Regex SentenceEndRegex = new(@"(?<=[.!?])\s+", RegexOptions.Compiled);

    private readonly ApplicationDbContext _context;
    private readonly ILogger<OpportunityProductFieldsBackfillService> _logger;

    public OpportunityProductFieldsBackfillService(
        ApplicationDbContext context,
        ILogger<OpportunityProductFieldsBackfillService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<OpportunityProductFieldsBackfillResult> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var opportunities = await _context.Opportunities
            .OrderBy(o => o.Id)
            .ToListAsync(cancellationToken);

        var linkedInvestments = await GetLinkedInvestmentsAsync(opportunities.Select(o => o.Id), cancellationToken);
        var shortDescriptionPopulated = 0;
        var useOfFundsPopulated = 0;
        var equityOfferedPercentageCalculated = 0;
        var skipped = 0;
        var errors = new List<string>();

        foreach (var opportunity in opportunities)
        {
            try
            {
                var changed = false;

                if (IsBlank(opportunity.ShortDescription))
                {
                    var shortDescription = BuildShortDescription(opportunity.Description);
                    if (shortDescription != null)
                    {
                        opportunity.ShortDescription = shortDescription;
                        shortDescriptionPopulated++;
                        changed = true;
                    }
                }

                if (IsBlank(opportunity.UseOfFunds))
                {
                    opportunity.UseOfFunds = BuildUseOfFunds(opportunity);
                    useOfFundsPopulated++;
                    changed = true;
                }

                if (opportunity.InvestmentModel == InvestmentModel.Equity
                    && !opportunity.EquityOfferedPercentage.HasValue
                    && linkedInvestments.TryGetValue(opportunity.Id, out var investment)
                    && investment.EquityOfferedPercentage is > 0 and <= 100)
                {
                    opportunity.EquityOfferedPercentage = investment.EquityOfferedPercentage.Value;
                    equityOfferedPercentageCalculated++;
                    changed = true;
                }

                if (changed)
                {
                    opportunity.UpdatedAt = DateTime.UtcNow;
                    _logger.LogInformation(
                        "Opportunity {OpportunityId} product fields backfilled. ShortDescription={ShortDescriptionUpdated}, UseOfFunds={UseOfFundsUpdated}, EquityOfferedPercentage={EquityUpdated}.",
                        opportunity.Id,
                        !IsBlank(opportunity.ShortDescription),
                        !IsBlank(opportunity.UseOfFunds),
                        opportunity.EquityOfferedPercentage.HasValue);
                }
                else
                {
                    skipped++;
                }
            }
            catch (Exception ex)
            {
                skipped++;
                var error = $"Opportunity {opportunity.Id}: {ex.Message}";
                errors.Add(error);
                _logger.LogWarning(ex, "Opportunity {OpportunityId} product fields backfill skipped.", opportunity.Id);
            }
        }

        if (shortDescriptionPopulated > 0 || useOfFundsPopulated > 0 || equityOfferedPercentageCalculated > 0)
            await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Opportunity product fields backfill completed. Scanned={Scanned}, ShortDescriptionPopulated={ShortDescriptionPopulated}, UseOfFundsPopulated={UseOfFundsPopulated}, EquityOfferedPercentageCalculated={EquityOfferedPercentageCalculated}, Skipped={Skipped}, Errors={Errors}.",
            opportunities.Count,
            shortDescriptionPopulated,
            useOfFundsPopulated,
            equityOfferedPercentageCalculated,
            skipped,
            errors.Count);

        return new OpportunityProductFieldsBackfillResult(
            opportunities.Count,
            shortDescriptionPopulated,
            useOfFundsPopulated,
            equityOfferedPercentageCalculated,
            skipped,
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

    private static string? BuildShortDescription(string? description)
    {
        var normalized = NormalizeWhitespace(description);
        if (normalized == null)
            return null;

        var firstSentence = SentenceEndRegex.Split(normalized).FirstOrDefault();
        var candidate = string.IsNullOrWhiteSpace(firstSentence) ? normalized : firstSentence.Trim();
        if (candidate.Length < 20)
            candidate = normalized;

        return Truncate(candidate, 300);
    }

    private static string BuildUseOfFunds(Opportunity opportunity)
    {
        var description = NormalizeWhitespace(opportunity.Description);
        if (description != null && LooksLikeUseOfFunds(description))
            return Truncate(description, 250, minimumLength: 30);

        return opportunity.InvestmentModel switch
        {
            InvestmentModel.Equity => "Funding will be used to support project growth and business expansion.",
            InvestmentModel.LoanInvestment => "Funding will be used as working capital and will be repaid according to the agreed terms.",
            InvestmentModel.CapitalContributionProfitSharing => "Funding will be used to expand operations and generate shared profits.",
            _ => "Funding will be used to support project execution and operational growth."
        };
    }

    private static bool LooksLikeUseOfFunds(string description)
    {
        return description.Contains("use of funds", StringComparison.OrdinalIgnoreCase)
            || description.Contains("funding will be used", StringComparison.OrdinalIgnoreCase)
            || description.Contains("capital will be used", StringComparison.OrdinalIgnoreCase)
            || description.Contains("working capital", StringComparison.OrdinalIgnoreCase)
            || description.Contains("expansion", StringComparison.OrdinalIgnoreCase);
    }

    private static string Truncate(string value, int maxLength, int minimumLength = 0)
    {
        var normalized = NormalizeWhitespace(value) ?? string.Empty;
        if (normalized.Length <= maxLength)
            return normalized;

        var truncated = normalized[..maxLength].Trim();
        var lastSpace = truncated.LastIndexOf(' ');
        if (lastSpace >= minimumLength)
            truncated = truncated[..lastSpace].Trim();

        return truncated.TrimEnd('.', ',', ';', ':') + "...";
    }

    private static string? NormalizeWhitespace(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return Regex.Replace(value.Trim(), @"\s+", " ");
    }

    private static bool IsBlank(string? value) => string.IsNullOrWhiteSpace(value);
}
