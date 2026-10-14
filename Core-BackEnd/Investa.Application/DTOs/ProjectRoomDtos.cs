using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;
namespace Investa.Application.DTOs;
public sealed class LegacyProjectRoomRedirectDto
{
    public int ProjectId{get;set;}
    public string ProjectRoomUrl{get;set;}=string.Empty;
}
public sealed class ProjectRoomDto
{
    public int ProjectId{get;set;} public string DisplayName{get;set;}=string.Empty; public string Summary{get;set;}=string.Empty;
    public bool IsFounder{get;set;} public bool HasProjectAccess{get;set;}
    public IReadOnlyList<ProjectRoomEntryDto> Updates{get;set;}=[];public IReadOnlyList<ProjectRoomEntryDto> Milestones{get;set;}=[];
    public IReadOnlyList<ProjectRoomEntryDto> Timeline{get;set;}=[];public IReadOnlyList<ProjectRoomDocumentDto> Documents{get;set;}=[];
    public IReadOnlyList<ProjectRoomDocumentCategoryDto> AvailableDocumentCategories{get;set;}=[];
    public IReadOnlyList<ProjectRoomOpportunityDto> Opportunities{get;set;}=[];
}
public sealed class ProjectRoomDocumentCategoryDto
{
    public string Code{get;set;}=string.Empty;public string NameEn{get;set;}=string.Empty;public string NameAr{get;set;}=string.Empty;
    public string AllowedExtensions{get;set;}=string.Empty;public long MaxFileSizeBytes{get;set;}
}
public sealed class ProjectRoomOpportunityDto
{
    public int OpportunityId{get;set;} public int SequenceNumber{get;set;} public string Title{get;set;}=string.Empty;
    public OpportunityFundingStatus FundingStatus{get;set;} public ObligationCompletionStatus ObligationCompletionStatus{get;set;}
    public bool HasOriginatingOpportunityAccess{get;set;} public int VisibleParticipationCount{get;set;} public int VisibleContractCount{get;set;}
    public IReadOnlyList<OpportunityDocumentDto> Documents{get;set;}=[];public IReadOnlyList<OpportunityMediaDto> Media{get;set;}=[];
    public string OpportunityRoomUrl{get;set;}=string.Empty;public string CashFlowUrl{get;set;}=string.Empty;public string ObligationCompletionUrl{get;set;}=string.Empty;
}
public sealed class ProjectRoomEntryDto
{
    public long Id{get;set;}public ProjectRoomEntryType EntryType{get;set;}public string Title{get;set;}=string.Empty;
    public string? Description{get;set;}public DateTime? DueAt{get;set;}public DateTime? CompletedAt{get;set;}public Guid CreatedByUserId{get;set;}public DateTime CreatedAt{get;set;}
    public string? EventType{get;set;}public int? OpportunityId{get;set;}
}
public sealed class ProjectRoomDocumentDto
{
    public long Id{get;set;}public string FileName{get;set;}=string.Empty;
    public string DocumentType{get;set;}=string.Empty;public string Category{get;set;}=string.Empty;public string MimeType{get;set;}=string.Empty;
    public long FileSize{get;set;}public string DownloadUrl{get;set;}=string.Empty;public string? PreviewUrl{get;set;}
    public bool CanDownload{get;set;}
    public ProjectRoomDocumentVisibility Visibility{get;set;}public DateTime CreatedAt{get;set;}
}
public sealed class CreateProjectRoomEntryRequest
{
    [Required]public ProjectRoomEntryType? EntryType{get;set;}[Required,StringLength(200)]public string Title{get;set;}=string.Empty;
    [StringLength(4000)]public string? Description{get;set;}public DateTime? DueAt{get;set;}public bool IsInvestorVisible{get;set;}=true;
}
public sealed class CreateProjectRoomDocumentRequest
{
    [Required,StringLength(500)]public string FileKey{get;set;}=string.Empty;
    [Required,StringLength(80)]public string CategoryCode{get;set;}=string.Empty;
    [Required,StringLength(100)]public string DocumentType{get;set;}=string.Empty;public ProjectRoomDocumentVisibility Visibility{get;set;}=ProjectRoomDocumentVisibility.ProjectMembers;
}
public sealed record ProjectRoomDocumentContent(byte[] Content,string FileName,string MimeType);
