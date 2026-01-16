using Investa.Application.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace Investa.Application.Interfaces;

/// <summary>
/// Service interface for JWT token generation
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generates a JWT token for the authenticated user
    /// </summary>
    /// <param name="user">The IdentityUser to generate token for</param>
    /// <returns>AuthResponseDto containing the token and expiration time</returns>
    Task<AuthResponseDto> GenerateTokenAsync(IdentityUser user);
}
