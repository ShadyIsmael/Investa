using Investa.Application.DTOs.Requests;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/investment-requests")]
[Authorize]
public class InvestmentRequestsController : ControllerBase
{
    private readonly IInvestmentRequestService _investmentRequestService;
    private readonly ILogger<InvestmentRequestsController> _logger;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public InvestmentRequestsController(IInvestmentRequestService investmentRequestService, ILogger<InvestmentRequestsController> logger, IStringLocalizer<SharedResource> localizer)
    {
        _investmentRequestService = investmentRequestService;
        _logger = logger;
        _localizer = localizer;
    }

    /// <summary>
    /// Creates an investment request after validating user credits.
    /// Stores request for both investor (outgoing) and founder (incoming), and notifies founder.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateInvestmentRequestResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateInvestmentRequest([FromBody] CreateInvestmentRequestDto dto)
    {
        try
        {
            _logger.LogInformation("CreateInvestmentRequest called with investmentId={InvestmentId}, amount={Amount}, shares={Shares}",
                dto.InvestmentId, dto.Amount, dto.Shares);

            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to identify user from token");
                return Unauthorized("Unable to identify user from token");
            }

            _logger.LogInformation("User authenticated: {UserId}", userId);

            var result = await _investmentRequestService.CreateInvestmentRequestAsync(userId, dto);
            
            _logger.LogInformation("Investment request created successfully for user {UserId}", userId);
            // Return compatible payload: { request: ..., updatedCreditBalance: ... }
            return Ok(new { request = result.Request, updatedCreditBalance = result.UpdatedCreditBalance });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation error: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating investment request");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = _localizer["FailedToCreateInvestmentRequest"].Value, error = ex.Message });
        }
    }

    /// <summary>
    /// Gets all investment requests for the authenticated user.
    /// Returns incoming requests (where user is the receiver/founder) and outgoing requests (where user is the sender/investor).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GetMyRequestsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMyRequests()
    {
        try
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to identify user from token");
                return Unauthorized("Unable to identify user from token");
            }

            _logger.LogInformation("Fetching requests for user {UserId}", userId);

            var result = await _investmentRequestService.GetMyRequestsAsync(userId);
            
            _logger.LogInformation("Retrieved {IncomingCount} incoming and {OutgoingCount} outgoing requests for user {UserId}",
                result.Incoming.Count, result.Outgoing.Count, userId);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching investment requests");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = _localizer["FailedToFetchInvestmentRequests"].Value, error = ex.Message });
        }
    }

    /// <summary>
    /// Approves an investment request (founder only)
    /// </summary>
    [HttpPost("{requestId}/approve")]
    [ProducesResponseType(typeof(InvestmentRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ApproveInvestmentRequest(int requestId)
    {
        try
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to identify user from token");
                return Unauthorized("Unable to identify user from token");
            }

            _logger.LogInformation("Approving investment request {RequestId} by user {UserId}", requestId, userId);

            var result = await _investmentRequestService.ApproveInvestmentRequestAsync(requestId, userId);
            
            _logger.LogInformation("Investment request {RequestId} approved successfully by user {UserId}", requestId, userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized approval attempt for request {RequestId}", requestId);
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation approving request {RequestId}", requestId);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error approving investment request {RequestId}", requestId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = _localizer["FailedToApproveInvestmentRequest"].Value, error = ex.Message });
        }
    }

    /// <summary>
    /// Rejects an investment request (founder only)
    /// </summary>
    [HttpPost("{requestId}/reject")]
    [ProducesResponseType(typeof(InvestmentRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RejectInvestmentRequest(int requestId)
    {
        try
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to identify user from token");
                return Unauthorized("Unable to identify user from token");
            }

            _logger.LogInformation("Rejecting investment request {RequestId} by user {UserId}", requestId, userId);

            var result = await _investmentRequestService.RejectInvestmentRequestAsync(requestId, userId);
            
            _logger.LogInformation("Investment request {RequestId} rejected successfully by user {UserId}", requestId, userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized rejection attempt for request {RequestId}", requestId);
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation rejecting request {RequestId}", requestId);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error rejecting investment request {RequestId}", requestId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = _localizer["FailedToRejectInvestmentRequest"].Value, error = ex.Message });
        }
    }
}
