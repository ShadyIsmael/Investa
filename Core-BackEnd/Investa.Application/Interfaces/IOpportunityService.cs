using Investa.Application.DTOs;
using Investa.Application.DTOs.Users;

namespace Investa.Application.Interfaces;

public interface IOpportunityService
{
    Task<OpportunityDetailDto> CreateAsync(Guid founderId, CreateOpportunityRequest request, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> UpdateAsync(Guid founderId, int id, UpdateOpportunityRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDto>> GetMyAsync(Guid founderId, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> GetFounderOpportunityAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<OpportunityMediaDto> AddMediaAsync(Guid founderId, int id, CreateOpportunityMediaRequest request, CancellationToken cancellationToken = default);
    Task<OpportunityDocumentDto> AddDocumentAsync(Guid founderId, int id, CreateOpportunityDocumentRequest request, CancellationToken cancellationToken = default);
    Task<OpportunityEventDto> AddEventAsync(Guid founderId, int id, CreateOpportunityEventRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityEventDto>> GetEventsAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDocumentDto>> GetDocumentsAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityMediaDto>> GetMediaAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDto>> GetPublicAsync(OpportunityDiscoveryQuery query, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> GetPublicByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> SubmitForReviewAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<PagedResultDto<AdminOpportunityListItemDto>> GetAdminOpportunitiesAsync(AdminOpportunityListQuery query, CancellationToken cancellationToken = default);
    Task<AdminOpportunityDetailDto> GetAdminOpportunityAsync(int id, CancellationToken cancellationToken = default);
    Task<AdminOpportunityDetailDto> ApproveAsync(Guid reviewerId, int id, CancellationToken cancellationToken = default);
    Task<AdminOpportunityDetailDto> RejectAsync(Guid reviewerId, int id, RejectOpportunityRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityLookupDto>> GetOpportunityCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityLookupDto>> GetOpportunityTagsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityLookupDto>> GetFundingGoalsAsync(CancellationToken cancellationToken = default);
    Task<OpportunityJoinRequestDto> CreateJoinRequestAsync(Guid investorId, int opportunityId, CreateOpportunityJoinRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityJoinRequestDto>> GetMyJoinRequestsAsync(Guid investorId, OpportunityJoinRequestQuery query, CancellationToken cancellationToken = default);
    Task<OpportunityJoinRequestDto> CancelJoinRequestAsync(Guid investorId, int requestId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityJoinRequestDto>> GetOpportunityJoinRequestsAsync(Guid founderId, int opportunityId, CancellationToken cancellationToken = default);
    Task<OpportunityJoinRequestDto> ApproveJoinRequestAsync(Guid founderId, int requestId, CancellationToken cancellationToken = default);
    Task<OpportunityJoinRequestDto> RejectJoinRequestAsync(Guid founderId, int requestId, RejectOpportunityJoinRequest request, CancellationToken cancellationToken = default);
}
