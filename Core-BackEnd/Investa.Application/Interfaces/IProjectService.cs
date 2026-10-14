using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetMineAsync(Guid founderId);
    Task<ProjectDto> GetAsync(Guid actorId, int id, bool isAdmin = false);
    Task<ProjectDto> CreateAsync(Guid founderId, CreateProjectRequest request);
    Task<ProjectDto> UpdateAsync(Guid founderId, int id, UpdateProjectRequest request);
    Task<ProjectDto> ArchiveAsync(Guid founderId, int id, ArchiveProjectRequest request);
    Task<ProjectDto> TransitionStatusAsync(Guid actorId, int id, TransitionProjectStatusRequest request, bool isAdmin);
}
