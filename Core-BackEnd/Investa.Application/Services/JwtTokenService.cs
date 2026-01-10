using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Investa.Application.DTOs.Auth;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
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
    private readonly IUnitOfWork _unitOfWork;

    public JwtTokenService(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
    }

    /// <inheritdoc/>
    public async Task<AuthResponseDto> GenerateTokenAsync(IdentityUser user)
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

        var refreshExpirationDays = 30; // Default
        if (int.TryParse(jwtSection["RefreshExpirationDays"], out var refreshDays))
        {
            refreshExpirationDays = refreshDays;
        }

        // Create security key
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Default role and user type
        var roleClaimValue = "Client";
        var userTypeValue = "Client";

        // Try to parse Identity user id as GUID and fetch AuthUser.UserType (primary source)
        User? domainUser = null;
        if (Guid.TryParse(user.Id, out var userGuid))
        {
            var authUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == userGuid)).FirstOrDefault();
            if (authUser != null)
            {
                // Map UserType enum directly to role
                roleClaimValue = authUser.UserType.ToString();
                userTypeValue = roleClaimValue;
            }
            
            // Also fetch domain user for group permissions
            domainUser = (await _unitOfWork.Repository<User>().FindAsync(u => u.Id == userGuid)).FirstOrDefault();
        }

        // Create claims with phone number as identifier
        var claims = new List<Claim>
        {
            new Claim("sub", user.Id), // Subject (user ID)
            new Claim("id", user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty), // Phone number claim
            new Claim("phone_number", user.PhoneNumber ?? string.Empty),
            // Include role claim so role-based Authorize attributes work
            new Claim(ClaimTypes.Role, roleClaimValue),
            new Claim("role", roleClaimValue),
            new Claim("userType", userTypeValue),
        };

        // Add group and permission claims if the domain user exists
        if (domainUser != null)
        {
            try
            {
                var domainUserGuid = domainUser.Id;
                var userGroups = (await _unitOfWork.Repository<UserGroup>().FindAsync(ug => ug.UserId == domainUserGuid)).ToList();
                if (userGroups.Any())
                {
                    var groupIds = userGroups.Select(ug => ug.GroupId).Distinct().ToList();
                    var groups = (await _unitOfWork.Repository<Group>().FindAsync(g => groupIds.Contains(g.Id))).ToList();
                    foreach (var g in groups)
                    {
                        claims.Add(new Claim("group", g.Name));
                    }

                    var groupPerms = (await _unitOfWork.Repository<GroupPermission>().FindAsync(gp => groupIds.Contains(gp.GroupId))).ToList();
                    var permissionIds = groupPerms.Select(gp => gp.PermissionId).Distinct().ToList();
                    var perms = (await _unitOfWork.Repository<Permission>().FindAsync(p => permissionIds.Contains(p.Id))).ToList();
                    foreach (var p in perms.DistinctBy(x => x.Key))
                    {
                        claims.Add(new Claim("permission", p.Key));
                    }
                }
            }
            catch
            {
                // swallow permission-loading errors to avoid blocking token issuance
            }
        }

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

        // Create refresh token and persist
        var refreshBytes = new byte[64];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(refreshBytes);
        }
        var refreshTokenString = Convert.ToBase64String(refreshBytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_'); // base64url

        var refreshExpiresAt = DateTime.UtcNow.AddDays(refreshExpirationDays);

        // Try to parse Identity user id as GUID for linking to AuthUser
        if (Guid.TryParse(user.Id, out var authUserGuid))
        {
            // Ensure an AuthUser exists for this identity id. If missing, create a minimal record so FK won't fail.
            var authUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == authUserGuid)).FirstOrDefault();
            if (authUser == null)
            {
                // Create a minimal AuthUser entry. PasswordHash is required by the model; use a placeholder hash.
                authUser = new AuthUser
                {
                    Id = authUserGuid,
                    Email = user.Email ?? (user.UserName + "@phone.investa.local"),
                    PasswordHash = "", // placeholder; real hash should be created during sign-up flow
                    UserType = UserType.Client,
                    Status = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<AuthUser>().AddAsync(authUser);
                await _unitOfWork.SaveChangesAsync();
            }

            var refreshEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                AuthUserId = authUserGuid,
                Token = refreshTokenString,
                ExpiresAt = refreshExpiresAt,
                Revoked = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<RefreshToken>().AddAsync(refreshEntity);
            await _unitOfWork.SaveChangesAsync();
        }

        var response = new AuthResponseDto
        {
            Token = tokenString,
            ExpiresAt = expiresAt,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            RefreshToken = refreshTokenString,
            RefreshExpiresAt = refreshExpiresAt,
            Message = "Authentication successful"
        };

        return response;
    }
}
