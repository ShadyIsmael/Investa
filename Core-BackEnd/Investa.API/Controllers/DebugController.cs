using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

/// <summary>
/// Debug controller for development and monitoring purposes.
/// Claims endpoint is restricted to Development environment only.
/// </summary>
[ApiController]
[Route("api/debug")]
public class DebugController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    /// <summary>
    /// Initializes a new instance of the <see cref="DebugController"/> class.
    /// </summary>
    /// <param name="environment">The hosting environment.</param>
    public DebugController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    /// <summary>
    /// Returns the claims of the authenticated user.
    /// Only available in Development environment for security reasons.
    /// </summary>
    /// <returns>User claims or 404 in production.</returns>
    [HttpGet("claims")]
    [Authorize]
    public IActionResult GetClaims()
    {
        // Security: Only expose claims in development environment
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList();
        return Ok(new { success = true, claims });
    }

    /// <summary>
    /// Health check endpoint for monitoring and load balancer probes.
    /// </summary>
    /// <returns>Health status with timestamp.</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
