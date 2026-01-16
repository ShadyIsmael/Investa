using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Investa.Application.Interfaces;
using Investa.Application.DTOs.Profile;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities.Enums;

namespace Investa.API.Controllers.Admin
{
    [ApiController]
    [Route("api/v1/admin/users")]
    [Authorize(Roles = "OrgUser")]
    public class UsersAdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IProfileService _profileService;

        public UsersAdminController(ApplicationDbContext db, IProfileService profileService)
        {
            _db = db;
            _profileService = profileService;
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
                    where au.UserType == Investa.Domain.Entities.Enums.UserType.OrgUser && (u == null || u.Role == "OrgUser")
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

        [HttpGet("myprofile")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrCreateOrgUserProfile([FromRoute] Guid userId, [FromQuery] bool createIfNotExists = true)
        {
            if (userId == Guid.Empty) return BadRequest("userId is required");

            // Try get existing profile
            var existing = await _profileService.GetUserProfileAsync(userId);
            if (existing != null)
            {
                return Ok(new { profile = existing, created = false });
            }

            if (!createIfNotExists)
            {
                return NotFound(new { message = "Profile not found" });
            }

            // Create and return
            try
            {
                var profile = await _profileService.GetOrCreateUserProfileAsync(userId);
                return Ok(new { profile, created = true });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
