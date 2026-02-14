using System;
using System.Collections.Generic;
using System.Linq;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

/// <summary>
/// Investment Opportunity DTO with equity crowdfunding support
/// </summary>
public class InvestmentDto
{
    public int Id { get; set; }
    public Guid FounderId { get; set; }
    public string? FounderDisplay { get; set; }
    public string? BusinessRole { get; set; }
    
    // Financial Structure
    public decimal? SharePrice { get; set; }
    public int? TotalShares { get; set; }
    public int? AvailableShares { get; set; }
    public int? SoldShares => TotalShares.HasValue && AvailableShares.HasValue 
        ? TotalShares.Value - AvailableShares.Value 
        : null;
    
    public decimal? MinInvestment { get; set; }
    public decimal? MaxInvestment { get; set; }
    public decimal? ValuationCap { get; set; }
    public decimal? ExpectedROI { get; set; }
    public InvestmentType InvestmentTypeId { get; set; }
    public string Status { get; set; } = "Draft";
    
    // Amounts
    public decimal InitialCapital { get; set; }
    public decimal CurrentFunding => Participants?.Sum(p => p.AmountInvested) ?? 0;
    public decimal? TargetFund { get; set; }
    public decimal FundingPercentage => TargetFund.HasValue && TargetFund.Value > 0 
        ? (CurrentFunding / TargetFund.Value) * 100 
        : 0;
    
    // Dates
    public DateTime Date { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Opportunity details
    public string? BusinessName { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public int? BusinessStageId { get; set; }
    public int? BusinessCategoryId { get; set; }
    public string? BusinessCategoryName { get; set; }
    public int? ProjectPhaseId { get; set; }
    public string? Milestone { get; set; }
    public string? RiskLevel { get; set; }
    public string? Currency { get; set; }
    
    // Founding-specific fields
    public int? DurationMonths { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public string? PayoutFrequency { get; set; }
    
    // Social Proof
    public int CredibilityScore { get; set; }
    
    /// <summary>
    /// Team members/founders associated with this investment opportunity
    /// </summary>
    public List<TeamMemberDto>? TeamMembers { get; set; }
    public int InvestorCount => Participants?.Count ?? 0;

    /// <summary>
    /// The total amount invested by the current (requesting) user in this investment.
    /// Set by the API controller during DTO enrichment when user context is available.
    /// </summary>
    public decimal? InvestedAmount { get; set; }

    public List<InvestorParticipationDto>? Participants { get; set; }

    /// <summary>
    /// Image gallery associated with the investment opportunity
    /// </summary>
    public List<InvestmentImageDto>? Images { get; set; }
}
