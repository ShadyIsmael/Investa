using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

/// <summary>
/// DEV-ONLY Opportunity data repair/seed utility.
/// Fills incomplete Opportunities with valid randomized test values.
/// CRITICAL: This utility MUST refuse to run outside Development environment.
/// </summary>
public sealed record OpportunitySeedResult(
    int TotalInspected,
    int TotalUpdated,
    int TotalSkipped,
    int EquitiesRepaired,
    int LoansRepaired,
    int ProfitSharingRepaired,
    Dictionary<int, OpportunitySeedFieldsUpdated> UpdatesByOpportunity,
    List<string> ValidationErrors,
    Opportunity2028Details? Opportunity2028Details);

public sealed record OpportunitySeedFieldsUpdated(
    int OpportunityId,
    List<string> FieldsUpdated,
    InvestmentModel Model,
    OpportunityStatus Status,
    bool IsValid);

public sealed record Opportunity2028Details(
    int Id,
    string Title,
    InvestmentModel Model,
    decimal FundingTarget,
    decimal? MinimumInvestment,
    decimal? MaximumInvestment,
    int? EquityPercentage,
    decimal? InterestRate,
    string? RepaymentFrequency,
    DateTime? FinalRepaymentDate,
    decimal? ProfitSharePercentage,
    string? ProfitPayoutFrequency,
    int? ExpectedDurationMonths);

public class OpportunitySeedService
{
    private const int StabilizedLoanOpportunityId = 2028;
    private const decimal StabilizedLoanInterestRate = 14m;
    private const string StabilizedLoanRepaymentFrequency = "Monthly";
    private const int StabilizedLoanDurationMonths = 36;
    private static readonly DateTime StabilizedLoanFinalRepaymentDate = new(2030, 7, 12, 0, 0, 0, DateTimeKind.Utc);
    private const int DefaultEquityPercentageMin = 5;
    private const int DefaultEquityPercentageMax = 40;
    private const decimal DefaultLoanInterestMin = 5m;
    private const decimal DefaultLoanInterestMax = 25m;
    private const int DefaultProfitSharePercentageMin = 5;
    private const int DefaultProfitSharePercentageMax = 35;
    private const decimal DefaultFundingMin = 100_000m;
    private const decimal DefaultFundingMax = 5_000_000m;
    private const decimal DefaultMinInvestmentMin = 5_000m;
    private const decimal DefaultMinInvestmentMax = 100_000m;

    private static readonly string[] SampleTitles = new[]
    {
        "Innovative Tech Startup",
        "Sustainable Agriculture Project",
        "E-commerce Platform",
        "Healthcare Solutions",
        "Green Energy Initiative",
        "Educational Platform",
        "Fintech Solutions",
        "Real Estate Development",
        "Food & Beverage Brand",
        "Software Development Services"
    };

    private static readonly string[] SampleDescriptions = new[]
    {
        "A cutting-edge technology platform revolutionizing the industry.",
        "Building sustainable solutions for modern challenges.",
        "Creating value through innovative business models.",
        "Transforming the market with disruptive technology.",
        "Focused on delivering exceptional customer experience.",
        "Scaling a proven business model to new markets.",
        "Committed to long-term growth and sustainability.",
        "Leveraging emerging technologies for competitive advantage.",
        "Building a community-driven platform.",
        "Addressing critical market gaps with innovation."
    };

    private static readonly string[] SampleUseOfFunds = new[]
    {
        "Product development and R&D, team expansion, market expansion, technology infrastructure, and operational scaling.",
        "Market research, team hiring, technology stack implementation, office setup, and customer acquisition.",
        "Sales and marketing efforts, product enhancement, team growth, supply chain optimization, and quality assurance.",
        "Research and development, regulatory compliance, production capacity expansion, and brand building.",
        "Infrastructure development, team scaling, geographic expansion, customer support, and innovation initiatives.",
        "Technology enhancement, customer acquisition, operational improvement, team expansion, and market penetration.",
        "Product development, talent recruitment, market entry, technology upgrades, and customer retention programs.",
        "Capital for growth, team expansion, strategic partnerships, technology investment, and market development.",
        "Inventory expansion, retail space development, marketing campaigns, team hiring, and supply chain optimization.",
        "Engineering talent, platform scaling, user acquisition, data infrastructure, and compliance development."
    };

