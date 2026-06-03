using Investa.Application.Interfaces;
using Investa.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Authorization;

/// <summary>
/// Validates that the authenticated user's current trust level meets the policy requirement.
/// Reads the live trust level from the database (not from stale JWT claims).
/// </summary>
public class TrustLevelAuthorizationHandler
    : AuthorizationHandler<TrustLevelRequirement>
{
    private readonly IServiceScopeFactory _scopeFactory;

    public TrustLevelAuthorizationHandler(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TrustLevelRequirement requirement)
    {
        var userIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                       ?? context.User.FindFirst("sub")
                       ?? context.User.FindFirst("uid");

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            context.Fail();
            return;
        }

        using var scope = _scopeFactory.CreateScope();
        var trustService = scope.ServiceProvider.GetRequiredService<ITrustService>();

        try
        {
            var profile = await trustService.GetTrustProfileAsync(userId);
            if ((int)profile.TrustLevel >= (int)requirement.MinimumLevel)
                context.Succeed(requirement);
            else
                context.Fail(new AuthorizationFailureReason(
                    this,
                    $"Requires trust level {requirement.MinimumLevel} but user is at {profile.TrustLevel}"));
        }
        catch
        {
            context.Fail();
        }
    }
}
