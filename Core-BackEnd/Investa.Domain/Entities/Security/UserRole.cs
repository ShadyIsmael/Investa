using System;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Junction table linking AuthUsers to Roles.
/// Both Client and OrgUser accounts can have roles assigned.
/// </summary>
public class UserRole
{
    public int Id { get; set; }
    
    /// <summary>User ID — links to AuthUsers (the master user table).</summary>
    public Guid UserId { get; set; }
    public AuthUser User { get; set; } = null!;
    
    /// <summary>Role ID</summary>
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedBy { get; set; }
}