    private static readonly string[] RepaymentFrequencies = new[] { "Monthly", "Quarterly", "Annual" };
    private static readonly string[] ProfitPayoutFrequencies = new[] { "Monthly", "Quarterly", "Annual" };

    private readonly ApplicationDbContext _context;
    private readonly ILogger<OpportunitySeedService> _logger;
    private Random _rng;
    private int _seedValue;

    public OpportunitySeedService(
        ApplicationDbContext context,
        ILogger<OpportunitySeedService> logger)
    {
        _context = context;
        _logger = logger;
        _rng = new Random();
        _seedValue = 0;
    }

    /// <summary>
    /// Seeds/repairs all Opportunities with missing values.
    /// MUST ONLY RUN IN DEVELOPMENT ENVIRONMENT.
    /// </summary>
    public async Task<OpportunitySeedResult> SeedAsync(int? seedValue = null, bool publishReadyDrafts = false, CancellationToken cancellationToken = default)
    {
        _seedValue = seedValue ?? (int)DateTime.UtcNow.Ticks;
        _rng = new Random(_seedValue);

        _logger.LogInformation("🌱 [DEV ONLY] Opportunity seed operation starting with seed={Seed}", _seedValue);

        var opportunities = await _context.Opportunities
            .OrderBy(o => o.Id)
            .ToListAsync(cancellationToken);

        var updatesByOpportunity = new Dictionary<int, OpportunitySeedFieldsUpdated>();
        var validationErrors = new List<string>();
        var equitiesRepaired = 0;
        var loansRepaired = 0;
        var profitSharingRepaired = 0;

        foreach (var opportunity in opportunities)
        {
            try
            {
                var fieldsUpdated = FillMissingFields(opportunity);
                if (fieldsUpdated.Count > 0)
                {
                    switch (opportunity.InvestmentModel)
                    {
                        case InvestmentModel.Equity:
                            equitiesRepaired++;
                            break;
                        case InvestmentModel.LoanInvestment:
                            loansRepaired++;
                            break;
                        case InvestmentModel.CapitalContributionProfitSharing:
                            profitSharingRepaired++;
                            break;
                    }

                    var validationIssues = ValidateOpportunity(opportunity);
                    var isValid = validationIssues.Count == 0;

                    if (!isValid)
                    {
                        validationErrors.AddRange(validationIssues.Select(e => $"Opportunity {opportunity.Id}: {e}"));
                    }

                    updatesByOpportunity[opportunity.Id] = new OpportunitySeedFieldsUpdated(
                        opportunity.Id,
                        fieldsUpdated,
                        opportunity.InvestmentModel,
                        opportunity.Status,
                        isValid);

                    _logger.LogInformation(
                        "Opportunity {OpportunityId} repaired. Model={Model}, Fields={Fields}, Valid={IsValid}",
                        opportunity.Id,
                        opportunity.InvestmentModel,
                        string.Join(", ", fieldsUpdated),
                        isValid);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Opportunity {OpportunityId} repair failed", opportunity.Id);
                validationErrors.Add($"Opportunity {opportunity.Id}: {ex.Message}");
            }
        }

        // Save changes if any
        if (updatesByOpportunity.Count > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Opportunities saved. Total updated={Updated}",
                updatesByOpportunity.Count);
        }

        // Specific repair for Opportunity 2028
        var opportunity2028 = opportunities.FirstOrDefault(o => o.Id == 2028);
        Opportunity2028Details? opportunity2028Details = null;
        if (opportunity2028 != null)
        {
            opportunity2028Details = new Opportunity2028Details(
                opportunity2028.Id,
                opportunity2028.Title,
                opportunity2028.InvestmentModel,
                opportunity2028.FundingTarget,
                opportunity2028.MinimumInvestmentAmount,
                opportunity2028.MaximumInvestmentAmount,
                opportunity2028.EquityOfferedPercentage.HasValue ? (int)opportunity2028.EquityOfferedPercentage.Value : null,
                opportunity2028.InterestRate,
                opportunity2028.RepaymentFrequency,
                opportunity2028.FinalRepaymentDate,
                opportunity2028.ProfitSharePercentage,
                opportunity2028.ProfitSharingPayoutFrequency,
                opportunity2028.ExpectedDurationMonths);

            _logger.LogInformation(
                "✅ Opportunity 2028 final state: Title={Title}, Model={Model}, FundingTarget={FundingTarget}, IsValid={IsValid}",
                opportunity2028Details.Title,
                opportunity2028Details.Model,
                opportunity2028Details.FundingTarget,
                !validationErrors.Any(e => e.Contains("Opportunity 2028")));
        }

        var result = new OpportunitySeedResult(
            opportunities.Count,
            updatesByOpportunity.Count,
            opportunities.Count - updatesByOpportunity.Count,
            equitiesRepaired,
            loansRepaired,
            profitSharingRepaired,
            updatesByOpportunity,
            validationErrors,
            opportunity2028Details);

        _logger.LogInformation(
            "✅ Opportunity seed completed. Inspected={Inspected}, Updated={Updated}, EquitiesRepaired={EquitiesRepaired}, LoansRepaired={LoansRepaired}, ProfitSharingRepaired={ProfitSharingRepaired}",
            result.TotalInspected,
            result.TotalUpdated,
            result.EquitiesRepaired,
            result.LoansRepaired,
            result.ProfitSharingRepaired);

        return result;
    }

