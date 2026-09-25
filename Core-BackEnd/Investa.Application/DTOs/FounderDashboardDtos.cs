using Investa.Domain;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public sealed class FounderDashboardDto
{
    public DateTime EvaluatedAtUtc { get; init; }
    public string DisplayCurrency { get; init; } = CurrencyMasterDefaults.DefaultCurrency;
    public FounderDashboardMetricsDto Metrics { get; init; } = new();
    public IReadOnlyList<FounderDashboardProjectDto> Projects { get; init; } = [];
    public FounderDashboardTimeSeriesDto TimeSeries { get; init; } = new();
    public FounderDashboardAvailabilityDto Availability { get; init; } = new();
}

public sealed class FounderDashboardMetricsDto
{
    public int TotalProjects { get; init; }
    public int ActiveOpportunities { get; init; }
    public int UniqueActiveInvestors { get; init; }
    public FounderDashboardMoneyDto TotalFundingTarget { get; init; } = FounderDashboardMoneyDto.Zero();
    public FounderDashboardMoneyDto TotalFunded { get; init; } = FounderDashboardMoneyDto.Zero();
    public decimal? FundingProgressPercentage { get; init; }
    public FounderDashboardMoneyDto ReceivedAmount { get; init; } = FounderDashboardMoneyDto.Zero();
    public FounderDashboardMoneyDto Earnings { get; init; } = FounderDashboardMoneyDto.Unavailable("realized earnings source is not implemented");
    public int PendingActions { get; init; }
}

public sealed class FounderDashboardMoneyDto
{
    public decimal? Value { get; init; }
    public bool Available { get; init; }
    public bool Approximate { get; init; }
    public string? UnavailableReason { get; init; }

    public static FounderDashboardMoneyDto Zero() => new() { Value = 0m, Available = true };
    public static FounderDashboardMoneyDto From(decimal value, bool approximate) => new() { Value = value, Available = true, Approximate = approximate };
    public static FounderDashboardMoneyDto Unavailable(string reason) => new() { Available = false, UnavailableReason = reason };
}

public sealed class FounderDashboardAvailabilityDto
{
    public string Followers { get; init; } = "deferred";
    public string Earnings { get; init; } = "unavailable";
    public string ReceivedAmount { get; init; } = "platform_recorded";
}

public sealed class FounderDashboardProjectDto
{
    public int Id { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public ProjectStatus Status { get; init; }
    public string? DefaultCurrency { get; init; }
    public int OpportunityCount { get; init; }
    public FounderDashboardMoneyDto TotalFundingTarget { get; init; } = FounderDashboardMoneyDto.Zero();
    public FounderDashboardMoneyDto TotalFunded { get; init; } = FounderDashboardMoneyDto.Zero();
    public decimal? FundingProgressPercentage { get; init; }
    public IReadOnlyList<FounderDashboardOpportunityDto> Opportunities { get; init; } = [];
}

public sealed class FounderDashboardOpportunityDto
{
    public int Id { get; init; }
    public int SequenceNumber { get; init; }
    public string Title { get; init; } = string.Empty;
    public OpportunityStatus Status { get; init; }
    public OpportunityFundingStatus FundingStatus { get; init; }
    public decimal FundingTarget { get; init; }
    public string? FundingCurrency { get; init; }
    public FounderDashboardMoneyDto TotalFundingTarget { get; init; } = FounderDashboardMoneyDto.Zero();
    public FounderDashboardMoneyDto TotalFunded { get; init; } = FounderDashboardMoneyDto.Zero();
    public int ActiveInvestorCount { get; init; }
    public decimal? FundingProgressPercentage { get; init; }
}

public sealed class FounderDashboardTimeSeriesDto
{
    public IReadOnlyList<FounderDashboardTimeSeriesPointDto> FundingApprovals { get; init; } = [];
    public IReadOnlyList<FounderDashboardTimeSeriesPointDto> ReceivedAmounts { get; init; } = [];
    public IReadOnlyList<FounderDashboardTimeSeriesPointDto> Earnings { get; init; } = [];
}

public sealed class FounderDashboardTimeSeriesPointDto
{
    public DateTime PeriodStartUtc { get; init; }
    public decimal Value { get; init; }
    public string Currency { get; init; } = CurrencyMasterDefaults.DefaultCurrency;
    public bool Approximate { get; init; }
    public bool Unavailable { get; init; }
}
