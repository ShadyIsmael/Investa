using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/contracts")]
public class InvestmentContractsController : BaseApiController
{
    private readonly IInvestmentContractService _service;
    public InvestmentContractsController(IInvestmentContractService service) => _service = service;

    [HttpGet("{contractId:int}")]
    public async Task<IActionResult> Get(int contractId, CancellationToken cancellationToken) => await ExecuteAsync(id => _service.GetContractAsync(id, contractId, cancellationToken));

    [HttpGet("{contractId:int}/versions/{versionNumber:int}")]
    public async Task<IActionResult> GetVersion(int contractId, int versionNumber, CancellationToken cancellationToken) => await ExecuteAsync(id => _service.GetVersionAsync(id, contractId, versionNumber, cancellationToken));

    [HttpGet("{contractId:int}/versions/{versionNumber:int}/document")]
    public async Task<IActionResult> GetDocument(int contractId, int versionNumber, CancellationToken cancellationToken) => await ExecuteAsync(id => _service.GetDocumentAsync(id, contractId, versionNumber, cancellationToken));

    [HttpGet("{contractId:int}/versions/{versionNumber:int}/preview")]
    public async Task<IActionResult> Preview(int contractId, int versionNumber, CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try
        {
            var document = await _service.GetDocumentAsync(userId.Value, contractId, versionNumber, cancellationToken);
            return Content(document.Content, "text/html; charset=utf-8");
        }
        catch (BusinessValidationException ex) { return ContractError(ex); }
    }

    [HttpGet("{contractId:int}/versions/{versionNumber:int}/pdf")]
    public async Task<IActionResult> Pdf(int contractId, int versionNumber, CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try
        {
            var pdf = await _service.GetPdfAsync(userId.Value, contractId, versionNumber, cancellationToken);
            return File(pdf.Content, pdf.ContentType, pdf.FileName);
        }
        catch (BusinessValidationException ex) { return ContractError(ex); }
    }

    private async Task<IActionResult> ExecuteAsync<T>(Func<Guid, Task<T>> action)
    {
        var userId = ResolveUserId();
        if (userId == null) return ErrorResponse("Unable to resolve authenticated user", 401);
        try { return SuccessResponse(await action(userId.Value)); }
        catch (BusinessValidationException ex)
        {
            return ContractError(ex);
        }
    }

    private Guid? ResolveUserId()
    {
        var claim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        return Guid.TryParse(claim, out var userId) ? userId : null;
    }

    private IActionResult ContractError(BusinessValidationException ex)
    {
        var status = ex.Code.Contains("NOT_FOUND", StringComparison.Ordinal) ? 404 : ex.Code == "CONTRACT_ACCESS_DENIED" ? 403 : ex.Code == "PDF_GENERATING" ? 409 : 400;
        return ErrorResponse(ex.Message, status);
    }
}