    /// <summary>
    /// Fills missing fields for an Opportunity based on its investment model.
    /// Returns list of field names that were updated.
    /// </summary>
    private List<string> FillMissingFields(Opportunity opportunity)
    {
        var fieldsUpdated = new List<string>();

        // The actively tested DEV Loan uses explicit, repeatable Opportunity-native terms.
        // Do not seed a DTO alias or a legacy Investment row for this repair.
        if (opportunity.Id == StabilizedLoanOpportunityId && opportunity.InvestmentModel == InvestmentModel.LoanInvestment)
        {
            SetIfDifferent(opportunity.InterestRate, StabilizedLoanInterestRate, nameof(opportunity.InterestRate), fieldsUpdated, value => opportunity.InterestRate = value);
            SetIfDifferent(opportunity.RepaymentFrequency, StabilizedLoanRepaymentFrequency, nameof(opportunity.RepaymentFrequency), fieldsUpdated, value => opportunity.RepaymentFrequency = value);
            SetIfDifferent(opportunity.ExpectedDurationMonths, StabilizedLoanDurationMonths, nameof(opportunity.ExpectedDurationMonths), fieldsUpdated, value => opportunity.ExpectedDurationMonths = value);
            SetIfDifferent(opportunity.FinalRepaymentDate, StabilizedLoanFinalRepaymentDate, nameof(opportunity.FinalRepaymentDate), fieldsUpdated, value => opportunity.FinalRepaymentDate = value);
        }

        // Fill core fields
        if (IsBlank(opportunity.Title))
        {
            opportunity.Title = $"{SampleTitles[_rng.Next(SampleTitles.Length)]} - {opportunity.Id}";
            fieldsUpdated.Add(nameof(opportunity.Title));
        }

        if (IsBlank(opportunity.ShortDescription))
        {
            opportunity.ShortDescription = SampleDescriptions[_rng.Next(SampleDescriptions.Length)].Substring(0, Math.Min(300, SampleDescriptions[_rng.Next(SampleDescriptions.Length)].Length));
            fieldsUpdated.Add(nameof(opportunity.ShortDescription));
        }

        if (IsBlank(opportunity.Description))
        {
            opportunity.Description = SampleDescriptions[_rng.Next(SampleDescriptions.Length)];
            fieldsUpdated.Add(nameof(opportunity.Description));
        }

        if (IsBlank(opportunity.UseOfFunds))
        {
            opportunity.UseOfFunds = SampleUseOfFunds[_rng.Next(SampleUseOfFunds.Length)];
            fieldsUpdated.Add(nameof(opportunity.UseOfFunds));
        }

        // Fill funding target if missing or invalid
        if (opportunity.FundingTarget <= 0)
        {
            opportunity.FundingTarget = (decimal)(_rng.Next((int)DefaultFundingMin / 1000, (int)DefaultFundingMax / 1000) * 1000);
            fieldsUpdated.Add(nameof(opportunity.FundingTarget));
        }

        // Fill minimum investment if missing or invalid
        if (!opportunity.MinimumInvestmentAmount.HasValue || opportunity.MinimumInvestmentAmount <= 0)
        {
            opportunity.MinimumInvestmentAmount = (decimal)(_rng.Next((int)DefaultMinInvestmentMin / 1000, (int)DefaultMinInvestmentMax / 1000) * 1000);
            fieldsUpdated.Add(nameof(opportunity.MinimumInvestmentAmount));
        }

        // Fill maximum investment if missing or invalid (must be >= minimum and <= funding target)
        if (!opportunity.MaximumInvestmentAmount.HasValue || 
            opportunity.MaximumInvestmentAmount <= 0 ||
            opportunity.MaximumInvestmentAmount < opportunity.MinimumInvestmentAmount ||
            opportunity.MaximumInvestmentAmount > opportunity.FundingTarget)
        {
            var min = opportunity.MinimumInvestmentAmount ?? 50_000m;
            var maxAllowed = Math.Min(opportunity.FundingTarget, min * 10);
            
            // Ensure maxAllowed is greater than min; if not, use the minimum plus some variance
            if (maxAllowed <= min)
            {
                maxAllowed = Math.Min(opportunity.FundingTarget, min * 2);
            }
            
            var minInt = (int)Math.Min(min, int.MaxValue);
            var maxInt = (int)Math.Min(maxAllowed, int.MaxValue);
            
            // Additional safety check
            if (maxInt <= minInt)
            {
                maxInt = minInt + 1000;
            }
            
            opportunity.MaximumInvestmentAmount = (decimal)_rng.Next(minInt, maxInt);
            fieldsUpdated.Add(nameof(opportunity.MaximumInvestmentAmount));
        }

        // Fill expected duration if missing
        if (!opportunity.ExpectedDurationMonths.HasValue || opportunity.ExpectedDurationMonths <= 0)
        {
            opportunity.ExpectedDurationMonths = new[] { 6, 12, 18, 24, 36, 48 }[_rng.Next(6)];
            fieldsUpdated.Add(nameof(opportunity.ExpectedDurationMonths));
        }

        // Fill model-specific fields
        switch (opportunity.InvestmentModel)
        {
            case InvestmentModel.Equity:
                fieldsUpdated.AddRange(FillEquityFields(opportunity));
                break;
            case InvestmentModel.LoanInvestment:
                fieldsUpdated.AddRange(FillLoanFields(opportunity));
                break;
            case InvestmentModel.CapitalContributionProfitSharing:
                fieldsUpdated.AddRange(FillProfitSharingFields(opportunity));
                break;
        }

        opportunity.UpdatedAt = DateTime.UtcNow;
        return fieldsUpdated;
    }

