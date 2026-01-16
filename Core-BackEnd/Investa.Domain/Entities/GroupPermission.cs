using System;

namespace Investa.Domain.Entities;

public class GroupPermission
{
    public int Id { get; set; }
    
    public int GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedBy { get; set; }
}
