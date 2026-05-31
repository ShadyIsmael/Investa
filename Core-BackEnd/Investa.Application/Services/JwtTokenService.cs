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

    public JwtTokenService(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
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
        string? groupName = null;
        int? groupId = null;

        // Use explicit Identity roles when available
        var explicitRoles = identityRoles?.Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? new List<string>();

        if (explicitRoles.Any())
        {
            if (explicitRoles.Contains("Admin", StringComparer.OrdinalIgnoreCase))
            {
                roleClaimValue = "Admin";
            }
            else if (explicitRoles.Contains(nameof(UserRoles.OrgUser), StringComparer.OrdinalIgnoreCase))
            {
                roleClaimValue = UserRoles.OrgUser.ToString();
            }
            else if (explicitRoles.Contains(nameof(UserRoles.Client), StringComparer.OrdinalIgnoreCase))
            {
                roleClaimValue = UserRoles.Client.ToString();
            }
            else
            {
                roleClaimValue = explicitRoles.First();
            }

            userTypeValue = roleClaimValue;
        }

        var roleNames = new List<string>(explicitRoles);

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
                    roleClaimValue = UserRoles.OrgUser.ToString();
                    userTypeValue = UserRoles.OrgUser.ToString();
                }
                else // UserType.Client
                {
                    roleClaimValue = UserRoles.Client.ToString();
                    userTypeValue = UserRoles.Client.ToString();
                }
            }
            
            // Fetch role from UserRoles -> Roles -> Group (Group-Bound Role Architecture)
            try
            {
                var userRole = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                    .FindAsync(ur => ur.UserId == userGuid))
                    .FirstOrDefault();
                    
                if (userRole != null)
                {
                    var role = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.Role>()
                        .FindAsync(r => r.Id == userRole.RoleId && r.IsActive))
                        .FirstOrDefault();
                        
                    if (role != null)
                    {
                        if (!roleNames.Contains(role.Name, StringComparer.OrdinalIgnoreCase))
                        {
                            roleNames.Add(role.Name);
                        }

                        if (!explicitRoles.Any())
                        {
                            roleClaimValue = role.Name;
                            userTypeValue = role.Name;
                        }

                        groupId = role.GroupId;
                        
                        var group = (await _unitOfWork.Repository<Group>()
                            .FindAsync(g => g.Id == role.GroupId))
                            .FirstOrDefault();
                            
                        if (group != null)
                            groupName = group.Name;
                    }
                }
            }
            catch
            {
                // Swallow errors to avoid blocking token generation
            }
        }

        if (!roleNames.Any())
            roleNames.Add(roleClaimValue);

        var distinctRoleNames = roleNames.Distinct(StringComparer.OrdinalIgnoreCase).ToList();

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

        foreach (var roleName in distinctRoleNames)
        {
            claims.Add(new Claim(ClaimTypes.Role, roleName));
            claims.Add(new Claim("role", roleName));
        }
        
        if (groupId.HasValue)
            claims.Add(new Claim("group_id", groupId.Value.ToString()));
        
        if (!string.IsNullOrEmpty(groupName))
            claims.Add(new Claim("group", groupName));

        if (string.Equals(roleClaimValue, "Admin", StringComparison.OrdinalIgnoreCase))
            claims.Add(new Claim("permission", SystemPermissions.SuperAccess));

        // Add group and permission claims from UserGroups + UserRoles
        if (authUser != null)
        {
            try
            {
                var userGroups = (await _unitOfWork.Repository<UserGroup>().FindAsync(ug => ug.UserId == authUser.Id)).ToList();
                if (userGroups.Any())
                {
                    var groupIds = userGroups.Select(ug => ug.GroupId).Distinct().ToList();
                    var groups = (await _unitOfWork.Repository<Group>().FindAsync(g => groupIds.Contains(g.Id))).ToList();
                    foreach (var g in groups)
                    {
                        if (string.IsNullOrEmpty(groupName) || g.Name != groupName)
                            claims.Add(new Claim("group", g.Name));
                    }

                    var groupPerms = (await _unitOfWork.Repository<GroupPermission>().FindAsync(gp => groupIds.Contains(gp.GroupId))).ToList();
                    var permissionIds = groupPerms.Select(gp => gp.PermissionId).Distinct().ToList();
                    var perms = (await _unitOfWork.Repository<Permission>().FindAsync(p => permissionIds.Contains(p.Id))).ToList();
                    foreach (var p in perms.DistinctBy(x => x.Key))
                        claims.Add(new Claim("permission", p.Key));
                }
                
                // Permissions from RolePermissions (Group-Bound Role Architecture)
                if (userGuid != Guid.Empty)
                {
                    var userRole = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.UserRole>()
                        .FindAsync(ur => ur.UserId == userGuid))
                        .FirstOrDefault();
                        
                    if (userRole != null)
                    {
                        var rolePerms = (await _unitOfWork.Repository<Investa.Domain.Entities.Security.RolePermission>()
                            .FindAsync(rp => rp.RoleId == userRole.RoleId))
                            .ToList();
                            
                        if (rolePerms.Any())
                        {
                            var permIds = rolePerms.Select(rp => rp.PermissionId).Distinct().ToList();
                            var permissions = (await _unitOfWork.Repository<Permission>().FindAsync(p => permIds.Contains(p.Id))).ToList();
                            foreach (var perm in permissions.DistinctBy(x => x.Key))
                            {
                                if (!claims.Any(c => c.Type == "permission" && c.Value == perm.Key))
                                    claims.Add(new Claim("permission", perm.Key));
                            }
                        }
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
