using Investa.Domain;
using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class CreateOpportunityRequest
{
    /// <summary>
    /// Existing founder-owned Project to fund. Optional only for legacy clients;
    /// when omitted the Phase 1 compatibility path creates a dedicated Project.
    /// </summary>
    public int? ProjectId { get; set; }

    [StringLength(200)]
    public string? Purpose { get; set; }

    [StringLength(80)]
    public string? Type { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(300, MinimumLength = 20)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    [StringLength(2000, MinimumLength = 30)]
    public string UseOfFunds { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "FundingTarget must be greater than zero.")]
    public decimal FundingTarget { get; set; }

    public int? FundingGoalId { get; set; }

    [StringLength(3, MinimumLength = 3)] public string? FundingCurrency { get; set; }
    public string? Currency { get => FundingCurrency; set => FundingCurrency = value; }

    public IReadOnlyList<int> TagIds { get; set; } = Array.Empty<int>();

    [Required]
    public ProjectStage? ProjectStage { get; set; }

    [StringLength(120)]
    public string? ProjectStageCustomName { get; set; }

    [StringLength(1000)]
    public string? CoverImageUrl { get; set; }
}

public class UpdateOpportunityRequest
{
    [StringLength(200)]
    public string? Purpose { get; set; }

    [StringLength(80)]
    public string? Type { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(300, MinimumLength = 20)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    [StringLength(2000, MinimumLength = 30)]
    public string UseOfFunds { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "FundingTarget must be greater than zero.")]
    public decimal FundingTarget { get; set; }

    public int? FundingGoalId { get; set; }

    [StringLength(3, MinimumLength = 3)] public string? FundingCurrency { get; set; }
    public string? Currency { get => FundingCurrency; set => FundingCurrency = value; }

    public IReadOnlyList<int> TagIds { get; set; } = Array.Empty<int>();

    [Required]
    public ProjectStage? ProjectStage { get; set; }

    [StringLength(120)]
    public string? ProjectStageCustomName { get; set; }

    public OpportunityStatus? Status { get; set; }

    [StringLength(1000)]
    public string? CoverImageUrl { get; set; }
}

