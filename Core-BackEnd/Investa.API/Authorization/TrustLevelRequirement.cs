using Investa.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Authorization;

/// <summary>
/// Authorization requirement that enforces a minimum trust level.
/// Attach via [Authorize(Policy = "TrustLevel1")] etc.
/// </summary>
public class TrustLevelRequirement : IAuthorizationRequirement
{
    public TrustLevel MinimumLevel { get; }

    public TrustLevelRequirement(TrustLevel minimumLevel)
    {
        MinimumLevel = minimumLevel;
    }
}
