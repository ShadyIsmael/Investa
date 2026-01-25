using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

/// <summary>
/// Service interface for organizational user management.
/// Handles CRUD operations and queries for internal staff members.
/// </summary>
public interface IOrgUserService
{
    /// <summary>
    /// Gets a paginated list of organizational users with basic information.
    /// </summary>
    Task<(int total, List<OrgUserBasicDto> items)> GetOrgUsersAsync(int page, int pageSize);

    /// <summary>
    /// Gets a detailed paginated list of organizational users with filtering.
    /// </summary>
    Task<(int total, List<OrgUserAdminDto> items)> GetOrgUsersDetailedAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? roleId = null,
        int? groupId = null,
        string? status = null);

    /// <summary>
    /// Gets user role and group information.
    /// </summary>
    Task<(string? roleName, string? groupName)> GetUserRoleInfoAsync(Guid userId);

    /// <summary>
    /// Creates a new organizational user.
    /// </summary>
    Task<OrgUserAdminDto?> CreateOrgUserAsync(CreateOrgUserDto dto);

    /// <summary>
    /// Updates an existing organizational user.
    /// </summary>
    Task<OrgUserAdminDto?> UpdateOrgUserAsync(Guid userId, UpdateOrgUserDto dto);

    /// <summary>
    /// Deletes an organizational user.
    /// </summary>
    Task<bool> DeleteOrgUserAsync(Guid userId);

    /// <summary>
    /// Updates the status of multiple organizational users.
    /// </summary>
    Task<bool> BulkUpdateStatusAsync(List<Guid> userIds, bool isActive);
}
