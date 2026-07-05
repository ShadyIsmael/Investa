using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1")]
public class NegotiationsController : BaseApiController
{
    private readonly INegotiationService _negotiationService;

    public NegotiationsController(INegotiationService negotiationService)
    {
        _negotiationService = negotiationService;
    }

    [HttpGet("opportunities/{id:int}/viewer-state")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityViewerStateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpportunityViewerState(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var state = await _negotiationService.GetOpportunityViewerStateAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(state);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("opportunities/{id:int}/conversations")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationRequestDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> RequestConversation(int id, [FromBody] CreateNegotiationConversationRequest request, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var conversationRequest = await _negotiationService.RequestConversationAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(conversationRequest, "Conversation request sent successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("conversation-requests")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<NegotiationConversationRequestDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyConversationRequests(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var requests = await _negotiationService.GetMyConversationRequestsAsync(userId.Value, cancellationToken);
            return SuccessResponse(requests);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("conversations")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<NegotiationConversationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyConversations(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var conversations = await _negotiationService.GetMyConversationsAsync(userId.Value, cancellationToken);
            return SuccessResponse(conversations);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("conversations/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConversation(Guid id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var conversation = await _negotiationService.GetConversationAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(conversation);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("conversations/{id:guid}/messages")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<NegotiationMessageDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMessages(Guid id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var messages = await _negotiationService.GetMessagesAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(messages);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("conversations/{id:guid}/messages")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationMessageDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendNegotiationMessageRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var message = await _negotiationService.SendMessageAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(message, "Message sent successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("conversation-requests/{id:guid}/accept")]
    [HttpPost("conversations/{id:guid}/accept")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Accept(Guid id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var request = await _negotiationService.AcceptConversationRequestAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(request, "Conversation request accepted successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("conversation-requests/{id:guid}/reject")]
    [HttpPost("conversations/{id:guid}/reject")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectNegotiationRequest request, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var conversationRequest = await _negotiationService.RejectConversationRequestAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(conversationRequest, "Conversation request rejected successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("conversation-requests/{id:guid}/withdraw")]
    [HttpPost("conversations/{id:guid}/withdraw")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Withdraw(Guid id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var request = await _negotiationService.WithdrawConversationRequestAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(request, "Conversation request withdrawn successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("conversations/{id:guid}/close")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Close(Guid id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var conversation = await _negotiationService.CloseConversationAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(conversation, "Conversation closed successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("conversations/{id:guid}/ready-to-proceed")]
    [ProducesResponseType(typeof(ApiResponse<NegotiationConversationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReadyToProceed(Guid id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var conversation = await _negotiationService.MarkReadyToProceedAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(conversation, "Ready to Proceed saved successfully");
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
        var statusCode = ex.Code switch
        {
            "CONVERSATION_NOT_FOUND" or "CONVERSATION_REQUEST_NOT_FOUND" or "OPPORTUNITY_NOT_FOUND" => 404,
            "CONVERSATION_FORBIDDEN" => 403,
            "CLIENT_REQUIRED" or "USER_REQUIRED" => 401,
            _ => 400
        };

        return ErrorResponse(ex.Message, statusCode);
    }
}
