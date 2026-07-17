using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Application.Common;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Identity;
using Investa.Domain.Entities;
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
    private readonly UserManager<ApplicationIdentityUser> _userManager;
    private readonly ILogger<OrgUserService> _logger;

    public OrgUserService(
        ApplicationDbContext db,
        IUnitOfWork unitOfWork,
        UserManager<ApplicationIdentityUser> userManager,
        ILogger<OrgUserService> logger)
    {
        _db = db;
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<(int total, List<OrgUserBasicDto> items)> GetOrgUsersAsync(int page, int pageSize)
    {
        var query = from au in _db.AuthUsers
                    where au.UserType == UserType.OrgUser
                    select new OrgUserBasicDto
                    {
                        Id = au.Id,
                        Email = au.Email,
                        Role = au.UserType.ToString(),
                        AccessLevel = 0,
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
                    join ur in _db.UserRoles on au.Id equals ur.UserId into jur
                    from ur in jur.DefaultIfEmpty()
                    join r in _db.Roles on ur.RoleId equals r.Id into jr
                    from r in jr.DefaultIfEmpty()
                    join g in _db.Groups on r.GroupId equals g.Id into jg
                    from g in jg.DefaultIfEmpty()
                    where au.UserType == UserType.OrgUser
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
        var email = NormalizeAndValidateEmail(dto.Email);
        var firstName = dto.FirstName?.Trim() ?? string.Empty;
        var lastName = dto.LastName?.Trim() ?? string.Empty;
        var displayName = BuildDisplayName(firstName, lastName);
        if (string.IsNullOrWhiteSpace(displayName))
            throw Validation("DISPLAY_NAME_REQUIRED", "Display name is required.");
        if (string.IsNullOrWhiteSpace(dto.Password))
            throw Validation("PASSWORD_REQUIRED", "Password is required.");

        return await _db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var transaction = await BeginTransactionIfSupportedAsync();
            try
            {
                await EnsureEmailAvailableAsync(email);
                var role = await ResolveRequestedRoleAsync(dto.RoleId);
                var id = Guid.NewGuid();
                var identityUser = new ApplicationIdentityUser
                {
                    Id = id,
                    UserName = $"org_{id:N}",
                    Email = email,
                    EmailConfirmed = true,
                    PhoneNumber = NormalizeOptional(dto.PhoneNumber),
                    LockoutEnabled = true
                };

                var identityResult = await _userManager.CreateAsync(identityUser, dto.Password);
                EnsureIdentitySucceeded(identityResult, "USER_CREATE_FAILED", "User creation failed.");

                var now = DateTime.UtcNow;
                _db.AuthUsers.Add(new AuthUser
                {
                    Id = id,
                    Name = displayName,
                    Email = email,
                    PasswordHash = identityUser.PasswordHash ?? string.Empty,
                    UserType = UserType.OrgUser,
                    Status = true,
                    CreatedAt = now
                });
                _db.UserProfiles.Add(new UserProfile
                {
                    UserId = id,
                    FirstName = firstName,
                    LastName = lastName,
                    FullName = displayName,
                    Email = email,
                    Phone1 = identityUser.PhoneNumber,
                    CreatedAt = now,
                    UpdatedAt = now
                });

                if (role != null)
                {
                    _db.UserRoles.Add(new UserRole
                    {
                        UserId = id,
                        RoleId = role.Id,
                        AssignedAt = now
                    });
                }

                await _db.SaveChangesAsync();
                if (transaction != null)
                    await transaction.CommitAsync();

                _logger.LogInformation("Organizational user {UserId} created", id);
                return await BuildAdminDtoAsync(id);
            }
            catch
            {
                if (transaction != null)
                    await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<OrgUserAdminDto?> UpdateOrgUserAsync(Guid userId, UpdateOrgUserDto dto)
    {
        return await _db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var transaction = await BeginTransactionIfSupportedAsync();
            try
            {
                var authUser = await _db.AuthUsers.SingleOrDefaultAsync(x => x.Id == userId);
                var identityUser = await _userManager.FindByIdAsync(userId.ToString());
                if (authUser == null || identityUser == null)
                    return null;
                if (authUser.UserType != UserType.OrgUser)
                    throw Validation("ORG_USER_REQUIRED", "Only organizational users can be updated by this endpoint.");

                var profile = await _db.UserProfiles.SingleOrDefaultAsync(x => x.UserId == userId);
                var firstName = dto.FirstName != null
                    ? dto.FirstName.Trim()
                    : profile?.FirstName?.Trim() ?? authUser.Name.Trim();
                var lastName = dto.LastName != null
                    ? dto.LastName.Trim()
                    : profile?.LastName?.Trim() ?? string.Empty;
                var displayName = BuildDisplayName(firstName, lastName);
                if (string.IsNullOrWhiteSpace(displayName))
                    throw Validation("DISPLAY_NAME_REQUIRED", "Display name is required.");

                if (dto.Email != null)
                {
                    var email = NormalizeAndValidateEmail(dto.Email);
                    await EnsureEmailAvailableAsync(email, userId);
                    identityUser.Email = email;
                    authUser.Email = email;
                    if (profile != null)
                        profile.Email = email;
                }

                if (dto.PhoneNumber != null)
                {
                    identityUser.PhoneNumber = NormalizeOptional(dto.PhoneNumber);
                    if (profile != null)
                        profile.Phone1 = identityUser.PhoneNumber;
                }

                authUser.Name = displayName;
                if (dto.Status.HasValue)
                    authUser.Status = dto.Status.Value;

                var now = DateTime.UtcNow;
                if (profile == null)
                {
                    profile = new UserProfile
                    {
                        UserId = userId,
                        CreatedAt = authUser.CreatedAt
                    };
                    _db.UserProfiles.Add(profile);
                }
                profile.FirstName = firstName;
                profile.LastName = lastName;
                profile.FullName = displayName;
                profile.Email = authUser.Email;
                profile.Phone1 = identityUser.PhoneNumber;
                profile.UpdatedAt = now;

                var identityResult = await _userManager.UpdateAsync(identityUser);
                EnsureIdentitySucceeded(identityResult, "USER_UPDATE_FAILED", "User update failed.");

                var role = await ResolveRequestedRoleAsync(dto.RoleId);
                if (role != null && !await _db.UserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == role.Id))
                {
                    _db.UserRoles.Add(new UserRole
                    {
                        UserId = userId,
                        RoleId = role.Id,
                        AssignedAt = now
                    });
                }

                if (dto.Status == false)
                    await RevokeSessionsAsync(userId);

                await _db.SaveChangesAsync();
                if (transaction != null)
                    await transaction.CommitAsync();

                _logger.LogInformation("Organizational user {UserId} updated", userId);
                return await BuildAdminDtoAsync(userId);
            }
            catch
            {
                if (transaction != null)
                    await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<bool> DeleteOrgUserAsync(Guid userId)
    {
        return await _db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var transaction = await BeginTransactionIfSupportedAsync();
            try
            {
                var authUser = await _db.AuthUsers.SingleOrDefaultAsync(x => x.Id == userId);
                if (authUser == null)
                    return false;
                if (authUser.UserType != UserType.OrgUser)
                    throw Validation("ORG_USER_REQUIRED", "Client users cannot be deleted by this endpoint.");

                // Preserve the identity row and all maker/checker, audit, role, and group references.
                authUser.Status = false;
                await RevokeSessionsAsync(userId);
                await _db.SaveChangesAsync();
                if (transaction != null)
                    await transaction.CommitAsync();

                _logger.LogInformation("Organizational user {UserId} deactivated", userId);
                return true;
            }
            catch
            {
                if (transaction != null)
                    await transaction.RollbackAsync();
                throw;
            }
        });
    }

    private async Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction?> BeginTransactionIfSupportedAsync()
    {
        return _db.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory"
            ? null
            : await _db.Database.BeginTransactionAsync();
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string BuildDisplayName(string firstName, string lastName) =>
        $"{firstName} {lastName}".Trim();

    private string NormalizeAndValidateEmail(string? value)
    {
        var email = value?.Trim();
        if (string.IsNullOrWhiteSpace(email))
            throw Validation("EMAIL_REQUIRED", "A valid email address is required.");

        var normalized = _userManager.NormalizeEmail(email);
        if (string.IsNullOrWhiteSpace(normalized) || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email))
            throw Validation("INVALID_EMAIL", "A valid email address is required.");
        return email.ToLowerInvariant();
    }

    private async Task EnsureEmailAvailableAsync(string email, Guid? exceptUserId = null)
    {
        var identityUser = await _userManager.FindByEmailAsync(email);
        if (identityUser != null && identityUser.Id != exceptUserId)
            throw Validation("DUPLICATE_EMAIL", "A user with this email already exists.");

        var normalizedEmail = email.ToUpperInvariant();
        if (await _db.AuthUsers.AnyAsync(x => x.Id != exceptUserId && x.Email != null && x.Email.ToUpper() == normalizedEmail))
            throw Validation("DUPLICATE_EMAIL", "A user with this email already exists.");
    }

    private async Task<Role?> ResolveRequestedRoleAsync(Guid? roleId)
    {
        if (!roleId.HasValue)
            return null;

        var role = await _db.Roles.SingleOrDefaultAsync(x => x.Id == roleId.Value && x.IsActive);
        if (role == null)
            throw Validation("INVALID_ROLE", "The selected role does not exist or is inactive.");
        return role;
    }

    private static void EnsureIdentitySucceeded(IdentityResult result, string code, string message)
    {
        if (!result.Succeeded)
            throw new OrgUserValidationException(code, message, result.Errors.Select(x => x.Description));
    }

    private static OrgUserValidationException Validation(string code, string message) =>
        new(code, message);

    private async Task RevokeSessionsAsync(Guid userId)
    {
        var refreshTokens = await _db.RefreshTokens.Where(x => x.AuthUserId == userId && !x.Revoked).ToListAsync();
        foreach (var token in refreshTokens)
            token.Revoked = true;

        var sessions = await _db.UserSessions.Where(x => x.UserId == userId && !x.IsRevoked).ToListAsync();
        foreach (var session in sessions)
            session.IsRevoked = true;
    }

    private async Task<OrgUserAdminDto?> BuildAdminDtoAsync(Guid userId)
    {
        var data = await (from au in _db.AuthUsers
                          join up in _db.UserProfiles on au.Id equals up.UserId into profiles
                          from up in profiles.DefaultIfEmpty()
                          where au.Id == userId && au.UserType == UserType.OrgUser
                          select new { au, up }).SingleOrDefaultAsync();
        if (data == null)
            return null;

        var roleInfo = await (from ur in _db.UserRoles
                              join role in _db.Roles on ur.RoleId equals role.Id
                              join groupEntity in _db.Groups on role.GroupId equals groupEntity.Id
                              where ur.UserId == userId && role.IsActive
                              orderby ur.AssignedAt
                              select new { role.Id, RoleName = role.Name, GroupId = groupEntity.Id, GroupName = groupEntity.Name })
            .FirstOrDefaultAsync();

        return new OrgUserAdminDto
        {
            Id = data.au.Id,
            FirstName = data.up?.FirstName ?? data.au.Name,
            LastName = data.up?.LastName ?? string.Empty,
            Name = data.up?.FullName ?? data.au.Name,
            Email = data.au.Email,
            Role = roleInfo?.RoleName ?? data.au.UserType.ToString(),
            RoleId = roleInfo?.Id,
            RoleName = roleInfo?.RoleName,
            GroupId = roleInfo?.GroupId,
            GroupName = roleInfo?.GroupName,
            Status = data.au.Status ? "Active" : "Inactive",
            CreatedAt = data.au.CreatedAt,
            UpdatedAt = data.up?.UpdatedAt,
            Avatar = data.up?.AvatarUrl,
            Metadata = new { department = roleInfo?.GroupName, location = data.up?.Nationality ?? data.up?.Address }
        };
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
