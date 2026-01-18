using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;

namespace Investa.API.Controllers
{
    /// <summary>
    /// Health check controller for monitoring and discovery
    /// Provides system status, server identity, and network binding information
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;
        private readonly IConfiguration _configuration;

        public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// GET /api/health
        /// Returns system health status and network configuration
        /// </summary>
        /// <returns>Health status response</returns>
        [HttpGet]
        public IActionResult GetHealth()
        {
            try
            {
                var serverName = Environment.MachineName;
                var binding = "0.0.0.0:5000"; // Configured in Kestrel
                
                // Get local IP addresses
                var hostName = Dns.GetHostName();
                var ipAddresses = Dns.GetHostEntry(hostName).AddressList
                    .Where(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    .Select(ip => ip.ToString())
                    .ToList();

                var healthResponse = new
                {
                    status = "Healthy",
                    deviceName = serverName,
                    hostName = hostName,
                    binding = binding,
                    ipAddresses = ipAddresses,
                    timestamp = DateTime.UtcNow,
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    version = "1.0.0",
                    endpoints = new
                    {
                        api = $"http://{serverName}:5000/api",
                        swagger = $"http://{serverName}:5000/swagger",
                        notifications = "Firebase Cloud Messaging (FCM)"
                    }
                };

                _logger.LogInformation(
                    "[{Server}] Health check requested from {RemoteIp}",
                    serverName, HttpContext.Connection.RemoteIpAddress);

                return Ok(healthResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing health check");
                
                return StatusCode(500, new
                {
                    status = "Unhealthy",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// GET /api/health/ping
        /// Simple ping endpoint for quick availability checks
        /// </summary>
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new
            {
                pong = true,
                server = Environment.MachineName,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
