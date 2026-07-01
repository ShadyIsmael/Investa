using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Application.DTOs;
using Investa.Application.DTOs.Investments;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IInvestmentEventService _eventService;
    private readonly IInvestmentRepository _investmentRepository;
    private readonly IOpportunityService _opportunityService;
    private readonly ILogger<InvestmentService> _logger;

    public InvestmentService(
        IUnitOfWork unitOfWork, 
        IInvestmentEventService eventService,
        IInvestmentRepository investmentRepository,
        IOpportunityService opportunityService,
        ILogger<InvestmentService> logger)
    {
        _unitOfWork = unitOfWork;
        _eventService = eventService;
        _investmentRepository = investmentRepository;
        _opportunityService = opportunityService;
        _logger = logger;
    }

    public async Task<bool> PurchaseSharesAsync(Guid investorId, int investmentId, int sharesPurchased)
    {
        if (sharesPurchased <= 0)
            throw new ArgumentException("Shares must be positive.");

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            // Get investor
            var investor = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(investorId);
            if (investor == null)
                throw new Exception("Investor not found.");

            // Get investment opportunity
            var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(investmentId);
            if (investment == null)
                throw new Exception("Investment opportunity not found.");

            // Validate investment status
            if (investment.Status != "Active")
                throw new Exception("Investment opportunity is not active.");

            // Validate required equity crowdfunding fields
            if (!investment.SharePrice.HasValue || !investment.TotalShares.HasValue || !investment.AvailableShares.HasValue)
                throw new Exception("Investment opportunity is not properly configured for equity crowdfunding.");

            // Check available shares
            if (investment.AvailableShares.Value < sharesPurchased)
                throw new Exception($"Only {investment.AvailableShares.Value} shares available.");

            // Calculate amount
            var amount = sharesPurchased * investment.SharePrice.Value;

            // Check investor balance
            if (investor.WalletBalance < amount)
                throw new Exception("Insufficient balance.");

            // Check investment limits
            if (investment.MinInvestment.HasValue && amount < investment.MinInvestment.Value)
                throw new Exception($"Minimum investment is {investment.MinInvestment.Value}.");

            if (investment.MaxInvestment.HasValue && amount > investment.MaxInvestment.Value)
                throw new Exception($"Maximum investment is {investment.MaxInvestment.Value}.");

            // Deduct from wallet
            investor.WalletBalance -= amount;

            // Update available shares
            investment.AvailableShares = investment.AvailableShares.Value - sharesPurchased;

            // Check if fully funded
            if (investment.AvailableShares == 0)
            {
                investment.Status = "Funded";
            }

            // Create participation record
            var participant = new InvestmentParticipant
            {
                InvestmentId = investmentId,
                InvestorId = investorId,
                SharesPurchased = sharesPurchased,
                AmountInvested = amount,
                InvestmentDate = DateTime.UtcNow,
                Status = ParticipationLifecycle.Participated
            };

            // Create transaction
            var transaction = new Transaction
            {
                WalletId = investorId,
                Amount = amount,
                Type = TransactionType.Investment,
                Timestamp = DateTime.UtcNow
            };

            await _unitOfWork.Repository<InvestmentParticipant>().AddAsync(participant);
            await _unitOfWork.Repository<Transaction>().AddAsync(transaction);
            await _unitOfWork.Repository<AuthUser>().UpdateAsync(investor);
            await _unitOfWork.Repository<Investment>().UpdateAsync(investment);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            // Emit event: SharesPurchased / ParticipantAdded (best-effort)
            try
            {
                var payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    InvestorId = investorId,
                    SharesPurchased = sharesPurchased,
                    Amount = amount,
                    NewAvailableShares = investment.AvailableShares
                });

                var evDto = new CreateInvestmentEventDto
                {
                    EventType = "SharesPurchased",
                    Payload = payload,
                    CreatedBy = investorId
                };

                await _eventService.AppendEventAsync(investmentId, evDto);
            }
            catch
            {
                // ignore event failures
            }

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Investment> CreateAsync(CreateInvestmentDto dto)
    {
        var entity = new Investment
        {
            FounderId = dto.FounderId,
            InitialCapital = dto.InitialCapital,
            Date = DateTime.UtcNow,
            BusinessName = dto.BusinessName,
            Description = dto.Description,
            StartDate = dto.StartDate,
            BusinessStageId = dto.BusinessStageId,
            BusinessCategoryId = dto.BusinessCategoryId,
            ProjectPhaseId = dto.ProjectPhaseId,
            TargetFund = dto.TargetFund,
            SharePrice = dto.SharePrice,
            TotalShares = dto.TotalShares,
            AvailableShares = dto.TotalShares, // Initially all shares available
            MinInvestment = dto.MinInvestment,
            MaxInvestment = dto.MaxInvestment,
            ValuationCap = dto.ValuationCap,
            ExpectedROI = dto.ExpectedROI,
            InvestmentTypeId = dto.InvestmentTypeId ?? InvestmentType.Equity,
            Status = "Draft",
            EndDate = dto.EndDate,
            ImageUrl = dto.ImageUrl,
            VideoUrl = dto.VideoUrl,
            // Founding-specific fields
            DurationMonths = dto.DurationMonths,
            ProfitPercentage = dto.ProfitPercentage,
            PayoutFrequency = dto.PayoutFrequency,
            // Equity exit strategy fields
            CurrentValuation = dto.CurrentValuation,
            EstimatedFutureValuation = dto.EstimatedFutureValuation,
            EquityExitType = dto.EquityExitType,
            ExitTargetDate = dto.ExitTargetDate,
            ExpectedExitStrategy = dto.ExpectedExitStrategy,
            // Revenue sharing exit strategy fields
            ContractStartDate = dto.ContractStartDate,
            ContractEndDate = dto.ContractEndDate,
            TotalExpectedPayout = dto.TotalExpectedPayout,
            RemainingPayoutAmount = dto.RemainingPayoutAmount,
            RevenueDistributionFrequency = dto.RevenueDistributionFrequency,
            ContractCompletionStatus = dto.ContractCompletionStatus,
            // Loan/Debt exit strategy fields
            RepaymentStartDate = dto.RepaymentStartDate,
            FinalRepaymentDate = dto.FinalRepaymentDate,
            RemainingBalance = dto.RemainingBalance,
            TotalPaidAmount = dto.TotalPaidAmount,
            NextInstallmentDate = dto.NextInstallmentDate,
            DefaultRiskLevel = dto.DefaultRiskLevel,
            LoanCompletionStatus = dto.LoanCompletionStatus
        };

        await _unitOfWork.Repository<Investment>().AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();
        var mirroredOpportunityId = await MirrorLegacyCreateToOpportunityAsync(dto, entity);
        if (mirroredOpportunityId.HasValue)
        {
            entity.OpportunityId = mirroredOpportunityId.Value;
            await _unitOfWork.Repository<Investment>().UpdateAsync(entity);
            await _unitOfWork.SaveChangesAsync();
        }

        // Best-effort: append Created event (do not fail creation if event append fails)
        try
        {
            var createdDto = new CreateInvestmentEventDto
            {
                EventType = "Created",
                Payload = System.Text.Json.JsonSerializer.Serialize(new { entity.Id, entity.BusinessName, entity.Status }),
                CreatedBy = entity.FounderId
            };
            await _eventService.AppendEventAsync(entity.Id, createdDto);
        }
        catch
        {
            // swallow to avoid affecting main flow
        }

        return entity;
    }

    public async Task<bool> UpdateAsync(int id, UpdateInvestmentDto dto)
    {
        var repo = _unitOfWork.Repository<Investment>();
        var entity = await repo.GetByIdAsync(id);
        if (entity == null) return false;

        var oldStatus = entity.Status;
        var oldBusinessName = entity.BusinessName;

        if (dto.InitialCapital.HasValue) entity.InitialCapital = dto.InitialCapital.Value;
        if (dto.BusinessName != null) entity.BusinessName = dto.BusinessName;
        if (dto.Description != null) entity.Description = dto.Description;
        if (dto.StartDate.HasValue) entity.StartDate = dto.StartDate;
        if (dto.BusinessStageId.HasValue) entity.BusinessStageId = dto.BusinessStageId;
        if (dto.BusinessCategoryId.HasValue) entity.BusinessCategoryId = dto.BusinessCategoryId;
        if (dto.ProjectPhaseId.HasValue) entity.ProjectPhaseId = dto.ProjectPhaseId;
        if (dto.TargetFund.HasValue) entity.TargetFund = dto.TargetFund.Value;
        if (dto.SharePrice.HasValue) entity.SharePrice = dto.SharePrice.Value;
        if (dto.TotalShares.HasValue) 
        {
            var oldTotalShares = entity.TotalShares;
            entity.TotalShares = dto.TotalShares.Value;
            // If this is the first time setting TotalShares, set AvailableShares equal to it
            if (!oldTotalShares.HasValue || oldTotalShares == 0)
            {
                entity.AvailableShares = dto.TotalShares.Value;
            }
        }
        if (dto.MinInvestment.HasValue) entity.MinInvestment = dto.MinInvestment.Value;
        if (dto.MaxInvestment.HasValue) entity.MaxInvestment = dto.MaxInvestment.Value;
        if (dto.ValuationCap.HasValue) entity.ValuationCap = dto.ValuationCap.Value;
        if (dto.ExpectedROI.HasValue) entity.ExpectedROI = dto.ExpectedROI.Value;
        if (dto.InvestmentTypeId.HasValue) entity.InvestmentTypeId = dto.InvestmentTypeId.Value;
        if (dto.Status != null) entity.Status = dto.Status;
        if (dto.EndDate.HasValue) entity.EndDate = dto.EndDate;
        if (dto.ImageUrl != null) entity.ImageUrl = dto.ImageUrl;
        if (dto.VideoUrl != null) entity.VideoUrl = dto.VideoUrl;
        if (dto.DurationMonths.HasValue) entity.DurationMonths = dto.DurationMonths.Value;
        if (dto.ProfitPercentage.HasValue) entity.ProfitPercentage = dto.ProfitPercentage.Value;
        if (dto.PayoutFrequency != null) entity.PayoutFrequency = dto.PayoutFrequency;
        
        // Equity exit strategy fields
        if (dto.CurrentValuation.HasValue) entity.CurrentValuation = dto.CurrentValuation.Value;
        if (dto.EstimatedFutureValuation.HasValue) entity.EstimatedFutureValuation = dto.EstimatedFutureValuation.Value;
        if (dto.EquityExitType.HasValue) entity.EquityExitType = dto.EquityExitType.Value;
        if (dto.ExitTargetDate.HasValue) entity.ExitTargetDate = dto.ExitTargetDate;
        if (dto.ExpectedExitStrategy != null) entity.ExpectedExitStrategy = dto.ExpectedExitStrategy;
        
        // Revenue sharing exit strategy fields
        if (dto.ContractStartDate.HasValue) entity.ContractStartDate = dto.ContractStartDate;
        if (dto.ContractEndDate.HasValue) entity.ContractEndDate = dto.ContractEndDate;
        if (dto.TotalExpectedPayout.HasValue) entity.TotalExpectedPayout = dto.TotalExpectedPayout.Value;
        if (dto.RemainingPayoutAmount.HasValue) entity.RemainingPayoutAmount = dto.RemainingPayoutAmount.Value;
        if (dto.RevenueDistributionFrequency != null) entity.RevenueDistributionFrequency = dto.RevenueDistributionFrequency;
        if (dto.ContractCompletionStatus != null) entity.ContractCompletionStatus = dto.ContractCompletionStatus;
        
        // Loan/Debt exit strategy fields
        if (dto.RepaymentStartDate.HasValue) entity.RepaymentStartDate = dto.RepaymentStartDate;
        if (dto.FinalRepaymentDate.HasValue) entity.FinalRepaymentDate = dto.FinalRepaymentDate;
        if (dto.RemainingBalance.HasValue) entity.RemainingBalance = dto.RemainingBalance.Value;
        if (dto.TotalPaidAmount.HasValue) entity.TotalPaidAmount = dto.TotalPaidAmount.Value;
        if (dto.NextInstallmentDate.HasValue) entity.NextInstallmentDate = dto.NextInstallmentDate;
        if (dto.DefaultRiskLevel != null) entity.DefaultRiskLevel = dto.DefaultRiskLevel;
        if (dto.LoanCompletionStatus != null) entity.LoanCompletionStatus = dto.LoanCompletionStatus;

        await repo.UpdateAsync(entity);
        await _unitOfWork.SaveChangesAsync();
        await MirrorLegacyUpdateToOpportunityAsync(entity, oldBusinessName);

        // Emit status change event if status changed
        if (oldStatus != entity.Status)
        {
            try
            {
                var payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    OldStatus = oldStatus,
                    NewStatus = entity.Status
                });

                var evDto = new CreateInvestmentEventDto
                {
                    EventType = "StatusChanged",
                    Payload = payload,
                    CreatedBy = entity.FounderId
                };

                await _eventService.AppendEventAsync(entity.Id, evDto);
            }
            catch
            {
                // ignore event failures
            }
        }

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var repo = _unitOfWork.Repository<Investment>();
        var entity = await repo.GetByIdAsync(id);
        if (entity == null) return false;

        // Only allow deletion of Draft investments
        if (entity.Status != "Draft")
            throw new InvalidOperationException("Only draft investments can be deleted.");

        await repo.DeleteAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        // Best-effort: append Deleted event
        try
        {
            var evDto = new CreateInvestmentEventDto
            {
                EventType = "Deleted",
                Payload = System.Text.Json.JsonSerializer.Serialize(new { entity.Id, entity.BusinessName }),
                CreatedBy = entity.FounderId
            };
            await _eventService.AppendEventAsync(entity.Id, evDto);
        }
        catch
        {
            // ignore event failures
        }

        return true;
    }

    public async Task<Investment?> GetByIdAsync(int id)
    {
        return await _investmentRepository.GetByIdWithFullDetailsAsync(id);
    }

    public async Task<IEnumerable<Investment>> GetAllAsync()
    {
        return await _investmentRepository.GetAllWithFullDetailsAsync();
    }

    public async Task<IEnumerable<Investment>> GetByFounderIdAsync(Guid founderId)
    {
        var allInvestments = await _investmentRepository.GetAllWithFullDetailsAsync();
        return allInvestments.Where(i => i.FounderId == founderId);
    }

    public async Task<IEnumerable<Investment>> GetByCategoryAsync(int? categoryId)
    {
        if (categoryId.HasValue)
        {
            return await _investmentRepository.GetByCategoryWithFullDetailsAsync(categoryId.Value);
        }
        return await _investmentRepository.GetAllWithFullDetailsAsync();
    }

    public async Task<IEnumerable<Investment>> GetMyInvestmentsAsync(Guid founderId)
    {
        var allInvestments = await _investmentRepository.GetAllWithFullDetailsAsync();
        return allInvestments.Where(i => i.FounderId == founderId);
    }

    public async Task<IEnumerable<int>> GetFavoriteInvestmentIdsAsync(Guid investorId)
    {
        var favorites = await _unitOfWork.Repository<InvestmentFavorite>()
            .GetAllAsync();
        return favorites.Where(f => f.InvestorId == investorId).Select(f => f.InvestmentId);
    }

    public async Task<bool> ToggleFavoriteAsync(Guid investorId, int investmentId, bool favorited)
    {
        var repo = _unitOfWork.Repository<InvestmentFavorite>();
        
        if (favorited)
        {
            // Check if already exists
            var existing = (await repo.GetAllAsync())
                .FirstOrDefault(f => f.InvestorId == investorId && f.InvestmentId == investmentId);
            if (existing == null)
            {
                await repo.AddAsync(new InvestmentFavorite
                {
                    InvestorId = investorId,
                    InvestmentId = investmentId,
                    CreatedAt = DateTime.UtcNow
                });
                await _unitOfWork.SaveChangesAsync();
            }
        }
        else
        {
            var existing = (await repo.GetAllAsync())
                .FirstOrDefault(f => f.InvestorId == investorId && f.InvestmentId == investmentId);
            if (existing != null)
            {
                await repo.DeleteAsync(existing);
                await _unitOfWork.SaveChangesAsync();
            }
        }
        
        return true;
    }

    public async Task<IEnumerable<InvestmentParticipant>> GetParticipantsAsync(int investmentId)
    {
        var repo = _unitOfWork.Repository<InvestmentParticipant>();
        var participants = await repo.GetAllAsync();
        return participants.Where(p => p.InvestmentId == investmentId);
    }

    private async Task<int?> MirrorLegacyCreateToOpportunityAsync(CreateInvestmentDto dto, Investment investment)
    {
        if (!InvestmentOpportunityCompatibilityMapper.TryCreateRequest(dto, investment.Id, out var request, out var skipReason))
        {
            _logger.LogWarning(
                "Legacy investment {InvestmentId} Opportunity mirror create skipped: {Reason}",
                investment.Id,
                skipReason);
            return null;
        }

        try
        {
            var opportunity = await _opportunityService.CreateAsync(dto.FounderId, request);
            _logger.LogInformation(
                "Legacy investment {InvestmentId} mirrored to Opportunity {OpportunityId} during create.",
                investment.Id,
                opportunity.Id);
            return opportunity.Id;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Legacy investment {InvestmentId} was created, but Opportunity mirror create was skipped.",
                investment.Id);
            return null;
        }
    }

    private async Task MirrorLegacyUpdateToOpportunityAsync(Investment investment, string? oldBusinessName)
    {
        try
        {
            var existing = await FindMirroredOpportunityAsync(investment, oldBusinessName);
            if (existing is null)
                return;

            if (!InvestmentOpportunityCompatibilityMapper.TryUpdateRequest(investment, out var request, out var skipReason))
            {
                _logger.LogWarning(
                    "Legacy investment {InvestmentId} Opportunity mirror update skipped: {Reason}",
                    investment.Id,
                    skipReason);
                return;
            }

            await _opportunityService.UpdateAsync(investment.FounderId, existing.Id, request);
            _logger.LogInformation(
                "Legacy investment {InvestmentId} mirrored to Opportunity {OpportunityId} during update.",
                investment.Id,
                existing.Id);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Legacy investment {InvestmentId} was updated, but Opportunity mirror update was skipped.",
                investment.Id);
        }
    }

    private async Task<OpportunityDto?> FindMirroredOpportunityAsync(Investment investment, string? oldBusinessName)
    {
        var opportunities = await _opportunityService.GetMyAsync(investment.FounderId);
        if (investment.OpportunityId.HasValue)
        {
            var linked = opportunities.FirstOrDefault(o => o.Id == investment.OpportunityId.Value);
            if (linked is not null)
                return linked;
        }

        var currentTitle = InvestmentOpportunityCompatibilityMapper.ToOpportunityTitle(investment.BusinessName, investment.Id);
        var previousTitle = InvestmentOpportunityCompatibilityMapper.ToOpportunityTitle(oldBusinessName, investment.Id);

        return opportunities.FirstOrDefault(o =>
            string.Equals(o.Title, currentTitle, StringComparison.OrdinalIgnoreCase)
            || string.Equals(o.Title, previousTitle, StringComparison.OrdinalIgnoreCase));
    }
}
