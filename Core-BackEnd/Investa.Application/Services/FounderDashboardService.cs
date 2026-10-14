using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class FounderDashboardService(
    IUnitOfWork uow,
    ICurrencyConversionService conversion,
    ICurrencyDisplayService display) : IFounderDashboardService
{
    public async Task<FounderDashboardDto> GetAsync(
        Guid founderId,
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureFounderAsync(founderId, cancellationToken);
        var evaluatedAt = DateTime.UtcNow;
        var displayCurrency = await ResolveDisplayCurrencyAsync(founderId, cancellationToken);
        var (seriesFrom, seriesTo) = ResolveSeriesRange(fromUtc, toUtc, evaluatedAt);
        var fxCache = new Dictionary<string, ExchangeRateSnapshot>(StringComparer.OrdinalIgnoreCase);

        var projects = await uow.Repository<Project>().Query()
            .Where(p => p.FounderId == founderId)
            .OrderByDescending(p => p.Id)
            .Select(p => new ProjectRow(p.Id, p.DisplayName, p.Status, p.DefaultCurrency))
            .ToListAsync(cancellationToken);

        var projectIds = projects.Select(p => p.Id).ToArray();
        var opportunities = await uow.Repository<Opportunity>().Query()
            .Where(o => projectIds.Contains(o.ProjectId))
            .OrderBy(o => o.ProjectId).ThenBy(o => o.SequenceNumber).ThenBy(o => o.Id)
            .Select(o => new OpportunityRow(
                o.Id, o.ProjectId, o.SequenceNumber, o.Title, o.Status, o.FundingStatus,
                o.FundingOpensAt, o.FundingClosesAt, o.FundingTarget, o.FundingCurrency,
                ProjectStatus.Draft))
            .ToListAsync(cancellationToken);
        var projectStatuses = projects.ToDictionary(p => p.Id, p => p.Status);
        opportunities = opportunities
            .Where(o => projectStatuses.ContainsKey(o.ProjectId))
            .Select(o => o with { ProjectStatus = projectStatuses[o.ProjectId] })
            .ToList();

        var opportunityIds = opportunities.Select(o => o.Id).ToArray();
        var approved = await (from r in uow.Repository<OpportunityJoinRequest>().Query()
            join o in uow.Repository<Opportunity>().Query() on r.OpportunityId equals o.Id
            join p in uow.Repository<Project>().Query() on o.ProjectId equals p.Id
            where opportunityIds.Contains(o.Id)
                && p.FounderId == founderId
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Approved
            select new ApprovedFundingRow(
                r.Id, r.OpportunityId, r.InvestorId,
                r.FundingAmount ?? r.RequestedAmount ?? 0m,
                r.FundingCurrency,
                r.FundingAmount == null,
                r.ReviewedAt ?? r.UpdatedAt,
                o.FundingCurrency))
            .ToListAsync(cancellationToken);

        var declarations = await (from d in uow.Repository<FundingDeclaration>().Query()
            join o in uow.Repository<Opportunity>().Query() on d.OpportunityId equals o.Id
            join p in uow.Repository<Project>().Query() on o.ProjectId equals p.Id
            where opportunityIds.Contains(d.OpportunityId)
                && p.FounderId == founderId
            select new DeclaredFundingRow(d.Id, d.OpportunityId, d.Amount, d.CurrencyCode, d.DeclaredAt, d.Status))
            .ToListAsync(cancellationToken);

        var pendingActions = await CountPendingActionsAsync(founderId, opportunityIds, cancellationToken);
        var activeOpportunities = opportunities.Count(o => IsActive(o, evaluatedAt));
        var activeInvestors = approved.Select(r => r.InvestorId).Distinct().Count();

        var targetRows = opportunities
            .Select(o => new MoneyRow(o.FundingTarget, NormalizeCurrencyOrNull(o.FundingCurrency), false));
        var committedRows = approved.Where(r => r.Amount > 0)
            .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(ResolveFundingCurrency(r)), r.Approximate));

        var target = await ConvertRowsAsync(targetRows, displayCurrency, fxCache, cancellationToken);
        var committed = await ConvertRowsAsync(committedRows, displayCurrency, fxCache, cancellationToken);
        var declared = await ConvertRowsAsync(
            declarations.Where(d => d.Amount > 0).Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
            displayCurrency, fxCache, cancellationToken);
        var awaiting = await ConvertRowsAsync(
            declarations.Where(d => d.Status == FundingDeclarationStatus.PendingConfirmation && d.Amount > 0)
                .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
            displayCurrency, fxCache, cancellationToken);
        var disputed = await ConvertRowsAsync(
            declarations.Where(d => d.Status == FundingDeclarationStatus.Disputed && d.Amount > 0)
                .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
            displayCurrency, fxCache, cancellationToken);
        var confirmed = await ConvertRowsAsync(
            declarations.Where(d => d.Status == FundingDeclarationStatus.Confirmed && d.Amount > 0)
                .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
            displayCurrency, fxCache, cancellationToken);

        var projectDtos = new List<FounderDashboardProjectDto>(projects.Count);
        foreach (var project in projects)
        {
            var childOpportunities = opportunities.Where(o => o.ProjectId == project.Id).ToList();
            var projectTarget = await ConvertRowsAsync(
                childOpportunities.Select(o => new MoneyRow(o.FundingTarget, NormalizeCurrencyOrNull(o.FundingCurrency), false)),
                NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken);
            var projectCommitted = await ConvertRowsAsync(
                approved.Where(r => childOpportunities.Any(o => o.Id == r.OpportunityId))
                    .Where(r => r.Amount > 0)
                    .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(ResolveFundingCurrency(r)), r.Approximate)),
                NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken);
            var projectConfirmed = await ConvertRowsAsync(
                declarations.Where(d => childOpportunities.Any(o => o.Id == d.OpportunityId) && d.Status == FundingDeclarationStatus.Confirmed && d.Amount > 0)
                    .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
                NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken);

            var childDtos = new List<FounderDashboardOpportunityDto>(childOpportunities.Count);
            foreach (var opportunity in childOpportunities)
            {
                var opportunityCommitted = await ConvertRowsAsync(
                    approved.Where(r => r.OpportunityId == opportunity.Id && r.Amount > 0)
                        .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(ResolveFundingCurrency(r)), r.Approximate)),
                    NormalizeCurrencyOrNull(opportunity.FundingCurrency), fxCache, cancellationToken);
                var opportunityDeclared = await ConvertRowsAsync(
                    declarations.Where(r => r.OpportunityId == opportunity.Id && r.Amount > 0)
                        .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(r.Currency), false)),
                    NormalizeCurrencyOrNull(opportunity.FundingCurrency), fxCache, cancellationToken);
                var opportunityAwaiting = await ConvertRowsAsync(
                    declarations.Where(r => r.OpportunityId == opportunity.Id && r.Status == FundingDeclarationStatus.PendingConfirmation && r.Amount > 0)
                        .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(r.Currency), false)),
                    NormalizeCurrencyOrNull(opportunity.FundingCurrency), fxCache, cancellationToken);
                var opportunityDisputed = await ConvertRowsAsync(
                    declarations.Where(r => r.OpportunityId == opportunity.Id && r.Status == FundingDeclarationStatus.Disputed && r.Amount > 0)
                        .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(r.Currency), false)),
                    NormalizeCurrencyOrNull(opportunity.FundingCurrency), fxCache, cancellationToken);
                var opportunityConfirmed = await ConvertRowsAsync(
                    declarations.Where(r => r.OpportunityId == opportunity.Id && r.Status == FundingDeclarationStatus.Confirmed && r.Amount > 0)
                        .Select(r => new MoneyRow(r.Amount, NormalizeCurrencyOrNull(r.Currency), false)),
                    NormalizeCurrencyOrNull(opportunity.FundingCurrency), fxCache, cancellationToken);
                childDtos.Add(new FounderDashboardOpportunityDto
                {
                    Id = opportunity.Id,
                    SequenceNumber = opportunity.SequenceNumber,
                    Title = opportunity.Title,
                    Status = opportunity.Status,
                    FundingStatus = EffectiveFundingStatus(opportunity, evaluatedAt),
                    FundingTarget = opportunity.FundingTarget,
                    FundingCurrency = opportunity.FundingCurrency,
                    TotalFundingTarget = HasCurrency(opportunity.FundingCurrency)
                        ? FounderDashboardMoneyDto.From(opportunity.FundingTarget, false)
                        : FounderDashboardMoneyDto.Unavailable("Opportunity funding currency is missing"),
                    TotalCommitted = opportunityCommitted,
                    DeclaredReceivedAmount = opportunityDeclared,
                    AwaitingConfirmationAmount = opportunityAwaiting,
                    DisputedAmount = opportunityDisputed,
                    UndeclaredCommittedAmount = SubtractMoney(opportunityCommitted, opportunityDeclared),
                    ConfirmedReceivedAmount = opportunityConfirmed,
                    OutstandingAmount = SubtractMoney(opportunityCommitted, opportunityConfirmed),
                    TotalFunded = opportunityConfirmed,
                    ActiveInvestorCount = approved.Where(r => r.OpportunityId == opportunity.Id)
                        .Select(r => r.InvestorId).Distinct().Count(),
                    FundingProgressPercentage = FundingSemantics.CalculateFundingProgress(opportunity.FundingTarget, opportunityConfirmed.Value ?? 0m)
                });
            }

            projectDtos.Add(new FounderDashboardProjectDto
            {
                Id = project.Id,
                DisplayName = project.DisplayName,
                Status = project.Status,
                DefaultCurrency = project.DefaultCurrency,
                OpportunityCount = childOpportunities.Count,
                TotalFundingTarget = projectTarget,
                TotalCommitted = projectCommitted,
                DeclaredReceivedAmount = await ConvertRowsAsync(
                    declarations.Where(d => childOpportunities.Any(o => o.Id == d.OpportunityId) && d.Amount > 0)
                        .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
                    NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken),
                AwaitingConfirmationAmount = await ConvertRowsAsync(
                    declarations.Where(d => childOpportunities.Any(o => o.Id == d.OpportunityId) && d.Status == FundingDeclarationStatus.PendingConfirmation && d.Amount > 0)
                        .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
                    NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken),
                DisputedAmount = await ConvertRowsAsync(
                    declarations.Where(d => childOpportunities.Any(o => o.Id == d.OpportunityId) && d.Status == FundingDeclarationStatus.Disputed && d.Amount > 0)
                        .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
                    NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken),
                UndeclaredCommittedAmount = SubtractMoney(
                    projectCommitted,
                    await ConvertRowsAsync(
                        declarations.Where(d => childOpportunities.Any(o => o.Id == d.OpportunityId) && d.Amount > 0)
                            .Select(d => new MoneyRow(d.Amount, NormalizeCurrencyOrNull(d.Currency), false)),
                        NormalizeCurrencyOrNull(project.DefaultCurrency), fxCache, cancellationToken)),
                ConfirmedReceivedAmount = projectConfirmed,
                OutstandingAmount = SubtractMoney(projectCommitted, projectConfirmed),
                TotalFunded = projectConfirmed,
                FundingProgressPercentage = projectTarget.Value is > 0m
                    ? decimal.Round((projectConfirmed.Value ?? 0m) * 100m / projectTarget.Value.Value, 2)
                    : 0m,
                Opportunities = childDtos
            });
        }

        return new FounderDashboardDto
        {
            EvaluatedAtUtc = evaluatedAt,
            DisplayCurrency = displayCurrency,
            Metrics = new FounderDashboardMetricsDto
            {
                TotalProjects = projects.Count,
                ActiveOpportunities = activeOpportunities,
                UniqueActiveInvestors = activeInvestors,
                TotalFundingTarget = target,
                TotalCommitted = committed,
                DeclaredReceivedAmount = declared,
                AwaitingConfirmationAmount = awaiting,
                DisputedAmount = disputed,
                UndeclaredCommittedAmount = SubtractMoney(committed, declared),
                ConfirmedReceivedAmount = confirmed,
                OutstandingAmount = SubtractMoney(committed, confirmed),
                TotalFunded = confirmed,
                FundingProgressPercentage = target.Value is > 0m ? decimal.Round((confirmed.Value ?? 0m) * 100m / target.Value.Value, 2) : 0m,
                ReceivedAmount = confirmed,
                Earnings = FounderDashboardMoneyDto.Unavailable("realized earnings source is not implemented"),
                PendingActions = pendingActions
            },
            Projects = projectDtos,
            TimeSeries = new FounderDashboardTimeSeriesDto
            {
                FundingApprovals = await BuildFundingSeriesAsync(approved, seriesFrom, seriesTo, displayCurrency, fxCache, cancellationToken),
                ReceivedAmounts = [],
                Earnings = []
            },
            Availability = new FounderDashboardAvailabilityDto()
        };
    }

    private async Task<int> CountPendingActionsAsync(Guid founderId, IReadOnlyCollection<int> opportunityIds, CancellationToken cancellationToken)
    {
        if (opportunityIds.Count == 0) return 0;

        var participation = await uow.Repository<OpportunityJoinRequest>().Query()
            .Where(r => opportunityIds.Contains(r.OpportunityId)
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Pending
                && r.IsVisibleToFounder)
            .Select(r => r.Id).Distinct().CountAsync(cancellationToken);

        var obligations = await uow.Repository<ParticipationObligationConfirmation>().Query()
            .Where(c => c.OpportunityId != 0 && opportunityIds.Contains(c.OpportunityId)
                && c.RequiredUserId == founderId && c.Status == ObligationConfirmationStatus.Pending)
            .Select(c => c.Id).Distinct().CountAsync(cancellationToken);

        var conversationRequests = await uow.Repository<ConversationRequest>().Query()
            .Where(r => opportunityIds.Contains(r.OpportunityId)
                && r.RecipientUserId == founderId && r.Status == ConversationRequestStatus.Pending)
            .Select(r => r.Id).Distinct().CountAsync(cancellationToken);

        var negotiationOffers = await uow.Repository<NegotiationOffer>().Query()
            .Where(o => o.Status == NegotiationOfferStatus.Pending
                && o.CreatedByUserId != founderId
                && o.Conversation != null
                && o.Conversation.FounderId == founderId
                && o.Conversation.OpportunityId.HasValue
                && opportunityIds.Contains(o.Conversation.OpportunityId.Value))
            .Select(o => o.Id).Distinct().CountAsync(cancellationToken);

        return participation + obligations + conversationRequests + negotiationOffers;
    }

    private async Task<string> ResolveDisplayCurrencyAsync(Guid founderId, CancellationToken cancellationToken)
    {
        var user = await uow.Repository<AuthUser>().GetSingleAsync(u => u.Id == founderId, u => u.Profile!);
        var requested = user?.Profile?.PreferredCurrency;
        var candidate = string.IsNullOrWhiteSpace(requested) ? CurrencyMasterDefaults.DefaultCurrency : requested;
        try
        {
            return (await display.GetInfoAsync(candidate!, cancellationToken)).ISOCode;
        }
        catch (BusinessValidationException ex) when (IsCurrencyAvailabilityError(ex))
        {
            return CurrencyMasterDefaults.DefaultCurrency;
        }
    }

    private async Task EnsureFounderAsync(Guid founderId, CancellationToken cancellationToken)
    {
        var user = await uow.Repository<AuthUser>().Query()
            .Where(u => u.Id == founderId && u.Status && u.UserType == UserType.Client
                && (u.ClientType == ClientType.Founder || u.ClientType == ClientType.Both)
                && (!u.SuspendedUntil.HasValue || u.SuspendedUntil <= DateTime.UtcNow))
            .Select(u => u.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (user == Guid.Empty)
            throw new BusinessValidationException("FOUNDER_ACCESS_REQUIRED", "An active Founder account is required.");
    }

    private async Task<FounderDashboardMoneyDto> ConvertRowsAsync(IEnumerable<MoneyRow> rows, string? targetCurrency, IDictionary<string, ExchangeRateSnapshot> fxCache, CancellationToken cancellationToken)
    {
        if (!HasCurrency(targetCurrency)) return FounderDashboardMoneyDto.Unavailable("Currency is missing from legacy portfolio data");
        var groups = rows.Where(r => r.Amount > 0)
            .GroupBy(r => r.Currency, StringComparer.OrdinalIgnoreCase)
            .Select(g => new MoneyRow(g.Sum(r => r.Amount), g.Key, g.Any(r => r.Approximate)))
            .ToList();
        if (groups.Count == 0) return FounderDashboardMoneyDto.Zero();
        if (groups.Any(r => !HasCurrency(r.Currency)))
            return FounderDashboardMoneyDto.Unavailable("Currency is missing or invalid in portfolio data");

        var total = 0m;
        var approximate = false;
        foreach (var group in groups)
        {
            try
            {
                total += await ConvertAmountAsync(group.Amount, group.Currency!, targetCurrency!, fxCache, cancellationToken);
                approximate |= group.Approximate || !string.Equals(group.Currency, targetCurrency, StringComparison.OrdinalIgnoreCase);
            }
            catch (BusinessValidationException ex) when (IsCurrencyAvailabilityError(ex))
            {
                return FounderDashboardMoneyDto.Unavailable(ex.Message);
            }
        }
        return FounderDashboardMoneyDto.From(total, approximate);
    }

    private async Task<IReadOnlyList<FounderDashboardTimeSeriesPointDto>> BuildFundingSeriesAsync(
        IReadOnlyCollection<ApprovedFundingRow> rows, DateTime from, DateTime to, string currency, IDictionary<string, ExchangeRateSnapshot> fxCache, CancellationToken cancellationToken)
    {
        var grouped = rows.Where(r => r.Amount > 0 && r.EventAt >= from && r.EventAt < to)
            .GroupBy(r => new { Period = MonthStart(r.EventAt), Currency = ResolveFundingCurrency(r) })
            .Select(g => new SeriesRow(g.Key.Period, g.Sum(r => r.Amount), g.Key.Currency, g.Any(r => r.Approximate)))
            .ToList();
        return await BuildSeriesAsync(grouped, from, to, currency, fxCache, cancellationToken);
    }

    private async Task<IReadOnlyList<FounderDashboardTimeSeriesPointDto>> BuildReceivedSeriesAsync(
        IReadOnlyCollection<PaymentRow> rows, DateTime from, DateTime to, string currency, IDictionary<string, ExchangeRateSnapshot> fxCache, CancellationToken cancellationToken)
    {
        var events = new List<SeriesRow>();
        foreach (var row in rows.Where(r => r.Amount > 0))
        {
            var sourceCurrency = ResolvePaymentCurrency(row);
            var approximate = string.IsNullOrWhiteSpace(row.RequestCurrency);
            if (row.PaymentDate >= from && row.PaymentDate < to)
                events.Add(new SeriesRow(MonthStart(row.PaymentDate), row.Amount, sourceCurrency, approximate));
            if (row.IsReversed && row.ReversedAt is { } reversedAt && reversedAt >= from && reversedAt < to)
                events.Add(new SeriesRow(MonthStart(reversedAt), -row.Amount, sourceCurrency, approximate));
        }

        var grouped = events.GroupBy(r => new { r.Period, r.Currency })
            .Select(g => new SeriesRow(g.Key.Period, g.Sum(r => r.Amount), g.Key.Currency, g.Any(r => r.Approximate)))
            .ToList();
        return await BuildSeriesAsync(grouped, from, to, currency, fxCache, cancellationToken);
    }

    private async Task<IReadOnlyList<FounderDashboardTimeSeriesPointDto>> BuildSeriesAsync(
        IReadOnlyCollection<SeriesRow> rows, DateTime from, DateTime to, string currency, IDictionary<string, ExchangeRateSnapshot> fxCache, CancellationToken cancellationToken)
    {
        var points = new List<FounderDashboardTimeSeriesPointDto>();
        for (var period = from; period < to; period = period.AddMonths(1))
        {
            var bucket = rows.Where(r => r.Period == period).ToList();
            var value = 0m;
            var approximate = false;
            var unavailable = false;
            foreach (var group in bucket)
            {
                if (group.Amount == 0) continue;
                if (!HasCurrency(group.Currency))
                {
                    unavailable = true;
                    continue;
                }
                try
                {
                    var converted = await ConvertAmountAsync(Math.Abs(group.Amount), group.Currency!, currency, fxCache, cancellationToken);
                    value += group.Amount < 0 ? -converted : converted;
                    approximate |= group.Approximate || !string.Equals(group.Currency, currency, StringComparison.OrdinalIgnoreCase);
                }
                catch (BusinessValidationException ex) when (IsCurrencyAvailabilityError(ex))
                {
                    unavailable = true;
                }
            }
            points.Add(new FounderDashboardTimeSeriesPointDto { PeriodStartUtc = period, Value = value, Currency = currency, Approximate = approximate, Unavailable = unavailable });
        }
        return points;
    }

    private async Task<decimal> ConvertAmountAsync(decimal amount, string sourceCurrency, string targetCurrency, IDictionary<string, ExchangeRateSnapshot> fxCache, CancellationToken cancellationToken)
    {
        var source = display.Normalize(sourceCurrency);
        var target = display.Normalize(targetCurrency);
        if (string.Equals(source, target, StringComparison.OrdinalIgnoreCase)) return amount;
        var key = $"{source}:{target}";
        if (!fxCache.TryGetValue(key, out var snapshot))
        {
            snapshot = (await conversion.ConvertForDisplayAsync(1m, source, target, cancellationToken)).Snapshot;
            fxCache[key] = snapshot;
        }
        return conversion.ConvertUsingSnapshot(amount, snapshot).ConvertedAmount;
    }

    private static (DateTime From, DateTime To) ResolveSeriesRange(DateTime? from, DateTime? to, DateTime evaluatedAt)
    {
        var end = MonthStart(to ?? evaluatedAt).AddMonths(1);
        var start = MonthStart(from ?? end.AddMonths(-12));
        if (end <= start) end = start.AddMonths(1);
        return (DateTime.SpecifyKind(start, DateTimeKind.Utc), DateTime.SpecifyKind(end, DateTimeKind.Utc));
    }

    private static DateTime MonthStart(DateTime value) => new(value.Year, value.Month, 1, 0, 0, 0, DateTimeKind.Utc);

    private static decimal? Progress(FounderDashboardMoneyDto amount, FounderDashboardMoneyDto target) =>
        !amount.Available || !target.Available ? null :
        target.Value is null or <= 0 ? 0m : amount.Value!.Value / target.Value.Value * 100m;

    private static OpportunityFundingStatus EffectiveFundingStatus(OpportunityRow opportunity, DateTime now)
    {
        if (opportunity.FundingStatus == OpportunityFundingStatus.Scheduled
            && opportunity.FundingOpensAt <= now
            && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > now))
            return OpportunityFundingStatus.Open;
        if (opportunity.FundingStatus == OpportunityFundingStatus.Open
            && opportunity.FundingClosesAt.HasValue && opportunity.FundingClosesAt <= now)
            return OpportunityFundingStatus.Closed;
        return opportunity.FundingStatus == OpportunityFundingStatus.NotScheduled
            && opportunity.Status is OpportunityStatus.Published or OpportunityStatus.Funding or OpportunityStatus.FullyFunded or OpportunityStatus.InProgress
                ? OpportunityFundingStatus.Open
                : opportunity.FundingStatus;
    }

    private static bool IsActive(OpportunityRow opportunity, DateTime now) =>
        opportunity.Status is OpportunityStatus.Published or OpportunityStatus.Funding or OpportunityStatus.FullyFunded or OpportunityStatus.InProgress
        && opportunity.ProjectStatus != ProjectStatus.Archived
        && EffectiveFundingStatus(opportunity, now) == OpportunityFundingStatus.Open
        && (!opportunity.FundingOpensAt.HasValue || opportunity.FundingOpensAt <= now)
        && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > now);

    private static string? ResolveFundingCurrency(ApprovedFundingRow row) =>
        string.IsNullOrWhiteSpace(row.FundingCurrency) ? row.OpportunityCurrency : row.FundingCurrency!;

    private static string? ResolvePaymentCurrency(PaymentRow row) =>
        string.IsNullOrWhiteSpace(row.RequestCurrency) ? row.OpportunityCurrency : row.RequestCurrency!;

    private static bool HasCurrency(string? currency) => NormalizeCurrencyOrNull(currency) is not null;

    private static bool IsCurrencyAvailabilityError(BusinessValidationException exception) =>
        exception.Code is "INVALID_CURRENCY" or "UNSUPPORTED_CURRENCY" or "FX_PROVIDER_UNAVAILABLE";

    private static string? NormalizeCurrencyOrNull(string? currency)
    {
        var value = currency?.Trim().ToUpperInvariant();
        return value?.Length == 3 && value.All(char.IsLetter) ? value : null;
    }

    private static FounderDashboardMoneyDto SubtractMoney(FounderDashboardMoneyDto left, FounderDashboardMoneyDto right)
    {
        if (!left.Available || !right.Available || left.Value is null || right.Value is null)
            return FounderDashboardMoneyDto.Unavailable("Unable to calculate the undeclared committed amount in the selected currency");
        return FounderDashboardMoneyDto.From(Math.Max(left.Value.Value - right.Value.Value, 0m), left.Approximate || right.Approximate);
    }

    private sealed record ProjectRow(int Id, string DisplayName, ProjectStatus Status, string? DefaultCurrency);
    private sealed record OpportunityRow(int Id, int ProjectId, int SequenceNumber, string Title, OpportunityStatus Status, OpportunityFundingStatus FundingStatus, DateTime? FundingOpensAt, DateTime? FundingClosesAt, decimal FundingTarget, string? FundingCurrency, ProjectStatus ProjectStatus);
    private sealed record ApprovedFundingRow(int Id, int OpportunityId, Guid InvestorId, decimal Amount, string? FundingCurrency, bool Approximate, DateTime EventAt, string? OpportunityCurrency);
    private sealed record DeclaredFundingRow(int Id, int OpportunityId, decimal Amount, string Currency, DateTime DeclaredAt, FundingDeclarationStatus Status);
    private sealed record PaymentRow(int Id, decimal Amount, DateTime PaymentDate, bool IsReversed, DateTime? ReversedAt, int OpportunityId, string? RequestCurrency, string? OpportunityCurrency);
    private sealed record MoneyRow(decimal Amount, string? Currency, bool Approximate);
    private sealed record SeriesRow(DateTime Period, decimal Amount, string? Currency, bool Approximate);
}
