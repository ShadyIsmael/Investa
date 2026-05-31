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

    // ──────────────────────────────── CRUD ────────────────────────────────

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
        return ToDto(g);
    }

    public async Task<GroupDto?> UpdateAsync(int id, UpdateGroupRequest request)
    {
        var g = await _db.Groups.FindAsync(id);
        if (g == null) return null;

        g.Name = request.Name;
        g.Description = request.Description;
        g.ModifiedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToDto(g);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var g = await _db.Groups.FindAsync(id);
        if (g == null) return false;

        // Soft delete
        g.IsActive = false;
        g.ModifiedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<GroupDto>> GetAllAsync()
    {
        return await _db.Groups
            .Where(g => g.IsActive)
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
            .ToListAsync();
    }

    public async Task<IEnumerable<GroupDto>> GetAllWithoutPermissionsAsync()
    {
        return await _db.Groups
            .Where(g => g.IsActive)
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                CreatedAt = g.CreatedAt,
                Permissions = new List<PermissionDto>()
            })
            .ToListAsync();
    }

    public async Task<GroupDto?> GetByIdAsync(int id)
    {
        var g = await _db.Groups
            .Include(g => g.GroupPermissions)
            .ThenInclude(gp => gp.Permission)
            .FirstOrDefaultAsync(g => g.Id == id && g.IsActive);

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

    // ──────────────────────────── Permissions ─────────────────────────────

    public async Task AssignPermissionAsync(int groupId, int permissionId)
    {
        var exists = await _db.GroupPermissions
            .AnyAsync(x => x.GroupId == groupId && x.PermissionId == permissionId);
        if (exists) return;

        _db.GroupPermissions.Add(new GroupPermission
        {
            GroupId = groupId,
            PermissionId = permissionId,
            AssignedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Bulk-replace all permissions for a group:
    /// removes ones not in the new list, adds missing ones.
    /// </summary>
    public async Task UpdatePermissionsAsync(int groupId, IEnumerable<int> permissionIds)
    {
        var incoming = permissionIds.Distinct().ToList();

        var existing = await _db.GroupPermissions
            .Where(x => x.GroupId == groupId)
            .ToListAsync();

        // Remove permissions that are no longer in the incoming list
        var toRemove = existing.Where(x => !incoming.Contains(x.PermissionId)).ToList();
        _db.GroupPermissions.RemoveRange(toRemove);

        // Add permissions that are new
        var existingIds = existing.Select(x => x.PermissionId).ToHashSet();
        foreach (var permId in incoming.Where(id => !existingIds.Contains(id)))
        {
            _db.GroupPermissions.Add(new GroupPermission
            {
                GroupId = groupId,
                PermissionId = permId,
                AssignedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<PermissionDto>> GetPermissionsAsync(int groupId)
    {
        return await _db.GroupPermissions
            .Where(gp => gp.GroupId == groupId)
            .Include(gp => gp.Permission)
            .Select(gp => new PermissionDto
            {
                Id = gp.Permission.Id,
                Key = gp.Permission.Key,
                Name = gp.Permission.Name,
                Description = gp.Permission.Description,
                CreatedAt = gp.Permission.CreatedAt
            })
            .ToListAsync();
    }

    // ──────────────────────────────── Users ───────────────────────────────

    public async Task AssignUserAsync(int groupId, Guid userId)
    {
        var exists = await _db.UserGroups
            .AnyAsync(x => x.GroupId == groupId && x.UserId == userId);
        if (exists) return;

        _db.UserGroups.Add(new UserGroup
        {
            GroupId = groupId,
            UserId = userId,
            AssignedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    public async Task RemoveUserAsync(int groupId, Guid userId)
    {
        var entity = await _db.UserGroups
            .FirstOrDefaultAsync(x => x.GroupId == groupId && x.UserId == userId);
        if (entity == null) return;

        _db.UserGroups.Remove(entity);
        await _db.SaveChangesAsync();
    }

    // ─────────────────────────────── Helpers ──────────────────────────────

    private static GroupDto ToDto(Group g) => new()
    {
        Id = g.Id,
        Name = g.Name,
        Description = g.Description,
        CreatedAt = g.CreatedAt,
        Permissions = new List<PermissionDto>()
    };
}
