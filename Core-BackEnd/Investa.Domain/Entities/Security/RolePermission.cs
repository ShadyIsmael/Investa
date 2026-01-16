using System;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Junction table linking Roles to Permissions.
/// Defines which permissions are granted by a specific role.
/// </summary>
public class RolePermission
{
    public int Id { get; set; }
    
    /// <summary>
    /// Role ID
    /// </summary>
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    
    /// <summary>
    /// Permission ID (links to Permission table)
    /// </summary>
    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedBy { get; set; }
}
