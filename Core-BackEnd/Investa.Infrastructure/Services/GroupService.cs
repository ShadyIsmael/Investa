using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Investa.Application.DTOs;
using Investa.Infrastructure.Persistence;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Infrastructure.Services;

public class GroupService : IGroupService
{
    private readonly ApplicationDbContext _db;

    public GroupService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<GroupDto> CreateAsync(CreateGroupRequest request)
    {
        var g = new Group
        {
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };
        _db.Groups.Add(g);
        await _db.SaveChangesAsync();
        return new GroupDto { Id = g.Id, Name = g.Name, Description = g.Description, CreatedAt = g.CreatedAt };
    }

    public async Task<IEnumerable<GroupDto>> GetAllAsync()
    {
        return await Task.FromResult(_db.Groups
            .Include(g => g.GroupPermissions)
            .ThenInclude(gp => gp.Permission)
            .Select(g => new GroupDto 
            { 
                Id = g.Id, 
                Name = g.Name, 
                Description = g.Description, 
                CreatedAt = g.CreatedAt,
                Permissions = g.GroupPermissions.Select(gp => new PermissionDto
                {
                    Id = gp.Permission.Id,
                    Key = gp.Permission.Key,
                    Name = gp.Permission.Name,
                    Description = gp.Permission.Description,
                    CreatedAt = gp.Permission.CreatedAt
                }).ToList()
            })
            .ToList());
    }

    public async Task<IEnumerable<GroupDto>> GetAllWithoutPermissionsAsync()
    {
        return await Task.FromResult(_db.Groups
            .Select(g => new GroupDto 
            { 
                Id = g.Id, 
                Name = g.Name, 
                Description = g.Description, 
                CreatedAt = g.CreatedAt,
                Permissions = new List<PermissionDto>()
            })
            .ToList());
    }

    public async Task<GroupDto?> GetByIdAsync(int id)
    {
        var g = await _db.Groups
            .Include(g => g.GroupPermissions)
            .ThenInclude(gp => gp.Permission)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (g == null) return null;
        return new GroupDto 
        { 
            Id = g.Id, 
            Name = g.Name, 
            Description = g.Description, 
            CreatedAt = g.CreatedAt,
            Permissions = g.GroupPermissions.Select(gp => new PermissionDto
            {
                Id = gp.Permission.Id,
                Key = gp.Permission.Key,
                Name = gp.Permission.Name,
                Description = gp.Permission.Description,
                CreatedAt = gp.Permission.CreatedAt
            }).ToList()
        };
    }

    public async Task AssignPermissionAsync(int groupId, int permissionId)
    {
        var exists = _db.GroupPermissions.Find(groupId, permissionId);
        if (exists != null) return;
        _db.GroupPermissions.Add(new GroupPermission { GroupId = groupId, PermissionId = permissionId });
        await _db.SaveChangesAsync();
    }

    public async Task AssignUserAsync(int groupId, Guid userId)
    {
        var exists = _db.UserGroups.FirstOrDefault(x => x.GroupId == groupId && x.UserId == userId);
        if (exists != null) return;
        _db.UserGroups.Add(new UserGroup { GroupId = groupId, UserId = userId, AssignedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();
    }

    public async Task RemoveUserAsync(int groupId, Guid userId)
    {
        var exists = _db.UserGroups.FirstOrDefault(x => x.GroupId == groupId && x.UserId == userId);
        if (exists == null) return;
        _db.UserGroups.Remove(exists);
        await _db.SaveChangesAsync();
    }
}
