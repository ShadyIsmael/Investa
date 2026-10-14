using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
namespace Investa.Application.Services;
public sealed class ProjectRoomService(IUnitOfWork uow,IFileStorage fileStorage):IProjectRoomService
{
    private static readonly string[] ProjectRoomDocumentCategoryCodes=["GENERAL","LEGAL","FINANCIALREPORT","CONTRACT","PRESENTATION","SPREADSHEET"];
    public async Task<ProjectRoomDto> GetAsync(Guid actorId,int projectId,bool isAdmin,CancellationToken token=default)
    {
        var project=await uow.Repository<Project>().GetByIdAsync(projectId)??throw new BusinessValidationException("PROJECT_NOT_FOUND","Project was not found.");
        var opportunities=(await uow.Repository<Opportunity>().FindAsync(o=>o.ProjectId==projectId)).OrderBy(o=>o.SequenceNumber).ToArray();
        var approved=(await uow.Repository<OpportunityJoinRequest>().FindAsync(p=>p.InvestorId==actorId&&p.Status==OpportunityJoinRequestStatus.Approved
            &&p.RequestType==OpportunityJoinRequestType.InvestmentParticipation)).Where(p=>opportunities.Any(o=>o.Id==p.OpportunityId)).ToArray();
        var isFounder=project.FounderId==actorId;
        if(!isAdmin&&!isFounder&&approved.Length==0)throw new BusinessValidationException("PROJECT_ROOM_FORBIDDEN","Project Room access requires ownership or an approved Participation in this Project.");
        var entries=(await uow.Repository<ProjectRoomEntry>().FindAsync(e=>e.ProjectId==projectId))
            .Where(e=>isFounder||isAdmin||e.IsInvestorVisible).OrderByDescending(e=>e.CreatedAt).ToArray();
        var roomDocs=(await uow.Repository<ProjectRoomDocument>().FindAsync(d=>d.ProjectId==projectId))
            .Where(d=>isFounder||isAdmin||d.Visibility==ProjectRoomDocumentVisibility.ProjectMembers).OrderByDescending(d=>d.CreatedAt).ToArray();
        var roomFileKeys=roomDocs.Select(d=>d.FileKey).ToHashSet(StringComparer.Ordinal);
        var roomFiles=(await uow.Repository<StoredFile>().FindAsync(f=>f.ProjectId==projectId&&!f.IsDeleted&&ProjectRoomDocumentCategoryCodes.Contains(f.CategoryCode)
            &&f.EntityType=="ProjectRoom"&&f.EntityId==projectId.ToString()&&roomFileKeys.Contains(f.FileKey)))
            .ToDictionary(f=>f.FileKey,StringComparer.Ordinal);
        var documentCategories=(await uow.Repository<FileCategory>().FindAsync(c=>c.IsActive&&ProjectRoomDocumentCategoryCodes.Contains(c.Code)))
            .OrderBy(c=>c.SortOrder).Select(c=>new ProjectRoomDocumentCategoryDto{Code=c.Code,NameEn=c.NameEn,NameAr=c.NameAr,
                AllowedExtensions=c.AllowedExtensions,MaxFileSizeBytes=c.MaxFileSizeBytes}).ToArray();
        var opportunityIds=opportunities.Select(o=>o.Id).ToHashSet();
        var docs=(await uow.Repository<OpportunityDocument>().FindAsync(d=>opportunityIds.Contains(d.OpportunityId))).ToArray();
        var media=(await uow.Repository<OpportunityMedia>().FindAsync(m=>opportunityIds.Contains(m.OpportunityId))).ToArray();
        var timelineEvents=(await uow.Repository<OpportunityEvent>().FindAsync(e=>opportunityIds.Contains(e.OpportunityId)))
            .Where(ProjectActivityTimeline.IsInvestorVisible).OrderByDescending(e=>e.CreatedAt).ThenByDescending(e=>e.Id).Take(100)
            .Select(e=>new ProjectRoomEntryDto{Id=-e.Id,EntryType=ProjectRoomEntryType.Activity,Title=e.EventType,EventType=e.EventType,
                OpportunityId=e.OpportunityId,CreatedByUserId=Guid.Empty,CreatedAt=e.CreatedAt}).ToArray();
        var allParticipations=(await uow.Repository<OpportunityJoinRequest>().FindAsync(p=>opportunityIds.Contains(p.OpportunityId)&&p.Status==OpportunityJoinRequestStatus.Approved
            &&p.RequestType==OpportunityJoinRequestType.InvestmentParticipation)).ToArray();
        var contracts=(await uow.Repository<InvestmentContract>().FindAsync(c=>opportunityIds.Contains(c.OpportunityId))).ToArray();
        var participationIds=allParticipations.Select(p=>p.Id).ToHashSet();
        var loanObligationsByParticipation=(await uow.Repository<LoanObligation>().FindAsync(x=>participationIds.Contains(x.ParticipationRequestId)))
            .GroupBy(x=>x.ParticipationRequestId)
            .ToDictionary(x=>x.Key,x=>(IReadOnlyList<LoanObligation>)x.ToList());
        return new ProjectRoomDto{
            ProjectId=project.Id,DisplayName=project.DisplayName,Summary=project.Summary,IsFounder=isFounder,HasProjectAccess=true,
            Updates=entries.Where(e=>e.EntryType==ProjectRoomEntryType.Update).Select(ToDto).ToArray(),
            Milestones=entries.Where(e=>e.EntryType==ProjectRoomEntryType.Milestone).Select(ToDto).ToArray(),
            Timeline=entries.Select(ToDto).Concat(timelineEvents).OrderByDescending(e=>e.CreatedAt).Take(100).ToArray(),Documents=roomDocs.Select(d=>ToDto(d,roomFiles.GetValueOrDefault(d.FileKey))).ToArray(),
            AvailableDocumentCategories=documentCategories,
            Opportunities=opportunities.Select(o=>{
                var originAccess=isFounder||isAdmin||approved.Any(p=>p.OpportunityId==o.Id);
                var visibleParticipations=originAccess?(isFounder||isAdmin?allParticipations.Where(p=>p.OpportunityId==o.Id):allParticipations.Where(p=>p.OpportunityId==o.Id&&p.InvestorId==actorId)):[];
                var visibleContracts=originAccess?(isFounder||isAdmin?contracts.Where(c=>c.OpportunityId==o.Id):contracts.Where(c=>c.OpportunityId==o.Id&&c.InvestorUserId==actorId)):[];
                var effectiveFundingStatus=OpportunityService.EffectiveFundingStatus(o);
                var oppParticipationIds=allParticipations.Where(p=>p.OpportunityId==o.Id).Select(p=>p.Id);
                var loanObs=oppParticipationIds.SelectMany(pid=>loanObligationsByParticipation.GetValueOrDefault(pid)??Array.Empty<LoanObligation>()).ToList();
                var derivedObligationCompletion=OpportunityService.DeriveObligationCompletionStatus(loanObs);
                return new ProjectRoomOpportunityDto{
                    OpportunityId=o.Id,SequenceNumber=o.SequenceNumber,Title=o.Title,FundingStatus=effectiveFundingStatus,ObligationCompletionStatus=derivedObligationCompletion,
                    HasOriginatingOpportunityAccess=originAccess,VisibleParticipationCount=visibleParticipations.Count(),VisibleContractCount=visibleContracts.Count(),
                    Documents=docs.Where(d=>d.OpportunityId==o.Id&&(originAccess||d.Visibility==OpportunityDocumentVisibility.Public)).Select(ToDto).ToArray(),
                    Media=media.Where(m=>m.OpportunityId==o.Id&&(originAccess||m.IsPublic)).Select(ToDto).ToArray(),
                    OpportunityRoomUrl=originAccess?$"/admin/opportunities/{o.Id}/room":string.Empty,
                    CashFlowUrl=originAccess?$"/admin/opportunities/{o.Id}/room?tab=payments":string.Empty,
                    ObligationCompletionUrl=originAccess?$"/admin/opportunities/{o.Id}/obligations":string.Empty
                };
            }).ToArray()
        };
    }

