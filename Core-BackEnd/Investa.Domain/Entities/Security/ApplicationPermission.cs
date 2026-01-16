using System;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Enhanced Permission entity with resource-action-scope model for fine-grained authorization
/// </summary>
public class ApplicationPermission
{
    public int Id { get; set; }
    
    /// <summary>
    /// Machine-readable key in format: {resource}.{action} (e.g., "clients.read", "reports.execute")
    /// </summary>
    public string Key { get; set; } = null!;
    
    /// <summary>
    /// Human-readable display name
    /// </summary>
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// Detailed description for admin UI
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Resource type this permission applies to (Client, Investment, Report, etc.)
    /// </summary>
    public string ResourceType { get; set; } = null!;
    
    /// <summary>
    /// Action allowed on the resource (Read, Write, Delete, Execute)
    /// </summary>
    public string Action { get; set; } = null!;
    
    /// <summary>
    /// Scope of permission: Organization, Department, User
    /// </summary>
    public PermissionScope Scope { get; set; } = PermissionScope.Organization;
    
    /// <summary>
    /// For hierarchical permissions (e.g., clients.read inherits from clients.*)
    /// </summary>
    public int? ParentPermissionId { get; set; }
    public ApplicationPermission? ParentPermission { get; set; }
    
    /// <summary>
    /// Multi-tenancy support (null = system-wide permission)
    /// </summary>
    public Guid? TenantId { get; set; }
    
    /// <summary>
    /// For soft delete and audit trails
    /// </summary>
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public Guid? ModifiedBy { get; set; }

    // Navigation properties
    public ICollection<GroupPermission> GroupPermissions { get; set; } = new List<GroupPermission>();
    public ICollection<ApplicationPermission> ChildPermissions { get; set; } = new List<ApplicationPermission>();
}

/// <summary>
/// Defines the scope/level at which a permission operates
/// </summary>
public enum PermissionScope
{
    /// <summary>
    /// Permission applies across the entire organization/tenant
    /// </summary>
    Organization = 1,
    
    /// <summary>
    /// Permission limited to user's department/group
    /// </summary>
    Department = 2,
    
    /// <summary>
    /// Permission only applies to user's own resources
    /// </summary>
    User = 3
}
