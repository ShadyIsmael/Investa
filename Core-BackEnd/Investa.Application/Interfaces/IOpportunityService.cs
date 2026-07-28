using Investa.Application.DTOs;
using Investa.Application.DTOs.Users;

namespace Investa.Application.Interfaces;

public interface IOpportunityService
{
    Task<OpportunityDetailDto> CreateAsync(Guid founderId, CreateOpportunityRequest request, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> UpdateAsync(Guid founderId, int id, UpdateOpportunityRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDto>> GetMyAsync(Guid founderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MyParticipationDto>> GetMyParticipationsAsync(Guid investorId, CancellationToken cancellationToken = default);
    Task<InvestorCashFlowSummaryDto> GetInvestorCashFlowSummaryAsync(Guid investorId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MonthlyCashFlowDto>> GetInvestorMonthlyCashFlowAsync(Guid investorId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExpectedPaymentScheduleItemDto>> GetUpcomingPaymentsAsync(Guid investorId, CancellationToken cancellationToken = default);
    Task<ParticipationPaymentScheduleDto> GetParticipationPaymentScheduleAsync(Guid investorId, int requestId, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> GetFounderOpportunityAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<OpportunityRoomDto> GetProjectRoomAsync(Guid userId, int id, CancellationToken cancellationToken = default);
    Task<OpportunityMediaDto> AddMediaAsync(Guid founderId, int id, CreateOpportunityMediaRequest request, CancellationToken cancellationToken = default);
    Task<OpportunityDocumentDto> AddDocumentAsync(Guid founderId, int id, CreateOpportunityDocumentRequest request, CancellationToken cancellationToken = default);
    Task<OpportunityEventDto> AddEventAsync(Guid founderId, int id, CreateOpportunityEventRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityEventDto>> GetEventsAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDocumentDto>> GetDocumentsAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityMediaDto>> GetMediaAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDto>> GetPublicAsync(OpportunityDiscoveryQuery query, Guid? currentUserId = null, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> GetPublicByIdAsync(int id, Guid? currentUserId = null, CancellationToken cancellationToken = default);
    Task<PublicProjectActivityPageDto> GetPublicProjectActivityAsync(int id, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OpportunityDto>> GetFavoriteOpportunitiesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> IsFavoriteAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default);
    Task<bool> SetFavoriteAsync(Guid userId, int opportunityId, bool favorited, CancellationToken cancellationToken = default);
    Task<OpportunityDetailDto> PublishAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<OpportunityParticipationFormDto> GetParticipationFormAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default);
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
    Task<IReadOnlyList<ApprovedInvestorDto>> GetApprovedInvestorsAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InvestorPaymentSummaryDto>> GetOpportunityPaymentsAsync(Guid founderId, int id, CancellationToken cancellationToken = default);
    Task<InvestorPaymentDetailDto> GetInvestorPaymentDetailsAsync(Guid founderId, int id, Guid investorId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FounderIncomingJoinRequestDto>> GetIncomingJoinRequestsAsync(Guid founderId, CancellationToken cancellationToken = default);
    Task<FounderIncomingJoinRequestDto> GetIncomingJoinRequestAsync(Guid founderId, int requestId, CancellationToken cancellationToken = default);
    Task<OpportunityJoinRequestDto> ApproveJoinRequestAsync(Guid founderId, int requestId, CancellationToken cancellationToken = default);
    Task<OpportunityJoinRequestDto> RejectJoinRequestAsync(Guid founderId, int requestId, RejectOpportunityJoinRequest request, CancellationToken cancellationToken = default);
    Task<PaymentTransactionDetailDto> RecordPaymentAsync(Guid userId, int opportunityId, RecordPaymentRequest request, CancellationToken cancellationToken = default);
    Task<PaymentTransactionDetailDto> ReversePaymentAsync(Guid userId, int opportunityId, ReversePaymentRequest request, CancellationToken cancellationToken = default);
    Task<MonthlyBulkConfirmPreviewDto> GetMonthlyUnpaidInstallmentsAsync(Guid founderId, int opportunityId, int? year, int? month, CancellationToken cancellationToken = default);
    Task<BulkConfirmMonthlyResultDto> BulkConfirmMonthlyPaymentsAsync(Guid founderId, int opportunityId, BulkConfirmMonthlyRequest request, CancellationToken cancellationToken = default);
}
