namespace Investa.Domain.Entities.Enums;

/// <summary>
/// User type classification for authentication and authorization.
/// Two types only: OrgUser (internal staff/admins) and Client (external users including investors, founders, partners).
/// </summary>
public enum UserType
{
    /// <summary>
    /// Internal organization user (employees, admins, staff) - for Admin Portal
    /// </summary>
    OrgUser = 0,

    /// <summary>
    /// External client user (investors, founders, partners) - for Client Portal and Mobile Apps
    /// </summary>
    Client = 1
}