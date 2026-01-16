using System;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Junction table linking Users to Roles.
/// When a user is assigned a role, they are implicitly associated with that role's group.
/// </summary>
public class UserRole
{
    public int Id { get; set; }
    
    /// <summary>
    /// User ID (links to ApplicationUsers or AuthUser)
    /// </summary>
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Optional: reference to AuthUser.Id to support gradual migration from ApplicationUser -> AuthUser
    /// </summary>
    public Guid? AuthUserId { get; set; }
    
    /// <summary>
    /// Role ID
    /// </summary>
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedBy { get; set; }
}
