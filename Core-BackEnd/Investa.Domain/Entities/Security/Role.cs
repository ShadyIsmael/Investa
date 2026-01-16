using System;
using System.Collections.Generic;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Represents a Role that MUST belong to a Group.
/// This implements the "Group-Bound Role" architecture where every role is owned by a group.
/// </summary>
public class Role
{
    public Guid Id { get; set; }
    
    /// <summary>
    /// Name of the role (e.g., "Manager", "Viewer", "Editor")
    /// </summary>
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// Normalized name for case-insensitive lookups
    /// </summary>
    public string NormalizedName { get; set; } = null!;
    
    /// <summary>
    /// Optional description of the role's purpose
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// MANDATORY: Every role must belong to a Group
    /// </summary>
    public int GroupId { get; set; }
    public Group Group { get; set; } = null!;
    
    /// <summary>
    /// For multi-tenancy support (null = system-wide role)
    /// </summary>
    public Guid? TenantId { get; set; }
    
    /// <summary>
    /// Soft delete support
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ModifiedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    
    /// <summary>
    /// Navigation properties
    /// </summary>
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
