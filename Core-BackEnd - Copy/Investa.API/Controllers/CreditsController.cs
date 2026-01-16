using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/credits")]
    [Authorize(Roles = "OrgUser")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class CreditsController : ControllerBase
    {
        // This controller was relocated to API admin dashboard at
        // /api/v1/admin/dashboard. Endpoints here are intentionally disabled.
        [HttpGet]
        public IActionResult Index() => StatusCode(410, new { message = "Moved to /api/v1/admin/dashboard" });
    }

    }
