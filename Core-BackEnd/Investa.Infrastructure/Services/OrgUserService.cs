using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Infrastructure.Services;

/// <summary>
/// Service for managing organizational users (internal staff).
/// </summary>
public class OrgUserService : IOrgUserService
{
    private readonly ApplicationDbContext _db;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OrgUserService> _logger;

    public OrgUserService(
        ApplicationDbContext db,
        IUnitOfWork unitOfWork,
        ILogger<OrgUserService> logger)
    {
        _db = db;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<(int total, List<OrgUserBasicDto> items)> GetOrgUsersAsync(int page, int pageSize)
    {
        var query = from au in _db.AuthUsers
                    join u in _db.ApplicationUsers on au.Id equals u.Id into ju
                    from u in ju.DefaultIfEmpty()
                    join e in _db.Employees on au.Id equals e.UserId into je
                    from e in je.DefaultIfEmpty()
                    where au.UserType == UserType.OrgUser && (u == null || u.Role == nameof(UserRoles.OrgUser))
                    select new OrgUserBasicDto
                    {
                        Id = au.Id,
                        Email = u != null && !string.IsNullOrEmpty(u.Email) ? u.Email : au.Email,
                        Role = u != null ? u.Role : au.UserType.ToString(),
                        AccessLevel = e != null ? (int)e.PermissionsLevel : 0,
                        Status = au.Status
                    };

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (total, items);
    }

    public async Task<(int total, List<OrgUserAdminDto> items)> GetOrgUsersDetailedAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? roleId = null,
        int? groupId = null,
        string? status = null)
    {
        var query = from au in _db.AuthUsers
                    join up in _db.UserProfiles on au.Id equals up.UserId into jup
                    from up in jup.DefaultIfEmpty()
                    join u in _db.ApplicationUsers on au.Id equals u.Id into ju
                    from u in ju.DefaultIfEmpty()
                    join ur in _db.UserRoles on au.Id equals ur.UserId into jur
                    from ur in jur.DefaultIfEmpty()
                    join r in _db.Roles on ur.RoleId equals r.Id into jr
                    from r in jr.DefaultIfEmpty()
                    join g in _db.Groups on r.GroupId equals g.Id into jg
                    from g in jg.DefaultIfEmpty()
                    where au.UserType == UserType.OrgUser && (u == null || u.Role == nameof(UserRoles.OrgUser))
                    let lastSession = _db.UserSessions
                        .Where(s => s.UserId == au.Id && !s.IsRevoked)
                        .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
                        .Select(s => s.LastUsedAt ?? s.CreatedAt)
                        .FirstOrDefault()
                    select new
                    {
                        au.Id,
                        FirstName = up.FirstName,
                        LastName = up.LastName,
                        FullName = up.FullName,
                        au.Email,
                        Role = r != null ? r.Name : au.UserType.ToString(),
                        RoleId = r != null ? r.Id : (Guid?)null,
                        GroupName = g != null ? g.Name : null,
                        GroupId = (int?)g.Id,
                        RoleName = r != null ? r.Name : null,
                        Status = au.Status,
                        LastLogin = up.LastLoginDate ?? lastSession,
                        CreatedAt = au.CreatedAt,
                        UpdatedAt = (DateTime?)(up != null ? up.UpdatedAt : au.CreatedAt),
                        Avatar = up.AvatarUrl,
                        Department = g != null ? g.Name : null,
                        Location = up.Nationality ?? up.Address
                    };

        // Apply filters
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.FullName ?? (x.FirstName + " " + x.LastName)).Contains(search) ||
                (x.FirstName ?? "").Contains(search) ||
                (x.LastName ?? "").Contains(search) ||
                (x.Email ?? "").Contains(search));
        }

        if (roleId.HasValue)
        {
            query = query.Where(x => x.RoleId == roleId.Value);
        }

        if (groupId.HasValue)
        {
            query = query.Where(x => x.GroupId == groupId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim().ToLowerInvariant();
            if (st == "active") query = query.Where(x => x.Status == true);
            else if (st == "inactive") query = query.Where(x => x.Status == false);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.FullName ?? x.Email)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(it => new OrgUserAdminDto
        {
            Id = it.Id,
            FirstName = it.FirstName ?? string.Empty,
            LastName = it.LastName ?? string.Empty,
            Name = !string.IsNullOrWhiteSpace(it.FullName) ? it.FullName : $"{it.FirstName} {it.LastName}".Trim(),
            Email = it.Email,
            Role = it.Role,
            RoleId = it.RoleId,
            GroupName = it.GroupName,
            GroupId = it.GroupId,
            RoleName = it.RoleName,
            Status = it.Status ? "Active" : "Inactive",
            LastLogin = it.LastLogin,
            CreatedAt = it.CreatedAt,
            UpdatedAt = it.UpdatedAt,
            Avatar = it.Avatar,
            Metadata = new { department = it.Department, location = it.Location }
        }).ToList();

        return (total, result);
    }

    public async Task<(string? roleName, string? groupName)> GetUserRoleInfoAsync(Guid userId)
    {
        try
        {
            var userRole = (await _unitOfWork.Repository<UserRole>()
                .FindAsync(ur => ur.UserId == userId))
                .FirstOrDefault();

            if (userRole == null)
                return (null, null);

            var role = (await _unitOfWork.Repository<Role>()
                .FindAsync(r => r.Id == userRole.RoleId && r.IsActive))
                .FirstOrDefault();

            if (role == null)
                return (null, null);

            var group = (await _unitOfWork.Repository<Domain.Entities.Group>()
                .FindAsync(g => g.Id == role.GroupId))
                .FirstOrDefault();

            return (role.Name, group?.Name);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not fetch role/group for user {UserId}", userId);
            return (null, null);
        }
    }

    public async Task<OrgUserAdminDto?> CreateOrgUserAsync(CreateOrgUserDto dto)
    {
        // Implementation for creating org user
        // This would integrate with authentication service
        throw new NotImplementedException("Create org user functionality pending authentication service integration");
    }

    public async Task<OrgUserAdminDto?> UpdateOrgUserAsync(Guid userId, UpdateOrgUserDto dto)
    {
        // Implementation for updating org user
        throw new NotImplementedException("Update org user functionality pending");
    }

    public async Task<bool> DeleteOrgUserAsync(Guid userId)
    {
        // Implementation for deleting org user
        throw new NotImplementedException("Delete org user functionality pending");
    }

    public async Task<bool> BulkUpdateStatusAsync(List<Guid> userIds, bool isActive)
    {
        try
        {
            var users = await _db.AuthUsers
                .Where(u => userIds.Contains(u.Id) && u.UserType == UserType.OrgUser)
                .ToListAsync();

            foreach (var user in users)
            {
                user.Status = isActive;
            }

            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to bulk update user status");
            return false;
        }
    }
}
