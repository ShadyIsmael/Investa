using System;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Audit trail for compliance and security monitoring
/// </summary>
public class AuditLog
{
    public long Id { get; set; }
    
    /// <summary>
    /// Who performed the action
    /// </summary>
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    
    /// <summary>
    /// Type of entity affected (e.g., "Client", "Investment", "Permission")
    /// </summary>
    public string EntityType { get; set; } = null!;
    
    /// <summary>
    /// ID of the affected entity
    /// </summary>
    public string EntityId { get; set; } = null!;
    
    /// <summary>
    /// Action performed: Create, Update, Delete, Read, Execute
    /// </summary>
    public string Action { get; set; } = null!;
    
    /// <summary>
    /// JSON snapshot of changes made
    /// </summary>
    public string? Changes { get; set; }
    
    /// <summary>
    /// Original values before change (for rollback capability)
    /// </summary>
    public string? OldValues { get; set; }
    
    /// <summary>
    /// New values after change
    /// </summary>
    public string? NewValues { get; set; }
    
    /// <summary>
    /// IP address from which action was performed
    /// </summary>
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// User agent for device identification
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// When the action occurred
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Multi-tenancy support
    /// </summary>
    public Guid? TenantId { get; set; }
    
    /// <summary>
    /// Severity level for security events
    /// </summary>
    public AuditSeverity Severity { get; set; } = AuditSeverity.Information;
}

public enum AuditSeverity
{
    Information = 0,
    Warning = 1,
    Error = 2,
    Critical = 3
}
