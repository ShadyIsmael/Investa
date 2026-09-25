using Investa.Domain;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

/// <summary>
/// Display metadata resolved ONLY from the active Currency Master record.
/// No client may hardcode symbols, bilingual names, or decimal-digit rules.
/// </summary>
public class CurrencyDisplayInfo
{
    public string ISOCode { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string EnglishName { get; set; } = string.Empty;
    public string ArabicName { get; set; } = string.Empty;
    public int DecimalDigits { get; set; } = 2;
    public bool IsActive { get; set; }
    public bool SupportsFunding { get; set; }
    public bool SupportsSettlement { get; set; }
    public bool SupportsWallet { get; set; }

    public static CurrencyDisplayInfo FromEntity(Currency currency) => new()
    {
        ISOCode = currency.ISOCode,
        Symbol = currency.Symbol,
        EnglishName = currency.EnglishName,
        ArabicName = currency.ArabicName,
        DecimalDigits = currency.DecimalDigits,
        IsActive = currency.IsActive,
        SupportsFunding = currency.SupportsFunding,
        SupportsSettlement = currency.SupportsSettlement,
        SupportsWallet = currency.SupportsWallet
    };
}

public class ProjectDto
{
    public int Id { get; set; }
    public Guid FounderId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public OpportunityLookupDto? Category { get; set; }
    public string? Industry { get; set; }
    public ProjectStage BusinessStage { get; set; }
    public string? Geography { get; set; }
    public DateOnly? FoundedOn { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? TeamDescription { get; set; }
    public string? BusinessModel { get; set; }
    public string? RiskLevel { get; set; }
    public string? RiskDisclosure { get; set; }
    public ProjectStatus Status { get; set; }
    public string? ArchiveReason { get; set; }

    /// <summary>Project Default Currency (ISO 4217). All project-level totals are displayed in it.</summary>
    public string DefaultCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;

    /// <summary>Currency Master display metadata for <see cref="DefaultCurrency"/>.</summary>
    public CurrencyDisplayInfo? DefaultCurrencyInfo { get; set; }

    /// <summary>Sum of all opportunity targets converted to Project Default Currency (approximate display).</summary>
    public decimal TotalFundingTargetInDefaultCurrency { get; set; }

    public int OpportunityCount { get; set; }
    public bool CanCreateOpportunity => Status != ProjectStatus.Archived;
    public IReadOnlyList<ProjectOpportunityDto> Opportunities { get; set; } = Array.Empty<ProjectOpportunityDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ProjectOpportunityDto
{
    public int Id { get; set; }
    public int SequenceNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public ProjectStage ProjectStage { get; set; }
    public string? ProjectStageCustomName { get; set; }
    public OpportunityStatus Status { get; set; }
    public OpportunityModerationStatus ModerationStatus { get; set; }
    public OpportunityFundingStatus FundingStatus { get; set; }
    public DateTime? FundingOpensAt { get; set; }
    public DateTime? FundingClosesAt { get; set; }
    public OpportunityClosureReason? ClosureReason { get; set; }
    public decimal FundingTarget { get; set; }
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public DateTime CreatedAt { get; set; }
}

public sealed class TransitionProjectStatusRequest
{
    public ProjectStatus TargetStatus { get; set; }
    [System.ComponentModel.DataAnnotations.StringLength(1000)]
    public string? Reason { get; set; }
}
