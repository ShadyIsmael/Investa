using System.Security.Claims;
using Investa.API.Controllers;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.DTOs.Users;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[Authorize(Roles = "Admin,Reviewer")]
[Route("api/v1/admin/opportunities")]
public class OpportunitiesAdminController : BaseApiController
{
    private readonly IOpportunityService _opportunityService;

    public OpportunitiesAdminController(IOpportunityService opportunityService)
    {
        _opportunityService = opportunityService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResultDto<AdminOpportunityListItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] AdminOpportunityListQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var opportunities = await _opportunityService.GetAdminOpportunitiesAsync(query, cancellationToken);
            return SuccessResponse(opportunities);
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<AdminOpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        try
        {
            var opportunity = await _opportunityService.GetAdminOpportunityAsync(id, cancellationToken);
            return SuccessResponse(opportunity);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(typeof(ApiResponse<AdminOpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var reviewerId = ResolveUserIdFromClaims();
        if (reviewerId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.ApproveAsync(reviewerId.Value, id, cancellationToken);
            return SuccessResponse(opportunity, "Opportunity approved successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/reject")]
    [ProducesResponseType(typeof(ApiResponse<AdminOpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectOpportunityRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var reviewerId = ResolveUserIdFromClaims();
        if (reviewerId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.RejectAsync(reviewerId.Value, id, request, cancellationToken);
            return SuccessResponse(opportunity, "Opportunity rejected successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    private Guid? ResolveUserIdFromClaims()
    {
        var claimValue = User.FindFirst("sub")?.Value
                         ?? User.FindFirst("id")?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(claimValue, out var userId) ? userId : null;
    }

    private IActionResult ToBusinessError(BusinessValidationException ex)
    {
        var statusCode = ex.Code == "OPPORTUNITY_NOT_FOUND" ? 404 : 400;
        return ErrorResponse(ex.Message, statusCode);
    }
}
