using Microsoft.AspNetCore.Http;

namespace Investa.API.Utilities;

/// <summary>
/// Utility class for IP address extraction from HTTP requests.
/// Supports X-Forwarded-For header for requests behind proxies/load balancers.
/// </summary>
public static class IpAddressUtility
{
    /// <summary>
    /// Extracts the client's IP address from the HTTP context.
    /// Handles X-Forwarded-For header for requests behind proxies or load balancers.
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <returns>The client's IP address as a string, or null if unable to determine</returns>
    public static string? GetClientIpAddress(HttpContext context)
    {
        if (context == null)
            return null;

        // Check for X-Forwarded-For header (most common for proxies/load balancers)
        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var xForwardedFor))
        {
            var ips = xForwardedFor.ToString().Split(',');
            if (ips.Length > 0)
            {
                var ip = ips[0].Trim();
                if (!string.IsNullOrWhiteSpace(ip))
                    return ip;
            }
        }

        // Check for X-Real-IP header (used by some proxies)
        if (context.Request.Headers.TryGetValue("X-Real-IP", out var xRealIp))
        {
            var ip = xRealIp.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(ip))
                return ip;
        }

        // Fall back to RemoteIpAddress from the connection
        var remoteIp = context.Connection.RemoteIpAddress?.ToString();
        if (!string.IsNullOrWhiteSpace(remoteIp))
            return remoteIp;

        return null;
    }

    /// <summary>
    /// Gets device information from the User-Agent header.
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <returns>Device info string (User-Agent), or null if not available</returns>
    public static string? GetDeviceInfo(HttpContext context)
    {
        if (context == null)
            return null;

        return context.Request.Headers.TryGetValue("User-Agent", out var userAgent)
            ? userAgent.ToString()
            : null;
    }
}
