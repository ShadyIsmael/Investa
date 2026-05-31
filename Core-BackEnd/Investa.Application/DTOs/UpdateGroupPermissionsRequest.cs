using System.Collections.Generic;

namespace Investa.Application.DTOs;

/// <summary>
/// Bulk-replace permissions for a group.
/// All existing group permissions are removed and replaced with the supplied list.
/// </summary>
public class UpdateGroupPermissionsRequest
{
    /// <summary>IDs of permissions to assign to the group.</summary>
    public List<int> PermissionIds { get; set; } = new();
}
