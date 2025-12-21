using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Investa.Application.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Investa.Application.Services;

/// <summary>
/// Service implementation for JWT token generation
/// Creates tokens with phone number as claim and configurable expiration
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <inheritdoc/>
    public Task<AuthResponseDto> GenerateTokenAsync(IdentityUser user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        // Get JWT configuration from appsettings.json
        var jwtSection = _configuration.GetSection("Jwt");
        var key = jwtSection["Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
        var issuer = jwtSection["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is not configured");
        var audience = jwtSection["Audience"] ?? throw new InvalidOperationException("JWT Audience is not configured");
        var expirationMinutes = 60; // Default to 60 minutes
        if (int.TryParse(jwtSection["ExpirationMinutes"], out var expiration))
        {
            expirationMinutes = expiration;
        }

        // Create security key
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Create claims with phone number as identifier
        var claims = new List<Claim>
        {
            new Claim("sub", user.Id), // Subject (user ID)
            new Claim("id", user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty), // Phone number claim
            new Claim("phone_number", user.PhoneNumber ?? string.Empty),
        };

        // Calculate expiration time
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        // Create JWT token
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        // Serialize token
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenString = tokenHandler.WriteToken(token);

        var response = new AuthResponseDto
        {
            Token = tokenString,
            ExpiresAt = expiresAt,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            Message = "Registration successful"
        };

        return Task.FromResult(response);
    }
}
