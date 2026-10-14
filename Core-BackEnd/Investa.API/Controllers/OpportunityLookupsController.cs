using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[AllowAnonymous]
[Route("api/v1/lookups")]
public class OpportunityLookupsController : BaseApiController
{
    private readonly IOpportunityService _opportunityService;

    public OpportunityLookupsController(IOpportunityService opportunityService)
    {
        _opportunityService = opportunityService;
    }

    [HttpGet("opportunity-tags")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityLookupDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpportunityTags(CancellationToken cancellationToken)
    {
        var tags = await _opportunityService.GetOpportunityTagsAsync(cancellationToken);
        return SuccessResponse(tags);
    }

}