    public async Task<ProjectRoomEntryDto> AddEntryAsync(Guid founderId,int projectId,CreateProjectRoomEntryRequest request,CancellationToken token=default)
    {
        var project=await Owned(founderId,projectId);if(!request.EntryType.HasValue||!Enum.IsDefined(request.EntryType.Value)||string.IsNullOrWhiteSpace(request.Title))
            throw new BusinessValidationException("PROJECT_ROOM_ENTRY_INVALID","Entry type and title are required.");
        var entry=new ProjectRoomEntry{ProjectId=projectId,EntryType=request.EntryType.Value,Title=request.Title.Trim(),Description=Clean(request.Description),
            DueAt=request.DueAt,CreatedByUserId=founderId,IsInvestorVisible=request.IsInvestorVisible};
        await uow.Repository<ProjectRoomEntry>().AddAsync(entry);await Audit(founderId,projectId,"AddEntry",new{
            entry.EntryType,entry.Title,entry.Description,entry.DueAt,entry.IsInvestorVisible
        });await uow.SaveChangesAsync();return ToDto(entry);
    }
    public async Task<ProjectRoomEntryDto> CompleteMilestoneAsync(Guid founderId,int projectId,long entryId,CancellationToken token=default)
    {
        await Owned(founderId,projectId);var entry=(await uow.Repository<ProjectRoomEntry>().FindAsync(e=>e.Id==entryId)).SingleOrDefault();
        if(entry==null||entry.ProjectId!=projectId||entry.EntryType!=ProjectRoomEntryType.Milestone)throw new BusinessValidationException("MILESTONE_NOT_FOUND","Project milestone was not found.");
        if(entry.CompletedAt.HasValue)return ToDto(entry);entry.CompletedAt=DateTime.UtcNow;await uow.Repository<ProjectRoomEntry>().UpdateAsync(entry);
        await Audit(founderId,projectId,"CompleteMilestone",new{entry.Id,entry.CompletedAt});await uow.SaveChangesAsync();return ToDto(entry);
    }
    public async Task<ProjectRoomDocumentDto> AddDocumentAsync(Guid founderId,int projectId,CreateProjectRoomDocumentRequest request,CancellationToken token=default)
    {
        await Owned(founderId,projectId);if(string.IsNullOrWhiteSpace(request.FileKey)||string.IsNullOrWhiteSpace(request.DocumentType)||!Enum.IsDefined(request.Visibility))
            throw new BusinessValidationException("PROJECT_DOCUMENT_INVALID","Uploaded file, purpose, and valid visibility are required.");
        var key=request.FileKey.Trim();
        var categoryCode=request.CategoryCode.Trim().ToUpperInvariant();
        if(!ProjectRoomDocumentCategoryCodes.Contains(categoryCode,StringComparer.Ordinal))
            throw new BusinessValidationException("PROJECT_DOCUMENT_CATEGORY_INVALID","The selected category is not supported for Project Room documents.");
        var category=await uow.Repository<FileCategory>().GetSingleAsync(c=>c.Code==categoryCode&&c.IsActive);
        if(category is null)throw new BusinessValidationException("FILE_CATEGORY_INACTIVE","The selected file category is not available.");
        var storedFile=await uow.Repository<StoredFile>().GetSingleAsync(f=>f.FileKey==key&&f.ProjectId==projectId&&f.UploadedByUserId==founderId
            &&!f.IsDeleted&&f.CategoryCode==categoryCode&&f.EntityType=="ProjectRoom"&&f.EntityId==projectId.ToString());
        if(storedFile is null)throw new BusinessValidationException("PROJECT_DOCUMENT_UPLOAD_REQUIRED","Select a file uploaded to this Project Room before linking it.");
        var d=new ProjectRoomDocument{ProjectId=projectId,FileKey=storedFile.FileKey,FileName=storedFile.OriginalFileName,DocumentType=request.DocumentType.Trim(),
            Visibility=request.Visibility,CreatedByUserId=founderId};await uow.Repository<ProjectRoomDocument>().AddAsync(d);
        await Audit(founderId,projectId,"AddDocument",new{d.FileName,d.DocumentType,d.Visibility,storedFile.CategoryCode,storedFile.FileSizeBytes,storedFile.MimeType});await uow.SaveChangesAsync();return ToDto(d,storedFile);
    }
    public async Task<ProjectRoomDocumentContent> DownloadDocumentAsync(Guid actorId,int projectId,long documentId,bool isAdmin,CancellationToken token=default)
    {
        var project=await uow.Repository<Project>().GetByIdAsync(projectId)??throw new BusinessValidationException("PROJECT_NOT_FOUND","Project was not found.");
        var isFounder=project.FounderId==actorId;
        var opportunityIds=(await uow.Repository<Opportunity>().FindAsync(o=>o.ProjectId==projectId)).Select(o=>o.Id).ToHashSet();
        var approved=await uow.Repository<OpportunityJoinRequest>().FindAsync(p=>opportunityIds.Contains(p.OpportunityId)&&p.InvestorId==actorId
            &&p.Status==OpportunityJoinRequestStatus.Approved&&p.RequestType==OpportunityJoinRequestType.InvestmentParticipation);
        if(!isAdmin&&!isFounder&&!approved.Any())throw new BusinessValidationException("PROJECT_ROOM_FORBIDDEN","Project Room access requires ownership or an approved Participation in this Project.");
        var document=await uow.Repository<ProjectRoomDocument>().GetSingleAsync(d=>d.Id==documentId&&d.ProjectId==projectId)
            ??throw new BusinessValidationException("PROJECT_DOCUMENT_NOT_FOUND","Project document was not found.");
        if(!isAdmin&&!isFounder&&document.Visibility!=ProjectRoomDocumentVisibility.ProjectMembers)
            throw new BusinessValidationException("PROJECT_ROOM_FORBIDDEN","This document is not visible to Project Members.");
        var storedFile=await uow.Repository<StoredFile>().GetSingleAsync(f=>f.FileKey==document.FileKey&&f.ProjectId==projectId&&!f.IsDeleted
            &&ProjectRoomDocumentCategoryCodes.Contains(f.CategoryCode)&&f.EntityType=="ProjectRoom"&&f.EntityId==projectId.ToString()&&f.UploadedByUserId==document.CreatedByUserId)
            ??throw new BusinessValidationException("PROJECT_DOCUMENT_FILE_NOT_FOUND","The stored Project document is unavailable.");
        return new ProjectRoomDocumentContent(await fileStorage.ReadFileAsync(storedFile.FileKey,token),storedFile.OriginalFileName,storedFile.MimeType);
    }
    private async Task<Project> Owned(Guid founderId,int projectId)=>await uow.Repository<Project>().GetSingleAsync(p=>p.Id==projectId&&p.FounderId==founderId)
        ??throw new BusinessValidationException("PROJECT_ROOM_FORBIDDEN","Only the Project founder can modify the Project Room.");
    private async Task Audit(Guid actor,int projectId,string action,object changes)=>await uow.Repository<AuditLog>().AddAsync(new AuditLog{
        UserId=actor,EntityType="ProjectRoom",EntityId=projectId.ToString(),Action=action,Changes=JsonSerializer.Serialize(changes),Timestamp=DateTime.UtcNow});
    private static string? Clean(string? value)=>string.IsNullOrWhiteSpace(value)?null:value.Trim();
    private static ProjectRoomEntryDto ToDto(ProjectRoomEntry e)=>new(){Id=e.Id,EntryType=e.EntryType,Title=e.Title,Description=e.Description,DueAt=e.DueAt,CompletedAt=e.CompletedAt,CreatedByUserId=e.CreatedByUserId,CreatedAt=e.CreatedAt};
    private static ProjectRoomDocumentDto ToDto(ProjectRoomDocument d,StoredFile? f=null)=>new(){Id=d.Id,FileName=d.FileName,DocumentType=d.DocumentType,
        Category=f?.CategoryCode??string.Empty,MimeType=f?.MimeType??string.Empty,FileSize=f?.FileSizeBytes??0,Visibility=d.Visibility,
        DownloadUrl=$"/api/v1/projects/{d.ProjectId}/room/documents/{d.Id}/download",PreviewUrl=$"/api/v1/projects/{d.ProjectId}/room/documents/{d.Id}/preview",
        CanDownload=f is not null,CreatedAt=d.CreatedAt};
    private static OpportunityDocumentDto ToDto(OpportunityDocument d)=>new(){Id=d.Id,OpportunityId=d.OpportunityId,FileUrl=d.FileUrl,FileId=d.FileId,FileKey=d.FileKey,FileName=d.FileName,
        FileExtension=d.FileExtension,MimeType=d.MimeType,FileSize=d.FileSize,PreviewUrl=d.PreviewUrl,ThumbnailUrl=d.ThumbnailUrl,DocumentType=d.DocumentType,Visibility=d.Visibility,
        Purpose=d.Purpose,Category=d.Category,SearchTags=d.SearchTags,CreatedByUserId=d.CreatedByUserId,CreatedAt=d.CreatedAt};
    private static OpportunityMediaDto ToDto(OpportunityMedia m)=>new(){Id=m.Id,OpportunityId=m.OpportunityId,FileUrl=m.FileUrl,FileId=m.FileId,FileKey=m.FileKey,FileName=m.FileName,
        FileType=m.FileType,MimeType=m.MimeType,FileSize=m.FileSize,PreviewUrl=m.PreviewUrl,ThumbnailUrl=m.ThumbnailUrl,MediaType=m.MediaType,Purpose=m.Purpose,IsCover=m.IsCover,
        IsPublic=m.IsPublic,SortOrder=m.SortOrder,CreatedByUserId=m.CreatedByUserId,CreatedAt=m.CreatedAt};
}
