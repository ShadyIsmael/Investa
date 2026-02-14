using Investa.Application.DTOs.Requests;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/investment-requests")]
[Authorize]
public class InvestmentRequestsController : ControllerBase
{
    private readonly IInvestmentRequestService _investmentRequestService;
    private readonly ILogger<InvestmentRequestsController> _logger;

    public InvestmentRequestsController(IInvestmentRequestService investmentRequestService, ILogger<InvestmentRequestsController> logger)
    {
        _investmentRequestService = investmentRequestService;
        _logger = logger;
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
                new { message = "Failed to create investment request", error = ex.Message });
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
                new { message = "Failed to fetch investment requests", error = ex.Message });
        }
    }
}
