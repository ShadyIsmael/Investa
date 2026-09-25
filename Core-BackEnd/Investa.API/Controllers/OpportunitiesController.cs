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
        try { return SuccessResponse(await _investmentContractService.GetOpportunityContractsAsync(userId.Value, id, cancellationToken, User.IsInRole("Admin") || User.IsInRole("Reviewer"))); }
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

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await _opportunityService.GetFavoriteOpportunitiesAsync(userId.Value, cancellationToken)); }
        catch (BusinessValidationException ex) { return ToBusinessError(ex); }
    }

    [HttpGet("{id:int}/favorite")]
    public async Task<IActionResult> GetFavoriteStatus(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(new { opportunityId = id, favorited = await _opportunityService.IsFavoriteAsync(userId.Value, id, cancellationToken) }); }
        catch (BusinessValidationException ex) { return ToBusinessError(ex); }
    }

    [HttpPut("{id:int}/favorite")]
    public async Task<IActionResult> SetFavorite(int id, [FromBody] SetOpportunityFavoriteRequest request, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(new { opportunityId = id, favorited = await _opportunityService.SetFavoriteAsync(userId.Value, id, request.Favorited, cancellationToken) }); }
        catch (BusinessValidationException ex) { return ToBusinessError(ex); }
    }

    [HttpGet("investor-cash-flow/summary")]
    public async Task<IActionResult> GetInvestorCashFlowSummary(CancellationToken cancellationToken) => await CashFlowResponse(id => _opportunityService.GetInvestorCashFlowSummaryAsync(id, cancellationToken));

    [HttpGet("investor-cash-flow/monthly")]
    public async Task<IActionResult> GetInvestorMonthlyCashFlow(CancellationToken cancellationToken) => await CashFlowResponse(id => _opportunityService.GetInvestorMonthlyCashFlowAsync(id, cancellationToken));

    [HttpGet("investor-cash-flow/upcoming")]
    public async Task<IActionResult> GetUpcomingPayments(CancellationToken cancellationToken) => await CashFlowResponse(id => _opportunityService.GetUpcomingPaymentsAsync(id, cancellationToken));

    [HttpGet("participations/{requestId:int}/payment-schedule")]
    public async Task<IActionResult> GetParticipationPaymentSchedule(int requestId, CancellationToken cancellationToken) => await CashFlowResponse(id => _opportunityService.GetParticipationPaymentScheduleAsync(id, requestId, cancellationToken));

    private async Task<IActionResult> CashFlowResponse<T>(Func<Guid, Task<T>> action)
    {
        var userId = ResolveUserIdFromClaims(); if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await action(userId.Value)); }
        catch (BusinessValidationException ex) { return ToBusinessError(ex); }
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
            var opportunity = await _opportunityService.GetFounderOpportunityAsync(
                userId.Value,
                id,
                cancellationToken,
                User.IsInRole("Admin") || User.IsInRole("Reviewer"));
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
    public async Task<IActionResult> GetOpportunityRoom(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            return SuccessResponse(await _opportunityService.GetOpportunityRoomAsync(userId.Value, id, cancellationToken, User.IsInRole("Admin") || User.IsInRole("Reviewer")));
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/approved-investors")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ApprovedInvestorDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetApprovedInvestors(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            return SuccessResponse(await _opportunityService.GetApprovedInvestorsAsync(userId.Value, id, cancellationToken, User.IsInRole("Admin") || User.IsInRole("Reviewer")));
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/payments")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<InvestorPaymentSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPayments(int id, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            return SuccessResponse(await _opportunityService.GetOpportunityPaymentsAsync(userId.Value, id, cancellationToken, User.IsInRole("Admin") || User.IsInRole("Reviewer")));
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/payments/investors/{investorId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<InvestorPaymentDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvestorPaymentDetails(int id, Guid investorId, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            return SuccessResponse(await _opportunityService.GetInvestorPaymentDetailsAsync(userId.Value, id, investorId, cancellationToken, User.IsInRole("Admin") || User.IsInRole("Reviewer")));
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/payments")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<PaymentTransactionDetailDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> RecordPayment(
        int id,
        [FromBody] RecordPaymentRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            request.IdempotencyKey = string.IsNullOrWhiteSpace(idempotencyKey) ? request.IdempotencyKey : idempotencyKey;
            var result = await _opportunityService.RecordPaymentAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(result, "Payment recorded successfully", 201);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/payments/reverse")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<PaymentTransactionDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReversePayment(int id, [FromBody] ReversePaymentRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var result = await _opportunityService.ReversePaymentAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(result, "Payment reversed successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpGet("{id:int}/payments/monthly-unpaid")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<MonthlyBulkConfirmPreviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonthlyUnpaidInstallments(int id, [FromQuery] int? year, [FromQuery] int? month, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var result = await _opportunityService.GetMonthlyUnpaidInstallmentsAsync(userId.Value, id, year, month, cancellationToken);
            return SuccessResponse(result);
        }
        catch (BusinessValidationException ex)
        {
            return ToBusinessError(ex);
        }
    }

    [HttpPost("{id:int}/payments/bulk-confirm-monthly")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<BulkConfirmMonthlyResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkConfirmMonthlyPayments(int id, [FromBody] BulkConfirmMonthlyRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var result = await _opportunityService.BulkConfirmMonthlyPaymentsAsync(userId.Value, id, request, cancellationToken);
            return SuccessResponse(result, "Monthly payments confirmed successfully");
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

    [HttpPost("{id:int}/funding-status")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TransitionFunding(int id, [FromBody] TransitionOpportunityFundingRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ErrorResponse("Invalid request", 400, ModelState);
        var userId = ResolveUserIdFromClaims();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await _opportunityService.TransitionFundingAsync(userId.Value, id, request, false, cancellationToken)); }
        catch (BusinessValidationException ex) { return ToBusinessError(ex); }
    }

    [HttpPost("{id:int}/milestones/{milestoneId:int}/complete")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityMilestoneDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteMilestone(int id, int milestoneId, CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        try
        {
            var milestone = await _opportunityService.CompleteMilestoneAsync(userId.Value, id, milestoneId, cancellationToken);
            return SuccessResponse(milestone, "Milestone completed successfully");
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
            "PROJECT_NOT_FOUND" => 404,
            "PROJECT_ROOM_FORBIDDEN" or "OPPORTUNITY_ROOM_FORBIDDEN" => 403,
            "FOUNDER_ACCESS_REQUIRED" => 403,
            "DUPLICATE_JOIN_REQUEST"
                or "CONCURRENCY_CONFLICT"
                or "PAYMENT_IDEMPOTENCY_CONFLICT"
                or "DUPLICATE_PAYMENT_REFERENCE"
                or "DUPLICATE_PAYMENT"
                or "PAYMENT_ALREADY_REVERSED"
                or "NO_UNPAID_INSTALLMENTS"
                or "INSTALLMENT_ALREADY_CONFIRMED" => 409,
            "PROJECT_ARCHIVED" => 409,
            _ => 400
        };
        return ErrorResponse(ex.Message, statusCode);
    }
}
