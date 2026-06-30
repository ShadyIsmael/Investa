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

    [HttpGet("opportunity-categories")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityLookupDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpportunityCategories(CancellationToken cancellationToken)
    {
        var categories = await _opportunityService.GetOpportunityCategoriesAsync(cancellationToken);
        return SuccessResponse(categories);
    }

    [HttpGet("opportunity-tags")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityLookupDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpportunityTags(CancellationToken cancellationToken)
    {
        var tags = await _opportunityService.GetOpportunityTagsAsync(cancellationToken);
        return SuccessResponse(tags);
    }

    [HttpGet("funding-goals")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityLookupDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFundingGoals(CancellationToken cancellationToken)
    {
        var goals = await _opportunityService.GetFundingGoalsAsync(cancellationToken);
        return SuccessResponse(goals);
    }
}
