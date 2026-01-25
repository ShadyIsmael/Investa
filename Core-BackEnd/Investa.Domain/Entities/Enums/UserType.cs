namespace Investa.Domain.Entities.Enums;

/// <summary>
/// User type classification for authentication and authorization.
/// Only three types are supported: OrgUser (internal users), Founder (business owners), Partner (external partners).
/// </summary>
public enum UserType
{
    /// <summary>
    /// Internal organization user (employees, admins, staff)
    /// </summary>
    OrgUser = 0,

    /// <summary>
    /// Business founder/owner who creates investment opportunities
    /// </summary>
    Founder = 1,

    /// <summary>
    /// External partner user
    /// </summary>
    Partner = 2
}