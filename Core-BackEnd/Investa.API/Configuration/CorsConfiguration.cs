using Microsoft.Extensions.Configuration;

namespace Investa.API.Configuration;

public static class CorsConfiguration
{
    public static string[] GetAllowedOrigins(IConfiguration configuration, string environmentName)
    {
        var configured = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();

        var origins = new HashSet<string>(configured.Where(IsAbsoluteOrigin), StringComparer.OrdinalIgnoreCase);

        if (string.Equals(environmentName, Environments.Development, StringComparison.OrdinalIgnoreCase))
        {
            // Single-port setting (legacy): NetworkConfig:FrontendPort (default 5173).
            var frontendPort = configuration["NetworkConfig:FrontendPort"] ?? "5173";
            var ports = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { frontendPort };

            // Multi-port setting (preferred): NetworkConfig:FrontendPorts = ["3000", "4200", ...].
            var configuredPorts = configuration.GetSection("NetworkConfig:FrontendPorts").Get<string[]>()
                ?? Array.Empty<string>();
            foreach (var port in configuredPorts.Where(p => !string.IsNullOrWhiteSpace(p)))
                ports.Add(port.Trim());

            // Always allow the well-known local dev servers so a frontend port
            // change (e.g. Angular serve on :3000 per angular.json) never breaks
            // CORS with "No 'Access-Control-Allow-Origin' header" errors.
            ports.Add("3000");
            ports.Add("4200");
            ports.Add("5173");

            foreach (var port in ports)
            {
                origins.Add($"http://localhost:{port}");
                origins.Add($"http://127.0.0.1:{port}");
            }

            var hostName = configuration["NetworkConfig:HostName"];
            if (!string.IsNullOrWhiteSpace(hostName)
                && !string.Equals(hostName, "localhost", StringComparison.OrdinalIgnoreCase))
            {
                foreach (var port in ports)
                    origins.Add($"http://{hostName}:{port}");
            }
        }

        return origins.OrderBy(origin => origin, StringComparer.OrdinalIgnoreCase).ToArray();
    }

    private static bool IsAbsoluteOrigin(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
        && !string.IsNullOrWhiteSpace(uri.Host)
        && string.IsNullOrEmpty(uri.AbsolutePath.Trim('/'));
}
