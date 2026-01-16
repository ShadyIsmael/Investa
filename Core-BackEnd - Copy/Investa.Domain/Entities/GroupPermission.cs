namespace Investa.Domain.Entities;

public class GroupPermission
{
    public int GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}
