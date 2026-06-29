using Investa.Application.DTOs.Trust;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

/// <summary>
/// Manages Reputation Rules CRUD operations.
/// </summary>
[Authorize(Roles = "Admin")]
[Route("api/v1/reputation")]
public class ReputationController : BaseApiController
{
    private readonly IReputationService _reputationService;

    public ReputationController(IReputationService reputationService)
    {
        _reputationService = reputationService;
    }

    /// <summary>Returns all reputation rules ordered by SortOrder.</summary>
    [HttpGet("rules")]
    [ProducesResponseType(typeof(ApiResponse<List<ReputationRuleDto>>), 200)]
    public async Task<IActionResult> GetRules([FromQuery] bool includeDisabled = false)
    {
        var rules = await _reputationService.GetRulesAsync(includeDisabled);
        return SuccessResponse(rules);
    }

    /// <summary>Returns a single reputation rule by id.</summary>
    [HttpGet("rules/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ReputationRuleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetRule(int id)
    {
        var rule = await _reputationService.GetRuleByIdAsync(id);
        if (rule == null)
            return NotFound();

        return SuccessResponse(rule);
    }

    /// <summary>Creates a new reputation rule.</summary>
    [HttpPost("rules")]
    [ProducesResponseType(typeof(ApiResponse<ReputationRuleDto>), 201)]
    public async Task<IActionResult> CreateRule([FromBody] CreateReputationRuleRequest request)
    {
        try
        {
            var rule = await _reputationService.CreateRuleAsync(request);
            return CreatedAtAction(nameof(GetRule), new { id = rule.Id }, SuccessResponse(rule));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    /// <summary>Updates an existing reputation rule. RuleCode and IsSystem are immutable.</summary>
    [HttpPut("rules/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ReputationRuleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateRule(int id, [FromBody] UpdateReputationRuleRequest request)
    {
        try
        {
            var rule = await _reputationService.UpdateRuleAsync(id, request);
            return SuccessResponse(rule);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    /// <summary>Toggles the IsEnabled status of a reputation rule.</summary>
    [HttpPatch("rules/{id:int}/toggle")]
    [ProducesResponseType(typeof(ApiResponse<ReputationRuleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ToggleRule(int id)
    {
        try
        {
            var rule = await _reputationService.ToggleRuleAsync(id);
            return SuccessResponse(rule);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}