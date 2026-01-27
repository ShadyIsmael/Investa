using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Application.DTOs;
using Investa.Application.DTOs.Investments;

namespace Investa.Application.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IInvestmentEventService _eventService;
    private readonly IInvestmentRepository _investmentRepository;

    public InvestmentService(
        IUnitOfWork unitOfWork, 
        IInvestmentEventService eventService,
        IInvestmentRepository investmentRepository)
    {
        _unitOfWork = unitOfWork;
        _eventService = eventService;
        _investmentRepository = investmentRepository;
    }

    public async Task<bool> PurchaseSharesAsync(Guid investorId, int investmentId, int sharesPurchased)
    {
        if (sharesPurchased <= 0)
            throw new ArgumentException("Shares must be positive.");

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            // Get investor
            var investor = await _unitOfWork.Repository<User>().GetByIdAsync(investorId);
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
                Status = "Confirmed"
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
            await _unitOfWork.Repository<User>().UpdateAsync(investor);
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
            VideoUrl = dto.VideoUrl
        };

        await _unitOfWork.Repository<Investment>().AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

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

        if (dto.InitialCapital.HasValue) entity.InitialCapital = dto.InitialCapital.Value;
        if (dto.BusinessName != null) entity.BusinessName = dto.BusinessName;
        if (dto.Description != null) entity.Description = dto.Description;
        if (dto.StartDate.HasValue) entity.StartDate = dto.StartDate;
        if (dto.BusinessStageId.HasValue) entity.BusinessStageId = dto.BusinessStageId;
        if (dto.BusinessCategoryId.HasValue) entity.BusinessCategoryId = dto.BusinessCategoryId;
        if (dto.ProjectPhaseId.HasValue) entity.ProjectPhaseId = dto.ProjectPhaseId;
        if (dto.TargetFund.HasValue) entity.TargetFund = dto.TargetFund;
        if (dto.SharePrice.HasValue) entity.SharePrice = dto.SharePrice.Value;
        if (dto.TotalShares.HasValue) 
        {
            var soldShares = entity.TotalShares - entity.AvailableShares;
            entity.TotalShares = dto.TotalShares.Value;
            entity.AvailableShares = entity.TotalShares - soldShares;
        }
        if (dto.MinInvestment.HasValue) entity.MinInvestment = dto.MinInvestment;
        if (dto.MaxInvestment.HasValue) entity.MaxInvestment = dto.MaxInvestment;
        if (dto.ValuationCap.HasValue) entity.ValuationCap = dto.ValuationCap;
        if (dto.ExpectedROI.HasValue) entity.ExpectedROI = dto.ExpectedROI;
        if (dto.InvestmentTypeId.HasValue) entity.InvestmentTypeId = dto.InvestmentTypeId.Value;
        if (dto.Status != null) entity.Status = dto.Status;
        if (dto.EndDate.HasValue) entity.EndDate = dto.EndDate;
        if (dto.ImageUrl != null) entity.ImageUrl = dto.ImageUrl;
        if (dto.VideoUrl != null) entity.VideoUrl = dto.VideoUrl;

        await repo.UpdateAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        // If status changed, append an event (best-effort)
        if (dto.Status != null && dto.Status != oldStatus)
        {
            try
            {
                var ev = new CreateInvestmentEventDto
                {
                    EventType = "StatusUpdated",
                    Payload = System.Text.Json.JsonSerializer.Serialize(new { OldStatus = oldStatus, NewStatus = dto.Status }),
                    CreatedBy = null
                };
                await _eventService.AppendEventAsync(id, ev);
            }
            catch
            {
                // ignore
            }
        }

        return true;
    }

    public async Task<Investment?> GetByIdAsync(int id)
    {
        // Use specialized repository for full details including User/UserProfile for team members
        return await _investmentRepository.GetByIdWithFullDetailsAsync(id);
    }

    public async Task<IEnumerable<Investment>> GetByCategoryAsync(int? categoryId)
    {
        // Use specialized repository for full details including User/UserProfile for team members
        if (!categoryId.HasValue)
            return await _investmentRepository.GetAllWithFullDetailsAsync();

        return await _investmentRepository.GetByCategoryWithFullDetailsAsync(categoryId.Value);
    }

    public async Task<IEnumerable<InvestmentParticipant>> GetParticipantsAsync(int investmentId)
    {
        return await _unitOfWork.Repository<InvestmentParticipant>()
            .FindAsync(p => p.InvestmentId == investmentId);
    }
}