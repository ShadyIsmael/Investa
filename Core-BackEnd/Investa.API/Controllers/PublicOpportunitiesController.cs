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
        var opportunities = await _opportunityService.GetPublicAsync(query, cancellationToken);
        return SuccessResponse(opportunities);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        try
        {
            var opportunity = await _opportunityService.GetPublicByIdAsync(id, cancellationToken);
            return SuccessResponse(opportunity);
        }
        catch (BusinessValidationException ex)
        {
            var statusCode = ex.Code == "OPPORTUNITY_NOT_FOUND" ? 404 : 400;
            return ErrorResponse(ex.Message, statusCode);
        }
    }
}
