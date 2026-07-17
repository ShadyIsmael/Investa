using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using System;

namespace Investa.API.Authorization;

/// <summary>
/// Handles permission-based authorization by validating JWT claims and, when absent,
/// resolving permissions from the database via roles and group permissions.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IEffectivePermissionService _effectivePermissionService;

    public PermissionAuthorizationHandler(IEffectivePermissionService effectivePermissionService)
    {
        _effectivePermissionService = effectivePermissionService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1) Try permission claims from token first (fast path)
        var userPermissions = context.User
            .FindAll(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (PermissionMatches(userPermissions, requirement.Permission))
        {
            context.Succeed(requirement);
            return;
        }

        // Preserve the existing Identity Admin role's authoritative wildcard access,
        // including when evaluating a token issued before permission claims were added.
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return;
        }

        // 2) Fallback: resolve permissions from DB using user's id
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? context.User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            // No user id available to query DB -> cannot resolve further
            return;
        }

        var effectivePermissions = await _effectivePermissionService.ResolveAsync(userId);
        if (PermissionMatches(
                effectivePermissions.PermissionKeys.ToHashSet(StringComparer.OrdinalIgnoreCase),
                requirement.Permission))
        {
            context.Succeed(requirement);
        }
    }

    private static bool PermissionMatches(ISet<string> userPermissions, string required)
    {
        if (userPermissions.Contains(required)) return true;

        var parts = required.Split('.');
        if (parts.Length == 2)
        {
            var wildcard = $"{parts[0]}.*";
            if (userPermissions.Contains(wildcard)) return true;
        }

        if (userPermissions.Contains("*.*") || userPermissions.Contains("admin.*")) return true;

        return false;
    }
}
