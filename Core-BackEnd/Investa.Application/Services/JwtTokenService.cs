using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Investa.Application.DTOs.Auth;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
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
    private readonly IEffectivePermissionService _effectivePermissionService;

    public JwtTokenService(
        IConfiguration configuration,
        IUnitOfWork unitOfWork,
        IEffectivePermissionService effectivePermissionService)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _effectivePermissionService = effectivePermissionService;
    }

    /// <inheritdoc/>
    public async Task<AuthResponseDto> GenerateTokenAsync(IdentityUser<Guid> user, IEnumerable<string>? identityRoles = null)
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

        // Default role and user type (use enums)
        var roleClaimValue = UserRoles.Client.ToString();
        var userTypeValue = UserRoles.Client.ToString();

        // Identity roles are authoritative for JWT role claims.
        var explicitRoles = identityRoles?
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? new List<string>();

        if (explicitRoles.Any())
        {
            // Set the primary roleClaimValue based on Identity roles.
            // Still add ALL identity roles below as ClaimTypes.Role and "role".
            roleClaimValue = explicitRoles.Contains("Admin", StringComparer.OrdinalIgnoreCase)
                ? "Admin"
                : explicitRoles.First();

            userTypeValue = roleClaimValue;
        }


        var roleNames = new HashSet<string>(explicitRoles, StringComparer.OrdinalIgnoreCase);
        var permissionKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var groupIds = new HashSet<int>();
        var groupNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Try to parse Identity user id as GUID and fetch auth user info
        AuthUser? authUser = null;
        var userGuid = user.Id;
        if (userGuid != Guid.Empty)
        {
            authUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == userGuid)).FirstOrDefault();
            if (authUser != null)
            {
                // Simplified two-type mapping: OrgUser or Client
                if (authUser.UserType == UserType.OrgUser)
                {
                        userTypeValue = UserRoles.OrgUser.ToString();
                        if (!explicitRoles.Any())
                        {
                            roleClaimValue = UserRoles.OrgUser.ToString();
                        }
                }
                else // UserType.Client
                {
                        userTypeValue = UserRoles.Client.ToString();
                        if (!explicitRoles.Any())
                        {
                            roleClaimValue = UserRoles.Client.ToString();
                        }
                }
            }
            if (authUser != null)
            {
                var effectivePermissions = await _effectivePermissionService.ResolveAsync(userGuid);
                roleNames.UnionWith(effectivePermissions.RoleNames);
                permissionKeys.UnionWith(effectivePermissions.PermissionKeys);
                groupIds.UnionWith(effectivePermissions.GroupIds);
                groupNames.UnionWith(effectivePermissions.GroupNames);
            }
        }

        if (!roleNames.Any())
            roleNames.Add(roleClaimValue);

        // Create claims with phone number as identifier
        var claims = new List<Claim>
        {
            new Claim("sub", user.Id.ToString()),
            new Claim("id", user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty),
            new Claim("phone_number", user.PhoneNumber ?? string.Empty),
            new Claim("userType", userTypeValue),
        };

        foreach (var roleName in roleNames)
        {
            claims.Add(new Claim(ClaimTypes.Role, roleName));
            claims.Add(new Claim("role", roleName));
        }
        
        foreach (var groupId in groupIds)
            claims.Add(new Claim("group_id", groupId.ToString()));

        foreach (var groupName in groupNames)
            claims.Add(new Claim("group", groupName));

        if (explicitRoles.Contains("Admin", StringComparer.OrdinalIgnoreCase))
            permissionKeys.Add(SystemPermissions.SuperAccess);

        foreach (var permissionKey in permissionKeys)
            claims.Add(new Claim("permission", permissionKey));

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

        // Use the Guid-based identity user id for linking to AuthUser
        var authUserGuid = user.Id;
        if (authUserGuid != Guid.Empty)
        {
            // Ensure an AuthUser exists for this identity id. If missing, create a minimal record so FK won't fail.
            var existingAuthUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == authUserGuid)).FirstOrDefault();
            if (existingAuthUser == null)
            {
                existingAuthUser = new AuthUser
                {
                    Id = authUserGuid,
                    Email = user.Email ?? (user.UserName + "@phone.investa.local"),
                    PasswordHash = "",
                    UserType = UserType.Client,
                    Status = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<AuthUser>().AddAsync(existingAuthUser);
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