    private static void SetIfDifferent<T>(T current, T required, string fieldName, List<string> fieldsUpdated, Action<T> setter)
    {
        if (EqualityComparer<T>.Default.Equals(current, required))
            return;

        setter(required);
        fieldsUpdated.Add(fieldName);
    }

    private List<string> FillEquityFields(Opportunity opportunity)
    {
        var fieldsUpdated = new List<string>();

        if (!opportunity.EquityOfferedPercentage.HasValue || 
            opportunity.EquityOfferedPercentage <= 0 || 
            opportunity.EquityOfferedPercentage > 100)
        {
            opportunity.EquityOfferedPercentage = _rng.Next(DefaultEquityPercentageMin, DefaultEquityPercentageMax);
            fieldsUpdated.Add(nameof(opportunity.EquityOfferedPercentage));
        }

        return fieldsUpdated;
    }

    private List<string> FillLoanFields(Opportunity opportunity)
    {
        var fieldsUpdated = new List<string>();

        if (!opportunity.InterestRate.HasValue || opportunity.InterestRate <= 0 || opportunity.InterestRate > 100)
        {
            opportunity.InterestRate = (decimal)(_rng.Next((int)(DefaultLoanInterestMin * 100), (int)(DefaultLoanInterestMax * 100)) / 100.0);
            fieldsUpdated.Add(nameof(opportunity.InterestRate));
        }

        if (string.IsNullOrWhiteSpace(opportunity.RepaymentFrequency))
        {
            opportunity.RepaymentFrequency = RepaymentFrequencies[_rng.Next(RepaymentFrequencies.Length)];
            fieldsUpdated.Add(nameof(opportunity.RepaymentFrequency));
        }

        if (!opportunity.FinalRepaymentDate.HasValue || opportunity.FinalRepaymentDate <= DateTime.UtcNow)
        {
            var months = opportunity.ExpectedDurationMonths ?? _rng.Next(6, 49);
            opportunity.FinalRepaymentDate = DateTime.UtcNow.AddMonths(months);
            fieldsUpdated.Add(nameof(opportunity.FinalRepaymentDate));
        }

        return fieldsUpdated;
    }

