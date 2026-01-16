using System;
using Investa.Domain.Entities.Security;

namespace Investa.Domain.Entities;

public class Permission
{
    public int Id { get; set; }
    // A machine key like "clients.read" or "clients.update"
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<GroupPermission> GroupPermissions { get; set; } = new List<GroupPermission>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
