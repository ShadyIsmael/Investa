using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/opportunities")]
public class OpportunitiesController : BaseApiController
{
    private readonly IOpportunityService _opportunityService;
    private readonly IInvestmentContractService _investmentContractService;

    public OpportunitiesController(IOpportunityService opportunityService, IInvestmentContractService investmentContractService)
    {
        _opportunityService = opportunityService;
        _investmentContractService = investmentContractService;
    }

    [HttpGet("{id:int}/contracts")]
    public async Task<IActionResult> GetContracts(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await _investmentContractService.GetOpportunityContractsAsync(userId.Value, id, cancellationToken)); }
        catch (BusinessValidationException ex)
        {
            var status = ex.Code == "OPPORTUNITY_NOT_FOUND" ? 404 : ex.Code == "CONTRACT_ACCESS_DENIED" ? 403 : 400;
            return ErrorResponse(ex.Message, status);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateOpportunityRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.CreateAsync(userId.Value, request, cancellationToken);
            return SuccessResponse(opportunity, "Opportunity created successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOpportunityRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.UpdateAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(opportunity, "Opportunity updated successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("my")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMy(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var opportunities = await _opportunityService.GetMyAsync(userId.Value, cancellationToken);
        return SuccessResponse(opportunities);
    }

    [HttpGet("my-participations")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<MyParticipationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyParticipations(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            return SuccessResponse(await _opportunityService.GetMyParticipationsAsync(userId.Value, cancellationToken));
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.GetFounderOpportunityAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(opportunity);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/room")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityRoomDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProjectRoom(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.GetProjectRoomAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(opportunity);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/publish")]
    [HttpPost("{id:int}/submit-review")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Publish(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunity = await _opportunityService.PublishAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(opportunity, "Opportunity published successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/join-requests")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityJoinRequestDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateJoinRequest(int id, [FromBody] CreateOpportunityJoinRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var joinRequest = await _opportunityService.CreateJoinRequestAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(joinRequest, "Join request created successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/participation-form")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityParticipationFormDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetParticipationForm(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var form = await _opportunityService.GetParticipationFormAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(form);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("my-join-requests")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityJoinRequestDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyJoinRequests([FromQuery] OpportunityJoinRequestQuery query, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var requests = await _opportunityService.GetMyJoinRequestsAsync(userId.Value, query, cancellationToken);
            return SuccessResponse(requests);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("incoming-join-requests")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FounderIncomingJoinRequestDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIncomingJoinRequests(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var requests = await _opportunityService.GetIncomingJoinRequestsAsync(userId.Value, cancellationToken);
            return SuccessResponse(requests);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/join-requests")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityJoinRequestDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpportunityJoinRequests(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var requests = await _opportunityService.GetOpportunityJoinRequestsAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(requests);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/media")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityMediaDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddMedia(int id, [FromBody] CreateOpportunityMediaRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var media = await _opportunityService.AddMediaAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(media, "Opportunity media added successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/documents")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDocumentDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddDocument(int id, [FromBody] CreateOpportunityDocumentRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var document = await _opportunityService.AddDocumentAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(document, "Opportunity document added successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/events")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityEventDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddEvent(int id, [FromBody] CreateOpportunityEventRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var opportunityEvent = await _opportunityService.AddEventAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(opportunityEvent, "Opportunity event added successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/events")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityEventDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEvents(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var events = await _opportunityService.GetEventsAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(events);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/documents")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityDocumentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocuments(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var documents = await _opportunityService.GetDocumentsAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(documents);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/media")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OpportunityMediaDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMedia(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var media = await _opportunityService.GetMediaAsync(userId.Value, id, cancellationToken);
            return SuccessResponse(media);
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
            "OPPORTUNITY_NOT_FOUND" => 404,
            "PROJECT_ROOM_FORBIDDEN" => 403,
            "FOUNDER_ACCESS_REQUIRED" => 403,
            _ => 400
        };
        return ErrorResponse(ex.Message, statusCode);
    }
}
