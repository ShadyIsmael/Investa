using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Authorization;

/// <summary>
/// Custom authorization requirement for permission-based access control
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    /// <summary>
    /// Required permission key in format: resource.action (e.g., "clients.read")
    /// </summary>
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission ?? throw new ArgumentNullException(nameof(permission));
    }
}
