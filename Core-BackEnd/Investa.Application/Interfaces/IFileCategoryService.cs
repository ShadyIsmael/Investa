using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IFileCategoryService
{
    Task<IReadOnlyList<FileCategoryAdminDto>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<FileCategoryAdminDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<FileCategoryAdminDto> CreateAsync(CreateFileCategoryRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<FileCategoryAdminDto?> UpdateAsync(int id, UpdateFileCategoryRequest request, Guid? actorId, CancellationToken cancellationToken = default);
    Task<FileCategoryAdminDto?> SetStatusAsync(int id, bool isActive, Guid? actorId, CancellationToken cancellationToken = default);
}

public interface IFileStoragePolicyService
{
    Task<FileStoragePolicyDto> GetAsync(CancellationToken cancellationToken = default);
    Task<FileStoragePolicyDto> UpdateAsync(UpdateFileStoragePolicyRequest request, Guid? actorId, CancellationToken cancellationToken = default);
}
