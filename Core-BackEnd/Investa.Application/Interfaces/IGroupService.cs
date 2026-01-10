using System.Collections.Generic;
using System.Threading.Tasks;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IGroupService
{
    Task<GroupDto> CreateAsync(CreateGroupRequest request);
    Task<IEnumerable<GroupDto>> GetAllAsync();
    Task<GroupDto?> GetByIdAsync(int id);
    Task AssignPermissionAsync(int groupId, int permissionId);
    Task AssignUserAsync(int groupId, System.Guid userId);
    Task RemoveUserAsync(int groupId, System.Guid userId);
}
