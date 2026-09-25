using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
namespace Investa.Application.Services;
public sealed class ProjectRoomService(IUnitOfWork uow):IProjectRoomService
{
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
        var opportunityIds=opportunities.Select(o=>o.Id).ToHashSet();
        var docs=(await uow.Repository<OpportunityDocument>().FindAsync(d=>opportunityIds.Contains(d.OpportunityId))).ToArray();
        var media=(await uow.Repository<OpportunityMedia>().FindAsync(m=>opportunityIds.Contains(m.OpportunityId))).ToArray();
        var allParticipations=(await uow.Repository<OpportunityJoinRequest>().FindAsync(p=>opportunityIds.Contains(p.OpportunityId)&&p.Status==OpportunityJoinRequestStatus.Approved
            &&p.RequestType==OpportunityJoinRequestType.InvestmentParticipation)).ToArray();
        var contracts=(await uow.Repository<InvestmentContract>().FindAsync(c=>opportunityIds.Contains(c.OpportunityId))).ToArray();
        return new ProjectRoomDto{
            ProjectId=project.Id,DisplayName=project.DisplayName,Summary=project.Summary,IsFounder=isFounder,HasProjectAccess=true,
            Updates=entries.Where(e=>e.EntryType==ProjectRoomEntryType.Update).Select(ToDto).ToArray(),
            Milestones=entries.Where(e=>e.EntryType==ProjectRoomEntryType.Milestone).Select(ToDto).ToArray(),
            Timeline=entries.Select(ToDto).ToArray(),Documents=roomDocs.Select(ToDto).ToArray(),
            Opportunities=opportunities.Select(o=>{
                var originAccess=isFounder||isAdmin||approved.Any(p=>p.OpportunityId==o.Id);
                var visibleParticipations=originAccess?(isFounder||isAdmin?allParticipations.Where(p=>p.OpportunityId==o.Id):allParticipations.Where(p=>p.OpportunityId==o.Id&&p.InvestorId==actorId)):[];
                var visibleContracts=originAccess?(isFounder||isAdmin?contracts.Where(c=>c.OpportunityId==o.Id):contracts.Where(c=>c.OpportunityId==o.Id&&c.InvestorUserId==actorId)):[];
                return new ProjectRoomOpportunityDto{
                    OpportunityId=o.Id,SequenceNumber=o.SequenceNumber,Title=o.Title,FundingStatus=o.FundingStatus,ObligationCompletionStatus=o.ObligationCompletionStatus,
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
        await Owned(founderId,projectId);if(string.IsNullOrWhiteSpace(request.FileKey)||string.IsNullOrWhiteSpace(request.FileName)||string.IsNullOrWhiteSpace(request.DocumentType))
            throw new BusinessValidationException("PROJECT_DOCUMENT_INVALID","File key, name, and document type are required.");
        var d=new ProjectRoomDocument{ProjectId=projectId,FileKey=request.FileKey.Trim(),FileName=request.FileName.Trim(),DocumentType=request.DocumentType.Trim(),
            Visibility=request.Visibility,CreatedByUserId=founderId};await uow.Repository<ProjectRoomDocument>().AddAsync(d);
        await Audit(founderId,projectId,"AddDocument",new{d.FileName,d.DocumentType,d.Visibility});await uow.SaveChangesAsync();return ToDto(d);
    }
    private async Task<Project> Owned(Guid founderId,int projectId)=>await uow.Repository<Project>().GetSingleAsync(p=>p.Id==projectId&&p.FounderId==founderId)
        ??throw new BusinessValidationException("PROJECT_ROOM_FORBIDDEN","Only the Project founder can modify the Project Room.");
    private async Task Audit(Guid actor,int projectId,string action,object changes)=>await uow.Repository<AuditLog>().AddAsync(new AuditLog{
        UserId=actor,EntityType="ProjectRoom",EntityId=projectId.ToString(),Action=action,Changes=JsonSerializer.Serialize(changes),Timestamp=DateTime.UtcNow});
    private static string? Clean(string? value)=>string.IsNullOrWhiteSpace(value)?null:value.Trim();
    private static ProjectRoomEntryDto ToDto(ProjectRoomEntry e)=>new(){Id=e.Id,EntryType=e.EntryType,Title=e.Title,Description=e.Description,DueAt=e.DueAt,CompletedAt=e.CompletedAt,CreatedByUserId=e.CreatedByUserId,CreatedAt=e.CreatedAt};
    private static ProjectRoomDocumentDto ToDto(ProjectRoomDocument d)=>new(){Id=d.Id,FileKey=d.FileKey,FileName=d.FileName,DocumentType=d.DocumentType,Visibility=d.Visibility,CreatedAt=d.CreatedAt};
    private static OpportunityDocumentDto ToDto(OpportunityDocument d)=>new(){Id=d.Id,OpportunityId=d.OpportunityId,FileUrl=d.FileUrl,FileId=d.FileId,FileKey=d.FileKey,FileName=d.FileName,
        FileExtension=d.FileExtension,MimeType=d.MimeType,FileSize=d.FileSize,PreviewUrl=d.PreviewUrl,ThumbnailUrl=d.ThumbnailUrl,DocumentType=d.DocumentType,Visibility=d.Visibility,
        Purpose=d.Purpose,Category=d.Category,SearchTags=d.SearchTags,CreatedByUserId=d.CreatedByUserId,CreatedAt=d.CreatedAt};
    private static OpportunityMediaDto ToDto(OpportunityMedia m)=>new(){Id=m.Id,OpportunityId=m.OpportunityId,FileUrl=m.FileUrl,FileId=m.FileId,FileKey=m.FileKey,FileName=m.FileName,
        FileType=m.FileType,MimeType=m.MimeType,FileSize=m.FileSize,PreviewUrl=m.PreviewUrl,ThumbnailUrl=m.ThumbnailUrl,MediaType=m.MediaType,Purpose=m.Purpose,IsCover=m.IsCover,
        IsPublic=m.IsPublic,SortOrder=m.SortOrder,CreatedByUserId=m.CreatedByUserId,CreatedAt=m.CreatedAt};
}
