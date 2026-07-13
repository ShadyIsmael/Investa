using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/opportunity-join-requests")]
public class OpportunityJoinRequestsController : BaseApiController
{
    private readonly IOpportunityService _opportunityService;

    public OpportunityJoinRequestsController(IOpportunityService opportunityService)
    {
        _opportunityService = opportunityService;
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<FounderIncomingJoinRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var joinRequest = await _opportunityService.GetIncomingJoinRequestAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(joinRequest);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityJoinRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var joinRequest = await _opportunityService.CancelJoinRequestAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(joinRequest, "Join request cancelled successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityJoinRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var joinRequest = await _opportunityService.ApproveJoinRequestAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(joinRequest, "Join request approved successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/reject")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityJoinRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectOpportunityJoinRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var joinRequest = await _opportunityService.RejectJoinRequestAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(joinRequest, "Join request rejected successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    private Guid? ResolveUserIdFromClaims()
    {
        var claimValue = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;

        return Guid.TryParse(claimValue, out var userId) ? userId : null;
    }

    private IActionResult ToBusinessError(BusinessValidationException ex)
    {
        var statusCode = ex.Code switch
        {
            "JOIN_REQUEST_NOT_FOUND" or "OPPORTUNITY_NOT_FOUND" => 404,
            "FOUNDER_ACCESS_REQUIRED" => 403,
            _ => 400
        };
        return ErrorResponse(ex.Message, statusCode);
    }
}
