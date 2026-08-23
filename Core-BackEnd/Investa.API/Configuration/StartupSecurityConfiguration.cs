using Microsoft.Extensions.Configuration;

namespace Investa.API.Configuration;

public static class StartupSecurityConfiguration
{
    public static string RequireJwtSigningKey(IConfiguration configuration)
    {
        var jwtKey = configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey))
            throw new InvalidOperationException(
                "Required secret 'Jwt:Key' is missing. Configure it through environment variables, User Secrets, or an approved secret store.");
        if (jwtKey.Length < 32)
            throw new InvalidOperationException(
                "Required secret 'Jwt:Key' must be at least 32 characters. Configure a cryptographically strong value through a secure secret provider.");
        return jwtKey;
    }

    public static void ValidateActiveFileStore(IConfiguration configuration)
    {
        var baseUrl = configuration["FileStore:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new InvalidOperationException(
                "FileStore is the active file provider and requires 'FileStore:BaseUrl' configuration.");
        if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out _))
            throw new InvalidOperationException(
                "FileStore is the active file provider and requires a valid absolute 'FileStore:BaseUrl'.");
        if (string.IsNullOrWhiteSpace(configuration["FileStore:ApiKey"]))
            throw new InvalidOperationException(
                "FileStore is the active file provider and requires secret 'FileStore:ApiKey'. Configure it through environment variables, User Secrets, or an approved secret store.");
    }
}
