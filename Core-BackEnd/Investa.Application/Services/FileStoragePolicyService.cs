using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class FileStoragePolicyService(IUnitOfWork uow) : IFileStoragePolicyService
{
    public async Task<FileStoragePolicyDto> GetAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var policy = await uow.Repository<FileStoragePolicy>().GetByIdAsync(1) ?? throw new InvalidOperationException("File storage policy is not configured.");
        return ToDto(policy);
    }

    public async Task<FileStoragePolicyDto> UpdateAsync(UpdateFileStoragePolicyRequest request, Guid? actorId, CancellationToken cancellationToken = default)
    {
        if (request.GlobalMaxFileSizeBytes <= 0 || request.DefaultUserQuotaBytes <= 0 || request.DefaultProjectQuotaBytes <= 0) throw new BusinessValidationException("FILE_STORAGE_POLICY_INVALID", "Storage limits must be positive.");
        var policy = await uow.Repository<FileStoragePolicy>().GetByIdAsync(1) ?? new FileStoragePolicy { Id = 1 };
        policy.GlobalMaxFileSizeBytes = request.GlobalMaxFileSizeBytes; policy.DefaultUserQuotaBytes = request.DefaultUserQuotaBytes; policy.DefaultProjectQuotaBytes = request.DefaultProjectQuotaBytes; policy.UpdatedAt = DateTime.UtcNow; policy.UpdatedByUserId = actorId;
        if (policy.Id == 1 && !await uow.Repository<FileStoragePolicy>().ExistsAsync(x => x.Id == 1)) await uow.Repository<FileStoragePolicy>().AddAsync(policy); else await uow.Repository<FileStoragePolicy>().UpdateAsync(policy);
        await uow.SaveChangesAsync();
        return ToDto(policy);
    }
    private static FileStoragePolicyDto ToDto(FileStoragePolicy x) => new() { GlobalMaxFileSizeBytes = x.GlobalMaxFileSizeBytes, DefaultUserQuotaBytes = x.DefaultUserQuotaBytes, DefaultProjectQuotaBytes = x.DefaultProjectQuotaBytes, UpdatedAt = x.UpdatedAt };
}
