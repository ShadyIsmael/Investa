using Investa.Application.DTOs.Analytics;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public class InvestmentAnalyticsService : IInvestmentAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InvestmentAnalyticsService> _logger;

    public InvestmentAnalyticsService(IUnitOfWork unitOfWork, ILogger<InvestmentAnalyticsService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task RecordViewAsync(int investmentId, Guid? userId, string? userIp, string? userAgent)
    {
        try
        {
            // Duplicate prevention: Check if user viewed this investment in the last 24 hours
            if (userId.HasValue)
            {
                var recentViews = await _unitOfWork.Repository<InvestmentView>()
                    .FindAsync(v => v.InvestmentId == investmentId 
                                && v.UserId == userId 
                                && v.ViewedAt >= DateTime.UtcNow.AddHours(-24));
                
                if (recentViews.Any())
                {
                    _logger.LogInformation("View already recorded in last 24 hours for investment {InvestmentId} by user {UserId}", investmentId, userId);
                    return; // Skip duplicate
                }
            }

            var view = new InvestmentView
            {
                InvestmentId = investmentId,
                UserId = userId,
                ViewedAt = DateTime.UtcNow,
                UserIp = userIp,
                UserAgent = userAgent
            };

            await _unitOfWork.Repository<InvestmentView>().AddAsync(view);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Recorded view for investment {InvestmentId} by user {UserId}", investmentId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record view for investment {InvestmentId}", investmentId);
            // Don't throw - analytics failures should not block main functionality
        }
    }

    public async Task RecordLearnMoreAsync(int investmentId, Guid? userId, string? userIp, string? userAgent)
    {
        try
        {
            // Duplicate prevention: Check if user clicked Learn More in the last 24 hours
            if (userId.HasValue)
            {
                var recentLearnMores = await _unitOfWork.Repository<InvestmentLearnMore>()
                    .FindAsync(lm => lm.InvestmentId == investmentId 
                                && lm.UserId == userId 
                                && lm.OpenedAt >= DateTime.UtcNow.AddHours(-24));
                
                if (recentLearnMores.Any())
                {
                    _logger.LogInformation("Learn More already recorded in last 24 hours for investment {InvestmentId} by user {UserId}", investmentId, userId);
                    return; // Skip duplicate
                }
            }

            var learnMore = new InvestmentLearnMore
            {
                InvestmentId = investmentId,
                UserId = userId,
                OpenedAt = DateTime.UtcNow,
                UserIp = userIp,
                UserAgent = userAgent
            };

            await _unitOfWork.Repository<InvestmentLearnMore>().AddAsync(learnMore);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Recorded Learn More for investment {InvestmentId} by user {UserId}", investmentId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record Learn More for investment {InvestmentId}", investmentId);
            // Don't throw - analytics failures should not block main functionality
        }
    }

    public async Task<FounderSummaryDto> GetFounderSummaryAsync(Guid founderId, DateTime? startDate, DateTime? endDate)
    {
        var investments = await _unitOfWork.Repository<Investment>().FindAsync(i => i.FounderId == founderId);
        var requests = await _unitOfWork.Repository<InvestmentRequest>().FindAsync(r => r.FounderId == founderId);
        var views = await _unitOfWork.Repository<InvestmentView>().GetAllAsync();
        var learnMores = await _unitOfWork.Repository<InvestmentLearnMore>().GetAllAsync();
        var conversationParticipants = await _unitOfWork.Repository<ConversationParticipant>().GetAllAsync();
        var conversations = await _unitOfWork.Repository<Conversation>().GetAllAsync();

        // Filter views and learn mores by founder's investments
        var investmentIds = investments.Select(i => i.Id).ToList();
        var filteredViews = views.Where(v => investmentIds.Contains(v.InvestmentId));
        var filteredLearnMores = learnMores.Where(lm => investmentIds.Contains(lm.InvestmentId));

        // Apply date filters
        if (startDate.HasValue)
        {
            requests = requests.Where(r => r.CreatedAt >= startDate.Value).ToList();
            filteredViews = filteredViews.Where(v => v.ViewedAt >= startDate.Value);
            filteredLearnMores = filteredLearnMores.Where(lm => lm.OpenedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            requests = requests.Where(r => r.CreatedAt <= endDate.Value).ToList();
            filteredViews = filteredViews.Where(v => v.ViewedAt <= endDate.Value);
            filteredLearnMores = filteredLearnMores.Where(lm => lm.OpenedAt <= endDate.Value);
        }

        var totalOpportunities = investments.Count();
        var publishedOpportunities = investments.Count(i => i.Status != "Draft");
        var totalViews = filteredViews.Count();
        var uniqueViews = filteredViews.Select(v => v.UserId).Distinct().Count(u => u.HasValue);
        var learnMoreOpens = filteredLearnMores.Count();
        var uniqueLearnMoreOpens = filteredLearnMores.Select(lm => lm.UserId).Distinct().Count(u => u.HasValue);
        var requestsReceived = requests.Count();
        var approvedRequests = requests.Count(r => r.Status == InvestmentRequestStatus.Accepted);
        var rejectedRequests = requests.Count(r => r.Status == InvestmentRequestStatus.Declined);

        // Calculate active conversations
        var conversationIds = conversationParticipants
            .Where(cp => cp.UserId == founderId)
            .Select(cp => cp.ConversationId)
            .Distinct()
            .ToList();

        var activeConversations = conversations
            .Count(c => conversationIds.Contains(c.Id) && c.IsActive);

        var approvalRate = requestsReceived > 0 ? (double)approvedRequests / requestsReceived * 100 : 0;

        return new FounderSummaryDto
        {
            TotalOpportunities = totalOpportunities,
            PublishedOpportunities = publishedOpportunities,
            TotalViews = totalViews,
            UniqueViews = uniqueViews,
            LearnMoreOpens = learnMoreOpens,
            UniqueLearnMoreOpens = uniqueLearnMoreOpens,
            RequestsReceived = requestsReceived,
            ApprovedRequests = approvedRequests,
            RejectedRequests = rejectedRequests,
            ApprovalRate = Math.Round(approvalRate, 1),
            ActiveConversations = activeConversations
        };
    }

    public async Task<InvestmentPerformanceDto> GetInvestmentMetricsAsync(int investmentId, DateTime? startDate, DateTime? endDate)
    {
        var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(investmentId);
        
        if (investment == null)
            throw new InvalidOperationException($"Investment {investmentId} not found");

        var views = await _unitOfWork.Repository<InvestmentView>().FindAsync(v => v.InvestmentId == investmentId);
        var learnMores = await _unitOfWork.Repository<InvestmentLearnMore>().FindAsync(lm => lm.InvestmentId == investmentId);
        var requests = await _unitOfWork.Repository<InvestmentRequest>().FindAsync(r => r.InvestmentId == investmentId);
        var conversationParticipants = await _unitOfWork.Repository<ConversationParticipant>().GetAllAsync();
        var conversations = await _unitOfWork.Repository<Conversation>().GetAllAsync();

        // Apply date filters
        if (startDate.HasValue)
        {
            views = views.Where(v => v.ViewedAt >= startDate.Value).ToList();
            learnMores = learnMores.Where(lm => lm.OpenedAt >= startDate.Value).ToList();
            requests = requests.Where(r => r.CreatedAt >= startDate.Value).ToList();
        }

        if (endDate.HasValue)
        {
            views = views.Where(v => v.ViewedAt <= endDate.Value).ToList();
            learnMores = learnMores.Where(lm => lm.OpenedAt <= endDate.Value).ToList();
            requests = requests.Where(r => r.CreatedAt <= endDate.Value).ToList();
        }

        var totalViews = views.Count();
        var uniqueViews = views.Select(v => v.UserId).Distinct().Count(u => u.HasValue);
        var learnMoreOpens = learnMores.Count();
        var uniqueLearnMoreOpens = learnMores.Select(lm => lm.UserId).Distinct().Count(u => u.HasValue);
        var requestsReceived = requests.Count();
        var approvedRequests = requests.Count(r => r.Status == InvestmentRequestStatus.Accepted);
        var rejectedRequests = requests.Count(r => r.Status == InvestmentRequestStatus.Declined);

        // Calculate active chats for this investment
        var conversationIds = conversationParticipants
            .Join(requests.Where(r => r.Status == InvestmentRequestStatus.Accepted), 
                  cp => cp.UserId, 
                  r => r.InvestorId, 
                  (cp, r) => new { cp, r })
            .Where(x => x.r.InvestmentId == investmentId)
            .Select(x => x.cp.ConversationId)
            .Distinct()
            .ToList();

        var activeChats = conversations.Count(c => conversationIds.Contains(c.Id) && c.IsActive);

        var coverImage = investment.Images?.FirstOrDefault(i => i.MediaType == MediaType.CoverImage)?.Url ?? investment.ImageUrl;

        return new InvestmentPerformanceDto
        {
            InvestmentId = investment.Id,
            InvestmentName = investment.BusinessName ?? "Untitled",
            CoverImage = coverImage,
            InvestmentType = investment.InvestmentTypeId.ToString(),
            Status = investment.Status,
            CreatedDate = investment.Date,
            TotalViews = totalViews,
            UniqueViews = uniqueViews,
            LearnMoreOpens = learnMoreOpens,
            UniqueLearnMoreOpens = uniqueLearnMoreOpens,
            RequestsReceived = requestsReceived,
            ApprovedRequests = approvedRequests,
            RejectedRequests = rejectedRequests,
            ActiveChats = activeChats
        };
    }

    public async Task<IEnumerable<InvestmentPerformanceDto>> GetOpportunitiesPerformanceAsync(Guid founderId, DateTime? startDate, DateTime? endDate)
    {
        var investments = await _unitOfWork.Repository<Investment>().FindAsync(i => i.FounderId == founderId);

        var performanceList = new List<InvestmentPerformanceDto>();

        foreach (var investment in investments)
        {
            var metrics = await GetInvestmentMetricsAsync(investment.Id, startDate, endDate);
            performanceList.Add(metrics);
        }

        return performanceList;
    }

    public async Task<IEnumerable<TopPerformingOpportunityDto>> GetTopPerformingOpportunitiesAsync(Guid founderId, int limit, DateTime? startDate, DateTime? endDate)
    {
        var opportunities = await GetOpportunitiesPerformanceAsync(founderId, startDate, endDate);

        var topPerforming = opportunities
            .Select(o => new TopPerformingOpportunityDto
            {
                InvestmentId = o.InvestmentId,
                InvestmentName = o.InvestmentName,
                CoverImage = o.CoverImage,
                Views = o.TotalViews,
                UniqueViews = o.UniqueViews,
                Requests = o.RequestsReceived,
                ApprovalRate = o.RequestsReceived > 0 ? Math.Round((double)o.ApprovedRequests / o.RequestsReceived * 100, 1) : 0,
                LearnMoreConversion = o.UniqueViews > 0 ? Math.Round((double)o.UniqueLearnMoreOpens / o.UniqueViews * 100, 1) : 0
            })
            .OrderByDescending(o => o.Requests)
            .ThenByDescending(o => o.ApprovalRate)
            .ThenByDescending(o => o.LearnMoreConversion)
            .Take(limit)
            .ToList();

        return topPerforming;
    }

    public async Task<IEnumerable<LowPerformingOpportunityDto>> GetLowPerformingOpportunitiesAsync(Guid founderId, int limit, DateTime? startDate, DateTime? endDate)
    {
        var opportunities = await GetOpportunitiesPerformanceAsync(founderId, startDate, endDate);

        var lowPerforming = opportunities
            .Select(o => new LowPerformingOpportunityDto
            {
                InvestmentId = o.InvestmentId,
                InvestmentName = o.InvestmentName,
                Views = o.TotalViews,
                UniqueViews = o.UniqueViews,
                LearnMore = o.LearnMoreOpens,
                UniqueLearnMore = o.UniqueLearnMoreOpens,
                Requests = o.RequestsReceived
            })
            .OrderBy(o => o.Requests)
            .ThenBy(o => o.UniqueViews)
            .ThenBy(o => o.UniqueLearnMore)
            .Take(limit)
            .ToList();

        return lowPerforming;
    }

    public async Task<ConversionFunnelDto> GetConversionFunnelAsync(Guid founderId, DateTime? startDate, DateTime? endDate)
    {
        var investments = await _unitOfWork.Repository<Investment>().FindAsync(i => i.FounderId == founderId);
        var investmentIds = investments.Select(i => i.Id).ToList();
        
        var views = await _unitOfWork.Repository<InvestmentView>().GetAllAsync();
        var learnMores = await _unitOfWork.Repository<InvestmentLearnMore>().GetAllAsync();
        var requests = await _unitOfWork.Repository<InvestmentRequest>().FindAsync(r => r.FounderId == founderId);
        var conversationParticipants = await _unitOfWork.Repository<ConversationParticipant>().GetAllAsync();
        var conversations = await _unitOfWork.Repository<Conversation>().GetAllAsync();

        // Filter views and learn mores by founder's investments
        var filteredViews = views.Where(v => investmentIds.Contains(v.InvestmentId));
        var filteredLearnMores = learnMores.Where(lm => investmentIds.Contains(lm.InvestmentId));

        // Apply date filters
        if (startDate.HasValue)
        {
            filteredViews = filteredViews.Where(v => v.ViewedAt >= startDate.Value);
            filteredLearnMores = filteredLearnMores.Where(lm => lm.OpenedAt >= startDate.Value);
            requests = requests.Where(r => r.CreatedAt >= startDate.Value).ToList();
        }

        if (endDate.HasValue)
        {
            filteredViews = filteredViews.Where(v => v.ViewedAt <= endDate.Value);
            filteredLearnMores = filteredLearnMores.Where(lm => lm.OpenedAt <= endDate.Value);
            requests = requests.Where(r => r.CreatedAt <= endDate.Value).ToList();
        }

        var viewsCount = filteredViews.Count();
        var uniqueViewsCount = filteredViews.Select(v => v.UserId).Distinct().Count(u => u.HasValue);
        var learnMoreCount = filteredLearnMores.Count();
        var uniqueLearnMoreCount = filteredLearnMores.Select(lm => lm.UserId).Distinct().Count(u => u.HasValue);
        var requestsCount = requests.Count();
        var approvalsCount = requests.Count(r => r.Status == InvestmentRequestStatus.Accepted);

        // Calculate active chats from approved requests
        var conversationIds = conversationParticipants
            .Join(requests.Where(r => r.Status == InvestmentRequestStatus.Accepted), 
                  cp => cp.UserId, 
                  r => r.InvestorId, 
                  (cp, r) => new { cp, r })
            .Where(x => x.r.FounderId == founderId)
            .Select(x => x.cp.ConversationId)
            .Distinct()
            .ToList();

        var chatsCount = conversations.Count(c => conversationIds.Contains(c.Id) && c.IsActive);

        return new ConversionFunnelDto
        {
            Views = viewsCount,
            UniqueViews = uniqueViewsCount,
            LearnMore = learnMoreCount,
            UniqueLearnMore = uniqueLearnMoreCount,
            Requests = requestsCount,
            Approvals = approvalsCount,
            Chats = chatsCount
        };
    }
}
