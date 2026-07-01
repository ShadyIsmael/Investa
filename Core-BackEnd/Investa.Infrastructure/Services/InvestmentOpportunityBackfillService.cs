using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

public sealed record InvestmentOpportunityBackfillResult(int Scanned, int Migrated, int Skipped);

public class InvestmentOpportunityBackfillService
{
    private readonly ApplicationDbContext _context;
    private readonly IOpportunityService _opportunityService;
    private readonly ILogger<InvestmentOpportunityBackfillService> _logger;

    public InvestmentOpportunityBackfillService(
        ApplicationDbContext context,
        IOpportunityService opportunityService,
        ILogger<InvestmentOpportunityBackfillService> logger)
    {
        _context = context;
        _opportunityService = opportunityService;
        _logger = logger;
    }

    public async Task<InvestmentOpportunityBackfillResult> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var investments = await _context.Investments
            .Where(i => i.OpportunityId == null)
            .OrderBy(i => i.Id)
            .ToListAsync(cancellationToken);

        var migrated = 0;
        var skipped = 0;

        foreach (var investment in investments)
        {
            if (!InvestmentOpportunityCompatibilityMapper.TryCreateRequest(investment, out var request, out var skipReason))
            {
                skipped++;
                _logger.LogWarning(
                    "Investment {InvestmentId} Opportunity backfill skipped: {Reason}",
                    investment.Id,
                    skipReason);
                continue;
            }

            try
            {
                var opportunity = await _opportunityService.CreateAsync(investment.FounderId, request, cancellationToken);
                investment.OpportunityId = opportunity.Id;
                _context.Investments.Update(investment);
                await _context.SaveChangesAsync(cancellationToken);

                migrated++;
                _logger.LogInformation(
                    "Investment {InvestmentId} backfilled with Opportunity {OpportunityId}.",
                    investment.Id,
                    opportunity.Id);
            }
            catch (Exception ex)
            {
                skipped++;
                _logger.LogWarning(
                    ex,
                    "Investment {InvestmentId} Opportunity backfill skipped after create attempt.",
                    investment.Id);
            }
        }

        _logger.LogInformation(
            "Investment Opportunity backfill completed. Scanned={Scanned}, Migrated={Migrated}, Skipped={Skipped}.",
            investments.Count,
            migrated,
            skipped);

        return new InvestmentOpportunityBackfillResult(investments.Count, migrated, skipped);
    }
}
