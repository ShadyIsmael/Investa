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

    /// <summary>Database-generated sequence value used only to produce RoleCode.</summary>
    public long RoleNumber { get; private set; }

    /// <summary>Immutable backend-generated business identifier (for example ROL-000001).</summary>
    public string RoleCode { get; private set; } = null!;

    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    
    /// <summary>
    /// Legacy compatibility value. Kept synchronized with NameEn.
    /// </summary>
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// Normalized name for case-insensitive lookups
    /// </summary>
    public string NormalizedName { get; set; } = null!;
    
    /// <summary>
    /// Legacy compatibility value. Kept synchronized with DescriptionEn.
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
