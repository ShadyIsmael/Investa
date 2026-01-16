using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Controllers
{
    [ApiController]
    public class ManifestController : ControllerBase
    {
        /// <summary>
        /// Serve the PWA manifest at the root path and ensure CORS headers are present
        /// so clients running behind tunnels (or other origins) can fetch it.
        /// </summary>
        [HttpGet("/manifest.json")]
        [AllowAnonymous]
        public IActionResult GetManifest()
        {
            try
            {
                var baseDir = AppContext.BaseDirectory;
                var manifestPath = Path.Combine(baseDir, "wwwroot", "manifest.json");
                if (!System.IO.File.Exists(manifestPath))
                {
                    return NotFound();
                }

                var content = System.IO.File.ReadAllText(manifestPath);

                // Add CORS header directly for this resource to avoid depending on global CORS policy
                Response.Headers["Access-Control-Allow-Origin"] = "*";
                Response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
                Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";

                return Content(content, "application/manifest+json");
            }
            catch
            {
                return StatusCode(500);
            }
        }

        // Respond to preflight requests explicitly
        [HttpOptions("/manifest.json")]
        [AllowAnonymous]
        public IActionResult OptionsManifest()
        {
            Response.Headers["Access-Control-Allow-Origin"] = "*";
            Response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
            Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";
            return NoContent();
        }
    }
}