    private List<string> FillProfitSharingFields(Opportunity opportunity)
    {
        var fieldsUpdated = new List<string>();

        if (!opportunity.ProfitSharePercentage.HasValue || 
            opportunity.ProfitSharePercentage <= 0 || 
            opportunity.ProfitSharePercentage > 100)
        {
            opportunity.ProfitSharePercentage = _rng.Next(DefaultProfitSharePercentageMin, DefaultProfitSharePercentageMax);
            fieldsUpdated.Add(nameof(opportunity.ProfitSharePercentage));
        }

        if (string.IsNullOrWhiteSpace(opportunity.ProfitSharingPayoutFrequency))
        {
            opportunity.ProfitSharingPayoutFrequency = ProfitPayoutFrequencies[_rng.Next(ProfitPayoutFrequencies.Length)];
            fieldsUpdated.Add(nameof(opportunity.ProfitSharingPayoutFrequency));
        }

        // Fill contract dates if both missing and no duration
        if ((!opportunity.ProfitSharingContractStartDate.HasValue || !opportunity.ProfitSharingContractEndDate.HasValue) &&
            (!opportunity.ExpectedDurationMonths.HasValue || opportunity.ExpectedDurationMonths <= 0))
        {
            var startDate = DateTime.UtcNow.AddDays(_rng.Next(1, 30));
            var durationMonths = opportunity.ExpectedDurationMonths ?? new[] { 6, 12, 18, 24, 36 }[_rng.Next(5)];
            opportunity.ProfitSharingContractStartDate = startDate;
            opportunity.ProfitSharingContractEndDate = startDate.AddMonths(durationMonths);
            fieldsUpdated.Add(nameof(opportunity.ProfitSharingContractStartDate));
            fieldsUpdated.Add(nameof(opportunity.ProfitSharingContractEndDate));
        }

        return fieldsUpdated;
    }

