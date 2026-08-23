using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

/// <summary>
/// Exposes lightweight platform feature flags consumed by the client portals.
/// </summary>
[Route("api/v1/config")]
public class ConfigController : BaseApiController
{
    private readonly IClientInteractionChargingPolicy _chargingPolicy;

    public ConfigController(IClientInteractionChargingPolicy chargingPolicy)
    {
        _chargingPolicy = chargingPolicy;
    }

    [HttpGet("features")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<FeaturesDto>), StatusCodes.Status200OK)]
    public IActionResult GetFeatures()
    {
        return SuccessResponse(new FeaturesDto
        {
            ClientInteractionChargingEnabled = _chargingPolicy.IsEnabled
        });
    }
}

/// <summary>
/// Platform feature flags returned to client portals.
/// </summary>
public class FeaturesDto
{
    public bool ClientInteractionChargingEnabled { get; set; }
}
