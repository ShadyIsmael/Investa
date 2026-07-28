using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IAdminUserApprovalService
{
    Task<PendingAdminChangeDto> SubmitChangeAsync(SubmitAdminChangeDto dto, Guid makerId, string? ipAddress = null);
    Task<PendingAdminChangeDto> ApproveChangeAsync(long changeId, ApproveAdminChangeDto dto, Guid checkerId, string? ipAddress = null);
    Task<PendingAdminChangeDto> RejectChangeAsync(long changeId, RejectAdminChangeDto dto, Guid checkerId, string? ipAddress = null);
    Task<PendingAdminChangeDto> CancelChangeAsync(long changeId, Guid userId);
    Task<List<PendingAdminChangeDto>> GetPendingChangesAsync(int page = 1, int pageSize = 20);
    Task<List<PendingAdminChangeDto>> GetMySubmittedChangesAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<PendingAdminChangeDto?> GetChangeByIdAsync(long changeId, Guid currentUserId);
}