    /// <summary>
    /// Validates an Opportunity against business rules.
    /// Returns list of validation error messages (empty if valid).
    /// </summary>
    private List<string> ValidateOpportunity(Opportunity opportunity)
    {
        var errors = new List<string>();

        // Core validations
        if (IsBlank(opportunity.Title))
            errors.Add("Title is required");

        if (opportunity.FundingTarget <= 0)
            errors.Add("FundingTarget must be greater than zero");

        if (!opportunity.CategoryId.HasValue)
            errors.Add("CategoryId is required");

        if (!opportunity.FundingGoalId.HasValue)
            errors.Add("FundingGoalId is required");

        if (IsBlank(opportunity.ShortDescription) || opportunity.ShortDescription.Length < 20)
            errors.Add("ShortDescription must be at least 20 characters");

        if (IsBlank(opportunity.UseOfFunds) || opportunity.UseOfFunds.Length < 30)
            errors.Add("UseOfFunds must be at least 30 characters");

        if (!opportunity.MinimumInvestmentAmount.HasValue || opportunity.MinimumInvestmentAmount <= 0)
            errors.Add("MinimumInvestmentAmount must be greater than zero");

        if (!opportunity.MaximumInvestmentAmount.HasValue || opportunity.MaximumInvestmentAmount <= 0)
            errors.Add("MaximumInvestmentAmount must be greater than zero");

        if (opportunity.MinimumInvestmentAmount.HasValue && 
            opportunity.MaximumInvestmentAmount.HasValue && 
            opportunity.MaximumInvestmentAmount < opportunity.MinimumInvestmentAmount)
            errors.Add("MaximumInvestmentAmount must be >= MinimumInvestmentAmount");

        // Model-specific validations
        switch (opportunity.InvestmentModel)
        {
            case InvestmentModel.Equity:
                if (!opportunity.EquityOfferedPercentage.HasValue || 
                    opportunity.EquityOfferedPercentage <= 0 || 
                    opportunity.EquityOfferedPercentage > 100)
                    errors.Add("EquityOfferedPercentage must be between 0.01 and 100");
                break;

            case InvestmentModel.LoanInvestment:
                if (!opportunity.ExpectedDurationMonths.HasValue || opportunity.ExpectedDurationMonths <= 0)
                    errors.Add("ExpectedDurationMonths is required for Loan opportunities");

                if (!opportunity.InterestRate.HasValue || opportunity.InterestRate <= 0 || opportunity.InterestRate > 100)
                    errors.Add("InterestRate must be between 0.01 and 100");

                if (string.IsNullOrWhiteSpace(opportunity.RepaymentFrequency))
                    errors.Add("RepaymentFrequency is required for Loan opportunities");

                if (!opportunity.FinalRepaymentDate.HasValue)
                    errors.Add("FinalRepaymentDate is required for Loan opportunities");

                if (opportunity.FinalRepaymentDate.HasValue && opportunity.FinalRepaymentDate <= DateTime.UtcNow)
                    errors.Add("FinalRepaymentDate must be in the future");
                break;

            case InvestmentModel.CapitalContributionProfitSharing:
                if (!opportunity.ProfitSharePercentage.HasValue || 
                    opportunity.ProfitSharePercentage <= 0 || 
                    opportunity.ProfitSharePercentage > 100)
                    errors.Add("ProfitSharePercentage must be between 0.01 and 100");

                if (string.IsNullOrWhiteSpace(opportunity.ProfitSharingPayoutFrequency))
                    errors.Add("ProfitSharingPayoutFrequency is required for Profit Sharing opportunities");

                var hasDuration = opportunity.ExpectedDurationMonths.HasValue && opportunity.ExpectedDurationMonths > 0;
                var hasDates = opportunity.ProfitSharingContractStartDate.HasValue && opportunity.ProfitSharingContractEndDate.HasValue;
                
                if (!hasDuration && !hasDates)
                    errors.Add("Either ExpectedDurationMonths or both contract dates must be provided for Profit Sharing opportunities");

                if (hasDates && opportunity.ProfitSharingContractEndDate <= opportunity.ProfitSharingContractStartDate)
                    errors.Add("ProfitSharingContractEndDate must be after start date");
                break;
        }

        return errors;
    }

    private bool IsBlank(string? value)
    {
        return string.IsNullOrWhiteSpace(value);
    }
}
