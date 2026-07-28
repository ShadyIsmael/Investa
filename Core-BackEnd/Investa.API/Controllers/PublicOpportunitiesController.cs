using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[AllowAnonymous]
[Route("api/v1/public/opportunities")]
public class PublicOpportunitiesController : BaseApiController
{
    private readonly IOpportunityService _opportunityService;

    public PublicOpportunitiesController(IOpportunityService opportunityService)
    {
        _opportunityService = opportunityService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] OpportunityDiscoveryQuery query, CancellationToken cancellationToken)
    {
        var opportunities = await _opportunityService.GetPublicAsync(query, ResolveUserIdFromClaims(), cancellationToken);
        return SuccessResponse(opportunities);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        try
        {
            var opportunity = await _opportunityService.GetPublicByIdAsync(id, ResolveUserIdFromClaims(), cancellationToken);
            return SuccessResponse(opportunity);
        }
        catch (BusinessValidationException ex)
        {
            var statusCode = ex.Code == "OPPORTUNITY_NOT_FOUND" ? 404 : 400;
            return ErrorResponse(ex.Message, statusCode);
        }
    }

    [HttpGet("{id:int}/project-activity")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectActivityPageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectActivity(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return SuccessResponse(await _opportunityService.GetPublicProjectActivityAsync(id, page, pageSize, cancellationToken));
        }
        catch (BusinessValidationException ex)
        {
            var statusCode = ex.Code == "OPPORTUNITY_NOT_FOUND" ? 404 : 400;
            return ErrorResponse(ex.Message, statusCode);
        }
    }

    private Guid? ResolveUserIdFromClaims()
    {
        var claimValue = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        return Guid.TryParse(claimValue, out var userId) ? userId : null;
    }
}
