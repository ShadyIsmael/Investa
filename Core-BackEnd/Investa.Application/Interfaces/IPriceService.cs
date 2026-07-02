using Investa.Application.DTOs;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Interfaces;

public interface IPriceService
{
    Task<ServicePriceDto> GetPriceAsync(PricingService serviceCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServicePriceDto>> GetAllPricesAsync(CancellationToken cancellationToken = default);
    Task<ServicePriceDto> UpdatePriceAsync(PricingService serviceCode, UpdateServicePriceRequest request, CancellationToken cancellationToken = default);
    Task<ServicePriceDto> EnablePriceAsync(PricingService serviceCode, CancellationToken cancellationToken = default);
    Task<ServicePriceDto> DisablePriceAsync(PricingService serviceCode, CancellationToken cancellationToken = default);
}
