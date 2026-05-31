using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IGroupService
{
    Task<GroupDto> CreateAsync(CreateGroupRequest request);
    Task<GroupDto?> UpdateAsync(int id, UpdateGroupRequest request);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<GroupDto>> GetAllAsync();
    Task<IEnumerable<GroupDto>> GetAllWithoutPermissionsAsync();
    Task<GroupDto?> GetByIdAsync(int id);

    // Single-permission helper (kept for backwards compat)
    Task AssignPermissionAsync(int groupId, int permissionId);
    /// <summary>Bulk-replace all permissions for a group.</summary>
    Task UpdatePermissionsAsync(int groupId, IEnumerable<int> permissionIds);
    Task<IEnumerable<PermissionDto>> GetPermissionsAsync(int groupId);

    Task AssignUserAsync(int groupId, Guid userId);
    Task RemoveUserAsync(int groupId, Guid userId);
}
