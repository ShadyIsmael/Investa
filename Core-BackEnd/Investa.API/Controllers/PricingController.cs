using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/v1/pricing")]
public class PricingController : BaseApiController
{
    private readonly IPriceService _priceService;

    public PricingController(IPriceService priceService)
    {
        _priceService = priceService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ServicePriceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var prices = await _priceService.GetAllPricesAsync(cancellationToken);
        return SuccessResponse(prices);
    }

    [HttpGet("{serviceCode}")]
    [ProducesResponseType(typeof(ApiResponse<ServicePriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(string serviceCode, CancellationToken cancellationToken)
    {
        if (!TryParseServiceCode(serviceCode, out var parsed, out var error))
            return ErrorResponse(error, 400);

        try
        {
            var price = await _priceService.GetPriceAsync(parsed, cancellationToken);
            return SuccessResponse(price);
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    [HttpPut("{serviceCode}")]
    [ProducesResponseType(typeof(ApiResponse<ServicePriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        string serviceCode,
        [FromBody] UpdateServicePriceRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        if (!TryParseServiceCode(serviceCode, out var parsed, out var error))
            return ErrorResponse(error, 400);

        try
        {
            var price = await _priceService.UpdatePriceAsync(parsed, request, cancellationToken);
            return SuccessResponse(price, "Price updated successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    [HttpPatch("{serviceCode}/enable")]
    [ProducesResponseType(typeof(ApiResponse<ServicePriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Enable(string serviceCode, CancellationToken cancellationToken)
    {
        if (!TryParseServiceCode(serviceCode, out var parsed, out var error))
            return ErrorResponse(error, 400);

        try
        {
            var price = await _priceService.EnablePriceAsync(parsed, cancellationToken);
            return SuccessResponse(price, "Price enabled successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    [HttpPatch("{serviceCode}/disable")]
    [ProducesResponseType(typeof(ApiResponse<ServicePriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Disable(string serviceCode, CancellationToken cancellationToken)
    {
        if (!TryParseServiceCode(serviceCode, out var parsed, out var error))
            return ErrorResponse(error, 400);

        try
        {
            var price = await _priceService.DisablePriceAsync(parsed, cancellationToken);
            return SuccessResponse(price, "Price disabled successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    private static bool TryParseServiceCode(string serviceCode, out PricingService parsed, out string error)
    {
        if (Enum.TryParse(serviceCode, ignoreCase: true, out parsed) && Enum.IsDefined(parsed))
        {
            error = string.Empty;
            return true;
        }

        error = $"Unknown pricing service code: {serviceCode}.";
        return false;
    }
}
