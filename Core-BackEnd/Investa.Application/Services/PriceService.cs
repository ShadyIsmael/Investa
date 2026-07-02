using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public class PriceService : IPriceService
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<PriceService> _logger;

    public PriceService(IUnitOfWork uow, ILogger<PriceService> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    public async Task<ServicePriceDto> GetPriceAsync(PricingService serviceCode, CancellationToken cancellationToken = default)
    {
        var price = await GetActivePriceEntityAsync(serviceCode);
        return ToDto(price);
    }

    public async Task<IReadOnlyList<ServicePriceDto>> GetAllPricesAsync(CancellationToken cancellationToken = default)
    {
        var prices = await _uow.Repository<ServicePrice>().FindAsync(p => p.IsActive);
        return prices
            .OrderBy(p => p.Id)
            .Select(ToDto)
            .ToList();
    }

    public async Task<ServicePriceDto> UpdatePriceAsync(
        PricingService serviceCode,
        UpdateServicePriceRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Price < 0)
            throw new BusinessValidationException("INVALID_PRICE", "Price must be zero or greater.");

        var price = await GetAnyPriceEntityAsync(serviceCode);
        price.Price = request.Price;

        if (!string.IsNullOrWhiteSpace(request.ServiceName))
            price.ServiceName = request.ServiceName.Trim();

        if (request.Description != null)
            price.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        if (!string.IsNullOrWhiteSpace(request.Currency))
            price.Currency = request.Currency.Trim();

        price.UpdatedAt = DateTime.UtcNow;

        await _uow.Repository<ServicePrice>().UpdateAsync(price);
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Price Updated. ServiceCode={ServiceCode} Price={Price} Currency={Currency}",
            price.ServiceCode,
            price.Price,
            price.Currency);

        return ToDto(price);
    }

    public async Task<ServicePriceDto> EnablePriceAsync(PricingService serviceCode, CancellationToken cancellationToken = default)
    {
        var price = await GetAnyPriceEntityAsync(serviceCode);
        price.IsActive = true;
        price.UpdatedAt = DateTime.UtcNow;

        await _uow.Repository<ServicePrice>().UpdateAsync(price);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Price Enabled. ServiceCode={ServiceCode}", price.ServiceCode);
        return ToDto(price);
    }

    public async Task<ServicePriceDto> DisablePriceAsync(PricingService serviceCode, CancellationToken cancellationToken = default)
    {
        var price = await GetAnyPriceEntityAsync(serviceCode);
        price.IsActive = false;
        price.UpdatedAt = DateTime.UtcNow;

        await _uow.Repository<ServicePrice>().UpdateAsync(price);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Price Disabled. ServiceCode={ServiceCode}", price.ServiceCode);
        return ToDto(price);
    }

    private async Task<ServicePrice> GetActivePriceEntityAsync(PricingService serviceCode)
    {
        var code = serviceCode.ToString();
        var price = (await _uow.Repository<ServicePrice>()
            .FindAsync(p => p.ServiceCode == code && p.IsActive))
            .FirstOrDefault();

        if (price == null)
            throw new BusinessValidationException("PRICE_NOT_AVAILABLE", $"Price for service {code} is not available.");

        return price;
    }

    private async Task<ServicePrice> GetAnyPriceEntityAsync(PricingService serviceCode)
    {
        var code = serviceCode.ToString();
        var matches = (await _uow.Repository<ServicePrice>()
            .FindAsync(p => p.ServiceCode == code))
            .ToList();

        if (matches.Count == 0)
            throw new BusinessValidationException("UNKNOWN_SERVICE_CODE", $"Unknown pricing service code: {code}.");

        if (matches.Count > 1)
            throw new BusinessValidationException("DUPLICATE_SERVICE_CODE", $"Duplicate pricing service code: {code}.");

        return matches[0];
    }

    private static ServicePriceDto ToDto(ServicePrice price) => new()
    {
        Id = price.Id,
        ServiceCode = price.ServiceCode,
        ServiceName = price.ServiceName,
        Description = price.Description,
        Price = price.Price,
        Currency = price.Currency,
        IsActive = price.IsActive,
        CreatedAt = price.CreatedAt,
        UpdatedAt = price.UpdatedAt
    };
}
