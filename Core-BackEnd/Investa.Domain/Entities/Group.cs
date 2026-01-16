using System;
using System.Collections.Generic;
using Investa.Domain.Entities.Security;

namespace Investa.Domain.Entities;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    
    /// <summary>
    /// Multi-tenancy support - null for system-wide groups
    /// </summary>
    public Guid? TenantId { get; set; }
    
    /// <summary>
    /// Soft delete support
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ModifiedAt { get; set; }

    /// <summary>
    /// Free-form metadata stored as JSON (e.g., location, departmentCode)
    /// </summary>
    public string? MetadataJson { get; set; }

    public ICollection<GroupPermission> GroupPermissions { get; set; } = new List<GroupPermission>();
    public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    public ICollection<Role> Roles { get; set; } = new List<Role>();
}
