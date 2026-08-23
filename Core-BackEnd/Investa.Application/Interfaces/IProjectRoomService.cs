using Investa.Application.DTOs;
namespace Investa.Application.Interfaces;
public interface IProjectRoomService
{
    Task<ProjectRoomDto> GetAsync(Guid actorId,int projectId,bool isAdmin,CancellationToken token=default);
    Task<ProjectRoomEntryDto> AddEntryAsync(Guid founderId,int projectId,CreateProjectRoomEntryRequest request,CancellationToken token=default);
    Task<ProjectRoomEntryDto> CompleteMilestoneAsync(Guid founderId,int projectId,long entryId,CancellationToken token=default);
    Task<ProjectRoomDocumentDto> AddDocumentAsync(Guid founderId,int projectId,CreateProjectRoomDocumentRequest request,CancellationToken token=default);
}
