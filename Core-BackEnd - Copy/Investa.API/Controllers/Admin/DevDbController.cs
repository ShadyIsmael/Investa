using System.Linq;
using System.Threading.Tasks;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin
{
    [ApiController]
    [Route("api/v1/admin/dev")]
    [AllowAnonymous]
    public class DevDbController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<IdentityUser> _userManager;

        public DevDbController(ApplicationDbContext db, UserManager<IdentityUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // Development-only: clears application tables (Clients, Employees, AuthUsers, AspNetUsers)
        // This endpoint has been disabled per project API surface policy.
        [HttpPost("clear-db")]
        public Task<IActionResult> ClearDb()
        {
            return Task.FromResult<IActionResult>(NotFound(new { message = "This endpoint is disabled." }));
        }
    }
}
