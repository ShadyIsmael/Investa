using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IProjectCategoryService
{
    Task<IReadOnlyList<ProjectCategoryDto>> GetAllAsync(bool includeInactive = true, string? search = null, bool? isActive = null);
    Task<ProjectCategoryDto?> GetByIdAsync(int id, bool includeInactive = true);
    Task<ProjectCategoryDto> CreateAsync(CreateProjectCategoryRequest request, Guid? actorId = null);
    Task<ProjectCategoryDto?> UpdateAsync(int id, UpdateProjectCategoryRequest request, Guid? actorId = null);
    Task<ProjectCategoryDto?> SetStatusAsync(int id, bool isActive, Guid? actorId = null);
}