public class CreateOpportunityMediaRequest
{
    [Required]
    [StringLength(500)]
    public string FileKey { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string MediaType { get; set; } = string.Empty;

    public OpportunityFilePurpose? Purpose { get; set; }

    public bool IsCover { get; set; }

    [Required]
    public bool? IsPublic { get; set; }

    public int SortOrder { get; set; }
}

public class CreateOpportunityDocumentRequest
{
    [Required]
    [StringLength(500)]
    public string FileKey { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string DocumentType { get; set; } = string.Empty;

    [Required]
    public OpportunityDocumentVisibility? Visibility { get; set; }

    public OpportunityFilePurpose? Purpose { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    [StringLength(1000)]
    public string? SearchTags { get; set; }
}

public class CreateOpportunityEventRequest
{
    [Required]
    [StringLength(100)]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [StringLength(4000)]
    public string? OldValue { get; set; }

    [StringLength(4000)]
    public string? NewValue { get; set; }

    public bool IsPublic { get; set; }
}

public class OpportunityDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? ProjectDisplayName { get; set; }
    public string? ProjectSummary { get; set; }
    public string? ProjectDescription { get; set; }
    public string? ProjectIndustry { get; set; }
    public string? ProjectLogoUrl { get; set; }
    public int SequenceNumber { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public InvestmentModel InvestmentModel { get; set; }
    public Guid FounderId { get; set; }
    public int? LegacyInvestmentId { get; set; }
    public bool Favorited { get; set; }
    public FounderSummaryDto Founder { get; set; } = new();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? UseOfFunds { get; set; }
    public decimal FundingTarget { get; set; }
    public OpportunityLookupDto? FundingGoal { get; set; }
    public string? FundingPurpose { get; set; }
    public decimal? MinimumInvestmentAmount { get; set; }
    public decimal? MaximumInvestmentAmount { get; set; }
    public int? ExpectedDurationMonths { get; set; }
    public string? Currency { get; set; }
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public string? DisplayCurrency { get; set; }
    public decimal? ApproximateDisplayFundingTarget { get; set; }
    public decimal? ApproximateDisplayFundedAmount { get; set; }
    public decimal? ApproximateDisplayRemainingAmount { get; set; }
    public DateTime? DisplayRateTimestamp { get; set; }
    public string? DisplayRateProvider { get; set; }
    public decimal? SharePrice { get; set; }
    public int? TotalShares { get; set; }
    public int? OfferedShares { get; set; }
    public decimal? EquityOfferedPercentage { get; set; }
    public decimal? ProfitSharePercentage { get; set; }
    public string? ProfitSharingPayoutFrequency { get; set; }
    public DateTime? ProfitSharingContractStartDate { get; set; }
    public DateTime? ProfitSharingContractEndDate { get; set; }
    public decimal? InterestRate { get; set; }
    public string? RepaymentFrequency { get; set; }
    public DateTime? FinalRepaymentDate { get; set; }
    public string? PublicInvestmentTermsSummary { get; set; }
    public string? ExpectedReturnSummary { get; set; }
    public decimal FundingProgressPercent { get; set; }
    public decimal FundedAmount { get; set; }
    public decimal RemainingFundingAmount { get; set; }
    public decimal FundingProgressPercentage { get; set; }
    public int ApprovedParticipantCount { get; set; }
    public int SoldShares { get; set; }
    public int? RemainingShares { get; set; }
    public decimal AllocatedEquityPercentage { get; set; }
    public decimal? RemainingEquityPercentage { get; set; }
    public IReadOnlyList<OpportunityLookupDto> Tags { get; set; } = Array.Empty<OpportunityLookupDto>();
    public ProjectStage ProjectStage { get; set; }
    public string? ProjectStageCustomName { get; set; }
    public OpportunityStatus Status { get; set; }
    public OpportunityModerationStatus ModerationStatus { get; set; }
    public OpportunityFundingStatus FundingStatus { get; set; }
    public DateTime? FundingOpensAt { get; set; }
    public DateTime? FundingClosesAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public OpportunityClosureReason? ClosureReason { get; set; }
    public ObligationCompletionStatus ObligationCompletionStatus { get; set; }
    public bool AcceptingParticipations => FundingStatus == OpportunityFundingStatus.Open;
    public string? CoverImageUrl { get; set; }
    public bool IsLockedForEditing { get; set; }
    public DateTime? FirstInvestorJoinedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Authoritative, read-only Project context embedded in an Opportunity detail
/// projection. These fields are resolved from the Project aggregate; they are
/// not persisted on Opportunity.
/// </summary>
public sealed class OpportunityProjectContextDto
{
    public int Id { get; set; }
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
    public string DefaultCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class OpportunityDetailDto : OpportunityDto
{
    public OpportunityProjectContextDto? ProjectContext { get; set; }
    public IReadOnlyList<OpportunityMediaDto> Media { get; set; } = Array.Empty<OpportunityMediaDto>();
    public IReadOnlyList<OpportunityDocumentDto> Documents { get; set; } = Array.Empty<OpportunityDocumentDto>();
    public IReadOnlyList<OpportunityEventDto> Events { get; set; } = Array.Empty<OpportunityEventDto>();
    public IReadOnlyList<ProjectActivityTimelineDto> RecentProjectActivity { get; set; } = Array.Empty<ProjectActivityTimelineDto>();
    public int ProjectActivityTotalCount { get; set; }
}

public sealed class TransitionOpportunityFundingRequest
{
    [Required]
    public OpportunityFundingStatus? TargetStatus { get; set; }
    public DateTime? FundingOpensAt { get; set; }
    public DateTime? FundingClosesAt { get; set; }
    public OpportunityClosureReason? ClosureReason { get; set; }
    [StringLength(1000)]
    public string? Reason { get; set; }
}

public class PublicProjectActivityPageDto
{
    public IReadOnlyList<ProjectActivityTimelineDto> Items { get; set; } = Array.Empty<ProjectActivityTimelineDto>();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public sealed class SetOpportunityFavoriteRequest
{
    public bool Favorited { get; set; }
}

public class OpportunityRoomDto
{
    public int ProjectId { get; set; }
    public string ProjectDisplayName { get; set; } = string.Empty;
    public OpportunityRoomOverviewDto Overview { get; set; } = new();
    public IReadOnlyList<OpportunityRoomMediaGroupDto> MediaLibrary { get; set; } = Array.Empty<OpportunityRoomMediaGroupDto>();
    public IReadOnlyList<OpportunityRoomDocumentGroupDto> DocumentsLibrary { get; set; } = Array.Empty<OpportunityRoomDocumentGroupDto>();
    public IReadOnlyList<ProjectActivityTimelineDto> Timeline { get; set; } = Array.Empty<ProjectActivityTimelineDto>();
    public IReadOnlyList<OpportunityMilestoneDto> Milestones { get; set; } = Array.Empty<OpportunityMilestoneDto>();
    public OpportunityMilestoneDto? LatestMilestone { get; set; }
    public IReadOnlyList<OpportunityRoomParticipationDto> Participations { get; set; } = Array.Empty<OpportunityRoomParticipationDto>();
    public OpportunityRoomParticipantContextDto ParticipantContext { get; set; } = new();
}

public sealed class OpportunityRoomParticipationDto
{
    public int ParticipationId { get; set; }
    public int SequenceNumber { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorDisplayName { get; set; } = string.Empty;
    public OpportunityJoinRequestStatus Status { get; set; }
    public decimal ApprovedAmount { get; set; }
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public DateTime? AcceptedAt { get; set; }
    public int? AcceptedOfferId { get; set; }
    public bool TermsImmutable { get; set; }
    public string TermsSnapshotHash { get; set; } = string.Empty;
    public IReadOnlyList<ParticipationLegDto> Legs { get; set; } = Array.Empty<ParticipationLegDto>();
    public OpportunityRoomContractDto? Contract { get; set; }
}

public sealed class OpportunityRoomContractDto
{
    public int ContractId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public int CurrentVersionNumber { get; set; }
    public InvestmentContractStatus Status { get; set; }
    public string DocumentHash { get; set; } = string.Empty;
    public DateTime? ActivatedAt { get; set; }
}

public class ProjectActivityTimelineDto
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string TitleKey { get; set; } = string.Empty;
    public string DescriptionKey { get; set; } = string.Empty;
    public string ActorType { get; set; } = "System";
    public DateTime OccurredAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public string? RelatedEntityId { get; set; }
    public IReadOnlyDictionary<string, string?> Metadata { get; set; } = new Dictionary<string, string?>();
}

public class OpportunityRoomOverviewDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public OpportunityStatus Status { get; set; }
    public ProjectStage ProjectStage { get; set; }
    public string? ProjectStageCustomName { get; set; }
    public FounderSummaryDto Founder { get; set; } = new();
    public decimal FundingTarget { get; set; }
    public decimal FundingProgress { get; set; }
    public decimal FundingProgressPercent { get; set; }
    public decimal FundedAmount { get; set; }
    public decimal RemainingFundingAmount { get; set; }
    public decimal FundingProgressPercentage { get; set; }
    public int ApprovedParticipantCount { get; set; }
    public string? UseOfFunds { get; set; }
}

public class OpportunityMilestoneDto
{
    public int MilestoneId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? TargetDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class OpportunityRoomMediaGroupDto
{
    public OpportunityFilePurpose Purpose { get; set; }
    public IReadOnlyList<OpportunityMediaDto> Items { get; set; } = Array.Empty<OpportunityMediaDto>();
}

public class OpportunityRoomDocumentGroupDto
{
    public OpportunityFilePurpose Purpose { get; set; }
    public IReadOnlyList<OpportunityDocumentDto> Items { get; set; } = Array.Empty<OpportunityDocumentDto>();
}

public class OpportunityRoomParticipantContextDto
{
    public bool IsFounder { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsApprovedParticipant { get; set; }
    public int ApprovedParticipantCount { get; set; }
    public bool CanAccessProjectRoom { get; set; }
    public bool CanEditCoreProject { get; set; }
    public bool CanAddUpdate { get; set; }
    public bool CanAddDocument { get; set; }
    public bool CanAddMilestone { get; set; }
    public bool CanUpload { get; set; }
    public bool CanPostUpdate { get; set; }
    public bool CanViewPrivateFiles { get; set; }
    public bool CanDownloadFiles { get; set; }
}

public class MyParticipationDto
{
    public int ProjectId { get; set; }
    public string ProjectDisplayName { get; set; } = string.Empty;
    public decimal ProjectTotalInvestment { get; set; }
    public decimal OpportunityTotalInvestment { get; set; }
    public IReadOnlyList<ParticipationItemDto> Participations { get; set; } = Array.Empty<ParticipationItemDto>();
    public int OpportunityId { get; set; }
    public string OpportunityTitle { get; set; } = string.Empty;
    public OpportunityStatus OpportunityStatus { get; set; }
    public InvestmentModel InvestmentModel { get; set; }
    public Guid FounderId { get; set; }
    public string FounderDisplayName { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? ShortDescription { get; set; }
    public int ParticipantId { get; set; }
    public int ParticipationRequestId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public decimal ApprovedContributionAmount { get; set; }
    public string? Currency { get; set; }
    public OpportunityJoinRequestStatus ParticipationStatus { get; set; }
    public bool ProjectRoomUnlocked { get; set; }
    public bool CanOpenProjectRoom { get; set; }
    public bool ContractAvailable { get; set; }
    public int? CurrentContractId { get; set; }
    public int? CurrentContractVersion { get; set; }
    public decimal FundedAmount { get; set; }
    public decimal FundingTarget { get; set; }
    public decimal RemainingFundingAmount { get; set; }
    public decimal FundingProgressPercentage { get; set; }
    public int ApprovedParticipantCount { get; set; }
    public int? ApprovedShares { get; set; }
    public decimal? SharePrice { get; set; }
    public decimal? OwnershipPercentage { get; set; }
    public int? TotalShares { get; set; }
    public int? OfferedShares { get; set; }
    public int SoldShares { get; set; }
    public int? RemainingShares { get; set; }
    public decimal AllocatedEquityPercentage { get; set; }
    public decimal? RemainingEquityPercentage { get; set; }
    public decimal? Principal { get; set; }
    public decimal? InterestRate { get; set; }
    public int? ExpectedDurationMonths { get; set; }
    public string? RepaymentFrequency { get; set; }
    public DateTime? FinalRepaymentDate { get; set; }
    public decimal? ExpectedReturn { get; set; }
    public decimal? ExpectedTotalRepayment { get; set; }
    public decimal? Contribution { get; set; }
    public decimal? ProfitSharePercentage { get; set; }
    public string? PayoutFrequency { get; set; }
    public DateTime? ContractStartDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public decimal? ExpectedProfit { get; set; }
    public decimal? ExpectedTotalPayout { get; set; }
}

public class ParticipationItemDto
{
    public int ParticipationId { get; set; }
    public int SequenceNumber { get; set; }
    public decimal ApprovedAmount { get; set; }
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public DateTime? ApprovedAt { get; set; }
    public int? ContractId { get; set; }
    public string? ContractNumber { get; set; }
    public int? ContractVersion { get; set; }
    public string? ContractDocumentHash { get; set; }
}

public class FounderSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
}

public class OpportunityLookupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class OpportunityDiscoveryQuery
{
    public InvestmentModel? InvestmentModel { get; set; }
    public int? CategoryId { get; set; }
    public int? FundingGoalId { get; set; }
    public ProjectStage? ProjectStage { get; set; }
    public decimal? MinFundingTarget { get; set; }
    public decimal? MaxFundingTarget { get; set; }
    public decimal? MinInvestmentAmount { get; set; }
    public decimal? MaxInvestmentAmount { get; set; }
    public IReadOnlyList<int> TagIds { get; set; } = Array.Empty<int>();
    public string? Search { get; set; }
}

public class AdminOpportunityListQuery
{
    public OpportunityStatus? Status { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "createdAt";
    public string? SortDirection { get; set; } = "desc";
}

public class AdminOpportunityListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public FounderSummaryDto Founder { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public OpportunityStatus Status { get; set; }
    public decimal FundingTarget { get; set; }
    public InvestmentModel InvestmentModel { get; set; }
    public ProjectStage ProjectStage { get; set; }
}

public class AdminOpportunityDetailDto : OpportunityDetailDto
{
    public IReadOnlyList<OpportunityEventDto> ReviewHistory { get; set; } = Array.Empty<OpportunityEventDto>();
}

public class RejectOpportunityRequest
{
    [Required]
    [StringLength(1000)]
    public string Reason { get; set; } = string.Empty;
}

public class CreateOpportunityJoinRequest
{
    [StringLength(100)]
    public string? IdempotencyKey { get; set; }

    public OpportunityJoinRequestType? RequestType { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "RequestedAmount must be greater than zero.")]
    public decimal? RequestedAmount { get; set; }

    [StringLength(3, MinimumLength = 3)]
    public string? EnteredCurrency { get; set; }

    [StringLength(1000)]
    public string? Message { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "NumberOfShares must be greater than zero.")]
    public int? NumberOfShares { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "SharePriceSnapshot must be greater than zero.")]
    public decimal? SharePriceSnapshot { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "TotalAmount must be greater than zero.")]
    public decimal? TotalAmount { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "ExpectedReturnRateSnapshot must be greater than zero.")]
    public decimal? ExpectedReturnRateSnapshot { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ExpectedDurationMonthsSnapshot must be greater than zero.")]
    public int? ExpectedDurationMonthsSnapshot { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "ExpectedReturnAmount must be greater than zero.")]
    public decimal? ExpectedReturnAmount { get; set; }

    [Range(0.01, 100, ErrorMessage = "ProposedSharePercentage must be between 0.01 and 100.")]
    public decimal? ProposedSharePercentage { get; set; }

    public string? MetadataJson { get; set; }
}

public class OpportunityParticipationFormDto
{
    public int OpportunityId { get; set; }
    public string OpportunityTitle { get; set; } = string.Empty;
    public InvestmentModel InvestmentModel { get; set; }
    public decimal FundingTarget { get; set; }
    public decimal AlreadyFundedAmount { get; set; }
    public decimal RemainingFundingAmount { get; set; }
    public decimal FundingProgressPercentage { get; set; }
    public int ApprovedParticipantCount { get; set; }
    public string Currency { get; set; } = "Credits";
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public string DisplayCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public decimal? ApproximateDisplayFundingTarget { get; set; }
    public decimal? ApproximateDisplayAlreadyFundedAmount { get; set; }
    public decimal? ApproximateDisplayRemainingFundingAmount { get; set; }
    public decimal? MinimumContribution { get; set; }
    public decimal? MaximumContribution { get; set; }
    public decimal? ReturnRate { get; set; }
    public string? ReturnRateType { get; set; }
    public int? TermValue { get; set; }
    public string? TermUnit { get; set; }
    public string? RepaymentModel { get; set; }
    public DateTime? ExpectedMaturityDate { get; set; }
    public decimal? ProfitSharePercentage { get; set; }
    public decimal? ExpectedProfitAmount { get; set; }
    public decimal? ExpectedTotalPayoutAmount { get; set; }
    public decimal? OpportunityTotalExpectedPayout { get; set; }
    public string? ExitTerms { get; set; }
    public DateTime? ContractStartDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public int? TotalShares { get; set; }
    public int? OfferedShares { get; set; }
    public int SoldShares { get; set; }
    public int? RemainingShares { get; set; }
    public decimal AllocatedEquityPercentage { get; set; }
    public decimal? RemainingEquityPercentage { get; set; }
    public int? AvailableShares { get; set; }
    public decimal? SharePrice { get; set; }
    public int? MinimumShares { get; set; }
    public int? MaximumShares { get; set; }
    public decimal? MinimumInvestmentAmount { get; set; }
    public decimal? MaximumInvestmentAmount { get; set; }
}

public class OpportunityJoinRequestQuery
{
    public OpportunityJoinRequestStatus? Status { get; set; }
    public int? OpportunityId { get; set; }
}

public class RejectOpportunityJoinRequest
{
    [Required]
    [StringLength(1000)]
    public string Reason { get; set; } = string.Empty;
}

public class OpportunityJoinRequestDto
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public string OpportunityTitle { get; set; } = string.Empty;
    public Guid InvestorId { get; set; }
    public int ParticipationSequence { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public Guid FounderId { get; set; }
    public string FounderName { get; set; } = string.Empty;
    public OpportunityJoinRequestType RequestType { get; set; }
    public decimal? RequestedAmount { get; set; }
    public decimal? CalculatedTotalAmount { get; set; }
    public decimal? EnteredAmount { get; set; }
    public string? EnteredCurrency { get; set; }
    public decimal? FundingAmount { get; set; }
    public string? FundingCurrency { get; set; }
    public Guid? ExchangeRateSnapshotId { get; set; }
    public string? Message { get; set; }
    public string? TermsSnapshotJson { get; set; }
    public OpportunityJoinRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? RejectionReason { get; set; }
}

public sealed class ApprovedInvestorDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime ApprovedAt { get; set; }
    public decimal TotalApprovedContribution { get; set; }
    public IReadOnlyList<ApprovedParticipationSummaryDto> Participations { get; set; } = [];
}

public sealed class ApprovedParticipationSummaryDto
{
    public int ParticipationRequestId { get; set; }
    public string InvestmentModel { get; set; } = string.Empty;
    public decimal ApprovedContribution { get; set; }
    public string? Currency { get; set; }
    public string FundingCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    public string? DisplayCurrency { get; set; }
    public decimal? ApproximateDisplayFundingTarget { get; set; }
    public decimal? ApproximateDisplayFundedAmount { get; set; }
    public decimal? ApproximateDisplayRemainingAmount { get; set; }
    public DateTime? DisplayRateTimestamp { get; set; }
    public string? DisplayRateProvider { get; set; }
    public DateTime ApprovedAt { get; set; }
}

public class FounderIncomingJoinRequestDto
{
    public int RequestId { get; set; }
    public int OpportunityId { get; set; }
    public string OpportunityTitle { get; set; } = string.Empty;
    public Guid InvestorId { get; set; }
    public string InvestorDisplayName { get; set; } = string.Empty;
    public InvestmentModel InvestmentModel { get; set; }
    public OpportunityJoinRequestType RequestType { get; set; }
    public decimal? RequestedAmount { get; set; }
    public OpportunityJoinRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal? CalculatedTotalAmount { get; set; }
    public string? TermsSnapshotJson { get; set; }
    public bool CanApprove { get; set; }
    public bool CanReject { get; set; }
    public Guid? SourceConversationId { get; set; }
}

public class OpportunityMediaDto
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? FileId { get; set; }
    public string? FileKey { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public long? FileSize { get; set; }
    public string? PreviewUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public OpportunityFilePurpose Purpose { get; set; }
    public bool IsCover { get; set; }
    public bool IsPublic { get; set; }
    public int SortOrder { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OpportunityDocumentDto
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? FileId { get; set; }
    public string? FileKey { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public long? FileSize { get; set; }
    public string? PreviewUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public OpportunityDocumentVisibility Visibility { get; set; }
    public OpportunityFilePurpose Purpose { get; set; }
    public string? Category { get; set; }
    public string? SearchTags { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OpportunityEventDto
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
}
