using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class CreateOpportunityRequest
{
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

    public int? CategoryId { get; set; }

    public int? FundingGoalId { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "MinimumInvestmentAmount must be greater than zero.")]
    public decimal? MinimumInvestmentAmount { get; set; }

    public decimal? MaximumInvestmentAmount { get; set; }

    public int? ExpectedDurationMonths { get; set; }

    public decimal? EquityOfferedPercentage { get; set; }

    public IReadOnlyList<int> TagIds { get; set; } = Array.Empty<int>();

    [Required]
    public InvestmentModel? InvestmentModel { get; set; }

    [Required]
    public ProjectStage? ProjectStage { get; set; }

    [StringLength(1000)]
    public string? CoverImageUrl { get; set; }
}

public class UpdateOpportunityRequest
{
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

    public int? CategoryId { get; set; }

    public int? FundingGoalId { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "MinimumInvestmentAmount must be greater than zero.")]
    public decimal? MinimumInvestmentAmount { get; set; }

    public decimal? MaximumInvestmentAmount { get; set; }

    public int? ExpectedDurationMonths { get; set; }

    public decimal? EquityOfferedPercentage { get; set; }

    public IReadOnlyList<int> TagIds { get; set; } = Array.Empty<int>();

    [Required]
    public InvestmentModel? InvestmentModel { get; set; }

    [Required]
    public ProjectStage? ProjectStage { get; set; }

    public OpportunityStatus? Status { get; set; }

    [StringLength(1000)]
    public string? CoverImageUrl { get; set; }
}

public class CreateOpportunityMediaRequest
{
    [Required]
    [StringLength(1000)]
    public string FileUrl { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FileId { get; set; }

    [StringLength(500)]
    public string? FileKey { get; set; }

    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string FileType { get; set; } = string.Empty;

    [StringLength(150)]
    public string? MimeType { get; set; }

    public long? FileSize { get; set; }

    [StringLength(1000)]
    public string? PreviewUrl { get; set; }

    [StringLength(1000)]
    public string? ThumbnailUrl { get; set; }

    [Required]
    [StringLength(50)]
    public string MediaType { get; set; } = string.Empty;

    public OpportunityFilePurpose? Purpose { get; set; }

    public bool IsCover { get; set; }

    public bool? IsPublic { get; set; }

    public int SortOrder { get; set; }
}

public class CreateOpportunityDocumentRequest
{
    [Required]
    [StringLength(1000)]
    public string FileUrl { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FileId { get; set; }

    [StringLength(500)]
    public string? FileKey { get; set; }

    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string FileExtension { get; set; } = string.Empty;

    [StringLength(150)]
    public string? MimeType { get; set; }

    public long? FileSize { get; set; }

    [StringLength(1000)]
    public string? PreviewUrl { get; set; }

    [StringLength(1000)]
    public string? ThumbnailUrl { get; set; }

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
    public Guid FounderId { get; set; }
    public int? LegacyInvestmentId { get; set; }
    public FounderSummaryDto Founder { get; set; } = new();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? UseOfFunds { get; set; }
    public decimal FundingTarget { get; set; }
    public OpportunityLookupDto? Category { get; set; }
    public OpportunityLookupDto? FundingGoal { get; set; }
    public string? FundingPurpose { get; set; }
    public decimal? MinimumInvestmentAmount { get; set; }
    public decimal? MaximumInvestmentAmount { get; set; }
    public int? ExpectedDurationMonths { get; set; }
    public decimal? EquityOfferedPercentage { get; set; }
    public string? PublicInvestmentTermsSummary { get; set; }
    public string? ExpectedReturnSummary { get; set; }
    public decimal FundingProgressPercent { get; set; }
    public IReadOnlyList<OpportunityLookupDto> Tags { get; set; } = Array.Empty<OpportunityLookupDto>();
    public InvestmentModel InvestmentModel { get; set; }
    public ProjectStage ProjectStage { get; set; }
    public OpportunityStatus Status { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsLockedForEditing { get; set; }
    public DateTime? FirstInvestorJoinedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class OpportunityDetailDto : OpportunityDto
{
    public IReadOnlyList<OpportunityMediaDto> Media { get; set; } = Array.Empty<OpportunityMediaDto>();
    public IReadOnlyList<OpportunityDocumentDto> Documents { get; set; } = Array.Empty<OpportunityDocumentDto>();
    public IReadOnlyList<OpportunityEventDto> Events { get; set; } = Array.Empty<OpportunityEventDto>();
}

public class OpportunityRoomDto
{
    public OpportunityRoomOverviewDto Overview { get; set; } = new();
    public IReadOnlyList<OpportunityRoomMediaGroupDto> MediaLibrary { get; set; } = Array.Empty<OpportunityRoomMediaGroupDto>();
    public IReadOnlyList<OpportunityRoomDocumentGroupDto> DocumentsLibrary { get; set; } = Array.Empty<OpportunityRoomDocumentGroupDto>();
    public IReadOnlyList<OpportunityEventDto> Timeline { get; set; } = Array.Empty<OpportunityEventDto>();
    public OpportunityRoomParticipantContextDto ParticipantContext { get; set; } = new();
}

public class OpportunityRoomOverviewDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public OpportunityStatus Status { get; set; }
    public ProjectStage ProjectStage { get; set; }
    public FounderSummaryDto Founder { get; set; } = new();
    public decimal FundingTarget { get; set; }
    public decimal FundingProgress { get; set; }
    public InvestmentModel InvestmentModel { get; set; }
    public decimal? MinimumInvestment { get; set; }
    public string? ExpectedReturnSummary { get; set; }
    public string? UseOfFunds { get; set; }
    public string? PublicInvestmentTermsSummary { get; set; }
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
    public bool IsApprovedParticipant { get; set; }
    public bool CanUpload { get; set; }
    public bool CanPostUpdate { get; set; }
    public bool CanViewPrivateFiles { get; set; }
    public bool CanDownloadFiles { get; set; }
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
    public OpportunityJoinRequestType? RequestType { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "RequestedAmount must be greater than zero.")]
    public decimal? RequestedAmount { get; set; }

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
    public string InvestorName { get; set; } = string.Empty;
    public OpportunityJoinRequestType RequestType { get; set; }
    public decimal? RequestedAmount { get; set; }
    public decimal? CalculatedTotalAmount { get; set; }
    public string? Message { get; set; }
    public string? TermsSnapshotJson { get; set; }
    public OpportunityJoinRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? RejectionReason { get; set; }
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
