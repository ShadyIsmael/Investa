using Investa.Application.DTOs.Requests;

namespace Investa.Application.Interfaces;

public interface IInvestmentRequestService
{
    Task<CreateInvestmentRequestResponseDto> CreateInvestmentRequestAsync(Guid investorId, CreateInvestmentRequestDto dto);
    Task<GetMyRequestsResponseDto> GetMyRequestsAsync(Guid userId);
}
