using Investa.Application.Interfaces;
using Investa.Domain.Entities.Security;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

public class OpportunityFileAuditService : IOpportunityFileAuditService
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<OpportunityFileAuditService> _logger;

    public OpportunityFileAuditService(IUnitOfWork uow, ILogger<OpportunityFileAuditService> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    public async Task RecordUploadAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileName)
    {
        await WriteAuditLogAsync(userId, "Upload", entityType, entityId,
            $"File uploaded to opportunity {opportunityId}: {fileName}", AuditSeverity.Information);
    }

    public async Task RecordLinkAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileKey)
    {
        await WriteAuditLogAsync(userId, "Link", entityType, entityId,
            $"File {fileKey} linked to opportunity {opportunityId}", AuditSeverity.Information);
    }

    public async Task RecordVisibilityChangeAsync(Guid userId, int opportunityId, string entityType, string entityId, bool wasPublic, bool nowPublic)
    {
        await WriteAuditLogAsync(userId, "Update", entityType, entityId,
            $"Visibility changed on opportunity {opportunityId} from {(wasPublic ? "Public" : "Private")} to {(nowPublic ? "Public" : "Private")}",
            AuditSeverity.Information);
    }

    public async Task RecordDownloadAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileName)
    {
        await WriteAuditLogAsync(userId, "Download", entityType, entityId,
            $"File {fileName} downloaded from opportunity {opportunityId}", AuditSeverity.Information);
    }

    public async Task RecordDeleteAsync(Guid userId, int opportunityId, string entityType, string entityId, string fileName)
    {
        await WriteAuditLogAsync(userId, "Delete", entityType, entityId,
            $"File {fileName} deleted from opportunity {opportunityId}", AuditSeverity.Warning);
    }

    public async Task RecordScanResultAsync(string entityType, string entityId, string fileKey, string scanStatus)
    {
        _logger.LogInformation("Scan result for {EntityType} {EntityId} ({FileKey}): {Status}", entityType, entityId, fileKey, scanStatus);
    }

    public async Task RecordAccessDeniedAsync(Guid userId, string reason, string? entityType = null, string? entityId = null)
    {
        await WriteAuditLogAsync(userId, "AccessDenied", entityType ?? "Unknown", entityId ?? "Unknown",
            reason, AuditSeverity.Warning);
    }

    private async Task WriteAuditLogAsync(Guid userId, string action, string entityType, string entityId, string description, AuditSeverity severity)
    {
        try
        {
            var audit = new AuditLog
            {
                UserId = userId,
                EntityType = entityType,
                EntityId = entityId,
                Action = action,
                Changes = description,
                Timestamp = DateTime.UtcNow,
                Severity = severity
            };

            await _uow.Repository<AuditLog>().AddAsync(audit);
            await _uow.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write audit log for {Action} on {EntityType} {EntityId}", action, entityType, entityId);
        }
    }
}
