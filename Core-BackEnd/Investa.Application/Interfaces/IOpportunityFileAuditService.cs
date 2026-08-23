using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface IOpportunityFileAuditService
{
    Task RecordUploadAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileName);

    Task RecordLinkAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileKey);

    Task RecordVisibilityChangeAsync(Guid userId, int opportunityId, string entityType, string entityId, bool wasPublic, bool nowPublic);

    Task RecordDownloadAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileName);

    Task RecordDeleteAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileName);

    Task RecordScanResultAsync(string entityType, string entityId, string fileKey, string scanStatus);

    Task RecordAccessDeniedAsync(Guid userId, string reason, string? entityType = null, string? entityId = null);
}
