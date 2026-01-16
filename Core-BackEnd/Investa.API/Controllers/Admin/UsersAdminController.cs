using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Investa.Application.Interfaces;
using Investa.Application.DTOs.Profile;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = nameof(UserRoles.Admin))]
    public class UsersAdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IProfileService _profileService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UsersAdminController> _logger;

        public UsersAdminController(ApplicationDbContext db, IProfileService profileService, IUnitOfWork unitOfWork, ILogger<UsersAdminController> logger)
        {
            _db = db;
            _profileService = profileService;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public class OrgUserDto
        {
            public string? Email { get; set; }
            public string? Role { get; set; }
            public int AccessLevel { get; set; }
            public bool Status { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrgUsers(int page = 1, int pageSize = 50)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 50;

            // Join ApplicationUsers (business users) with AuthUsers (auth table) and Employee for access level
            var q = from au in _db.AuthUsers
                    join u in _db.ApplicationUsers on au.Id equals u.Id into ju
                    from u in ju.DefaultIfEmpty()
                    join e in _db.Employees on au.Id equals e.UserId into je
                    from e in je.DefaultIfEmpty()
                        // Require AuthUser to be OrgUser and, if an ApplicationUser exists, ensure its Role is also OrgUser
                    where au.UserType == Investa.Domain.Entities.Enums.UserType.OrgUser && (u == null || u.Role == nameof(UserRoles.OrgUser))
                    select new OrgUserDto
                    {
                        Email = u != null && !string.IsNullOrEmpty(u.Email) ? u.Email : au.Email,
                        Role = u != null ? u.Role : au.UserType.ToString(),
                        AccessLevel = e != null ? (int)e.PermissionsLevel : 0,
                        Status = au.Status
                    };

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new { items, total, page, pageSize });
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetUsersList(int page = 1, int pageSize = 25, string? search = null, Guid? roleId = null, int? groupId = null, string? status = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 25;

            var q = from au in _db.AuthUsers
                    join up in _db.UserProfiles on au.Id equals up.UserId into jup
                    from up in jup.DefaultIfEmpty()
                    join ur in _db.UserRoles on au.Id equals ur.UserId into jur
                    from ur in jur.DefaultIfEmpty()
                    join r in _db.Roles on ur.RoleId equals r.Id into jr
                    from r in jr.DefaultIfEmpty()
                    join g in _db.Groups on r.GroupId equals g.Id into jg
                    from g in jg.DefaultIfEmpty()
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

            if (!string.IsNullOrWhiteSpace(search))
            {
                q = q.Where(x =>
                    (x.FullName ?? (x.FirstName + " " + x.LastName)).Contains(search) ||
                    (x.FirstName ?? "").Contains(search) ||
                    (x.LastName ?? "").Contains(search) ||
                    (x.Email ?? "").Contains(search)
                );
            }

            // Filtering by roleId, groupId, status
            if (roleId.HasValue)
            {
                q = q.Where(x => x.RoleId == roleId.Value);
            }

            if (groupId.HasValue)
            {
                q = q.Where(x => x.GroupId == groupId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var st = status.Trim().ToLowerInvariant();
                if (st == "active") q = q.Where(x => x.Status == true);
                else if (st == "inactive") q = q.Where(x => x.Status == false);
            }

            var total = await q.CountAsync();

            var items = await q
                .OrderBy(x => x.FullName ?? x.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = items.Select(it => new
            {
                id = it.Id,
                firstName = it.FirstName,
                lastName = it.LastName,
                name = !string.IsNullOrWhiteSpace(it.FullName) ? it.FullName : $"{it.FirstName} {it.LastName}".Trim(),
                email = it.Email,
                role = it.Role,
                roleId = it.RoleId,
                groupName = it.GroupName,
                groupId = it.GroupId,
                roleName = it.RoleName,
                status = it.Status ? "Active" : "Inactive",
                lastLogin = it.LastLogin,
                createdAt = it.CreatedAt,
                updatedAt = it.UpdatedAt,
                avatar = it.Avatar,
                metadata = new { department = it.Department, location = it.Location }
            });

            return Ok(new { items = result, total, page, pageSize });
        }

        [HttpGet("myprofile")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetOrCreateOrgUserProfile([FromQuery] bool createIfNotExists = true)
        {
            // Extract User ID from Token Claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var existing = await _profileService.GetUserProfileAsync(userId);
            
            // NEW: Fetch Role Name and Group Name from Group-Bound Role Architecture
            string? roleName = null;
            string? groupName = null;
            
            try
            {
                var userRole = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                    .FindAsync(ur => ur.UserId == userId))
                    .FirstOrDefault();
                    
                if (userRole != null)
                {
                    var role = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.Role>()
                        .FindAsync(r => r.Id == userRole.RoleId && r.IsActive))
                        .FirstOrDefault();
                        
                    if (role != null)
                    {
                        roleName = role.Name;
                        
                        // Fetch group name
                        var group = (await _unitOfWork.Repository<Group>()
                            .FindAsync(g => g.Id == role.GroupId))
                            .FirstOrDefault();
                            
                        if (group != null)
                        {
                            groupName = group.Name;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch role/group for user {UserId}", userId);
            }

            if (existing != null)
            {
                return Ok(new
                {
                    FirstName = existing.BasicInfo?.FirstName,
                    LastName = existing.BasicInfo?.LastName,
                    Mobile = existing.ContactInfo?.Phone1,
                    Image = existing.BasicInfo?.AvatarUrl,
                    RoleName = roleName,
                    GroupName = groupName
                });
            }

            if (!createIfNotExists)
            {
                return NotFound(new { message = "Profile not found" });
            }

            try
            {
                var profile = await _profileService.GetOrCreateUserProfileAsync(userId);
                return Ok(new
                {
                    FirstName = profile.BasicInfo?.FirstName,
                    LastName = profile.BasicInfo?.LastName,
                    Mobile = profile.ContactInfo?.Phone1,
                    Image = profile.BasicInfo?.AvatarUrl,
                    RoleName = roleName,
                    GroupName = groupName,
                    created = true
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
