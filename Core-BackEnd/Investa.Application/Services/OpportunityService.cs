using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.DTOs.Users;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public class OpportunityService : IOpportunityService
{
    private static readonly OpportunityStatus[] PublicStatuses =
    [
        OpportunityStatus.Published,
        OpportunityStatus.Funding,
        OpportunityStatus.FullyFunded,
        OpportunityStatus.InProgress,
        OpportunityStatus.Completed
    ];

    private readonly IUnitOfWork _uow;
    private readonly IPaidActionService _paidActionService;
    private readonly IReputationService _reputationService;
    private readonly IInvestmentContractService _investmentContractService;
    private readonly IUserNotificationService _userNotificationService;
    private readonly IRealtimeEventPublisher _realtimeEventPublisher;

    public OpportunityService(IUnitOfWork uow, IPaidActionService paidActionService, IReputationService reputationService, IInvestmentContractService investmentContractService, IUserNotificationService userNotificationService, IRealtimeEventPublisher realtimeEventPublisher)
    {
        _uow = uow;
        _paidActionService = paidActionService;
        _reputationService = reputationService;
        _investmentContractService = investmentContractService;
        _userNotificationService = userNotificationService;
        _realtimeEventPublisher = realtimeEventPublisher;
    }

    public async Task<OpportunityDetailDto> CreateAsync(Guid founderId, CreateOpportunityRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateCoreFields(request.Title, request.FundingTarget, request.InvestmentModel, request.ProjectStage);
        ValidateProductFields(request.ShortDescription, request.UseOfFunds, request.InvestmentModel, request.EquityOfferedPercentage, request.ProfitSharePercentage, request.ProfitSharingPayoutFrequency, request.ExpectedDurationMonths, request.ProfitSharingContractStartDate, request.ProfitSharingContractEndDate, request.InterestRate, request.RepaymentFrequency, request.FinalRepaymentDate);
        ValidateEquityConfiguration(request.InvestmentModel, request.Currency, request.SharePrice, request.TotalShares, request.OfferedShares, request.EquityOfferedPercentage, request.MinimumInvestmentAmount);
        ValidateCurrency(request.Currency);
        ValidateInvestmentBounds(request.MinimumInvestmentAmount, request.MaximumInvestmentAmount);
        var tags = await ValidateClassificationAsync(request.CategoryId, request.FundingGoalId, request.TagIds);

        var now = DateTime.UtcNow;
        var opportunity = new Opportunity
        {
            FounderId = founderId,
            Title = request.Title.Trim(),
            Description = Normalize(request.Description),
            ShortDescription = request.ShortDescription.Trim(),
            UseOfFunds = request.UseOfFunds.Trim(),
            FundingTarget = request.FundingTarget,
            CategoryId = request.CategoryId,
            FundingGoalId = request.FundingGoalId,
            MinimumInvestmentAmount = request.MinimumInvestmentAmount,
            MaximumInvestmentAmount = request.MaximumInvestmentAmount,
            ExpectedDurationMonths = request.ExpectedDurationMonths,
            Currency = Normalize(request.Currency),
            SharePrice = request.SharePrice,
            TotalShares = request.TotalShares,
            OfferedShares = request.OfferedShares,
            EquityOfferedPercentage = request.EquityOfferedPercentage,
            ProfitSharePercentage = request.ProfitSharePercentage,
            ProfitSharingPayoutFrequency = Normalize(request.ProfitSharingPayoutFrequency),
            ProfitSharingContractStartDate = request.ProfitSharingContractStartDate,
            ProfitSharingContractEndDate = request.ProfitSharingContractEndDate,
            InterestRate = request.InterestRate,
            RepaymentFrequency = Normalize(request.RepaymentFrequency),
            FinalRepaymentDate = request.FinalRepaymentDate,
            InvestmentModel = request.InvestmentModel!.Value,
            ProjectStage = request.ProjectStage!.Value,
            Status = OpportunityStatus.Draft,
            CoverImageUrl = Normalize(request.CoverImageUrl),
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var tag in tags)
        {
            opportunity.OpportunityTags.Add(new OpportunityTagAssignment
            {
                Opportunity = opportunity,
                OpportunityTagId = tag.Id
            });
        }

        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = "ProjectCreated",
            Title = "Project created",
            Description = "Opportunity draft was created.",
            CreatedByUserId = founderId,
            CreatedAt = now,
            IsPublic = false
        });

        await _uow.Repository<Opportunity>().AddAsync(opportunity);
        await _uow.SaveChangesAsync();

        return ToDetailDto(opportunity, tagLookup: tags.ToDictionary(t => t.Id));
    }

    public async Task<OpportunityDetailDto> UpdateAsync(Guid founderId, int id, UpdateOpportunityRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateCoreFields(request.Title, request.FundingTarget, request.InvestmentModel, request.ProjectStage);
        ValidateProductFields(request.ShortDescription, request.UseOfFunds, request.InvestmentModel, request.EquityOfferedPercentage, request.ProfitSharePercentage, request.ProfitSharingPayoutFrequency, request.ExpectedDurationMonths, request.ProfitSharingContractStartDate, request.ProfitSharingContractEndDate, request.InterestRate, request.RepaymentFrequency, request.FinalRepaymentDate);
        ValidateEquityConfiguration(request.InvestmentModel, request.Currency, request.SharePrice, request.TotalShares, request.OfferedShares, request.EquityOfferedPercentage, request.MinimumInvestmentAmount);
        ValidateCurrency(request.Currency);
        ValidateInvestmentBounds(request.MinimumInvestmentAmount, request.MaximumInvestmentAmount);
        var tags = await ValidateClassificationAsync(request.CategoryId, request.FundingGoalId, request.TagIds);

        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);

        if (opportunity.IsLockedForEditing)
            throw new BusinessValidationException("OPPORTUNITY_LOCKED", "Core project fields are locked after the first investor joins. Add a project event instead.");

        var previousStatus = opportunity.Status;
        var nextStatus = request.Status ?? opportunity.Status;
        ValidateFounderEditStatusTransition(previousStatus, nextStatus);

        var oldValue = SnapshotCore(opportunity);

        opportunity.Title = request.Title.Trim();
        opportunity.Description = Normalize(request.Description);
        opportunity.ShortDescription = request.ShortDescription.Trim();
        opportunity.UseOfFunds = request.UseOfFunds.Trim();
        opportunity.FundingTarget = request.FundingTarget;
        opportunity.CategoryId = request.CategoryId;
        opportunity.FundingGoalId = request.FundingGoalId;
        opportunity.MinimumInvestmentAmount = request.MinimumInvestmentAmount;
        opportunity.MaximumInvestmentAmount = request.MaximumInvestmentAmount;
        opportunity.ExpectedDurationMonths = request.ExpectedDurationMonths;
        opportunity.Currency = Normalize(request.Currency);
        opportunity.SharePrice = request.SharePrice;
        opportunity.TotalShares = request.TotalShares;
        opportunity.OfferedShares = request.OfferedShares;
        opportunity.EquityOfferedPercentage = request.EquityOfferedPercentage;
        opportunity.ProfitSharePercentage = request.ProfitSharePercentage;
        opportunity.ProfitSharingPayoutFrequency = Normalize(request.ProfitSharingPayoutFrequency);
        opportunity.ProfitSharingContractStartDate = request.ProfitSharingContractStartDate;
        opportunity.ProfitSharingContractEndDate = request.ProfitSharingContractEndDate;
        opportunity.InterestRate = request.InterestRate;
        opportunity.RepaymentFrequency = Normalize(request.RepaymentFrequency);
        opportunity.FinalRepaymentDate = request.FinalRepaymentDate;
        opportunity.InvestmentModel = request.InvestmentModel!.Value;
        opportunity.ProjectStage = request.ProjectStage!.Value;
        opportunity.Status = nextStatus;
        opportunity.CoverImageUrl = Normalize(request.CoverImageUrl);
        opportunity.UpdatedAt = DateTime.UtcNow;

        opportunity.OpportunityTags.Clear();
        foreach (var tag in tags)
        {
            opportunity.OpportunityTags.Add(new OpportunityTagAssignment
            {
                OpportunityId = opportunity.Id,
                OpportunityTagId = tag.Id
            });
        }

        var newValue = SnapshotCore(opportunity);

        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = previousStatus == nextStatus ? "ProjectUpdated" : "StageChanged",
            Title = previousStatus == nextStatus ? "Project updated" : "Project status changed",
            Description = previousStatus == nextStatus
                ? "Opportunity core fields were updated."
                : $"Status changed from {previousStatus} to {nextStatus}.",
            OldValue = oldValue,
            NewValue = newValue,
            CreatedByUserId = founderId,
            CreatedAt = DateTime.UtcNow,
            IsPublic = false
        });

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();

        return ToDetailDto(opportunity, tagLookup: tags.ToDictionary(t => t.Id));
    }

    public async Task<IReadOnlyList<OpportunityDto>> GetMyAsync(Guid founderId, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);

        var opportunities = await _uow.Repository<Opportunity>().FindWithIncludesAsync(
            o => o.FounderId == founderId,
            o => o.Category!,
            o => o.FundingGoal!,
            o => o.OpportunityTags);
        var tagLookup = await GetActiveTagLookupAsync();
        var ordered = opportunities
            .OrderByDescending(o => o.UpdatedAt)
            .Select(o => ToDto(o, tagLookup: tagLookup))
            .ToList();
        await ApplyParticipationSummariesAsync(ordered);
        return ordered;
    }

    public async Task<IReadOnlyList<MyParticipationDto>> GetMyParticipationsAsync(Guid investorId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(investorId, "Only authenticated clients can view their participations.");

        var approved = (await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
                r => r.InvestorId == investorId && r.Status == OpportunityJoinRequestStatus.Approved && r.IsVisibleToInvestor,
                r => r.Opportunity!,
                r => r.Investor!))
            .Where(r => r.Opportunity != null)
            .ToList();

        var relationshipGroups = approved.GroupBy(r => r.OpportunityId).ToList();
        var summaries = await GetParticipationSummariesAsync(relationshipGroups.Select(g => g.Key));
        var contracts = (await _uow.Repository<InvestmentContract>().FindAsync(c =>
                c.InvestorUserId == investorId && c.Status == InvestmentContractStatus.Active))
            .GroupBy(c => c.OpportunityId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(c => c.UpdatedAt).First());

        return relationshipGroups.Select(group =>
        {
            var latest = group.OrderByDescending(r => r.ReviewedAt ?? r.UpdatedAt).First();
            var opportunity = latest.Opportunity!;
            var investmentRequests = group.Where(r => r.RequestType == OpportunityJoinRequestType.InvestmentParticipation).ToList();
            var approvedContribution = investmentRequests.Sum(r => r.RequestedAmount ?? 0m);
            var approvedShares = investmentRequests.Sum(r => TryReadSelectedShares(r.TermsSnapshotJson));
            var summary = summaries[opportunity.Id];
            contracts.TryGetValue(opportunity.Id, out var contract);
            var parseResult = TermsSnapshotParser.Parse(latest.TermsSnapshotJson);
            var terms = parseResult.Normalized;
            var hasAcceptedOffer = latest.AcceptedOfferId.HasValue;
            var isSnapshotAuthoritative = hasAcceptedOffer;

            return new MyParticipationDto
            {
                OpportunityId = opportunity.Id,
                OpportunityTitle = opportunity.Title,
                OpportunityStatus = opportunity.Status,
                InvestmentModel = opportunity.InvestmentModel,
                FounderId = opportunity.FounderId,
                FounderDisplayName = summary.FounderDisplayName,
                CoverImageUrl = opportunity.CoverImageUrl,
                ShortDescription = opportunity.ShortDescription,
                ParticipantId = latest.Id,
                ParticipationRequestId = latest.Id,
                ApprovedAt = latest.ReviewedAt,
                ApprovedContributionAmount = approvedContribution,
                Currency = SnapshotString(terms, "currencySnapshot") ?? opportunity.Currency,
                ParticipationStatus = OpportunityJoinRequestStatus.Approved,
                ProjectRoomUnlocked = true,
                CanOpenProjectRoom = true,
                ContractAvailable = contract != null,
                CurrentContractId = contract?.Id,
                CurrentContractVersion = contract?.CurrentVersionNumber,
                FundedAmount = summary.FundedAmount,
                FundingTarget = opportunity.FundingTarget,
                RemainingFundingAmount = summary.RemainingFundingAmount,
                FundingProgressPercentage = summary.FundingProgressPercentage,
                ApprovedParticipantCount = summary.ApprovedParticipantCount,
                ApprovedShares = opportunity.InvestmentModel == InvestmentModel.Equity ? approvedShares : null,
                SharePrice = isSnapshotAuthoritative ? SnapshotDecimal(terms, "sharePriceSnapshot") : SnapshotDecimal(terms, "sharePriceSnapshot") ?? opportunity.SharePrice,
                OwnershipPercentage = SnapshotDecimal(terms, "ownershipPercentage", "proposedSharePercentage"),
                TotalShares = opportunity.TotalShares,
                OfferedShares = opportunity.OfferedShares,
                SoldShares = summary.SoldShares,
                RemainingShares = summary.RemainingShares,
                AllocatedEquityPercentage = summary.AllocatedEquityPercentage,
                RemainingEquityPercentage = summary.RemainingEquityPercentage,
                Principal = opportunity.InvestmentModel == InvestmentModel.LoanInvestment ? approvedContribution : null,
                InterestRate = isSnapshotAuthoritative ? SnapshotDecimal(terms, "returnRateSnapshot") : SnapshotDecimal(terms, "returnRateSnapshot") ?? opportunity.InterestRate,
                ExpectedDurationMonths = isSnapshotAuthoritative ? SnapshotInt(terms, "termValueSnapshot") : SnapshotInt(terms, "termValueSnapshot") ?? opportunity.ExpectedDurationMonths,
                RepaymentFrequency = isSnapshotAuthoritative ? SnapshotString(terms, "repaymentModelSnapshot") : SnapshotString(terms, "repaymentModelSnapshot") ?? opportunity.RepaymentFrequency,
                FinalRepaymentDate = isSnapshotAuthoritative ? SnapshotDate(terms, "finalRepaymentDateSnapshot") : SnapshotDate(terms, "finalRepaymentDateSnapshot") ?? opportunity.FinalRepaymentDate,
                ExpectedReturn = SnapshotDecimal(terms, "expectedReturnAmount"),
                ExpectedTotalRepayment = SnapshotDecimal(terms, "expectedTotalRepaymentAmount"),
                Contribution = opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing ? approvedContribution : null,
                ProfitSharePercentage = isSnapshotAuthoritative ? SnapshotDecimal(terms, "profitSharePercentageSnapshot") : SnapshotDecimal(terms, "profitSharePercentageSnapshot") ?? opportunity.ProfitSharePercentage,
                PayoutFrequency = isSnapshotAuthoritative ? SnapshotString(terms, "payoutFrequencySnapshot") : SnapshotString(terms, "payoutFrequencySnapshot") ?? opportunity.ProfitSharingPayoutFrequency,
                ContractStartDate = isSnapshotAuthoritative ? SnapshotDate(terms, "contractStartDateSnapshot") : SnapshotDate(terms, "contractStartDateSnapshot") ?? opportunity.ProfitSharingContractStartDate,
                ContractEndDate = isSnapshotAuthoritative ? SnapshotDate(terms, "contractEndDateSnapshot") : SnapshotDate(terms, "contractEndDateSnapshot") ?? opportunity.ProfitSharingContractEndDate,
                ExpectedProfit = SnapshotDecimal(terms, "expectedProfitAmount"),
                ExpectedTotalPayout = SnapshotDecimal(terms, "expectedTotalPayoutAmount")
            };
        }).OrderByDescending(r => r.ApprovedAt).ToList();
    }

    public async Task<ParticipationPaymentScheduleDto> GetParticipationPaymentScheduleAsync(Guid investorId, int requestId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(investorId, "Only authenticated clients can view payment schedules.");
        var request = (await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.Id == requestId && r.InvestorId == investorId && r.Status == OpportunityJoinRequestStatus.Approved && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation,
            r => r.Opportunity!)).SingleOrDefault();
        if (request?.Opportunity == null)
            throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "Approved participation was not found.");
        return BuildInvestorCashFlowSchedule(request);
    }

    public async Task<IReadOnlyList<MonthlyCashFlowDto>> GetInvestorMonthlyCashFlowAsync(Guid investorId, CancellationToken cancellationToken = default)
    {
        var schedules = await GetInvestorCashFlowSchedulesAsync(investorId);
        return schedules.SelectMany(s => s.Payments).GroupBy(p => new DateTime(p.DueDate.Year, p.DueDate.Month, 1))
            .OrderBy(g => g.Key).Select(g => new MonthlyCashFlowDto { Month = g.Key, ExpectedInterest = g.Sum(x => x.ExpectedInterest), ExpectedPrincipal = g.Sum(x => x.ExpectedPrincipal), ActualReceived = null }).ToList();
    }

    public async Task<IReadOnlyList<ExpectedPaymentScheduleItemDto>> GetUpcomingPaymentsAsync(Guid investorId, CancellationToken cancellationToken = default)
    {
        var schedules = await GetInvestorCashFlowSchedulesAsync(investorId);
        return schedules.SelectMany(s => s.Payments).Where(p => p.Status is ExpectedPaymentStatus.Upcoming or ExpectedPaymentStatus.Due).OrderBy(p => p.DueDate).ToList();
    }

    public async Task<InvestorCashFlowSummaryDto> GetInvestorCashFlowSummaryAsync(Guid investorId, CancellationToken cancellationToken = default)
    {
        var schedules = await GetInvestorCashFlowSchedulesAsync(investorId); var all = schedules.SelectMany(s => s.Payments).ToList(); var today = DateTime.UtcNow.Date; var monthEnd = new DateTime(today.Year, today.Month, 1).AddMonths(1); var yearEnd = today.AddMonths(12); var next = all.Where(p => p.DueDate >= today && p.Status != ExpectedPaymentStatus.Cancelled).OrderBy(p => p.DueDate).FirstOrDefault();
        var principalPaid = all.Where(p => p.DueDate <= today && p.ExpectedPrincipal > 0).Sum(p => p.ExpectedPrincipal);
        var totalPrincipal = schedules.Sum(s => s.Principal);
        return new InvestorCashFlowSummaryDto { Currency = schedules.FirstOrDefault()?.Currency, TotalInvestedAmount = totalPrincipal, ExpectedIncomeThisMonth = all.Where(p => p.DueDate >= new DateTime(today.Year,today.Month,1) && p.DueDate < monthEnd).Sum(p => p.ExpectedTotal), NextPaymentAmount = next?.ExpectedTotal, NextPaymentDate = next?.DueDate, NextTwelveMonths = all.Where(p => p.DueDate >= today && p.DueDate <= yearEnd).Sum(p => p.ExpectedTotal), TotalExpectedInterest = schedules.Sum(s => s.TotalExpectedInterest), ReceivedToDate = all.Where(p => p.DueDate <= today && p.Status == ExpectedPaymentStatus.Paid).Sum(p => p.ExpectedTotal), RemainingPrincipal = totalPrincipal - principalPaid, OverdueAmount = all.Where(p => p.Status == ExpectedPaymentStatus.Overdue).Sum(p => p.ExpectedTotal), MonthlyCashFlow = (await GetInvestorMonthlyCashFlowAsync(investorId, cancellationToken)).ToList() };
    }

    private static void EnrichScheduleWithPayments(
        List<ExpectedPaymentScheduleItemDto> scheduleItems,
        ILookup<int, PaymentAllocation> allocationsByInstallmentNumber,
        List<PaymentTransaction> allPayments)
    {
        var today = DateTime.UtcNow.Date;
        var paymentsLookup = allPayments.ToDictionary(p => p.Id);

        for (int i = 0; i < scheduleItems.Count; i++)
        {
            var item = scheduleItems[i];
            var installmentNumber = i + 1;
            var installAllocs = allocationsByInstallmentNumber[installmentNumber].ToList();
            var totalPaid = installAllocs.Sum(a => a.AllocatedAmount);
            var latestAlloc = installAllocs.LastOrDefault();
            PaymentTransaction? latestPayment = null;
            if (latestAlloc != null)
                paymentsLookup.TryGetValue(latestAlloc.PaymentTransactionId, out latestPayment);

            item.ActualPaid = totalPaid > 0 ? totalPaid : null;
            item.RemainingAmount = item.ExpectedTotal - totalPaid;
            item.PaymentDate = latestPayment?.PaymentDate;
            item.PaymentReference = latestPayment?.Reference;

            if (totalPaid >= item.ExpectedTotal)
                item.Status = ExpectedPaymentStatus.Paid;
            else if (totalPaid > 0)
                item.Status = ExpectedPaymentStatus.PartiallyPaid;
            else if (item.DueDate < today)
                item.Status = ExpectedPaymentStatus.Overdue;
            else if (item.DueDate == today)
                item.Status = ExpectedPaymentStatus.Due;
            else
                item.Status = ExpectedPaymentStatus.Upcoming;
        }
    }

    public async Task<PaymentTransactionDetailDto> RecordPaymentAsync(
        Guid userId, int opportunityId, RecordPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOpportunityAsync(opportunityId, includeChildren: false);
        var participation = await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(request.ParticipationRequestId);
        if (participation == null || participation.OpportunityId != opportunityId)
            throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "Participation request was not found for this opportunity.");
        if (participation.Status != OpportunityJoinRequestStatus.Approved)
            throw new BusinessValidationException("PARTICIPATION_NOT_APPROVED", "Only approved participations can receive payments.");
        if (request.Amount <= 0)
            throw new BusinessValidationException("INVALID_PAYMENT_AMOUNT", "Payment amount must be greater than zero.");
        if (!string.IsNullOrWhiteSpace(request.Reference))
        {
            var dupRef = await _uow.Repository<PaymentTransaction>().ExistsAsync(pt =>
                pt.Reference == request.Reference.Trim() && !pt.IsReversed);
            if (dupRef)
                throw new BusinessValidationException("DUPLICATE_PAYMENT_REFERENCE", "A payment with this reference already exists.");
        }
        var recentDup = await _uow.Repository<PaymentTransaction>().ExistsAsync(pt =>
            pt.ParticipationRequestId == request.ParticipationRequestId
            && pt.Amount == request.Amount
            && pt.PaymentDate.Date == request.PaymentDate.Date
            && !pt.IsReversed);
        if (recentDup)
            throw new BusinessValidationException("DUPLICATE_PAYMENT", "An identical payment has already been recorded for this participation on the same date.");

        var now = DateTime.UtcNow;
        var transaction = new PaymentTransaction
        {
            ParticipationRequestId = request.ParticipationRequestId,
            Amount = request.Amount,
            PaymentDate = request.PaymentDate,
            Reference = request.Reference?.Trim(),
            Notes = request.Notes?.Trim(),
            CreatedByUserId = userId,
            CreatedAt = now
        };

        List<PaymentAllocation> allocations;
        if (opportunity.InvestmentModel == InvestmentModel.LoanInvestment)
        {
            allocations = await ComputeFifoAllocationsAsync(participation, request.Amount);
        }
        else
        {
            allocations = new List<PaymentAllocation>
            {
                new PaymentAllocation
                {
                    ParticipationRequestId = participation.Id,
                    InstallmentNumber = 0,
                    AllocatedAmount = request.Amount
                }
            };
        }

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _uow.Repository<PaymentTransaction>().AddAsync(transaction);
                await _uow.SaveChangesAsync();
                foreach (var alloc in allocations)
                {
                    alloc.PaymentTransactionId = transaction.Id;
                    await _uow.Repository<PaymentAllocation>().AddAsync(alloc);
                }
                await _uow.SaveChangesAsync();
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        var creator = await _uow.Repository<AuthUser>().GetByIdAsync(userId);
        var dto = ToPaymentTransactionDetailDto(transaction, allocations, creator?.Name);

        await ApplyReputationActivitySafeAsync(
            userId,
            "ConfirmPayment",
            "PaymentTransaction",
            transaction.Id.ToString());

        return dto;
    }

    public async Task<MonthlyBulkConfirmPreviewDto> GetMonthlyUnpaidInstallmentsAsync(
        Guid founderId, int opportunityId, int? year, int? month,
        CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOwnedOpportunityAsync(founderId, opportunityId, includeChildren: false);

        var now = DateTime.UtcNow;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;
        var monthStart = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);

        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.OpportunityId == opportunityId
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Approved,
            r => r.Investor!,
            r => r.Investor!.Profile!);

        var requestIds = approved.Select(r => r.Id).ToList();
        var existingAllocations = await _uow.Repository<PaymentAllocation>()
            .FindWithIncludesAsync(a => requestIds.Contains(a.ParticipationRequestId), a => a.PaymentTransaction!);
        var validAllocs = existingAllocations.Where(a => !a.PaymentTransaction.IsReversed).ToList();
        var paidByRequestAndInstallment = validAllocs
            .GroupBy(a => new { a.ParticipationRequestId, a.InstallmentNumber })
            .ToDictionary(g => g.Key, g => g.Sum(a => a.AllocatedAmount));

        var installments = new List<MonthlyUnpaidInstallmentItemDto>();
        var investorIds = new HashSet<Guid>();

        foreach (var participation in approved)
        {
            investorIds.Add(participation.InvestorId);
            var schedule = BuildPaymentSchedule(participation);
            var displayName = participation.Investor?.Profile?.FullName?.Trim() ?? participation.Investor?.Name?.Trim() ?? string.Empty;

            for (int i = 0; i < schedule.Payments.Count; i++)
            {
                var item = schedule.Payments[i];
                var installmentNumber = i + 1;

                if (item.DueDate < monthStart || item.DueDate >= monthEnd)
                    continue;

                var key = new { ParticipationRequestId = participation.Id, InstallmentNumber = installmentNumber };
                var alreadyPaid = paidByRequestAndInstallment.GetValueOrDefault(key, 0m);
                var remaining = item.ExpectedTotal - alreadyPaid;

                if (remaining <= 0)
                    continue;

                installments.Add(new MonthlyUnpaidInstallmentItemDto
                {
                    ParticipationRequestId = participation.Id,
                    InvestorId = participation.InvestorId,
                    InvestorDisplayName = displayName,
                    InstallmentNumber = installmentNumber,
                    DueDate = item.DueDate,
                    ExpectedTotal = item.ExpectedTotal,
                    AlreadyPaid = alreadyPaid,
                    RemainingAmount = remaining
                });
            }
        }

        return new MonthlyBulkConfirmPreviewDto
        {
            Year = targetYear,
            Month = targetMonth,
            InvestorCount = investorIds.Count,
            InstallmentCount = installments.Count,
            TotalRemainingAmount = installments.Sum(i => i.RemainingAmount),
            Installments = installments
        };
    }

    public async Task<BulkConfirmMonthlyResultDto> BulkConfirmMonthlyPaymentsAsync(
        Guid founderId, int opportunityId, BulkConfirmMonthlyRequest request,
        CancellationToken cancellationToken = default)
    {
        var preview = await GetMonthlyUnpaidInstallmentsAsync(founderId, opportunityId, request.Year, request.Month, cancellationToken);
        if (preview.Installments.Count == 0)
            throw new BusinessValidationException("NO_UNPAID_INSTALLMENTS", "No unpaid installments found for the specified month.");

        var now = DateTime.UtcNow;
        var today = now.Date;
        var founderUser = await _uow.Repository<AuthUser>().GetByIdAsync(founderId);
        if (founderUser == null)
            throw new BusinessValidationException("FOUNDER_NOT_FOUND", "Founder user not found.");

        var processedIds = new HashSet<(int ParticipationRequestId, int InstallmentNumber)>();
        var createdTransactions = new List<(PaymentTransaction Txn, List<PaymentAllocation> Allocs)>();

        foreach (var inst in preview.Installments)
        {
            var dedupKey = (inst.ParticipationRequestId, inst.InstallmentNumber);
            if (processedIds.Contains(dedupKey)) continue;
            processedIds.Add(dedupKey);

            var transaction = new PaymentTransaction
            {
                ParticipationRequestId = inst.ParticipationRequestId,
                Amount = inst.RemainingAmount,
                PaymentDate = today,
                Reference = $"BULK-{preview.Year}-{preview.Month:D2}-{inst.InstallmentNumber}",
                Notes = $"Bulk confirmation for {preview.Year}-{preview.Month:D2} (installment #{inst.InstallmentNumber})",
                CreatedByUserId = founderId,
                CreatedAt = now
            };

            var allocations = new List<PaymentAllocation>
            {
                new PaymentAllocation
                {
                    ParticipationRequestId = inst.ParticipationRequestId,
                    InstallmentNumber = inst.InstallmentNumber,
                    AllocatedAmount = inst.RemainingAmount
                }
            };

            createdTransactions.Add((transaction, allocations));
        }

        var confirmedCount = 0;
        var totalAmount = 0m;

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                foreach (var (txn, allocs) in createdTransactions)
                {
                    await _uow.Repository<PaymentTransaction>().AddAsync(txn);
                    await _uow.SaveChangesAsync();
                    foreach (var alloc in allocs)
                    {
                        alloc.PaymentTransactionId = txn.Id;
                        await _uow.Repository<PaymentAllocation>().AddAsync(alloc);
                    }
                    await _uow.SaveChangesAsync();

                    await ApplyReputationActivitySafeAsync(
                        founderId,
                        "ConfirmPayment",
                        "PaymentTransaction",
                        txn.Id.ToString());

                    confirmedCount++;
                    totalAmount += txn.Amount;
                }

                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        var founderRepAfter = (await _uow.Repository<AuthUser>().GetByIdAsync(founderId))?.ReputationScore ?? 0;
        var pointsPerConfirm = preview.Installments.Count * 5;
        var totalPoints = Math.Min(pointsPerConfirm, founderRepAfter == 0 ? pointsPerConfirm : founderRepAfter);

        var founderNotif = await _userNotificationService.CreateAsync(
            founderId.ToString(),
            "Off-Platform Payment Declaration Recorded",
            $"You recorded off-platform payment declarations for {confirmedCount} installment(s) totaling {totalAmount:N2} for {preview.InvestorCount} investor(s). Reputation points: +{totalPoints}. Current reputation: {founderRepAfter}.",
            "success",
            $"/admin/opportunities/{opportunityId}/room?tab=payments");

        var investorNotifIds = new List<int>();
        var notifiedInvestorIds = new HashSet<Guid>();
        foreach (var inst in preview.Installments)
        {
            if (notifiedInvestorIds.Contains(inst.InvestorId)) continue;
            notifiedInvestorIds.Add(inst.InvestorId);

            var investorNotif = await _userNotificationService.CreateAsync(
                inst.InvestorId.ToString(),
                "Off-Platform Payment Declaration",
                $"The founder recorded an off-platform payment declaration of {inst.RemainingAmount:N2} for the installment due {inst.DueDate:yyyy-MM-dd}. FOPX One did not process or verify this transfer. This notification is informational only.",
                "info",
                $"/admin/opportunities/{opportunityId}/room?tab=payments");

            investorNotifIds.Add((int)investorNotif.Id);
        }

        return new BulkConfirmMonthlyResultDto
        {
            ConfirmedCount = confirmedCount,
            TotalAmount = totalAmount,
            ReputationPointsAwarded = totalPoints,
            FounderNotificationId = (int)founderNotif.Id,
            InvestorNotificationIds = investorNotifIds
        };
    }

    public async Task<PaymentTransactionDetailDto> ReversePaymentAsync(
        Guid userId, int opportunityId, ReversePaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOpportunityAsync(opportunityId, includeChildren: false);
        var transaction = await _uow.Repository<PaymentTransaction>().GetByIdAsync(request.PaymentTransactionId);
        if (transaction == null)
            throw new BusinessValidationException("PAYMENT_TRANSACTION_NOT_FOUND", "Payment transaction was not found.");
        var participation = await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(transaction.ParticipationRequestId);
        if (participation == null || participation.OpportunityId != opportunityId)
            throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "Payment participation does not match this opportunity.");
        if (transaction.IsReversed)
            throw new BusinessValidationException("PAYMENT_ALREADY_REVERSED", "This payment has already been reversed.");
        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new BusinessValidationException("REVERSAL_REASON_REQUIRED", "A reversal reason is required.");

        var now = DateTime.UtcNow;
        transaction.IsReversed = true;
        transaction.ReversalReason = request.Reason.Trim();
        transaction.ReversedAt = now;
        transaction.ReversedByUserId = userId;

        var allocations = await _uow.Repository<PaymentAllocation>()
            .FindAsync(a => a.PaymentTransactionId == transaction.Id);

        await _uow.Repository<PaymentTransaction>().UpdateAsync(transaction);
        await _uow.SaveChangesAsync();

        try
        {
            var existingRepTxn = (await _uow.Repository<ReputationTransaction>().FindAsync(rt =>
                rt.ReferenceType == "PaymentTransaction"
                && rt.ReferenceId == transaction.Id.ToString()))
                .FirstOrDefault();

            if (existingRepTxn != null)
            {
                var reversalTxn = new ReputationTransaction
                {
                    UserId = existingRepTxn.UserId,
                    ReputationRuleId = existingRepTxn.ReputationRuleId,
                    ActivityCode = existingRepTxn.ActivityCode,
                    Points = -existingRepTxn.Points,
                    Reason = $"Reversal of payment confirmation #{transaction.Id}",
                    ReferenceType = "PaymentTransactionReversal",
                    ReferenceId = transaction.Id.ToString(),
                    CreatedByUserId = userId,
                    SourceModuleValue = ReputationTransaction.SourceModule.System,
                    OccurredAt = now,
                    CreatedAt = now
                };
                await _uow.Repository<ReputationTransaction>().AddAsync(reversalTxn);

                var user = await _uow.Repository<AuthUser>().GetByIdAsync(existingRepTxn.UserId);
                if (user != null)
                {
                    user.ReputationScore = Math.Max(0, user.ReputationScore - existingRepTxn.Points);
                    await _uow.Repository<AuthUser>().UpdateAsync(user);
                }
                await _uow.SaveChangesAsync();
            }
        }
        catch
        {
        }

        var reverser = await _uow.Repository<AuthUser>().GetByIdAsync(userId);
        return ToPaymentTransactionDetailDto(transaction, allocations.ToList(), reverser?.Name);
    }

    private async Task<List<PaymentAllocation>> ComputeFifoAllocationsAsync(OpportunityJoinRequest participation, decimal amount)
    {
        participation.Opportunity = await _uow.Repository<Opportunity>().GetByIdAsync(participation.OpportunityId);
        var schedule = BuildPaymentSchedule(participation);
        var existingAllocations = await _uow.Repository<PaymentAllocation>()
            .FindWithIncludesAsync(
                a => a.ParticipationRequestId == participation.Id,
                a => a.PaymentTransaction!);
        var paidByInstallment = existingAllocations
            .Where(a => !a.PaymentTransaction.IsReversed)
            .GroupBy(a => a.InstallmentNumber)
            .ToDictionary(g => g.Key, g => g.Sum(a => a.AllocatedAmount));

        var result = new List<PaymentAllocation>();
        var remaining = amount;

        for (int i = 0; i < schedule.Payments.Count && remaining > 0; i++)
        {
            var item = schedule.Payments[i];
            var installmentNumber = i + 1;
            var alreadyPaid = paidByInstallment.GetValueOrDefault(installmentNumber, 0m);
            var needed = item.ExpectedTotal - alreadyPaid;

            if (needed <= 0) continue;

            var allocated = Math.Min(remaining, needed);
            result.Add(new PaymentAllocation
            {
                ParticipationRequestId = participation.Id,
                InstallmentNumber = installmentNumber,
                AllocatedAmount = allocated
            });
            remaining -= allocated;
        }

        return result;
    }

    private static PaymentTransactionDetailDto ToPaymentTransactionDetailDto(
        PaymentTransaction txn, IReadOnlyCollection<PaymentAllocation> allocations, string? createdByName)
    {
        return new PaymentTransactionDetailDto
        {
            Id = txn.Id,
            ParticipationRequestId = txn.ParticipationRequestId,
            Amount = txn.Amount,
            PaymentDate = txn.PaymentDate,
            Reference = txn.Reference,
            Notes = txn.Notes,
            IsReversed = txn.IsReversed,
            ReversalReason = txn.ReversalReason,
            ReversedAt = txn.ReversedAt,
            CreatedByName = createdByName,
            CreatedAt = txn.CreatedAt,
            Allocations = allocations.Select(a => new PaymentAllocationDetailDto
            {
                InstallmentNumber = a.InstallmentNumber,
                AllocatedAmount = a.AllocatedAmount
            }).ToList()
        };
    }

    private async Task<List<ParticipationPaymentScheduleDto>> GetInvestorCashFlowSchedulesAsync(Guid investorId)
    {
        await ValidateClientAsync(investorId, "Only authenticated clients can view expected cash flow.");
        var requests = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(r => r.InvestorId == investorId && r.Status == OpportunityJoinRequestStatus.Approved && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation, r => r.Opportunity!);
        return requests
            .Where(r => r.Opportunity?.InvestmentModel is InvestmentModel.LoanInvestment or InvestmentModel.CapitalContributionProfitSharing)
            .Select(BuildInvestorCashFlowSchedule)
            .ToList();
    }

    private static ParticipationPaymentScheduleDto BuildInvestorCashFlowSchedule(OpportunityJoinRequest request)
    {
        return request.Opportunity?.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing
            ? BuildProfitSharingPaymentSchedule(request)
            : BuildPaymentSchedule(request);
    }

    private static ParticipationPaymentScheduleDto BuildProfitSharingPaymentSchedule(OpportunityJoinRequest request)
    {
        var opportunity = request.Opportunity!;
        var terms = TermsSnapshotParser.Parse(request.TermsSnapshotJson).Normalized;
        var contribution = request.RequestedAmount ?? SnapshotDecimal(terms, "contributionAmount") ?? 0m;
        var expectedProfit = SnapshotDecimal(terms, "expectedProfitAmount") ?? 0m;
        var durationMonths = SnapshotInt(terms, "termValueSnapshot") ?? SnapshotInt(terms, "expectedDurationMonthsSnapshot") ?? opportunity.ExpectedDurationMonths;
        var frequency = SnapshotString(terms, "payoutFrequencySnapshot") ?? opportunity.ProfitSharingPayoutFrequency;
        var startDate = SnapshotDate(terms, "contractStartDateSnapshot") ?? opportunity.ProfitSharingContractStartDate ?? request.ReviewedAt ?? request.CreatedAt;
        var finalDate = SnapshotDate(terms, "contractEndDateSnapshot") ?? opportunity.ProfitSharingContractEndDate;
        if (finalDate == null && durationMonths is > 0) finalDate = startDate.AddMonths(durationMonths.Value);
        if (durationMonths == null && finalDate != null) durationMonths = Math.Max(1, ((finalDate.Value.Year - startDate.Year) * 12) + finalDate.Value.Month - startDate.Month);
        if (contribution <= 0 || expectedProfit < 0 || durationMonths is null or <= 0 || string.IsNullOrWhiteSpace(frequency) || finalDate == null)
            throw new BusinessValidationException("PROFIT_SHARING_SCHEDULE_TERMS_INCOMPLETE", "Approved Profit Sharing participation does not contain complete authoritative cash-flow terms.");
        return ProfitSharingCashFlowCalculator.Calculate(request.Id, opportunity.Id, opportunity.Title, SnapshotString(terms, "currencySnapshot") ?? opportunity.Currency, contribution, expectedProfit, durationMonths.Value, frequency, startDate, finalDate.Value);
    }

    private static ParticipationPaymentScheduleDto BuildPaymentSchedule(OpportunityJoinRequest request)
    {
        var opportunity = request.Opportunity!;
        var parseResult = TermsSnapshotParser.Parse(request.TermsSnapshotJson);
        var terms = parseResult.Normalized;
        var principal = request.RequestedAmount ?? 0m;
        var rate = SnapshotDecimal(terms, "returnRateSnapshot") ?? opportunity.InterestRate;
        var months = SnapshotInt(terms, "termValueSnapshot") ?? opportunity.ExpectedDurationMonths;
        var frequency = SnapshotString(terms, "repaymentModelSnapshot") ?? opportunity.RepaymentFrequency;
        var finalDate = SnapshotDate(terms, "finalRepaymentDateSnapshot") ?? opportunity.FinalRepaymentDate;
        if (principal <= 0 || rate is null or <= 0 || months is null or <= 0 || string.IsNullOrWhiteSpace(frequency) || finalDate == null)
            throw new BusinessValidationException("LOAN_SCHEDULE_TERMS_INCOMPLETE", "Approved loan participation does not contain complete authoritative schedule terms.");
        return LoanCashFlowCalculator.Calculate(request.Id, opportunity.Id, opportunity.Title, SnapshotString(terms,"currencySnapshot") ?? opportunity.Currency, principal, rate.Value, months.Value, frequency, request.ReviewedAt ?? request.CreatedAt, finalDate.Value);
    }

    public async Task<OpportunityDetailDto> GetFounderOpportunityAsync(Guid founderId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        var dto = ToDetailDto(opportunity, founder: founder, tagLookup: await GetActiveTagLookupAsync());
        await ApplyParticipationSummaryAsync(dto);
        return dto;
    }

    public async Task<OpportunityRoomDto> GetProjectRoomAsync(Guid userId, int id, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can access an investor project room.");
        var opportunity = await GetOpportunityAsync(id, includeChildren: true);
        var isFounder = opportunity.FounderId == userId;
        var summary = await GetParticipationSummaryAsync(id);
        var approvedParticipantCount = summary.ApprovedParticipantCount;
        var isApprovedParticipant = false;

        if (!isFounder)
        {
            isApprovedParticipant = await _uow.Repository<OpportunityJoinRequest>().ExistsAsync(r =>
                r.OpportunityId == id
                && r.InvestorId == userId
                && r.Status == OpportunityJoinRequestStatus.Approved);
        }

        if (!isFounder && !isApprovedParticipant)
            throw new BusinessValidationException("PROJECT_ROOM_FORBIDDEN", "Project room access requires founder ownership or an approved join request.");

        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        return ToRoomDto(opportunity, founder, isFounder, isApprovedParticipant, summary);
    }

    public async Task<OpportunityMediaDto> AddMediaAsync(Guid founderId, int id, CreateOpportunityMediaRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateRequired(request.FileUrl, "FILE_URL_REQUIRED", "FileUrl is required.");
        ValidateRequired(request.FileName, "FILE_NAME_REQUIRED", "FileName is required.");
        ValidateRequired(request.FileType, "FILE_TYPE_REQUIRED", "FileType is required.");
        ValidateRequired(request.MediaType, "MEDIA_TYPE_REQUIRED", "MediaType is required.");
        if (!request.IsPublic.HasValue)
            throw new BusinessValidationException("MEDIA_VISIBILITY_REQUIRED", "Media visibility must be explicitly Public or Private.");

        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        var now = DateTime.UtcNow;
        var purpose = ResolveMediaPurpose(request);
        ValidateMediaPurposeVisibility(purpose, request.IsPublic.Value);

        if (request.IsCover)
        {
            foreach (var existing in opportunity.Media)
                existing.IsCover = false;

            opportunity.CoverImageUrl = request.FileUrl.Trim();
        }

        var media = new OpportunityMedia
        {
            OpportunityId = id,
            FileUrl = request.FileUrl.Trim(),
            FileId = Normalize(request.FileId),
            FileKey = Normalize(request.FileKey),
            FileName = request.FileName.Trim(),
            FileType = request.FileType.Trim(),
            MimeType = Normalize(request.MimeType),
            FileSize = request.FileSize,
            PreviewUrl = Normalize(request.PreviewUrl),
            ThumbnailUrl = Normalize(request.ThumbnailUrl),
            MediaType = request.MediaType.Trim(),
            IsCover = request.IsCover,
            IsPublic = request.IsPublic.Value,
            Purpose = purpose,
            SortOrder = request.SortOrder,
            CreatedByUserId = founderId,
            CreatedAt = now
        };

        opportunity.Media.Add(media);
        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = "MediaUploaded",
            Title = "Media uploaded",
            Description = media.FileName,
            CreatedByUserId = founderId,
            CreatedAt = now,
            IsPublic = media.IsPublic
        });
        opportunity.UpdatedAt = now;

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();

        return ToMediaDto(media);
    }

    public async Task<OpportunityDocumentDto> AddDocumentAsync(Guid founderId, int id, CreateOpportunityDocumentRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateRequired(request.FileUrl, "FILE_URL_REQUIRED", "FileUrl is required.");
        ValidateRequired(request.FileName, "FILE_NAME_REQUIRED", "FileName is required.");
        ValidateRequired(request.FileExtension, "FILE_EXTENSION_REQUIRED", "FileExtension is required.");
        ValidateRequired(request.DocumentType, "DOCUMENT_TYPE_REQUIRED", "DocumentType is required.");

        if (!request.Visibility.HasValue || !Enum.IsDefined(request.Visibility.Value))
            throw new BusinessValidationException("INVALID_DOCUMENT_VISIBILITY", "Document visibility must be Public or Private.");

        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        var now = DateTime.UtcNow;
        var purpose = ResolveDocumentPurpose(request);
        ValidateDocumentPurposeVisibility(purpose, request.Visibility.Value);

        var document = new OpportunityDocument
        {
            OpportunityId = id,
            FileUrl = request.FileUrl.Trim(),
            FileId = Normalize(request.FileId),
            FileKey = Normalize(request.FileKey),
            FileName = request.FileName.Trim(),
            FileExtension = request.FileExtension.Trim(),
            MimeType = Normalize(request.MimeType),
            FileSize = request.FileSize,
            PreviewUrl = Normalize(request.PreviewUrl),
            ThumbnailUrl = Normalize(request.ThumbnailUrl),
            DocumentType = request.DocumentType.Trim(),
            Visibility = request.Visibility.Value,
            Purpose = purpose,
            Category = Normalize(request.Category),
            SearchTags = Normalize(request.SearchTags),
            CreatedByUserId = founderId,
            CreatedAt = now
        };

        opportunity.Documents.Add(document);
        if (document.Visibility == OpportunityDocumentVisibility.Public)
        {
            ProjectActivityTimeline.Add(
                opportunity.Events,
                opportunity.Id,
                ProjectActivityTimeline.Types.DocumentPublished,
                "Founder",
                founderId,
                now,
                "OpportunityDocument",
                document.FileId ?? document.FileKey ?? document.FileName,
                $"document-published:{Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(document.FileUrl)))}",
                new Dictionary<string, string?> { ["documentName"] = document.FileName });
        }
        opportunity.UpdatedAt = now;

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();
        if (document.Visibility == OpportunityDocumentVisibility.Public)
        {
            await PublishOpportunityRoomChangedAsync(
                opportunity,
                ProjectActivityTimeline.Types.DocumentPublished,
                document.Id.ToString(),
                cancellationToken);
            await NotifyApprovedParticipantsOfProjectUpdateAsync(
                opportunity,
                founderId,
                $"document:{document.Id}",
                document.FileName,
                cancellationToken);
        }
        await ApplyReputationActivitySafeAsync(
            founderId,
            "UploadProjectDocument",
            "OpportunityDocument",
            document.Id.ToString());

        return ToDocumentDto(document);
    }

    public async Task<OpportunityEventDto> AddEventAsync(Guid founderId, int id, CreateOpportunityEventRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateRequired(request.EventType, "EVENT_TYPE_REQUIRED", "EventType is required.");
        ValidateRequired(request.Title, "EVENT_TITLE_REQUIRED", "Title is required.");

        if (!IsMilestoneEvent(request.EventType))
            throw new BusinessValidationException("MANUAL_PROJECT_UPDATES_DISABLED", "Project activity is generated automatically from completed business actions.");

        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        var now = DateTime.UtcNow;

        var opportunityEvent = new OpportunityEvent
        {
            OpportunityId = id,
            EventType = request.EventType.Trim(),
            Title = request.Title.Trim(),
            Description = Normalize(request.Description),
            OldValue = Normalize(request.OldValue),
            NewValue = Normalize(request.NewValue),
            CreatedByUserId = founderId,
            CreatedAt = now,
            IsPublic = false
        };

        opportunity.Events.Add(opportunityEvent);
        var milestoneActivityType = ResolveMilestoneActivityType(request.EventType);
        var milestoneKey = $"milestone:{id}:{milestoneActivityType}:{now.Ticks}";
        ProjectActivityTimeline.Add(
            opportunity.Events,
            id,
            milestoneActivityType,
            "Founder",
            founderId,
            now,
            "OpportunityMilestone",
            milestoneKey,
            milestoneKey,
            new Dictionary<string, string?>
            {
                ["milestoneTitle"] = opportunityEvent.Title,
                ["milestoneDescription"] = opportunityEvent.Description
            });
        opportunity.UpdatedAt = now;

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();
        await PublishOpportunityRoomChangedAsync(
            opportunity,
            milestoneActivityType,
            opportunityEvent.Id.ToString(),
            cancellationToken);
        await NotifyApprovedParticipantsOfProjectUpdateAsync(
            opportunity,
            founderId,
            $"milestone:{opportunityEvent.Id}",
            opportunityEvent.Title,
            cancellationToken);
        await ApplyReputationActivitySafeAsync(
            founderId,
            "AddProjectMilestone",
            "OpportunityEvent",
            opportunityEvent.Id.ToString());

        return ToEventDto(opportunityEvent);
    }

    public async Task<IReadOnlyList<OpportunityEventDto>> GetEventsAsync(Guid founderId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        return opportunity.Events
            .OrderByDescending(e => e.CreatedAt)
            .Select(ToEventDto)
            .ToList();
    }

    public async Task<IReadOnlyList<OpportunityDocumentDto>> GetDocumentsAsync(Guid founderId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        return opportunity.Documents
            .OrderByDescending(d => d.CreatedAt)
            .Select(ToDocumentDto)
            .ToList();
    }

    public async Task<IReadOnlyList<OpportunityMediaDto>> GetMediaAsync(Guid founderId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        return opportunity.Media
            .OrderBy(m => m.SortOrder)
            .ThenByDescending(m => m.CreatedAt)
            .Select(ToMediaDto)
            .ToList();
    }

    public async Task<IReadOnlyList<OpportunityDto>> GetPublicAsync(OpportunityDiscoveryQuery query, Guid? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var opportunities = await _uow.Repository<Opportunity>()
            .FindWithIncludesAsync(
                o => PublicStatuses.Contains(o.Status),
                o => o.Category!,
                o => o.FundingGoal!,
                o => o.OpportunityTags);
        var tagLookup = await GetActiveTagLookupAsync();

        var filtered = ApplyDiscoveryFilters(opportunities.ToList(), query);
        var founders = await GetFounderLookupAsync(filtered.Select(o => o.FounderId));

        var result = filtered
            .OrderByDescending(o => o.UpdatedAt)
            .Select(o => ToDto(
                o,
                founders.TryGetValue(o.FounderId, out var founder) ? founder : null,
                tagLookup))
            .ToList();
        if (currentUserId.HasValue)
        {
            var favoriteIds = await GetFavoriteOpportunityIdsAsync(currentUserId.Value);
            foreach (var dto in result)
                dto.Favorited = favoriteIds.Contains(dto.Id);
        }
        await ApplyParticipationSummariesAsync(result);
        return result;
    }

    public async Task<OpportunityDetailDto> GetPublicByIdAsync(int id, Guid? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var opportunity = await _uow.Repository<Opportunity>().GetSingleAsync(
            o => o.Id == id && PublicStatuses.Contains(o.Status),
            o => o.Media,
            o => o.Documents,
            o => o.Events,
            o => o.Category!,
            o => o.FundingGoal!,
            o => o.OpportunityTags);

        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        var dto = ToDetailDto(
            opportunity,
            publicOnly: true,
            founder: founder,
            tagLookup: await GetActiveTagLookupAsync());
        dto.Favorited = currentUserId.HasValue && await IsFavoriteAsync(currentUserId.Value, id, cancellationToken);
        var publicActivity = opportunity.Events.Where(ProjectActivityTimeline.IsInvestorVisible).ToList();
        dto.ProjectActivityTotalCount = publicActivity.Count;
        dto.RecentProjectActivity = ProjectActivityTimeline.SelectPublic(publicActivity, 0, 5)
            .Select(ToProjectActivityTimelineDto)
            .ToList();
        dto.Events = Array.Empty<OpportunityEventDto>();
        await ApplyParticipationSummaryAsync(dto);
        return dto;
    }

    public async Task<PublicProjectActivityPageDto> GetPublicProjectActivityAsync(
        int id,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var opportunity = await _uow.Repository<Opportunity>().GetSingleAsync(
            o => o.Id == id && PublicStatuses.Contains(o.Status),
            o => o.Events);

        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

        var total = opportunity.Events.Count(ProjectActivityTimeline.IsInvestorVisible);
        var items = ProjectActivityTimeline.SelectPublic(opportunity.Events, (page - 1) * pageSize, pageSize)
            .Select(ToProjectActivityTimelineDto)
            .ToList();

        return new PublicProjectActivityPageDto
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IReadOnlyList<OpportunityDto>> GetFavoriteOpportunitiesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view favorites.");
        var favoriteIds = await GetFavoriteOpportunityIdsAsync(userId);
        if (favoriteIds.Count == 0) return Array.Empty<OpportunityDto>();

        var opportunities = await GetPublicAsync(new OpportunityDiscoveryQuery(), userId, cancellationToken);
        return opportunities.Where(o => favoriteIds.Contains(o.Id)).ToList();
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view favorites.");
        return (await _uow.Repository<InvestmentFavorite>().FindAsync(f =>
            f.InvestorId == userId && f.OpportunityId == opportunityId)).Any();
    }

    public async Task<bool> SetFavoriteAsync(Guid userId, int opportunityId, bool favorited, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can update favorites.");
        var repository = _uow.Repository<InvestmentFavorite>();
        var existing = (await repository.FindAsync(f => f.InvestorId == userId && f.OpportunityId == opportunityId)).SingleOrDefault();

        if (!favorited)
        {
            if (existing != null)
            {
                await repository.DeleteAsync(existing);
                await _uow.SaveChangesAsync();
            }
            return false;
        }

        var opportunity = await _uow.Repository<Opportunity>().GetByIdAsync(opportunityId);
        if (opportunity == null || !PublicStatuses.Contains(opportunity.Status))
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Published opportunity was not found.");

        if (existing == null)
        {
            await repository.AddAsync(new InvestmentFavorite
            {
                InvestorId = userId,
                OpportunityId = opportunityId,
                CreatedAt = DateTime.UtcNow
            });
            await _uow.SaveChangesAsync();
        }
        return true;
    }

    private async Task<HashSet<int>> GetFavoriteOpportunityIdsAsync(Guid userId)
    {
        var favorites = await _uow.Repository<InvestmentFavorite>().FindAsync(f => f.InvestorId == userId && f.OpportunityId.HasValue);
        return favorites.Select(f => f.OpportunityId!.Value).ToHashSet();
    }

    public async Task<OpportunityDetailDto> PublishAsync(Guid founderId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);

        if (opportunity.Status is not (OpportunityStatus.Draft or OpportunityStatus.Rejected))
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", "Only Draft or Rejected opportunities can be published.");

        ValidateCompleteForReview(opportunity);
        ChangeStatusWithEvent(opportunity, OpportunityStatus.Published, "Published", "Opportunity published", "Founder published opportunity to public.", founderId, isPublic: false);

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _paidActionService.ChargeAsync(
                    founderId,
                    PricingAction.PublishOpportunity,
                    ReferenceType.Opportunity,
                    id.ToString(),
                    cancellationToken);

                await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    founderId,
                    "PublishOpportunity",
                    "Opportunity",
                    opportunity.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        var result = ToDetailDto(opportunity, tagLookup: await GetActiveTagLookupAsync());
        await ApplyParticipationSummaryAsync(result);
        return result;
    }

    public async Task<OpportunityParticipationFormDto> GetParticipationFormAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(userId, "Only authenticated clients can view participation form data.");
        var opportunity = await GetOpportunityAsync(opportunityId, includeChildren: false);

        if (opportunity.FounderId == userId)
            throw new BusinessValidationException("FOUNDER_CANNOT_PARTICIPATE", "Founder cannot participate in their own opportunity.");

        if (!IsEligibleForJoin(opportunity))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for participation.");

        var linkedInvestment = await GetLinkedInvestmentAsync(opportunity.Id);
        var participationSummary = await GetParticipationSummaryAsync(opportunity.Id);
        var alreadyFundedAmount = participationSummary.FundedAmount;
        var remainingFundingAmount = participationSummary.RemainingFundingAmount;
        var sharePrice = opportunity.SharePrice;
        var totalShares = opportunity.OfferedShares;
        var approvedShares = participationSummary.SoldShares;
        int? availableShares = totalShares.HasValue
            ? Math.Max(totalShares.Value - approvedShares, 0)
            : null;
        var currency = opportunity.Currency ?? linkedInvestment?.Currency ?? "Credits";
        var minimumInvestment = opportunity.MinimumInvestmentAmount ?? linkedInvestment?.MinInvestment;
        var maximumInvestment = opportunity.MaximumInvestmentAmount ?? linkedInvestment?.MaxInvestment;
        var loanTermMonths = ResolveLoanTermMonths(opportunity);
        var profitSharingTermMonths = ResolveProfitSharingTermMonths(opportunity, linkedInvestment);
        var profitSharePercentage = opportunity.ProfitSharePercentage;

        return new OpportunityParticipationFormDto
        {
            OpportunityId = opportunity.Id,
            OpportunityTitle = opportunity.Title,
            InvestmentModel = opportunity.InvestmentModel,
            FundingTarget = opportunity.FundingTarget,
            AlreadyFundedAmount = alreadyFundedAmount,
            RemainingFundingAmount = remainingFundingAmount,
            FundingProgressPercentage = participationSummary.FundingProgressPercentage,
            ApprovedParticipantCount = participationSummary.ApprovedParticipantCount,
            Currency = currency,
            MinimumContribution = minimumInvestment,
            MaximumContribution = maximumInvestment,
            ReturnRate = opportunity.InvestmentModel == InvestmentModel.LoanInvestment ? opportunity.InterestRate : null,
            ReturnRateType = opportunity.InvestmentModel == InvestmentModel.LoanInvestment && opportunity.InterestRate.HasValue == true
                ? "AnnualSimple"
                : null,
            TermValue = opportunity.InvestmentModel switch
            {
                InvestmentModel.LoanInvestment => loanTermMonths,
                InvestmentModel.CapitalContributionProfitSharing => profitSharingTermMonths,
                _ => null
            },
            TermUnit = opportunity.InvestmentModel switch
            {
                InvestmentModel.LoanInvestment when loanTermMonths.HasValue => "Months",
                InvestmentModel.CapitalContributionProfitSharing when profitSharingTermMonths.HasValue => "Months",
                _ => null
            },
            RepaymentModel = opportunity.InvestmentModel == InvestmentModel.LoanInvestment ? opportunity.RepaymentFrequency : null,
            ExpectedMaturityDate = opportunity.InvestmentModel == InvestmentModel.LoanInvestment ? opportunity.FinalRepaymentDate : null,
            ProfitSharePercentage = opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing ? profitSharePercentage : null,
            ExpectedProfitAmount = null,
            ExpectedTotalPayoutAmount = null,
            OpportunityTotalExpectedPayout = opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing ? linkedInvestment?.TotalExpectedPayout : null,
            ExitTerms = opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing ? BuildProfitSharingExitTerms(opportunity, linkedInvestment) : null,
            ContractStartDate = opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing ? opportunity.ProfitSharingContractStartDate : null,
            ContractEndDate = opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing ? opportunity.ProfitSharingContractEndDate : null,
            TotalShares = totalShares,
            OfferedShares = opportunity.OfferedShares,
            SoldShares = participationSummary.SoldShares,
            RemainingShares = participationSummary.RemainingShares,
            AllocatedEquityPercentage = participationSummary.AllocatedEquityPercentage,
            RemainingEquityPercentage = participationSummary.RemainingEquityPercentage,
            AvailableShares = availableShares,
            SharePrice = sharePrice,
            MinimumInvestmentAmount = minimumInvestment,
            MaximumInvestmentAmount = maximumInvestment,
            MinimumShares = CalculateMinimumShares(minimumInvestment, sharePrice),
            MaximumShares = CalculateMaximumShares(maximumInvestment, sharePrice)
        };
    }

    public async Task<IReadOnlyList<OpportunityLookupDto>> GetOpportunityCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _uow.Repository<OpportunityCategory>().FindAsync(c => c.IsActive);
        return categories
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => ToLookupDto(c)!)
            .ToList();
    }

    public async Task<IReadOnlyList<OpportunityLookupDto>> GetOpportunityTagsAsync(CancellationToken cancellationToken = default)
    {
        var tags = await _uow.Repository<OpportunityTag>().FindAsync(t => t.IsActive);
        return tags
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .Select(ToLookupDto)
            .ToList();
    }

    public async Task<IReadOnlyList<OpportunityLookupDto>> GetFundingGoalsAsync(CancellationToken cancellationToken = default)
    {
        var goals = await _uow.Repository<FundingGoal>().FindAsync(g => g.IsActive);
        return goals
            .OrderBy(g => g.SortOrder)
            .ThenBy(g => g.Name)
            .Select(g => ToLookupDto(g)!)
            .ToList();
    }

    public async Task<OpportunityJoinRequestDto> CreateJoinRequestAsync(Guid investorId, int opportunityId, CreateOpportunityJoinRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(investorId, "Only authenticated clients can request to join an opportunity.");
        var opportunity = await GetOpportunityAsync(opportunityId, includeChildren: true);
        if (opportunity.FounderId == investorId)
            throw new BusinessValidationException("FOUNDER_CANNOT_JOIN_OWN_OPPORTUNITY", "Founder cannot request to join their own opportunity.");

        if (!IsEligibleForJoin(opportunity))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for join requests.");

        var hasActiveRequest = await _uow.Repository<OpportunityJoinRequest>().ExistsAsync(r =>
            r.OpportunityId == opportunityId
            && r.InvestorId == investorId
            && (r.Status == OpportunityJoinRequestStatus.Pending || r.Status == OpportunityJoinRequestStatus.Approved));

        if (hasActiveRequest)
            throw new BusinessValidationException("DUPLICATE_JOIN_REQUEST", "An active join request already exists for this opportunity.");

        var requestDetails = await BuildJoinRequestDetailsAsync(opportunity, request);
        var now = DateTime.UtcNow;
        var joinRequest = new OpportunityJoinRequest
        {
            OpportunityId = opportunityId,
            InvestorId = investorId,
            RequestType = requestDetails.RequestType,
            RequestedAmount = requestDetails.RequestedAmount,
            CalculatedTotalAmount = requestDetails.CalculatedTotalAmount,
            Message = Normalize(request.Message),
            TermsSnapshotJson = requestDetails.TermsSnapshotJson,
            Status = OpportunityJoinRequestStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };

        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = requestDetails.EventType,
            Title = requestDetails.EventTitle,
            Description = requestDetails.EventDescription,
            CreatedByUserId = investorId,
            CreatedAt = now,
            IsPublic = false
        });
        opportunity.UpdatedAt = now;

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await _paidActionService.ChargeAsync(
                    investorId,
                    PricingAction.SubmitParticipationRequest,
                    ReferenceType.OpportunityJoinRequest,
                    $"{opportunityId}:{investorId}",
                    cancellationToken);

                await _uow.Repository<OpportunityJoinRequest>().AddAsync(joinRequest);
                await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    investorId,
                    "SubmitParticipationRequest",
                    "OpportunityJoinRequest",
                    joinRequest.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        await PublishOpportunityRoomChangedAsync(
            opportunity,
            ProjectActivityTimeline.Types.ParticipationApproved,
            joinRequest.Id.ToString(),
            cancellationToken);

        if (joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
        {
            var investor = await _uow.Repository<AuthUser>().GetByIdAsync(investorId);
            var investorName = investor?.Profile?.FullName ?? investor?.Name ?? "An investor";
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                opportunity.FounderId,
                "ParticipationRequestCreated",
                joinRequest.Id.ToString(),
                "New participation request",
                $"{investorName} submitted a participation request for {opportunity.Title}.",
                "info",
                "/admin/requests",
                investorId,
                opportunity.Id), cancellationToken);
        }

        return await GetJoinRequestDtoAsync(joinRequest.Id, includeRejectionReason: true);
    }

    public async Task<IReadOnlyList<OpportunityJoinRequestDto>> GetMyJoinRequestsAsync(Guid investorId, OpportunityJoinRequestQuery query, CancellationToken cancellationToken = default)
    {
        await ValidateClientAsync(investorId, "Only authenticated clients can view their join requests.");

        var requests = (await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
                r => r.InvestorId == investorId && r.IsVisibleToInvestor,
                r => r.Opportunity!,
                r => r.Investor!,
                r => r.Investor!.Profile!,
                r => r.Investor!.Client!))
            .ToList();

        if (query.Status.HasValue)
        {
            if (!Enum.IsDefined(query.Status.Value))
                throw new BusinessValidationException("INVALID_JOIN_REQUEST_STATUS", "Unknown join request status.");

            requests = requests.Where(r => r.Status == query.Status.Value).ToList();
        }

        if (query.OpportunityId.HasValue)
            requests = requests.Where(r => r.OpportunityId == query.OpportunityId.Value).ToList();

        var founderIds = requests
            .Where(r => r.Opportunity != null)
            .Select(r => r.Opportunity!.FounderId)
            .Distinct()
            .ToHashSet();
        var founders = founderIds.Count == 0
            ? new Dictionary<Guid, AuthUser>()
            : (await _uow.Repository<AuthUser>().FindWithIncludesAsync(
                    user => founderIds.Contains(user.Id),
                    user => user.Profile!,
                    user => user.Client!))
                .ToDictionary(user => user.Id);

        return requests
            .OrderByDescending(r => r.CreatedAt)
            .Select(r =>
            {
                founders.TryGetValue(r.Opportunity?.FounderId ?? Guid.Empty, out var founder);
                return ToJoinRequestDto(r, includeRejectionReason: true, founder);
            })
            .ToList();
    }

    public async Task<OpportunityJoinRequestDto> CancelJoinRequestAsync(Guid investorId, int requestId, CancellationToken cancellationToken = default)
    {
        var joinRequest = await GetJoinRequestAsync(requestId);
        if (joinRequest.InvestorId != investorId)
            throw new BusinessValidationException("JOIN_REQUEST_FORBIDDEN", "Only the request owner can cancel this join request.");

        if (joinRequest.Status != OpportunityJoinRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_JOIN_REQUEST_STATUS_TRANSITION", "Only pending join requests can be cancelled.");

        var now = DateTime.UtcNow;
        joinRequest.Status = OpportunityJoinRequestStatus.Cancelled;
        joinRequest.UpdatedAt = now;

        await _uow.Repository<OpportunityJoinRequest>().UpdateAsync(joinRequest);
        await _uow.SaveChangesAsync();

        if (joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
        {
            var opportunity = await GetOpportunityAsync(joinRequest.OpportunityId, includeChildren: false);
            var investor = await _uow.Repository<AuthUser>().GetByIdAsync(investorId);
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                opportunity.FounderId,
                "ParticipationRequestWithdrawn",
                joinRequest.Id.ToString(),
                "Participation request withdrawn",
                $"{investor?.Profile?.FullName ?? investor?.Name ?? "An investor"} withdrew the participation request for {opportunity.Title}.",
                "info",
                "/admin/requests",
                investorId,
                joinRequest.OpportunityId), cancellationToken);
        }

        return await GetJoinRequestDtoAsync(requestId, includeRejectionReason: true);
    }

    public async Task<IReadOnlyList<OpportunityJoinRequestDto>> GetOpportunityJoinRequestsAsync(Guid founderId, int opportunityId, CancellationToken cancellationToken = default)
    {
        await GetOwnedOpportunityAsync(founderId, opportunityId, includeChildren: false);

        var requests = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.OpportunityId == opportunityId && r.IsVisibleToFounder,
            r => r.Opportunity!,
            r => r.Investor!);

        return requests
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => ToJoinRequestDto(r, includeRejectionReason: true))
            .ToList();
    }

    public async Task<IReadOnlyList<FounderIncomingJoinRequestDto>> GetIncomingJoinRequestsAsync(Guid founderId, CancellationToken cancellationToken = default)
    {
        await ValidateFounderClientAsync(founderId);

        var requests = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.Opportunity!.FounderId == founderId && r.IsVisibleToFounder,
            r => r.Opportunity!,
            r => r.Investor!,
            r => r.Investor!.Profile!,
            r => r.Investor!.Client!);

        return requests
            .OrderByDescending(r => r.CreatedAt)
            .Select(ToFounderIncomingJoinRequestDto)
            .ToList();
    }

    public async Task<FounderIncomingJoinRequestDto> GetIncomingJoinRequestAsync(Guid founderId, int requestId, CancellationToken cancellationToken = default)
    {
        await ValidateFounderClientAsync(founderId);

        var request = await _uow.Repository<OpportunityJoinRequest>().GetSingleAsync(
            r => r.Id == requestId && r.Opportunity!.FounderId == founderId && r.IsVisibleToFounder,
            r => r.Opportunity!,
            r => r.Investor!);

        if (request == null)
            throw new BusinessValidationException("JOIN_REQUEST_NOT_FOUND", "Join request was not found.");

        return ToFounderIncomingJoinRequestDto(request);
    }

    public async Task<OpportunityJoinRequestDto> ApproveJoinRequestAsync(Guid founderId, int requestId, CancellationToken cancellationToken = default)
    {
        var joinRequest = await GetJoinRequestAsync(requestId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, joinRequest.OpportunityId, includeChildren: true);

        if (joinRequest.Status != OpportunityJoinRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_JOIN_REQUEST_STATUS_TRANSITION", "Only pending join requests can be approved.");

        if (opportunity.InvestmentModel == InvestmentModel.Equity && joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
            await ValidateEquityAvailabilityForApprovalAsync(opportunity, joinRequest);

        if (opportunity.InvestmentModel == InvestmentModel.LoanInvestment && joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
            await ValidateLoanFundingAvailabilityForApprovalAsync(opportunity, joinRequest);

        if (opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing && joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
            await ValidateProfitSharingFundingAvailabilityForApprovalAsync(opportunity, joinRequest);

        var now = DateTime.UtcNow;
        joinRequest.Status = OpportunityJoinRequestStatus.Approved;
        joinRequest.ReviewedByFounderId = founderId;
        joinRequest.ReviewedAt = now;
        joinRequest.UpdatedAt = now;

        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = "JoinApproved",
            Title = "Join request approved",
            Description = "Founder approved an investor join request.",
            CreatedByUserId = founderId,
            CreatedAt = now,
            IsPublic = false
        });

        ProjectActivityTimeline.Add(
            opportunity.Events,
            opportunity.Id,
            ProjectActivityTimeline.Types.ParticipationApproved,
            "Founder",
            founderId,
            now,
            "OpportunityJoinRequest",
            joinRequest.Id.ToString(),
            $"participation-approved:{joinRequest.Id}");

        AddFundingProgressTimelineEntries(opportunity, founderId, now);

        if (!opportunity.IsLockedForEditing)
        {
            var oldValue = SnapshotCore(opportunity);
            opportunity.IsLockedForEditing = true;
            opportunity.FirstInvestorJoinedAt = now;
            var newValue = SnapshotCore(opportunity);

            opportunity.Events.Add(new OpportunityEvent
            {
                EventType = "FirstInvestorJoined",
                Title = "First investor joined",
                Description = "The first investor was approved and direct core edits are now locked.",
                OldValue = oldValue,
                NewValue = newValue,
                CreatedByUserId = founderId,
                CreatedAt = now,
                IsPublic = false
            });
        }

        opportunity.UpdatedAt = now;

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                await UpdateSourceConversationAfterParticipationReviewAsync(joinRequest, ConversationStatus.ParticipationApproved, now);
                await _uow.Repository<OpportunityJoinRequest>().UpdateAsync(joinRequest);
                await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
                await _investmentContractService.GenerateForApprovedParticipationAsync(opportunity, joinRequest, now, cancellationToken);
                await _uow.SaveChangesAsync();
                await ApplyReputationActivitySafeAsync(
                    founderId,
                    "ApproveParticipation",
                    "OpportunityJoinRequest",
                    joinRequest.Id.ToString());
                await ApplyReputationActivitySafeAsync(
                    joinRequest.InvestorId,
                    "BecomeParticipant",
                    "OpportunityJoinRequest",
                    joinRequest.Id.ToString());
                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        if (joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
        {
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                joinRequest.InvestorId,
                "ParticipationRequestApproved",
                joinRequest.Id.ToString(),
                "Participation request approved",
                $"Your participation request for {opportunity.Title} was approved.",
                "success",
                $"/admin/opportunities/{opportunity.Id}/room",
                founderId,
                opportunity.Id), cancellationToken);
        }

        return await GetJoinRequestDtoAsync(requestId, includeRejectionReason: true);
    }

    public async Task<OpportunityJoinRequestDto> RejectJoinRequestAsync(Guid founderId, int requestId, RejectOpportunityJoinRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequired(request.Reason, "REJECTION_REASON_REQUIRED", "Rejection reason is required.");

        var joinRequest = await GetJoinRequestAsync(requestId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, joinRequest.OpportunityId, includeChildren: true);

        if (joinRequest.Status != OpportunityJoinRequestStatus.Pending)
            throw new BusinessValidationException("INVALID_JOIN_REQUEST_STATUS_TRANSITION", "Only pending join requests can be rejected.");

        var now = DateTime.UtcNow;
        joinRequest.Status = OpportunityJoinRequestStatus.Rejected;
        joinRequest.RejectionReason = request.Reason.Trim();
        joinRequest.ReviewedByFounderId = founderId;
        joinRequest.ReviewedAt = now;
        joinRequest.UpdatedAt = now;

        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = "JoinRejected",
            Title = "Join request rejected",
            Description = "Founder rejected an investor join request.",
            CreatedByUserId = founderId,
            CreatedAt = now,
            IsPublic = false
        });
        opportunity.UpdatedAt = now;

        await UpdateSourceConversationAfterParticipationReviewAsync(joinRequest, ConversationStatus.ParticipationRejected, now);
        await _uow.Repository<OpportunityJoinRequest>().UpdateAsync(joinRequest);
        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();

        if (joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
        {
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                joinRequest.InvestorId,
                "ParticipationRequestRejected",
                joinRequest.Id.ToString(),
                "Participation request rejected",
                $"Your participation request for {opportunity.Title} was rejected.",
                "warning",
                "/admin/requests",
                founderId,
                opportunity.Id), cancellationToken);
        }

        return await GetJoinRequestDtoAsync(requestId, includeRejectionReason: true);
    }

    public async Task<PagedResultDto<AdminOpportunityListItemDto>> GetAdminOpportunitiesAsync(AdminOpportunityListQuery query, CancellationToken cancellationToken = default)
    {
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 100);
        var opportunities = (await _uow.Repository<Opportunity>().FindWithIncludesAsync(
            o => true,
            o => o.Category!,
            o => o.FundingGoal!,
            o => o.OpportunityTags)).ToList();
        var founders = (await _uow.Repository<AuthUser>().GetAllAsync()).ToDictionary(u => u.Id);

        if (query.Status.HasValue)
        {
            if (!Enum.IsDefined(query.Status.Value))
                throw new BusinessValidationException("INVALID_STATUS", "Unknown opportunity status.");

            opportunities = opportunities.Where(o => o.Status == query.Status.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            opportunities = opportunities
                .Where(o =>
                    o.Title.Contains(search, StringComparison.OrdinalIgnoreCase)
                    || (founders.TryGetValue(o.FounderId, out var founder)
                        && ((founder.Name?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
                            || (founder.Email?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false))))
                .ToList();
        }

        var ordered = SortAdminList(opportunities, founders, query.SortBy, query.SortDirection);
        var total = ordered.Count;
        var items = ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => ToAdminListItemDto(o, founders))
            .ToList();

        return new PagedResultDto<AdminOpportunityListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<AdminOpportunityDetailDto> GetAdminOpportunityAsync(int id, CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOpportunityAsync(id, includeChildren: true);
        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        return ToAdminDetailDto(opportunity, founder, await GetActiveTagLookupAsync());
    }

    public async Task<AdminOpportunityDetailDto> ApproveAsync(Guid reviewerId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(reviewerId);
        var opportunity = await GetOpportunityAsync(id, includeChildren: true);

        if (opportunity.Status != OpportunityStatus.UnderReview)
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", "Only UnderReview opportunities can be approved.");

        ChangeStatusWithEvent(opportunity, OpportunityStatus.Approved, "Approved", "Opportunity approved", "Admin approved opportunity for the next workflow step.", reviewerId, isPublic: false);

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();

        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        return ToAdminDetailDto(opportunity, founder, await GetActiveTagLookupAsync());
    }

    public async Task<AdminOpportunityDetailDto> RejectAsync(Guid reviewerId, int id, RejectOpportunityRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(reviewerId);
        ValidateRequired(request.Reason, "REJECTION_REASON_REQUIRED", "Rejection reason is required.");

        var opportunity = await GetOpportunityAsync(id, includeChildren: true);

        if (opportunity.Status != OpportunityStatus.UnderReview)
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", "Only UnderReview opportunities can be rejected.");

        ChangeStatusWithEvent(opportunity, OpportunityStatus.Rejected, "Rejected", "Opportunity rejected", request.Reason.Trim(), reviewerId, isPublic: false);

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();

        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        return ToAdminDetailDto(opportunity, founder, await GetActiveTagLookupAsync());
    }

    private async Task<Opportunity> GetOwnedOpportunityAsync(Guid founderId, int id, bool includeChildren)
    {
        Opportunity? opportunity;

        if (includeChildren)
        {
            opportunity = await _uow.Repository<Opportunity>().GetSingleAsync(
                o => o.Id == id && o.FounderId == founderId,
                o => o.Media,
                o => o.Documents,
                o => o.Events,
                o => o.Category!,
                o => o.FundingGoal!,
                o => o.OpportunityTags);
        }
        else
        {
            opportunity = (await _uow.Repository<Opportunity>()
                .FindAsync(o => o.Id == id && o.FounderId == founderId))
                .FirstOrDefault();
        }

        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

        return opportunity;
    }

    private async Task<OpportunityJoinRequest> GetJoinRequestAsync(int requestId)
    {
        var joinRequest = await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(requestId);
        if (joinRequest == null)
            throw new BusinessValidationException("JOIN_REQUEST_NOT_FOUND", "Join request was not found.");

        return joinRequest;
    }

    private async Task UpdateSourceConversationAfterParticipationReviewAsync(OpportunityJoinRequest joinRequest, ConversationStatus status, DateTime reviewedAt)
    {
        if (!joinRequest.SourceConversationId.HasValue)
            return;

        var conversation = await _uow.Repository<Conversation>().GetByIdAsync(joinRequest.SourceConversationId.Value);
        if (conversation == null)
            return;

        conversation.Status = status;
        conversation.IsActive = false;
        conversation.UpdatedAt = reviewedAt;
        await _uow.Repository<Conversation>().UpdateAsync(conversation);
    }

    private async Task<OpportunityJoinRequestDto> GetJoinRequestDtoAsync(int requestId, bool includeRejectionReason)
    {
        var joinRequest = await _uow.Repository<OpportunityJoinRequest>().GetSingleAsync(
            r => r.Id == requestId,
            r => r.Opportunity!,
            r => r.Investor!);

        if (joinRequest == null)
            throw new BusinessValidationException("JOIN_REQUEST_NOT_FOUND", "Join request was not found.");

        return ToJoinRequestDto(joinRequest, includeRejectionReason);
    }

    private async Task<Opportunity> GetOpportunityAsync(int id, bool includeChildren)
    {
        Opportunity? opportunity;

        if (includeChildren)
        {
            opportunity = await _uow.Repository<Opportunity>().GetSingleAsync(
                o => o.Id == id,
                o => o.Media,
                o => o.Documents,
                o => o.Events,
                o => o.Category!,
                o => o.FundingGoal!,
                o => o.OpportunityTags);
        }
        else
        {
            opportunity = await _uow.Repository<Opportunity>().GetByIdAsync(id);
        }

        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

        return opportunity;
    }

    private static void ValidateCoreFields(string title, decimal fundingTarget, InvestmentModel? investmentModel, ProjectStage? projectStage)
    {
        ValidateRequired(title, "TITLE_REQUIRED", "Title is required.");

        if (fundingTarget <= 0)
            throw new BusinessValidationException("INVALID_FUNDING_TARGET", "FundingTarget must be greater than zero.");

        if (!investmentModel.HasValue || !Enum.IsDefined(investmentModel.Value))
            throw new BusinessValidationException("INVALID_INVESTMENT_MODEL", "InvestmentModel is required.");

        if (!projectStage.HasValue || !Enum.IsDefined(projectStage.Value))
            throw new BusinessValidationException("INVALID_PROJECT_STAGE", "ProjectStage is required.");
    }

    private static void ValidateFounderEditStatusTransition(OpportunityStatus from, OpportunityStatus to)
    {
        if (!Enum.IsDefined(to))
            throw new BusinessValidationException("INVALID_STATUS", "Unknown opportunity status.");

        if (from == to)
            return;

        var allowed = from switch
        {
            OpportunityStatus.Draft => to is OpportunityStatus.Archived,
            OpportunityStatus.Rejected => to is OpportunityStatus.Draft or OpportunityStatus.Archived,
            OpportunityStatus.Published => to is OpportunityStatus.Archived,
            OpportunityStatus.Funding => to is OpportunityStatus.Archived,
            OpportunityStatus.FullyFunded => to is OpportunityStatus.Archived,
            OpportunityStatus.InProgress => to is OpportunityStatus.Archived,
            OpportunityStatus.Completed => to is OpportunityStatus.Archived,
            OpportunityStatus.Archived => false,
            _ => false
        };

        if (!allowed)
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", $"Cannot change opportunity status from {from} to {to}.");
    }

    private static void ValidateCompleteForReview(Opportunity opportunity)
    {
        ValidateRequired(opportunity.Title, "TITLE_REQUIRED", "Title is required.");

        if (opportunity.FundingTarget <= 0)
            throw new BusinessValidationException("INVALID_FUNDING_TARGET", "FundingTarget must be greater than zero.");

        if (!Enum.IsDefined(opportunity.InvestmentModel))
            throw new BusinessValidationException("INVALID_INVESTMENT_MODEL", "InvestmentModel is required.");

        if (!Enum.IsDefined(opportunity.ProjectStage))
            throw new BusinessValidationException("INVALID_PROJECT_STAGE", "ProjectStage is required.");

        if (!opportunity.CategoryId.HasValue)
            throw new BusinessValidationException("CATEGORY_REQUIRED", "CategoryId is required before review.");

        if (!opportunity.FundingGoalId.HasValue)
            throw new BusinessValidationException("FUNDING_GOAL_REQUIRED", "FundingGoalId is required before review.");

        ValidateProductFields(
            opportunity.ShortDescription,
            opportunity.UseOfFunds,
            opportunity.InvestmentModel,
            opportunity.EquityOfferedPercentage,
            opportunity.ProfitSharePercentage,
            opportunity.ProfitSharingPayoutFrequency,
            opportunity.ExpectedDurationMonths,
            opportunity.ProfitSharingContractStartDate,
            opportunity.ProfitSharingContractEndDate,
            opportunity.InterestRate,
            opportunity.RepaymentFrequency,
            opportunity.FinalRepaymentDate);
        ValidateEquityConfiguration(opportunity.InvestmentModel, opportunity.Currency, opportunity.SharePrice, opportunity.TotalShares, opportunity.OfferedShares, opportunity.EquityOfferedPercentage, opportunity.MinimumInvestmentAmount);
        ValidateCurrency(opportunity.Currency);
    }

    private static OpportunityFilePurpose ResolveMediaPurpose(CreateOpportunityMediaRequest request)
    {
        var purpose = request.Purpose ?? InferMediaPurpose(request);
        if (!Enum.IsDefined(purpose))
            throw new BusinessValidationException("INVALID_FILE_PURPOSE", "Unknown media purpose.");

        return purpose;
    }

    private static OpportunityFilePurpose InferMediaPurpose(CreateOpportunityMediaRequest request)
    {
        if (request.IsCover)
            return OpportunityFilePurpose.Cover;

        var mediaType = request.MediaType.Trim();
        return mediaType switch
        {
            var value when value.Equals("Cover", StringComparison.OrdinalIgnoreCase) => OpportunityFilePurpose.Cover,
            var value when value.Equals("Gallery", StringComparison.OrdinalIgnoreCase) => OpportunityFilePurpose.Gallery,
            var value when value.Equals("Video", StringComparison.OrdinalIgnoreCase) => OpportunityFilePurpose.PitchVideo,
            var value when value.Equals("PitchVideo", StringComparison.OrdinalIgnoreCase) => OpportunityFilePurpose.PitchVideo,
            var value when value.Equals("ProjectUpdateMedia", StringComparison.OrdinalIgnoreCase) => OpportunityFilePurpose.ProjectUpdateMedia,
            _ => OpportunityFilePurpose.General
        };
    }

    private static OpportunityFilePurpose ResolveDocumentPurpose(CreateOpportunityDocumentRequest request)
    {
        var purpose = request.Purpose ?? InferDocumentPurpose(request);
        if (!Enum.IsDefined(purpose))
            throw new BusinessValidationException("INVALID_FILE_PURPOSE", "Unknown document purpose.");

        return purpose;
    }

    private static OpportunityFilePurpose InferDocumentPurpose(CreateOpportunityDocumentRequest request)
    {
        var text = $"{request.DocumentType} {request.Category}".Trim();
        if (text.Contains("FinancialReport", StringComparison.OrdinalIgnoreCase) || text.Contains("Financial Report", StringComparison.OrdinalIgnoreCase))
            return OpportunityFilePurpose.FinancialReport;
        if (text.Contains("Contract", StringComparison.OrdinalIgnoreCase))
            return OpportunityFilePurpose.Contract;
        if (text.Contains("Legal", StringComparison.OrdinalIgnoreCase))
            return OpportunityFilePurpose.Legal;
        if (text.Contains("Internal", StringComparison.OrdinalIgnoreCase))
            return OpportunityFilePurpose.InternalFile;
        if (request.Visibility == OpportunityDocumentVisibility.Public)
            return OpportunityFilePurpose.PublicDocument;
        if (request.Visibility == OpportunityDocumentVisibility.Private)
            return OpportunityFilePurpose.PrivateDocument;

        return OpportunityFilePurpose.General;
    }

    private static void ValidateMediaPurposeVisibility(OpportunityFilePurpose purpose, bool isPublic)
    {
        if ((purpose is OpportunityFilePurpose.Cover or OpportunityFilePurpose.Gallery or OpportunityFilePurpose.PitchVideo) && !isPublic)
            throw new BusinessValidationException("INVALID_MEDIA_VISIBILITY", $"{purpose} media must be Public.");

        if ((purpose is OpportunityFilePurpose.FinancialReport or OpportunityFilePurpose.Contract or OpportunityFilePurpose.Legal or OpportunityFilePurpose.InternalFile) && isPublic)
            throw new BusinessValidationException("INVALID_MEDIA_VISIBILITY", $"{purpose} media must be Private.");
    }

    private static void ValidateDocumentPurposeVisibility(OpportunityFilePurpose purpose, OpportunityDocumentVisibility visibility)
    {
        if (purpose == OpportunityFilePurpose.PublicDocument && visibility != OpportunityDocumentVisibility.Public)
            throw new BusinessValidationException("INVALID_DOCUMENT_VISIBILITY", "PublicDocument must be Public.");

        if (purpose is OpportunityFilePurpose.PrivateDocument or OpportunityFilePurpose.FinancialReport or OpportunityFilePurpose.Contract or OpportunityFilePurpose.Legal or OpportunityFilePurpose.InternalFile
            && visibility != OpportunityDocumentVisibility.Private)
            throw new BusinessValidationException("INVALID_DOCUMENT_VISIBILITY", $"{purpose} must be Private.");
    }

    private async Task<IReadOnlyList<OpportunityTag>> ValidateClassificationAsync(int? categoryId, int? fundingGoalId, IReadOnlyList<int>? tagIds)
    {
        if (categoryId.HasValue)
        {
            var category = await _uow.Repository<OpportunityCategory>().GetByIdAsync(categoryId.Value);
            if (category == null || !category.IsActive)
                throw new BusinessValidationException("INVALID_CATEGORY", "CategoryId must reference an active opportunity category.");
        }

        if (fundingGoalId.HasValue)
        {
            var fundingGoal = await _uow.Repository<FundingGoal>().GetByIdAsync(fundingGoalId.Value);
            if (fundingGoal == null || !fundingGoal.IsActive)
                throw new BusinessValidationException("INVALID_FUNDING_GOAL", "FundingGoalId must reference an active funding goal.");
        }

        var distinctTagIds = (tagIds ?? Array.Empty<int>()).Distinct().ToList();
        if (distinctTagIds.Count == 0)
            return Array.Empty<OpportunityTag>();

        var requestedTagIds = distinctTagIds.ToHashSet();
        var tags = await _uow.Repository<OpportunityTag>().GetAllAsync();
        return tags.Where(t => requestedTagIds.Contains(t.Id) && t.IsActive).ToList();
    }

    private static void ValidateProductFields(string? shortDescription, string? useOfFunds, InvestmentModel? investmentModel, decimal? equityOfferedPercentage, decimal? profitSharePercentage, string? payoutFrequency, int? durationMonths, DateTime? contractStartDate, DateTime? contractEndDate, decimal? interestRate, string? repaymentFrequency, DateTime? finalRepaymentDate)
    {
        ValidateTextRange(shortDescription, "SHORT_DESCRIPTION_REQUIRED", "ShortDescription", 20, 300);
        ValidateTextRange(useOfFunds, "USE_OF_FUNDS_REQUIRED", "UseOfFunds", 30, 2000);

        if (investmentModel == InvestmentModel.Equity)
        {
            if (!equityOfferedPercentage.HasValue)
                throw new BusinessValidationException("EQUITY_OFFERED_REQUIRED", "EquityOfferedPercentage is required for Equity opportunities.");

            if (equityOfferedPercentage.Value <= 0 || equityOfferedPercentage.Value > 100)
                throw new BusinessValidationException("INVALID_EQUITY_OFFERED", "EquityOfferedPercentage must be greater than 0 and less than or equal to 100.");
        }
        else if (investmentModel == InvestmentModel.LoanInvestment)
        {
            if (!durationMonths.HasValue || durationMonths.Value <= 0)
                throw new BusinessValidationException("LOAN_TERM_REQUIRED", "ExpectedDurationMonths is required for Loan opportunities.");

            if (!interestRate.HasValue || interestRate.Value <= 0 || interestRate.Value > 100)
                throw new BusinessValidationException("LOAN_INTEREST_RATE_REQUIRED", "InterestRate must be between 0.01 and 100 for Loan opportunities.");

            if (string.IsNullOrWhiteSpace(repaymentFrequency))
                throw new BusinessValidationException("LOAN_REPAYMENT_FREQUENCY_REQUIRED", "RepaymentFrequency is required for Loan opportunities.");

            if (!finalRepaymentDate.HasValue)
                throw new BusinessValidationException("LOAN_FINAL_REPAYMENT_DATE_REQUIRED", "FinalRepaymentDate is required for Loan opportunities.");

            if (finalRepaymentDate.Value <= DateTime.UtcNow)
                throw new BusinessValidationException("LOAN_FINAL_REPAYMENT_DATE_PAST", "FinalRepaymentDate must be in the future.");
        }
        else if (investmentModel == InvestmentModel.CapitalContributionProfitSharing)
        {
            ValidateProfitSharingTerms(profitSharePercentage, payoutFrequency, durationMonths, contractStartDate, contractEndDate);
        }
        else if (equityOfferedPercentage.HasValue && (equityOfferedPercentage.Value <= 0 || equityOfferedPercentage.Value > 100))
        {
            throw new BusinessValidationException("INVALID_EQUITY_OFFERED", "EquityOfferedPercentage must be greater than 0 and less than or equal to 100.");
        }
    }

    private static void ValidateProfitSharingTerms(decimal? percentage, string? payoutFrequency, int? durationMonths, DateTime? startDate, DateTime? endDate)
    {
        if (!percentage.HasValue || percentage.Value <= 0 || percentage.Value > 100)
            throw new BusinessValidationException("PROFIT_SHARE_PERCENTAGE_REQUIRED", "ProfitSharePercentage between 0.01 and 100 is required for Profit Sharing opportunities.");
        if (string.IsNullOrWhiteSpace(payoutFrequency))
            throw new BusinessValidationException("PROFIT_SHARING_PAYOUT_FREQUENCY_REQUIRED", "ProfitSharingPayoutFrequency is required for Profit Sharing opportunities.");
        if ((!durationMonths.HasValue || durationMonths.Value <= 0) && (!startDate.HasValue || !endDate.HasValue))
            throw new BusinessValidationException("PROFIT_SHARING_CONTRACT_TERM_REQUIRED", "ExpectedDurationMonths or both ProfitSharingContractStartDate and ProfitSharingContractEndDate are required.");
        if (startDate.HasValue != endDate.HasValue || (startDate.HasValue && endDate <= startDate))
            throw new BusinessValidationException("INVALID_PROFIT_SHARING_CONTRACT_DATES", "Profit Sharing contract dates must both be provided and end after the start date.");
    }

    private static void ValidateEquityConfiguration(InvestmentModel? model, string? currency, decimal? sharePrice, int? totalShares, int? offeredShares, decimal? offeredPercentage, decimal? minimumInvestment)
    {
        if (model != InvestmentModel.Equity) return;
        if (string.IsNullOrWhiteSpace(currency)) throw new BusinessValidationException("CURRENCY_REQUIRED", "Currency is required for Equity opportunities.");
        if (!sharePrice.HasValue || sharePrice.Value <= 0) throw new BusinessValidationException("EQUITY_SHARE_PRICE_REQUIRED", "SharePrice must be greater than zero.");
        if (!totalShares.HasValue || totalShares.Value <= 0) throw new BusinessValidationException("EQUITY_TOTAL_SHARES_REQUIRED", "TotalShares must be greater than zero.");
        if (!offeredShares.HasValue || offeredShares.Value <= 0 || offeredShares.Value > totalShares.Value) throw new BusinessValidationException("INVALID_EQUITY_OFFERED_SHARES", "OfferedShares must be positive and cannot exceed TotalShares.");
        var calculatedPercentage = decimal.Round(offeredShares.Value * 100m / totalShares.Value, 2);
        if (!offeredPercentage.HasValue || calculatedPercentage != offeredPercentage.Value) throw new BusinessValidationException("EQUITY_PERCENTAGE_MISMATCH", "EquityOfferedPercentage must equal OfferedShares divided by TotalShares.");
        if (minimumInvestment.HasValue && minimumInvestment.Value % sharePrice.Value != 0) throw new BusinessValidationException("EQUITY_MINIMUM_NOT_SHARE_ALIGNED", "MinimumInvestmentAmount must be divisible by SharePrice.");
    }

    private static void ValidateTextRange(string? value, string errorCode, string fieldName, int minLength, int maxLength)
    {
        var normalized = Normalize(value);
        if (normalized == null)
            throw new BusinessValidationException(errorCode, $"{fieldName} is required.");

        if (normalized.Length < minLength || normalized.Length > maxLength)
            throw new BusinessValidationException($"INVALID_{fieldName.ToUpperInvariant()}", $"{fieldName} must be between {minLength} and {maxLength} characters.");
    }

    private static void ValidateCurrency(string? currency)
    {
        var value = currency?.Trim();
        if (value == null || value.Length != 3 || !value.All(char.IsLetter))
            throw new BusinessValidationException("INVALID_CURRENCY", "Currency must be a three-letter currency code.");
    }

    private static void ValidateInvestmentBounds(decimal? minimumInvestmentAmount, decimal? maximumInvestmentAmount)
    {
        if (minimumInvestmentAmount.HasValue && minimumInvestmentAmount.Value <= 0)
            throw new BusinessValidationException("INVALID_MINIMUM_INVESTMENT", "MinimumInvestmentAmount must be greater than zero.");

        if (maximumInvestmentAmount.HasValue)
        {
            if (maximumInvestmentAmount.Value <= 0)
                throw new BusinessValidationException("INVALID_MAXIMUM_INVESTMENT", "MaximumInvestmentAmount must be greater than zero.");

            if (minimumInvestmentAmount.HasValue && maximumInvestmentAmount.Value < minimumInvestmentAmount.Value)
                throw new BusinessValidationException("INVALID_INVESTMENT_RANGE", "MaximumInvestmentAmount must be greater than or equal to MinimumInvestmentAmount.");
        }
    }

    private static List<Opportunity> ApplyDiscoveryFilters(List<Opportunity> opportunities, OpportunityDiscoveryQuery query)
    {
        if (query.InvestmentModel.HasValue)
            opportunities = opportunities.Where(o => o.InvestmentModel == query.InvestmentModel.Value).ToList();

        if (query.CategoryId.HasValue)
            opportunities = opportunities.Where(o => o.CategoryId == query.CategoryId.Value).ToList();

        if (query.FundingGoalId.HasValue)
            opportunities = opportunities.Where(o => o.FundingGoalId == query.FundingGoalId.Value).ToList();

        if (query.ProjectStage.HasValue)
            opportunities = opportunities.Where(o => o.ProjectStage == query.ProjectStage.Value).ToList();

        if (query.MinFundingTarget.HasValue)
            opportunities = opportunities.Where(o => o.FundingTarget >= query.MinFundingTarget.Value).ToList();

        if (query.MaxFundingTarget.HasValue)
            opportunities = opportunities.Where(o => o.FundingTarget <= query.MaxFundingTarget.Value).ToList();

        if (query.MinInvestmentAmount.HasValue)
            opportunities = opportunities.Where(o => o.MinimumInvestmentAmount.HasValue && o.MinimumInvestmentAmount.Value >= query.MinInvestmentAmount.Value).ToList();

        if (query.MaxInvestmentAmount.HasValue)
            opportunities = opportunities.Where(o => o.MaximumInvestmentAmount.HasValue && o.MaximumInvestmentAmount.Value <= query.MaxInvestmentAmount.Value).ToList();

        var tagIds = query.TagIds?.Distinct().ToList() ?? [];
        if (tagIds.Count > 0)
            opportunities = opportunities.Where(o => tagIds.All(tagId => o.OpportunityTags.Any(t => t.OpportunityTagId == tagId))).ToList();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            opportunities = opportunities
                .Where(o =>
                    o.Title.Contains(search, StringComparison.OrdinalIgnoreCase)
                    || (o.Description?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
                    || (o.Category?.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
                    || (o.FundingGoal?.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false))
                .ToList();
        }

        return opportunities;
    }

    private async Task<Dictionary<int, OpportunityTag>> GetActiveTagLookupAsync()
    {
        var tags = await _uow.Repository<OpportunityTag>().FindAsync(t => t.IsActive);
        return tags.ToDictionary(t => t.Id);
    }

    private async Task<IReadOnlyDictionary<int, int>> GetLegacyInvestmentLookupAsync(IEnumerable<int> opportunityIds)
    {
        var ids = opportunityIds.Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<int, int>();

        var investments = (await _uow.Repository<Investment>().FindAsync(i => i.OpportunityId.HasValue))
            .Where(i => i.OpportunityId.HasValue && ids.Contains(i.OpportunityId.Value));

        return investments
            .GroupBy(i => i.OpportunityId!.Value)
            .ToDictionary(g => g.Key, g => g.OrderBy(i => i.Id).First().Id);
    }

    private async Task<int?> GetLegacyInvestmentIdAsync(int opportunityId)
    {
        var investment = (await _uow.Repository<Investment>().FindAsync(i => i.OpportunityId == opportunityId))
            .OrderBy(i => i.Id)
            .FirstOrDefault();

        return investment?.Id;
    }

    private static void ChangeStatusWithEvent(
        Opportunity opportunity,
        OpportunityStatus nextStatus,
        string eventType,
        string title,
        string description,
        Guid createdByUserId,
        bool isPublic)
    {
        var now = DateTime.UtcNow;
        var previousStatus = opportunity.Status;
        var oldValue = SnapshotCore(opportunity);

        opportunity.Status = nextStatus;
        opportunity.UpdatedAt = now;

        var newValue = SnapshotCore(opportunity);
        opportunity.Events.Add(new OpportunityEvent
        {
            EventType = eventType,
            Title = title,
            Description = description,
            OldValue = oldValue,
            NewValue = newValue,
            CreatedByUserId = createdByUserId,
            CreatedAt = now,
            IsPublic = isPublic
        });

        if (isPublic)
        {
            ProjectActivityTimeline.Add(
                opportunity.Events,
                opportunity.Id,
                ProjectActivityTimeline.Types.ProjectStatusChanged,
                "Founder",
                createdByUserId,
                now,
                "Opportunity",
                opportunity.Id.ToString(),
                $"status-change:{opportunity.Id}:{previousStatus}:{nextStatus}:{now.Ticks}",
                new Dictionary<string, string?>
                {
                    ["previousStatus"] = previousStatus.ToString(),
                    ["currentStatus"] = nextStatus.ToString()
                });
        }
    }

    private static void ValidateFounder(Guid founderId)
    {
        if (founderId == Guid.Empty)
            throw new BusinessValidationException("FOUNDER_REQUIRED", "FounderId is required.");
    }

    private async Task ValidateClientAsync(Guid userId, string message)
    {
        if (userId == Guid.Empty)
            throw new BusinessValidationException("USER_REQUIRED", "Authenticated user is required.");

        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId);
        if (user == null || user.UserType != UserType.Client)
            throw new BusinessValidationException("CLIENT_REQUIRED", message);
    }

    private async Task ValidateFounderClientAsync(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new BusinessValidationException("USER_REQUIRED", "Authenticated user is required.");

        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId);
        if (user == null || user.UserType != UserType.Client || user.ClientType is not (ClientType.Founder or ClientType.Both))
            throw new BusinessValidationException("FOUNDER_ACCESS_REQUIRED", "Founder access is required.");
    }

    private static void ValidateRequired(string? value, string code, string message)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new BusinessValidationException(code, message);
    }

    private async Task<JoinRequestDetails> BuildJoinRequestDetailsAsync(Opportunity opportunity, CreateOpportunityJoinRequest request)
    {
        var requestType = request.RequestType ?? OpportunityJoinRequestType.GeneralParticipation;
        if (!Enum.IsDefined(requestType))
            throw new BusinessValidationException("INVALID_JOIN_REQUEST_TYPE", "Unknown join request type.");

        return requestType switch
        {
            OpportunityJoinRequestType.GeneralParticipation => BuildGeneralParticipationDetails(opportunity, request),
            OpportunityJoinRequestType.InvestmentParticipation => await BuildInvestmentParticipationDetailsAsync(opportunity, request),
            _ => throw new BusinessValidationException("INVALID_JOIN_REQUEST_TYPE", "Unknown join request type.")
        };
    }

    private static JoinRequestDetails BuildGeneralParticipationDetails(Opportunity opportunity, CreateOpportunityJoinRequest request)
    {
        ValidateRequestedAmount(request.RequestedAmount);
        if (string.IsNullOrWhiteSpace(request.Message) && !request.RequestedAmount.HasValue)
            throw new BusinessValidationException("JOIN_REQUEST_DETAILS_REQUIRED", "GeneralParticipation requires a message or RequestedAmount.");

        var snapshot = SerializeTermsSnapshot(new
        {
            RequestType = OpportunityJoinRequestType.GeneralParticipation.ToString(),
            InvestmentModel = opportunity.InvestmentModel.ToString(),
            request.RequestedAmount,
            HasMessage = !string.IsNullOrWhiteSpace(request.Message),
            MetadataJson = Normalize(request.MetadataJson),
            SnapshotAt = DateTime.UtcNow
        });

        return new JoinRequestDetails(
            OpportunityJoinRequestType.GeneralParticipation,
            request.RequestedAmount,
            request.RequestedAmount,
            snapshot,
            "GeneralParticipationRequested",
            "General participation requested",
            "An investor requested general participation details.");
    }

    private async Task<JoinRequestDetails> BuildInvestmentParticipationDetailsAsync(Opportunity opportunity, CreateOpportunityJoinRequest request)
    {
        return opportunity.InvestmentModel switch
        {
            InvestmentModel.Equity => await BuildEquityParticipationDetailsAsync(opportunity, request),
            InvestmentModel.LoanInvestment => await BuildLoanParticipationDetailsAsync(opportunity, request),
            InvestmentModel.CapitalContributionProfitSharing => await BuildProfitSharingParticipationDetailsAsync(opportunity, request),
            _ => throw new BusinessValidationException("INVALID_INVESTMENT_MODEL", "Unsupported investment model.")
        };
    }

    private async Task<JoinRequestDetails> BuildEquityParticipationDetailsAsync(Opportunity opportunity, CreateOpportunityJoinRequest request)
    {
        if (!request.NumberOfShares.HasValue || request.NumberOfShares.Value <= 0)
            throw new BusinessValidationException("INVALID_NUMBER_OF_SHARES", "NumberOfShares must be greater than zero for equity participation.");

        if (opportunity.SharePrice is null or <= 0)
            throw new BusinessValidationException("EQUITY_SHARE_PRICE_REQUIRED", "Equity participation requires configured SharePrice.");

        if (!opportunity.OfferedShares.HasValue || opportunity.OfferedShares.Value <= 0)
            throw new BusinessValidationException("EQUITY_OFFERED_SHARES_REQUIRED", "Equity participation requires configured OfferedShares.");

        var approvedShares = await GetApprovedEquitySharesAsync(opportunity.Id);
        var availableShares = Math.Max(opportunity.OfferedShares.Value - approvedShares, 0);
        if (request.NumberOfShares.Value > availableShares)
            throw new BusinessValidationException("INSUFFICIENT_AVAILABLE_SHARES", $"Only {availableShares} shares are available.");

        var calculatedTotal = request.NumberOfShares.Value * opportunity.SharePrice.Value;
        if (request.TotalAmount.HasValue && request.TotalAmount.Value != calculatedTotal)
            throw new BusinessValidationException("INVALID_TOTAL_AMOUNT", "TotalAmount must equal NumberOfShares multiplied by backend SharePrice.");

        var snapshot = SerializeTermsSnapshot(new
        {
            RequestType = OpportunityJoinRequestType.InvestmentParticipation.ToString(),
            InvestmentModel = opportunity.InvestmentModel.ToString(),
            SelectedShares = request.NumberOfShares,
            SharePriceSnapshot = opportunity.SharePrice.Value,
            TotalSharesSnapshot = opportunity.TotalShares,
            OfferedSharesSnapshot = opportunity.OfferedShares,
            EquityOfferedPercentageSnapshot = opportunity.EquityOfferedPercentage,
            CurrencySnapshot = opportunity.Currency ?? "Credits",
            TotalInvestmentAmount = calculatedTotal,
            CalculatedTotalAmount = calculatedTotal,
            AvailableSharesAtSubmission = availableShares,
            OpportunityFundingTarget = opportunity.FundingTarget,
            MetadataJson = Normalize(request.MetadataJson),
            SnapshotAt = DateTime.UtcNow
        });

        return NewInvestmentParticipationDetails(calculatedTotal, calculatedTotal, snapshot);
    }

    private async Task<JoinRequestDetails> BuildLoanParticipationDetailsAsync(Opportunity opportunity, CreateOpportunityJoinRequest request)
    {
        ValidateRequestedAmount(request.RequestedAmount);
        if (!request.RequestedAmount.HasValue)
            throw new BusinessValidationException("INVALID_REQUESTED_AMOUNT", "RequestedAmount is required for loan participation.");

        var linkedInvestment = await GetLinkedInvestmentAsync(opportunity.Id);
        var currency = opportunity.Currency ?? linkedInvestment?.Currency ?? "Unspecified";
        var minimumContribution = opportunity.MinimumInvestmentAmount ?? linkedInvestment?.MinInvestment;
        var maximumContribution = opportunity.MaximumInvestmentAmount ?? linkedInvestment?.MaxInvestment;
        var alreadyFundedAmount = await GetApprovedFundedAmountAsync(opportunity.Id);
        var remainingFundingAmount = CalculateRemainingFunding(opportunity.FundingTarget, alreadyFundedAmount);

        ValidateContributionAmount(request.RequestedAmount.Value, minimumContribution, maximumContribution, remainingFundingAmount);

        if (opportunity.InterestRate is null or <= 0)
            throw new BusinessValidationException("LOAN_RETURN_RATE_REQUIRED", "Loan participation requires configured InterestRate.");

        var durationMonths = ResolveLoanTermMonths(opportunity);
        if (!durationMonths.HasValue || durationMonths.Value <= 0)
            throw new BusinessValidationException("LOAN_TERM_REQUIRED", "Loan participation requires configured loan term.");

        var expectedReturn = CalculateLoanExpectedReturn(request.RequestedAmount.Value, opportunity.InterestRate.Value, durationMonths.Value);
        var expectedTotalRepayment = request.RequestedAmount.Value + expectedReturn;

        if (request.ExpectedReturnAmount.HasValue && request.ExpectedReturnAmount.Value != expectedReturn)
            throw new BusinessValidationException("INVALID_EXPECTED_RETURN_AMOUNT", "ExpectedReturnAmount does not match the backend calculated loan return.");

        if (request.ExpectedReturnRateSnapshot.HasValue && request.ExpectedReturnRateSnapshot.Value != opportunity.InterestRate.Value)
            throw new BusinessValidationException("INVALID_EXPECTED_RETURN_RATE", "ExpectedReturnRateSnapshot does not match the backend loan return rate.");

        if (request.ExpectedDurationMonthsSnapshot.HasValue && request.ExpectedDurationMonthsSnapshot.Value != durationMonths.Value)
            throw new BusinessValidationException("INVALID_EXPECTED_DURATION", "ExpectedDurationMonthsSnapshot does not match the backend loan term.");

        var snapshot = SerializeTermsSnapshot(new
        {
            RequestType = OpportunityJoinRequestType.InvestmentParticipation.ToString(),
            InvestmentModel = opportunity.InvestmentModel.ToString(),
            ContributionAmount = request.RequestedAmount.Value,
            RequestedAmount = request.RequestedAmount.Value,
            CurrencySnapshot = currency,
            ReturnRateSnapshot = opportunity.InterestRate.Value,
            ReturnRateTypeSnapshot = "AnnualSimple",
            TermValueSnapshot = durationMonths.Value,
            TermUnitSnapshot = "Months",
            RepaymentModelSnapshot = opportunity.RepaymentFrequency,
            FinalRepaymentDateSnapshot = opportunity.FinalRepaymentDate,
            ExpectedReturnAmount = expectedReturn,
            ExpectedTotalRepaymentAmount = expectedTotalRepayment,
            CalculatedTotalAmount = expectedTotalRepayment,
            FundingTargetSnapshot = opportunity.FundingTarget,
            AlreadyFundedAmountAtSubmission = alreadyFundedAmount,
            RemainingFundingAtSubmission = remainingFundingAmount,
            MinimumContributionSnapshot = minimumContribution,
            MaximumContributionSnapshot = maximumContribution,
            SubmittedAt = DateTime.UtcNow,
            MetadataJson = Normalize(request.MetadataJson),
            SnapshotAt = DateTime.UtcNow
        });

        return NewInvestmentParticipationDetails(request.RequestedAmount.Value, expectedTotalRepayment, snapshot);
    }

    private async Task<JoinRequestDetails> BuildProfitSharingParticipationDetailsAsync(Opportunity opportunity, CreateOpportunityJoinRequest request)
    {
        ValidateRequestedAmount(request.RequestedAmount);
        if (!request.RequestedAmount.HasValue)
            throw new BusinessValidationException("INVALID_REQUESTED_AMOUNT", "RequestedAmount is required for profit sharing participation.");

        var linkedInvestment = await GetLinkedInvestmentAsync(opportunity.Id);
        var currency = opportunity.Currency ?? linkedInvestment?.Currency ?? "Unspecified";
        var minimumContribution = opportunity.MinimumInvestmentAmount ?? linkedInvestment?.MinInvestment;
        var maximumContribution = opportunity.MaximumInvestmentAmount ?? linkedInvestment?.MaxInvestment;
        var alreadyFundedAmount = await GetApprovedFundedAmountAsync(opportunity.Id);
        var remainingFundingAmount = CalculateRemainingFunding(opportunity.FundingTarget, alreadyFundedAmount);

        ValidateContributionAmount(request.RequestedAmount.Value, minimumContribution, maximumContribution, remainingFundingAmount);

        var profitSharePercentage = opportunity.ProfitSharePercentage;
        if (!profitSharePercentage.HasValue || profitSharePercentage.Value <= 0)
            throw new BusinessValidationException("PROFIT_SHARING_TERMS_NOT_CONFIGURED", "This Profit Sharing opportunity is missing its configured ProfitSharePercentage.");

        var termMonths = ResolveProfitSharingTermMonths(opportunity, linkedInvestment);
        var expectedProfitAmount = CalculateProfitSharingExpectedProfit(request.RequestedAmount.Value, profitSharePercentage.Value);
        var expectedTotalPayout = request.RequestedAmount.Value + expectedProfitAmount;

        var snapshot = SerializeTermsSnapshot(new
        {
            RequestType = OpportunityJoinRequestType.InvestmentParticipation.ToString(),
            InvestmentModel = opportunity.InvestmentModel.ToString(),
            ContributionAmount = request.RequestedAmount.Value,
            RequestedAmount = request.RequestedAmount.Value,
            CurrencySnapshot = currency,
            ProfitSharePercentageSnapshot = profitSharePercentage.Value,
            ProposedSharePercentage = request.ProposedSharePercentage,
            TermValueSnapshot = termMonths,
            TermUnitSnapshot = termMonths.HasValue ? "Months" : null,
            PayoutFrequencySnapshot = opportunity.ProfitSharingPayoutFrequency,
            ContractStartDateSnapshot = opportunity.ProfitSharingContractStartDate,
            ContractEndDateSnapshot = opportunity.ProfitSharingContractEndDate,
            OpportunityTotalExpectedPayoutSnapshot = linkedInvestment?.TotalExpectedPayout,
            ExpectedProfitAmount = expectedProfitAmount,
            ExpectedTotalPayoutAmount = expectedTotalPayout,
            CalculatedTotalAmount = expectedTotalPayout,
            FundingTargetSnapshot = opportunity.FundingTarget,
            AlreadyFundedAmountAtSubmission = alreadyFundedAmount,
            RemainingFundingAtSubmission = remainingFundingAmount,
            MinimumContributionSnapshot = minimumContribution,
            MaximumContributionSnapshot = maximumContribution,
            HasMessage = !string.IsNullOrWhiteSpace(request.Message),
            SubmittedAt = DateTime.UtcNow,
            MetadataJson = Normalize(request.MetadataJson),
            SnapshotAt = DateTime.UtcNow
        });

        return NewInvestmentParticipationDetails(request.RequestedAmount.Value, expectedTotalPayout, snapshot);
    }

    private static JoinRequestDetails NewInvestmentParticipationDetails(decimal requestedAmount, decimal calculatedTotalAmount, string termsSnapshotJson) =>
        new(
            OpportunityJoinRequestType.InvestmentParticipation,
            requestedAmount,
            calculatedTotalAmount,
            termsSnapshotJson,
            "InvestmentParticipationRequested",
            "Investment participation requested",
            "An investor submitted investment participation details.");

    private async Task<Investment?> GetLinkedInvestmentAsync(int opportunityId)
    {
        return (await _uow.Repository<Investment>().FindAsync(i => i.OpportunityId == opportunityId))
            .FirstOrDefault();
    }

    private async Task<decimal> GetApprovedFundedAmountAsync(int opportunityId, int? excludingJoinRequestId = null)
    {
        var approvedRequests = await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
            r.OpportunityId == opportunityId
            && r.Status == OpportunityJoinRequestStatus.Approved
            && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
            && (!excludingJoinRequestId.HasValue || r.Id != excludingJoinRequestId.Value));

        return approvedRequests.Sum(r => r.RequestedAmount ?? 0m);
    }

    public async Task<IReadOnlyList<ApprovedInvestorDto>> GetApprovedInvestorsAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOwnedOpportunityAsync(userId, opportunityId, includeChildren: false);

        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            request => request.OpportunityId == opportunityId
                && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && request.Status == OpportunityJoinRequestStatus.Approved,
            request => request.Investor!,
            request => request.Investor!.Profile!);

        return approved
            .GroupBy(request => request.InvestorId)
            .Select(group => new
            {
                First = group.OrderBy(request => request.ReviewedAt ?? request.UpdatedAt).First(),
                TotalContribution = group.Sum(r => r.RequestedAmount ?? 0m),
                Requests = group.OrderBy(request => request.ReviewedAt ?? request.UpdatedAt).ToList()
            })
            .OrderBy(x => x.First.ReviewedAt ?? x.First.UpdatedAt)
            .Select(x => new ApprovedInvestorDto
            {
                UserId = x.First.InvestorId,
                DisplayName = x.First.Investor?.Profile?.FullName?.Trim()
                    ?? x.First.Investor?.Name?.Trim()
                    ?? string.Empty,
                AvatarUrl = x.First.Investor?.Profile?.AvatarUrl,
                ApprovedAt = x.First.ReviewedAt ?? x.First.UpdatedAt,
                TotalApprovedContribution = x.TotalContribution,
                Participations = x.Requests.Select(request => new ApprovedParticipationSummaryDto
                {
                    ParticipationRequestId = request.Id,
                    InvestmentModel = ParticipationModelLabel(ResolveParticipationInvestmentModel(request, opportunity.InvestmentModel)),
                    ApprovedContribution = request.RequestedAmount ?? 0m,
                    Currency = SnapshotString(TermsSnapshotParser.Parse(request.TermsSnapshotJson).Normalized, "currencySnapshot")
                        ?? opportunity.Currency,
                    ApprovedAt = request.ReviewedAt ?? request.UpdatedAt
                }).ToList()
            })
            .ToList();
    }

    public async Task<IReadOnlyList<InvestorPaymentSummaryDto>> GetOpportunityPaymentsAsync(Guid founderId, int id, CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: false);

        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.OpportunityId == id
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Approved,
            r => r.Investor!,
            r => r.Investor!.Profile!);

        var groupByInvestor = approved
            .GroupBy(r => r.InvestorId)
            .ToList();

        var requestIds = approved.Select(r => r.Id).ToList();
        var paymentTxns = await _uow.Repository<PaymentTransaction>().FindAsync(pt => requestIds.Contains(pt.ParticipationRequestId) && !pt.IsReversed);
        var txnByParticipation = paymentTxns.GroupBy(pt => pt.ParticipationRequestId).ToDictionary(g => g.Key, g => g.ToList());
        var allAllocations = await _uow.Repository<PaymentAllocation>()
            .FindWithIncludesAsync(a => requestIds.Contains(a.ParticipationRequestId), a => a.PaymentTransaction!);
        var allocsByParticipation = allAllocations
            .Where(a => !a.PaymentTransaction.IsReversed)
            .GroupBy(a => a.ParticipationRequestId)
            .ToDictionary(g => g.Key, g => g.ToLookup(a => a.InstallmentNumber));

        var today = DateTime.UtcNow.Date;
        return groupByInvestor.Select(group =>
        {
            var first = group.First();
            var scheduledRequests = group
                .Where(r => ResolveParticipationInvestmentModel(r, opportunity.InvestmentModel) is InvestmentModel.LoanInvestment or InvestmentModel.CapitalContributionProfitSharing)
                .ToList();
            var schedules = scheduledRequests.Select(r =>
            {
                var schedule = ResolveParticipationInvestmentModel(r, opportunity.InvestmentModel) == InvestmentModel.CapitalContributionProfitSharing
                    ? BuildProfitSharingPaymentSchedule(r)
                    : BuildPaymentSchedule(r);
                var payments = txnByParticipation.TryGetValue(r.Id, out var pts) ? pts : [];
                var allocs = allocsByParticipation.TryGetValue(r.Id, out var al) ? al : new List<PaymentAllocation>().ToLookup(a => a.InstallmentNumber);
                EnrichScheduleWithPayments(schedule.Payments, allocs, payments);
                return schedule;
            }).ToList();
            var allPayments = schedules.SelectMany(s => s.Payments).ToList();
            var totalPaid = allPayments.Sum(p => p.ActualPaid ?? 0m);
            var totalOverdue = allPayments.Where(p => p.Status == ExpectedPaymentStatus.Overdue).Sum(p => p.RemainingAmount);
            var totalOutstanding = allPayments.Where(p => p.Status is ExpectedPaymentStatus.Upcoming or ExpectedPaymentStatus.Due or ExpectedPaymentStatus.PartiallyPaid).Sum(p => p.RemainingAmount);
            var unpaidCount = allPayments.Count(p => p.Status is ExpectedPaymentStatus.Upcoming or ExpectedPaymentStatus.Due or ExpectedPaymentStatus.Overdue or ExpectedPaymentStatus.PartiallyPaid);
            var next = allPayments.Where(p => p.DueDate >= today && p.Status != ExpectedPaymentStatus.Paid && p.Status != ExpectedPaymentStatus.Cancelled).OrderBy(p => p.DueDate).FirstOrDefault();

            var overallStatus = totalOverdue > 0 ? "Overdue" : totalOutstanding > 0 ? "Outstanding" : "Paid";
            if (schedules.Count == 0) overallStatus = "NoPaymentSchedule";
            var models = group.Select(r => ResolveParticipationInvestmentModel(r, opportunity.InvestmentModel)).Distinct().Select(ParticipationModelLabel);

            return new InvestorPaymentSummaryDto
            {
                InvestorId = group.Key,
                DisplayName = first.Investor?.Profile?.FullName?.Trim() ?? first.Investor?.Name?.Trim() ?? string.Empty,
                AvatarUrl = first.Investor?.Profile?.AvatarUrl,
                TotalApprovedContribution = group.Sum(r => r.RequestedAmount ?? 0m),
                TotalPaid = totalPaid,
                TotalOutstanding = totalOutstanding,
                OverdueAmount = totalOverdue,
                NextDueDate = next?.DueDate,
                UnpaidInstallmentCount = unpaidCount,
                Status = overallStatus,
                Currency = schedules.FirstOrDefault()?.Currency ?? opportunity.Currency,
                InvestmentModelLabel = string.Join(" / ", models)
            };
        }).ToList();
    }

    public async Task<InvestorPaymentDetailDto> GetInvestorPaymentDetailsAsync(Guid founderId, int id, Guid investorId, CancellationToken cancellationToken = default)
    {
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: false);

        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.OpportunityId == id
                && r.InvestorId == investorId
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Approved,
            r => r.Opportunity!,
            r => r.Investor!,
            r => r.Investor!.Profile!);

        if (!approved.Any())
            throw new BusinessValidationException("INVESTOR_NOT_FOUND", "No approved participation found for this investor in this opportunity.");

        var first = approved.First();
        var participationModels = approved.Select(r => ResolveParticipationInvestmentModel(r, opportunity.InvestmentModel)).Distinct().ToList();
        var investmentModel = string.Join(" / ", participationModels.Select(ParticipationModelLabel));
        var requestIds = approved.Select(r => r.Id).ToList();
        var allTxns = await _uow.Repository<PaymentTransaction>().FindAsync(pt => requestIds.Contains(pt.ParticipationRequestId));
        var nonReversedTxns = allTxns.Where(pt => !pt.IsReversed).ToList();
        var txnByParticipation = nonReversedTxns.GroupBy(pt => pt.ParticipationRequestId).ToDictionary(g => g.Key, g => g.ToList());
        var allAllocations = await _uow.Repository<PaymentAllocation>()
            .FindWithIncludesAsync(a => requestIds.Contains(a.ParticipationRequestId), a => a.PaymentTransaction!);
        var validAllocs = allAllocations.Where(a => !a.PaymentTransaction.IsReversed).ToList();
        var allocsByParticipation = validAllocs
            .GroupBy(a => a.ParticipationRequestId)
            .ToDictionary(g => g.Key, g => g.ToLookup(a => a.InstallmentNumber));
        var participations = approved.Select(r =>
        {
            var participationModel = ResolveParticipationInvestmentModel(r, opportunity.InvestmentModel);
            if (participationModel is InvestmentModel.LoanInvestment or InvestmentModel.CapitalContributionProfitSharing)
            {
                var schedule = participationModel == InvestmentModel.CapitalContributionProfitSharing
                    ? BuildProfitSharingPaymentSchedule(r)
                    : BuildPaymentSchedule(r);
                var payments = txnByParticipation.TryGetValue(r.Id, out var pts) ? pts : [];
                var allocs = allocsByParticipation.TryGetValue(r.Id, out var al) ? al : new List<PaymentAllocation>().ToLookup(a => a.InstallmentNumber);
                EnrichScheduleWithPayments(schedule.Payments, allocs, payments);
                return schedule;
            }
            return new ParticipationPaymentScheduleDto
            {
                ParticipationRequestId = r.Id,
                OpportunityId = id,
                OpportunityTitle = opportunity.Title,
                Currency = opportunity.Currency,
                Principal = r.RequestedAmount ?? 0m,
                AnnualInterestRate = 0m,
                DurationMonths = 0,
                RepaymentFrequency = string.Empty,
                PrincipalRepaymentMethod = LoanPrincipalRepaymentMethod.AtMaturity,
                StartDate = r.ReviewedAt ?? r.CreatedAt,
                FinalRepaymentDate = opportunity.FinalRepaymentDate ?? DateTime.MinValue,
                TotalExpectedInterest = 0m,
                AverageExpectedMonthlyIncome = 0m,
                ReceivedToDate = null,
                RemainingPrincipal = null,
                Payments = []
            };
        }).ToList();

        var creatorIds = allTxns.Select(t => t.CreatedByUserId).Distinct();
        var creators = (await _uow.Repository<AuthUser>().FindAsync(u => creatorIds.Contains(u.Id)))
            .ToDictionary(u => u.Id, u => u.Name);

        var paymentTransactionDtos = allTxns
            .OrderByDescending(t => t.CreatedAt)
            .Select(txn =>
            {
                var txnAllocs = validAllocs.Where(a => a.PaymentTransactionId == txn.Id).ToList();
                return ToPaymentTransactionDetailDto(txn, txnAllocs,
                    creators.GetValueOrDefault(txn.CreatedByUserId));
            })
            .ToList();

        return new InvestorPaymentDetailDto
        {
            InvestorId = investorId,
            DisplayName = first.Investor?.Profile?.FullName?.Trim() ?? first.Investor?.Name?.Trim() ?? string.Empty,
            AvatarUrl = first.Investor?.Profile?.AvatarUrl,
            InvestmentModel = investmentModel,
            Currency = opportunity.Currency,
            Participations = participations,
            PaymentTransactions = paymentTransactionDtos
        };
    }

    private static void AddFundingProgressTimelineEntries(Opportunity opportunity, Guid actorUserId, DateTime occurredAt)
    {
        if (opportunity.FundingTarget <= 0)
            return;

        var funded = opportunity.JoinRequests
            .Where(request => request.Status == OpportunityJoinRequestStatus.Approved
                && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
            .GroupBy(request => request.Id)
            .Select(group => group.First())
            .Sum(request => request.RequestedAmount ?? 0m);
        var progress = Math.Min(funded / opportunity.FundingTarget * 100m, 100m);

        foreach (var threshold in new[] { 25, 50, 75, 100 }.Where(value => progress >= value))
        {
            ProjectActivityTimeline.Add(
                opportunity.Events,
                opportunity.Id,
                ProjectActivityTimeline.Types.FundingProgressReached,
                "System",
                actorUserId,
                occurredAt,
                "Opportunity",
                opportunity.Id.ToString(),
                $"funding-progress:{opportunity.Id}:{threshold}",
                new Dictionary<string, string?> { ["progressPercent"] = threshold.ToString() });
        }

        if (progress >= 100m)
        {
            ProjectActivityTimeline.Add(
                opportunity.Events,
                opportunity.Id,
                ProjectActivityTimeline.Types.FundingCompleted,
                "System",
                actorUserId,
                occurredAt,
                "Opportunity",
                opportunity.Id.ToString(),
                $"funding-completed:{opportunity.Id}");
        }
    }

    private async Task<ParticipationSummary> GetParticipationSummaryAsync(int opportunityId)
    {
        var summaries = await GetParticipationSummariesAsync([opportunityId]);
        return summaries[opportunityId];
    }

    private async Task<IReadOnlyDictionary<int, ParticipationSummary>> GetParticipationSummariesAsync(IEnumerable<int> opportunityIds)
    {
        var ids = opportunityIds.Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<int, ParticipationSummary>();

        var opportunities = (await _uow.Repository<Opportunity>().FindAsync(o => true))
            .Where(o => ids.Contains(o.Id))
            .ToList();
        var founders = await GetFounderLookupAsync(opportunities.Select(o => o.FounderId));
        var approved = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.Status == OpportunityJoinRequestStatus.Approved))
            .Where(r => ids.Contains(r.OpportunityId))
            .ToList();

        return opportunities.ToDictionary(opportunity => opportunity.Id, opportunity =>
        {
            var requests = approved.Where(r => r.OpportunityId == opportunity.Id).ToList();
            var financialRequests = requests
                .Where(r => r.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
                .GroupBy(r => r.Id)
                .Select(g => g.First())
                .ToList();
            var fundedAmount = financialRequests.Sum(r => r.RequestedAmount ?? 0m);
            var remainingFunding = CalculateRemainingFunding(opportunity.FundingTarget, fundedAmount);
            var progress = opportunity.FundingTarget <= 0
                ? 0m
                : Math.Min(decimal.Round(fundedAmount / opportunity.FundingTarget * 100m, 2), 100m);
            var soldShares = opportunity.InvestmentModel == InvestmentModel.Equity
                ? financialRequests.Sum(r => TryReadSelectedShares(r.TermsSnapshotJson))
                : 0;
            int? remainingShares = opportunity.OfferedShares.HasValue
                ? Math.Max(opportunity.OfferedShares.Value - soldShares, 0)
                : null;
            var allocatedEquity = opportunity.TotalShares is > 0
                ? decimal.Round(soldShares * 100m / opportunity.TotalShares.Value, 2)
                : 0m;
            decimal? remainingEquity = opportunity.EquityOfferedPercentage.HasValue
                ? Math.Max(opportunity.EquityOfferedPercentage.Value - allocatedEquity, 0m)
                : null;

            return new ParticipationSummary(
                fundedAmount,
                remainingFunding,
                progress,
                requests.Select(r => r.InvestorId).Distinct().Count(),
                soldShares,
                remainingShares,
                allocatedEquity,
                remainingEquity,
                founders.TryGetValue(opportunity.FounderId, out var founder) ? founder.Name : string.Empty);
        });
    }

    private async Task ApplyParticipationSummariesAsync(IEnumerable<OpportunityDto> opportunities)
    {
        var list = opportunities.ToList();
        var summaries = await GetParticipationSummariesAsync(list.Select(o => o.Id));
        foreach (var opportunity in list)
            ApplyParticipationSummary(opportunity, summaries[opportunity.Id]);
    }

    private async Task ApplyParticipationSummaryAsync(OpportunityDto opportunity) =>
        ApplyParticipationSummary(opportunity, await GetParticipationSummaryAsync(opportunity.Id));

    private static void ApplyParticipationSummary(OpportunityDto opportunity, ParticipationSummary summary)
    {
        opportunity.FundedAmount = summary.FundedAmount;
        opportunity.RemainingFundingAmount = summary.RemainingFundingAmount;
        opportunity.FundingProgressPercentage = summary.FundingProgressPercentage;
        opportunity.FundingProgressPercent = summary.FundingProgressPercentage;
        opportunity.ApprovedParticipantCount = summary.ApprovedParticipantCount;
        opportunity.SoldShares = summary.SoldShares;
        opportunity.RemainingShares = summary.RemainingShares;
        opportunity.AllocatedEquityPercentage = summary.AllocatedEquityPercentage;
        opportunity.RemainingEquityPercentage = summary.RemainingEquityPercentage;
    }

    private static JsonElement? SnapshotProperty(JsonElement? root, params string[] names)
    {
        if (!root.HasValue || root.Value.ValueKind != JsonValueKind.Object) return null;
        foreach (var property in root.Value.EnumerateObject())
            if (names.Any(name => string.Equals(name, property.Name, StringComparison.OrdinalIgnoreCase)))
                return property.Value;
        return null;
    }

    private static decimal? SnapshotDecimal(JsonElement? root, params string[] names)
    {
        var value = SnapshotProperty(root, names);
        if (!value.HasValue) return null;
        if (value.Value.ValueKind == JsonValueKind.Number && value.Value.TryGetDecimal(out var number)) return number;
        return decimal.TryParse(value.Value.ToString(), out number) ? number : null;
    }

    private static int? SnapshotInt(JsonElement? root, params string[] names)
    {
        var value = SnapshotProperty(root, names);
        if (!value.HasValue) return null;
        if (value.Value.ValueKind == JsonValueKind.Number && value.Value.TryGetInt32(out var number)) return number;
        return int.TryParse(value.Value.ToString(), out number) ? number : null;
    }

    private static string? SnapshotString(JsonElement? root, params string[] names) =>
        SnapshotProperty(root, names)?.ToString();

    private static DateTime? SnapshotDate(JsonElement? root, params string[] names) =>
        DateTime.TryParse(SnapshotString(root, names), out var date) ? date : null;

    private static InvestmentModel ResolveParticipationInvestmentModel(OpportunityJoinRequest request, InvestmentModel? opportunityModel = null)
    {
        var terms = TermsSnapshotParser.Parse(request.TermsSnapshotJson).Normalized;
        var legType = SnapshotString(terms, "legTypeName");
        if (!string.IsNullOrWhiteSpace(legType))
        {
            var normalizedLeg = legType.Replace(" ", string.Empty, StringComparison.Ordinal).ToLowerInvariant();
            if (normalizedLeg.Contains("loan")) return InvestmentModel.LoanInvestment;
            if (normalizedLeg.Contains("profit")) return InvestmentModel.CapitalContributionProfitSharing;
            if (normalizedLeg.Contains("equity")) return InvestmentModel.Equity;
        }

        var raw = SnapshotString(terms, "InvestmentModel", "investmentModel");
        if (int.TryParse(raw, out var numeric) && Enum.IsDefined(typeof(InvestmentModel), numeric))
            return (InvestmentModel)numeric;
        if (!string.IsNullOrWhiteSpace(raw))
        {
            var normalized = raw.Replace(" ", string.Empty, StringComparison.Ordinal)
                .Replace("_", string.Empty, StringComparison.Ordinal)
                .Replace("-", string.Empty, StringComparison.Ordinal)
                .ToLowerInvariant();
            if (normalized.Contains("loan")) return InvestmentModel.LoanInvestment;
            if (normalized.Contains("profit")) return InvestmentModel.CapitalContributionProfitSharing;
            if (normalized.Contains("equity")) return InvestmentModel.Equity;
        }
        return opportunityModel ?? request.Opportunity?.InvestmentModel ?? InvestmentModel.Equity;
    }

    private static string ParticipationModelLabel(InvestmentModel model) => model switch
    {
        InvestmentModel.LoanInvestment => "Loan",
        InvestmentModel.CapitalContributionProfitSharing => "Profit Sharing",
        InvestmentModel.Equity => "Equity",
        _ => "Unknown"
    };

    private static decimal CalculateRemainingFunding(decimal fundingTarget, decimal alreadyFundedAmount) =>
        Math.Max(fundingTarget - alreadyFundedAmount, 0m);

    private static void ValidateContributionAmount(decimal amount, decimal? minimumContribution, decimal? maximumContribution, decimal remainingFundingAmount)
    {
        if (amount <= 0)
            throw new BusinessValidationException("INVALID_REQUESTED_AMOUNT", "RequestedAmount must be greater than zero.");

        if (minimumContribution.HasValue && amount < minimumContribution.Value)
            throw new BusinessValidationException("CONTRIBUTION_BELOW_MINIMUM", $"RequestedAmount must be at least {minimumContribution.Value:0.##}.");

        if (maximumContribution.HasValue && amount > maximumContribution.Value)
            throw new BusinessValidationException("CONTRIBUTION_ABOVE_MAXIMUM", $"RequestedAmount must not exceed {maximumContribution.Value:0.##}.");

        if (amount > remainingFundingAmount)
            throw new BusinessValidationException("CONTRIBUTION_EXCEEDS_REMAINING_FUNDING", $"RequestedAmount must not exceed remaining funding amount {remainingFundingAmount:0.##}.");
    }

    private static int? ResolveLoanTermMonths(Opportunity opportunity) =>
        opportunity.ExpectedDurationMonths;

    private static decimal CalculateLoanExpectedReturn(decimal contributionAmount, decimal annualReturnRate, int termMonths) =>
        decimal.Round(contributionAmount * (annualReturnRate / 100m) * termMonths / 12m, 2);

    private static int? ResolveProfitSharingTermMonths(Opportunity opportunity, Investment? linkedInvestment) =>
        opportunity.ExpectedDurationMonths ?? linkedInvestment?.DurationMonths;

    private static decimal CalculateProfitSharingExpectedProfit(decimal contributionAmount, decimal profitSharePercentage) =>
        decimal.Round(contributionAmount * (profitSharePercentage / 100m), 2);

    private static string? BuildProfitSharingExitTerms(Opportunity opportunity, Investment? linkedInvestment)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(opportunity.ProfitSharingPayoutFrequency))
            parts.Add($"Payout frequency: {opportunity.ProfitSharingPayoutFrequency}");

        if (!string.IsNullOrWhiteSpace(linkedInvestment?.RevenueDistributionFrequency))
            parts.Add($"Revenue distribution: {linkedInvestment.RevenueDistributionFrequency}");

        if (opportunity.ProfitSharingContractStartDate.HasValue)
            parts.Add($"Contract start: {opportunity.ProfitSharingContractStartDate.Value:yyyy-MM-dd}");

        if (opportunity.ProfitSharingContractEndDate.HasValue)
            parts.Add($"Contract end: {opportunity.ProfitSharingContractEndDate.Value:yyyy-MM-dd}");

        if (linkedInvestment?.TotalExpectedPayout.HasValue == true)
            parts.Add($"Total expected payout: {linkedInvestment.TotalExpectedPayout.Value:0.##}");

        return parts.Count == 0 ? null : string.Join(" | ", parts);
    }

    private async Task<int> GetApprovedEquitySharesAsync(int opportunityId, int? excludingJoinRequestId = null)
    {
        var approvedRequests = await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
            r.OpportunityId == opportunityId
            && r.Status == OpportunityJoinRequestStatus.Approved
            && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
            && (!excludingJoinRequestId.HasValue || r.Id != excludingJoinRequestId.Value));

        return approvedRequests.Sum(r => TryReadSelectedShares(r.TermsSnapshotJson));
    }

    private async Task<int> GetApprovedParticipantCountAsync(int opportunityId)
    {
        var approvedInvestorIds = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId
                && r.Status == OpportunityJoinRequestStatus.Approved))
            .Select(r => r.InvestorId)
            .Distinct()
            .ToList();

        return approvedInvestorIds.Count;
    }

    private async Task ValidateEquityAvailabilityForApprovalAsync(Opportunity opportunity, OpportunityJoinRequest joinRequest)
    {
        if (opportunity.OfferedShares is null or <= 0)
            throw new BusinessValidationException("EQUITY_OFFERED_SHARES_REQUIRED", "Equity participation requires configured OfferedShares.");

        var selectedShares = TryReadSelectedShares(joinRequest.TermsSnapshotJson);
        if (selectedShares <= 0)
            throw new BusinessValidationException("INVALID_EQUITY_TERMS_SNAPSHOT", "Equity participation request is missing selected shares.");

        var approvedShares = await GetApprovedEquitySharesAsync(opportunity.Id, joinRequest.Id);
        var availableShares = Math.Max(opportunity.OfferedShares.Value - approvedShares, 0);
        if (selectedShares > availableShares)
            throw new BusinessValidationException("INSUFFICIENT_AVAILABLE_SHARES", $"Only {availableShares} shares are available.");
    }

    private async Task ValidateLoanFundingAvailabilityForApprovalAsync(Opportunity opportunity, OpportunityJoinRequest joinRequest)
    {
        if (!joinRequest.RequestedAmount.HasValue || joinRequest.RequestedAmount.Value <= 0)
            throw new BusinessValidationException("INVALID_REQUESTED_AMOUNT", "Loan participation request is missing a valid RequestedAmount.");

        var linkedInvestment = await GetLinkedInvestmentAsync(opportunity.Id);
        if (opportunity.InterestRate is null or <= 0)
            throw new BusinessValidationException("LOAN_RETURN_RATE_REQUIRED", "Loan participation requires configured InterestRate.");

        var durationMonths = ResolveLoanTermMonths(opportunity);
        if (!durationMonths.HasValue || durationMonths.Value <= 0)
            throw new BusinessValidationException("LOAN_TERM_REQUIRED", "Loan participation requires configured loan term.");

        var minimumContribution = opportunity.MinimumInvestmentAmount ?? linkedInvestment?.MinInvestment;
        var maximumContribution = opportunity.MaximumInvestmentAmount ?? linkedInvestment?.MaxInvestment;
        var alreadyFundedAmount = await GetApprovedFundedAmountAsync(opportunity.Id, joinRequest.Id);
        var remainingFundingAmount = CalculateRemainingFunding(opportunity.FundingTarget, alreadyFundedAmount);

        ValidateContributionAmount(joinRequest.RequestedAmount.Value, minimumContribution, maximumContribution, remainingFundingAmount);
    }

    private async Task ValidateProfitSharingFundingAvailabilityForApprovalAsync(Opportunity opportunity, OpportunityJoinRequest joinRequest)
    {
        if (!joinRequest.RequestedAmount.HasValue || joinRequest.RequestedAmount.Value <= 0)
            throw new BusinessValidationException("INVALID_REQUESTED_AMOUNT", "Profit sharing participation request is missing a valid RequestedAmount.");

        var linkedInvestment = await GetLinkedInvestmentAsync(opportunity.Id);
        var profitSharePercentage = opportunity.ProfitSharePercentage;
        if (!profitSharePercentage.HasValue || profitSharePercentage.Value <= 0)
            throw new BusinessValidationException("PROFIT_SHARING_TERMS_NOT_CONFIGURED", "This Profit Sharing opportunity is missing its configured ProfitSharePercentage.");

        var minimumContribution = opportunity.MinimumInvestmentAmount ?? linkedInvestment?.MinInvestment;
        var maximumContribution = opportunity.MaximumInvestmentAmount ?? linkedInvestment?.MaxInvestment;
        var alreadyFundedAmount = await GetApprovedFundedAmountAsync(opportunity.Id, joinRequest.Id);
        var remainingFundingAmount = CalculateRemainingFunding(opportunity.FundingTarget, alreadyFundedAmount);

        ValidateContributionAmount(joinRequest.RequestedAmount.Value, minimumContribution, maximumContribution, remainingFundingAmount);
    }

    private static int TryReadSelectedShares(string? termsSnapshotJson)
    {
        if (string.IsNullOrWhiteSpace(termsSnapshotJson))
            return 0;

        try
        {
            using var document = JsonDocument.Parse(termsSnapshotJson);
            var root = document.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
                return 0;

            if (root.TryGetProperty("selectedShares", out var selectedShares) && selectedShares.TryGetInt32(out var selected))
                return selected;

            if (root.TryGetProperty("numberOfShares", out var numberOfShares) && numberOfShares.TryGetInt32(out var legacy))
                return legacy;
        }
        catch
        {
            return 0;
        }

        return 0;
    }

    private static int? CalculateMinimumShares(decimal? minimumInvestmentAmount, decimal? sharePrice)
    {
        if (!minimumInvestmentAmount.HasValue || !sharePrice.HasValue || sharePrice.Value <= 0)
            return null;

        return (int)Math.Ceiling(minimumInvestmentAmount.Value / sharePrice.Value);
    }

    private static int? CalculateMaximumShares(decimal? maximumInvestmentAmount, decimal? sharePrice)
    {
        if (!maximumInvestmentAmount.HasValue || !sharePrice.HasValue || sharePrice.Value <= 0)
            return null;

        return (int)Math.Floor(maximumInvestmentAmount.Value / sharePrice.Value);
    }

    private async Task ApplyReputationActivitySafeAsync(Guid userId, string activityCode, string referenceType, string referenceId)
    {
        try
        {
            await _reputationService.ApplyActivityAsync(userId, activityCode, referenceType, referenceId, userId);
        }
        catch
        {
            // Reputation is non-authoritative for the product action; leave the main action intact.
        }
    }

    private static bool IsMilestoneEvent(string? eventType)
    {
        return !string.IsNullOrWhiteSpace(eventType)
            && eventType.Contains("milestone", StringComparison.OrdinalIgnoreCase);
    }

    private async Task NotifyApprovedParticipantsOfProjectUpdateAsync(
        Opportunity opportunity,
        Guid actorUserId,
        string businessEntityId,
        string updateTitle,
        CancellationToken cancellationToken)
    {
        var recipients = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(request =>
                request.OpportunityId == opportunity.Id
                && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && request.Status == OpportunityJoinRequestStatus.Approved))
            .Select(request => request.InvestorId)
            .Where(userId => userId != actorUserId)
            .Distinct()
            .Select(userId => new NotificationEventCreation(
                userId,
                "ProjectUpdatePublished",
                businessEntityId,
                "New project update",
                $"A new update was published for {opportunity.Title}: {updateTitle}",
                "info",
                $"/admin/opportunities/{opportunity.Id}/room",
                actorUserId,
                opportunity.Id));

        await _userNotificationService.CreateEventRangeAsync(recipients, cancellationToken);
    }

    private async Task PublishOpportunityRoomChangedAsync(
        Opportunity opportunity,
        string changeType,
        string relatedEntityId,
        CancellationToken cancellationToken)
    {
        var participantIds = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(request =>
                request.OpportunityId == opportunity.Id
                && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && request.Status == OpportunityJoinRequestStatus.Approved))
            .Select(request => request.InvestorId)
            .Append(opportunity.FounderId)
            .Where(userId => userId != Guid.Empty)
            .Distinct()
            .ToList();

        var eventId = Guid.NewGuid();
        var data = new Dictionary<string, object?>
        {
            ["opportunityId"] = opportunity.Id,
            ["changeType"] = changeType,
            ["relatedEntityId"] = relatedEntityId
        };

        foreach (var participantId in participantIds)
        {
            try
            {
                await _realtimeEventPublisher.PublishToUserAsync(
                    participantId,
                    "OpportunityRoomChanged",
                    eventId,
                    data,
                    cancellationToken);
            }
            catch
            {
                // The database state is authoritative; realtime delivery must not roll it back.
            }
        }
    }

    private static string ResolveMilestoneActivityType(string eventType)
    {
        if (eventType.Contains("completed", StringComparison.OrdinalIgnoreCase))
            return ProjectActivityTimeline.Types.MilestoneCompleted;
        if (eventType.Contains("delayed", StringComparison.OrdinalIgnoreCase))
            return ProjectActivityTimeline.Types.MilestoneDelayed;
        if (eventType.Contains("updated", StringComparison.OrdinalIgnoreCase))
            return ProjectActivityTimeline.Types.MilestoneUpdated;
        return ProjectActivityTimeline.Types.MilestoneCreated;
    }

    private static string SerializeTermsSnapshot(object snapshot) =>
        JsonSerializer.Serialize(snapshot, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    private static void ValidateRequestedAmount(decimal? requestedAmount)
    {
        if (requestedAmount.HasValue && requestedAmount.Value <= 0)
            throw new BusinessValidationException("INVALID_REQUESTED_AMOUNT", "RequestedAmount must be greater than zero.");
    }

    private static bool IsEligibleForJoin(Opportunity opportunity)
    {
        return PublicStatuses.Contains(opportunity.Status)
            && opportunity.Status is not OpportunityStatus.Completed
            && opportunity.Status is not OpportunityStatus.Archived;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string SnapshotCore(Opportunity opportunity)
    {
        var snapshot = new
        {
            opportunity.Title,
            opportunity.Description,
            opportunity.ShortDescription,
            opportunity.UseOfFunds,
            opportunity.FundingTarget,
            opportunity.CategoryId,
            opportunity.FundingGoalId,
            opportunity.MinimumInvestmentAmount,
            opportunity.MaximumInvestmentAmount,
            opportunity.ExpectedDurationMonths,
            opportunity.EquityOfferedPercentage,
            opportunity.ProfitSharePercentage,
            opportunity.ProfitSharingPayoutFrequency,
            opportunity.ProfitSharingContractStartDate,
            opportunity.ProfitSharingContractEndDate,
            opportunity.InterestRate,
            opportunity.RepaymentFrequency,
            opportunity.FinalRepaymentDate,
            InvestmentModel = opportunity.InvestmentModel.ToString(),
            ProjectStage = opportunity.ProjectStage.ToString(),
            Status = opportunity.Status.ToString(),
            opportunity.CoverImageUrl,
            opportunity.IsLockedForEditing,
            opportunity.FirstInvestorJoinedAt,
            TagIds = opportunity.OpportunityTags.Select(t => t.OpportunityTagId).OrderBy(id => id).ToList()
        };

        return JsonSerializer.Serialize(snapshot);
    }

    private static OpportunityDetailDto ToDetailDto(
        Opportunity opportunity,
        bool publicOnly = false,
        AuthUser? founder = null,
        IReadOnlyDictionary<int, OpportunityTag>? tagLookup = null,
        int? legacyInvestmentId = null)
    {
        var dto = new OpportunityDetailDto
        {
            Id = opportunity.Id,
            FounderId = opportunity.FounderId,
            LegacyInvestmentId = legacyInvestmentId,
            Founder = ToFounderSummary(founder, opportunity.FounderId),
            Title = opportunity.Title,
            Description = opportunity.Description,
            ShortDescription = opportunity.ShortDescription,
            UseOfFunds = opportunity.UseOfFunds,
            FundingTarget = opportunity.FundingTarget,
            Category = ToLookupDto(opportunity.Category),
            FundingGoal = ToLookupDto(opportunity.FundingGoal),
            FundingPurpose = opportunity.UseOfFunds,
            MinimumInvestmentAmount = opportunity.MinimumInvestmentAmount,
            MaximumInvestmentAmount = opportunity.MaximumInvestmentAmount,
            ExpectedDurationMonths = opportunity.ExpectedDurationMonths,
            Currency = opportunity.Currency,
            SharePrice = opportunity.SharePrice,
            TotalShares = opportunity.TotalShares,
            OfferedShares = opportunity.OfferedShares,
            EquityOfferedPercentage = opportunity.EquityOfferedPercentage,
            ProfitSharePercentage = opportunity.ProfitSharePercentage,
            ProfitSharingPayoutFrequency = opportunity.ProfitSharingPayoutFrequency,
            ProfitSharingContractStartDate = opportunity.ProfitSharingContractStartDate,
            ProfitSharingContractEndDate = opportunity.ProfitSharingContractEndDate,
            InterestRate = opportunity.InterestRate,
            RepaymentFrequency = opportunity.RepaymentFrequency,
            FinalRepaymentDate = opportunity.FinalRepaymentDate,
            PublicInvestmentTermsSummary = BuildPublicInvestmentTermsSummary(opportunity),
            ExpectedReturnSummary = BuildExpectedReturnSummary(opportunity),
            FundingProgressPercent = 0m,
            Tags = ToTagDtos(opportunity, tagLookup),
            InvestmentModel = opportunity.InvestmentModel,
            ProjectStage = opportunity.ProjectStage,
            Status = opportunity.Status,
            CoverImageUrl = opportunity.CoverImageUrl,
            IsLockedForEditing = opportunity.IsLockedForEditing,
            FirstInvestorJoinedAt = opportunity.FirstInvestorJoinedAt,
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt,
            Media = opportunity.Media
                .Where(m => !publicOnly || m.IsPublic)
                .OrderBy(m => m.SortOrder)
                .ThenByDescending(m => m.CreatedAt)
                .Select(ToMediaDto)
                .ToList(),
            Documents = opportunity.Documents
                .Where(d => !publicOnly || IsPublicSafeDocument(d))
                .OrderByDescending(d => d.CreatedAt)
                .Select(ToDocumentDto)
                .ToList(),
            Events = opportunity.Events
                .Where(e => !publicOnly || e.IsPublic)
                .OrderByDescending(e => e.CreatedAt)
                .Select(ToEventDto)
                .ToList()
        };

        return dto;
    }

    private static OpportunityDto ToDto(
        Opportunity opportunity,
        AuthUser? founder = null,
        IReadOnlyDictionary<int, OpportunityTag>? tagLookup = null,
        int? legacyInvestmentId = null) => new()
    {
        Id = opportunity.Id,
        FounderId = opportunity.FounderId,
        LegacyInvestmentId = legacyInvestmentId,
        Founder = ToFounderSummary(founder, opportunity.FounderId),
        Title = opportunity.Title,
        Description = opportunity.Description,
        ShortDescription = opportunity.ShortDescription,
        UseOfFunds = opportunity.UseOfFunds,
        FundingTarget = opportunity.FundingTarget,
        Category = ToLookupDto(opportunity.Category),
        FundingGoal = ToLookupDto(opportunity.FundingGoal),
        FundingPurpose = opportunity.UseOfFunds,
        MinimumInvestmentAmount = opportunity.MinimumInvestmentAmount,
        MaximumInvestmentAmount = opportunity.MaximumInvestmentAmount,
        ExpectedDurationMonths = opportunity.ExpectedDurationMonths,
        Currency = opportunity.Currency,
        SharePrice = opportunity.SharePrice,
        TotalShares = opportunity.TotalShares,
        OfferedShares = opportunity.OfferedShares,
        EquityOfferedPercentage = opportunity.EquityOfferedPercentage,
        ProfitSharePercentage = opportunity.ProfitSharePercentage,
        ProfitSharingPayoutFrequency = opportunity.ProfitSharingPayoutFrequency,
        ProfitSharingContractStartDate = opportunity.ProfitSharingContractStartDate,
        ProfitSharingContractEndDate = opportunity.ProfitSharingContractEndDate,
        InterestRate = opportunity.InterestRate,
        RepaymentFrequency = opportunity.RepaymentFrequency,
        FinalRepaymentDate = opportunity.FinalRepaymentDate,
        PublicInvestmentTermsSummary = BuildPublicInvestmentTermsSummary(opportunity),
        ExpectedReturnSummary = BuildExpectedReturnSummary(opportunity),
        FundingProgressPercent = 0m,
        Tags = ToTagDtos(opportunity, tagLookup),
        InvestmentModel = opportunity.InvestmentModel,
        ProjectStage = opportunity.ProjectStage,
        Status = opportunity.Status,
        CoverImageUrl = opportunity.CoverImageUrl,
        IsLockedForEditing = opportunity.IsLockedForEditing,
        FirstInvestorJoinedAt = opportunity.FirstInvestorJoinedAt,
        CreatedAt = opportunity.CreatedAt,
        UpdatedAt = opportunity.UpdatedAt
    };

    private static AdminOpportunityListItemDto ToAdminListItemDto(Opportunity opportunity, IReadOnlyDictionary<Guid, AuthUser> founders) => new()
    {
        Id = opportunity.Id,
        Title = opportunity.Title,
        Founder = ToFounderSummary(founders.TryGetValue(opportunity.FounderId, out var founder) ? founder : null, opportunity.FounderId),
        CreatedAt = opportunity.CreatedAt,
        Status = opportunity.Status,
        FundingTarget = opportunity.FundingTarget,
        InvestmentModel = opportunity.InvestmentModel,
        ProjectStage = opportunity.ProjectStage
    };

    private static AdminOpportunityDetailDto ToAdminDetailDto(Opportunity opportunity, AuthUser? founder, IReadOnlyDictionary<int, OpportunityTag>? tagLookup = null)
    {
        var detail = ToDetailDto(opportunity, tagLookup: tagLookup);
        return new AdminOpportunityDetailDto
        {
            Id = detail.Id,
            FounderId = detail.FounderId,
            Title = detail.Title,
            Description = detail.Description,
            ShortDescription = detail.ShortDescription,
            UseOfFunds = detail.UseOfFunds,
            FundingTarget = detail.FundingTarget,
            Category = detail.Category,
            FundingGoal = detail.FundingGoal,
            FundingPurpose = detail.FundingPurpose,
            MinimumInvestmentAmount = detail.MinimumInvestmentAmount,
            MaximumInvestmentAmount = detail.MaximumInvestmentAmount,
            ExpectedDurationMonths = detail.ExpectedDurationMonths,
            EquityOfferedPercentage = detail.EquityOfferedPercentage,
            Tags = detail.Tags,
            InvestmentModel = detail.InvestmentModel,
            ProjectStage = detail.ProjectStage,
            Status = detail.Status,
            CoverImageUrl = detail.CoverImageUrl,
            IsLockedForEditing = detail.IsLockedForEditing,
            FirstInvestorJoinedAt = detail.FirstInvestorJoinedAt,
            CreatedAt = detail.CreatedAt,
            UpdatedAt = detail.UpdatedAt,
            Media = detail.Media,
            Documents = detail.Documents,
            Events = detail.Events,
            Founder = ToFounderSummary(founder, opportunity.FounderId),
            ReviewHistory = detail.Events
                .Where(IsReviewEvent)
                .OrderByDescending(e => e.CreatedAt)
                .ToList()
        };
    }

    private static OpportunityRoomDto ToRoomDto(Opportunity opportunity, AuthUser? founder, bool isFounder, bool isApprovedParticipant, ParticipationSummary summary)
    {
        var canAccessRoom = isFounder || isApprovedParticipant;
        var canViewPrivateFiles = canAccessRoom;
        var milestoneEvents = opportunity.Events
            .Where(e => e.IsImmutableTimelineEntry && e.EventType is
                ProjectActivityTimeline.Types.MilestoneCreated or
                ProjectActivityTimeline.Types.MilestoneCompleted or
                ProjectActivityTimeline.Types.MilestoneDelayed or
                ProjectActivityTimeline.Types.MilestoneUpdated)
            .OrderByDescending(e => e.CreatedAt)
            .ToList();
        var milestones = milestoneEvents.Select(ToMilestoneDto).ToList();

        return new OpportunityRoomDto
        {
            Overview = new OpportunityRoomOverviewDto
            {
                Id = opportunity.Id,
                Title = opportunity.Title,
                Status = opportunity.Status,
                ProjectStage = opportunity.ProjectStage,
                Founder = ToFounderSummary(founder, opportunity.FounderId),
                FundingTarget = opportunity.FundingTarget,
                FundingProgress = summary.FundingProgressPercentage,
                FundingProgressPercent = summary.FundingProgressPercentage,
                FundedAmount = summary.FundedAmount,
                RemainingFundingAmount = summary.RemainingFundingAmount,
                FundingProgressPercentage = summary.FundingProgressPercentage,
                ApprovedParticipantCount = summary.ApprovedParticipantCount,
                TotalShares = opportunity.TotalShares,
                OfferedShares = opportunity.OfferedShares,
                SoldShares = summary.SoldShares,
                RemainingShares = summary.RemainingShares,
                SharePrice = opportunity.SharePrice,
                AllocatedEquityPercentage = summary.AllocatedEquityPercentage,
                RemainingEquityPercentage = summary.RemainingEquityPercentage,
                InvestmentModel = opportunity.InvestmentModel,
                MinimumInvestment = opportunity.MinimumInvestmentAmount,
                ExpectedReturnSummary = BuildExpectedReturnSummary(opportunity),
                UseOfFunds = opportunity.UseOfFunds,
                PublicInvestmentTermsSummary = BuildPublicInvestmentTermsSummary(opportunity)
            },
            MediaLibrary = BuildRoomMediaLibrary(opportunity.Media, canViewPrivateFiles),
            DocumentsLibrary = BuildRoomDocumentsLibrary(opportunity.Documents, canViewPrivateFiles),
            Timeline = opportunity.Events
                .Where(ProjectActivityTimeline.IsInvestorVisible)
                .OrderByDescending(e => e.CreatedAt)
                .Select(ToProjectActivityTimelineDto)
                .ToList(),
            Milestones = milestones,
            LatestMilestone = milestones.FirstOrDefault(),
            ParticipantContext = new OpportunityRoomParticipantContextDto
            {
                IsFounder = isFounder,
                IsApprovedParticipant = isApprovedParticipant,
                ApprovedParticipantCount = summary.ApprovedParticipantCount,
                CanAccessProjectRoom = canAccessRoom,
                CanEditCoreProject = isFounder && summary.ApprovedParticipantCount == 0,
                CanAddUpdate = isFounder,
                CanAddDocument = isFounder,
                CanAddMilestone = isFounder,
                CanUpload = isFounder,
                CanPostUpdate = isFounder,
                CanViewPrivateFiles = canViewPrivateFiles,
                CanDownloadFiles = canAccessRoom
            }
        };
    }

    private static OpportunityMilestoneDto ToMilestoneDto(OpportunityEvent milestone)
    {
        var isCompleted = milestone.EventType.Contains("completed", StringComparison.OrdinalIgnoreCase);
        var isStarted = milestone.EventType.Contains("started", StringComparison.OrdinalIgnoreCase);

        return new OpportunityMilestoneDto
        {
            MilestoneId = milestone.Id,
            Title = milestone.Title,
            Description = milestone.Description,
            Status = isCompleted ? "Completed" : isStarted ? "InProgress" : "Created",
            CreatedAt = milestone.CreatedAt,
            CompletedAt = isCompleted ? milestone.CreatedAt : null
        };
    }

    private static IReadOnlyList<OpportunityRoomMediaGroupDto> BuildRoomMediaLibrary(IEnumerable<OpportunityMedia> media, bool includePrivate)
    {
        var allowedPurposes = new[]
        {
            OpportunityFilePurpose.Cover,
            OpportunityFilePurpose.Gallery,
            OpportunityFilePurpose.PitchVideo,
            OpportunityFilePurpose.ProjectUpdateMedia,
            OpportunityFilePurpose.General
        };

        var visibleMedia = media
            .Where(m => includePrivate || m.IsPublic)
            .ToList();

        return allowedPurposes
            .Select(purpose => new OpportunityRoomMediaGroupDto
            {
                Purpose = purpose,
                Items = visibleMedia
                    .Where(m => m.Purpose == purpose)
                    .OrderBy(m => m.SortOrder)
                    .ThenByDescending(m => m.CreatedAt)
                    .Select(ToMediaDto)
                    .ToList()
            })
            .ToList();
    }

    private static IReadOnlyList<OpportunityRoomDocumentGroupDto> BuildRoomDocumentsLibrary(IEnumerable<OpportunityDocument> documents, bool includePrivate)
    {
        var allowedPurposes = new[]
        {
            OpportunityFilePurpose.PublicDocument,
            OpportunityFilePurpose.PrivateDocument,
            OpportunityFilePurpose.FinancialReport,
            OpportunityFilePurpose.Contract,
            OpportunityFilePurpose.Legal,
            OpportunityFilePurpose.InternalFile,
            OpportunityFilePurpose.General
        };

        var visibleDocuments = documents
            .Where(d => includePrivate || IsPublicSafeDocument(d))
            .ToList();

        return allowedPurposes
            .Select(purpose => new OpportunityRoomDocumentGroupDto
            {
                Purpose = purpose,
                Items = visibleDocuments
                    .Where(d => d.Purpose == purpose)
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(ToDocumentDto)
                    .ToList()
            })
            .ToList();
    }

    private static FounderSummaryDto ToFounderSummary(AuthUser? founder, Guid founderId) => new()
    {
        Id = founderId,
        Name = founder?.Name ?? string.Empty,
        Email = founder?.Email
    };

    private async Task<IReadOnlyDictionary<Guid, AuthUser>> GetFounderLookupAsync(IEnumerable<Guid> founderIds)
    {
        var ids = founderIds.Where(id => id != Guid.Empty).Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<Guid, AuthUser>();

        return (await _uow.Repository<AuthUser>().GetAllAsync())
            .Where(u => ids.Contains(u.Id))
            .ToDictionary(u => u.Id);
    }

    private static string? ToShortDescription(string? description)
    {
        var normalized = Normalize(description);
        if (normalized == null)
            return null;

        return normalized.Length <= 220 ? normalized : normalized[..217] + "...";
    }

    private static string BuildPublicInvestmentTermsSummary(Opportunity opportunity)
    {
        var parts = new List<string> { opportunity.InvestmentModel.ToString() };

        if (opportunity.MinimumInvestmentAmount.HasValue)
            parts.Add($"Minimum investment {opportunity.MinimumInvestmentAmount.Value:0.##}");

        if (opportunity.MaximumInvestmentAmount.HasValue)
            parts.Add($"Maximum investment {opportunity.MaximumInvestmentAmount.Value:0.##}");

        if (opportunity.ExpectedDurationMonths.HasValue)
            parts.Add($"{opportunity.ExpectedDurationMonths.Value} months expected duration");

        if (opportunity.InvestmentModel == InvestmentModel.Equity && opportunity.EquityOfferedPercentage.HasValue)
            parts.Add($"{opportunity.EquityOfferedPercentage.Value:0.##}% equity offered");

        return string.Join(" | ", parts);
    }

    private static string BuildExpectedReturnSummary(Opportunity opportunity)
    {
        return opportunity.InvestmentModel switch
        {
            InvestmentModel.Equity => "Equity upside based on future company value.",
            InvestmentModel.LoanInvestment => opportunity.ExpectedDurationMonths.HasValue
                ? $"Loan return terms over {opportunity.ExpectedDurationMonths.Value} months."
                : "Loan return terms available on request.",
            InvestmentModel.CapitalContributionProfitSharing => "Profit sharing terms available on request.",
            _ => "Expected return summary available on request."
        };
    }

    private static bool IsPublicSafeDocument(OpportunityDocument document)
    {
        if (document.Visibility != OpportunityDocumentVisibility.Public)
            return false;

        var type = (document.DocumentType ?? string.Empty).Replace(" ", string.Empty);
        var category = (document.Category ?? string.Empty).Replace(" ", string.Empty);
        var sensitiveTokens = new[] { "Private", "FinancialReport", "Finance", "Contract", "Legal", "Internal" };

        return !sensitiveTokens.Any(token =>
            type.Contains(token, StringComparison.OrdinalIgnoreCase)
            || category.Contains(token, StringComparison.OrdinalIgnoreCase));
    }

    private static OpportunityLookupDto? ToLookupDto(OpportunityCategory? category)
    {
        return category == null
            ? null
            : new OpportunityLookupDto { Id = category.Id, Name = category.Name, Description = category.Description };
    }

    private static OpportunityLookupDto? ToLookupDto(FundingGoal? fundingGoal)
    {
        return fundingGoal == null
            ? null
            : new OpportunityLookupDto { Id = fundingGoal.Id, Name = fundingGoal.Name, Description = fundingGoal.Description };
    }

    private static OpportunityLookupDto ToLookupDto(OpportunityTag tag) => new()
    {
        Id = tag.Id,
        Name = tag.Name,
        Description = tag.Description
    };

    private static IReadOnlyList<OpportunityLookupDto> ToTagDtos(Opportunity opportunity, IReadOnlyDictionary<int, OpportunityTag>? tagLookup)
    {
        return opportunity.OpportunityTags
            .Select(t => tagLookup != null && tagLookup.TryGetValue(t.OpportunityTagId, out var tag)
                ? new OpportunityLookupDto { Id = tag.Id, Name = tag.Name, Description = tag.Description }
                : t.OpportunityTag == null
                    ? new OpportunityLookupDto { Id = t.OpportunityTagId, Name = string.Empty }
                    : new OpportunityLookupDto { Id = t.OpportunityTag.Id, Name = t.OpportunityTag.Name, Description = t.OpportunityTag.Description })
            .OrderBy(t => t.Name)
            .ToList();
    }

    private static bool IsReviewEvent(OpportunityEventDto opportunityEvent)
    {
        return opportunityEvent.EventType is "SubmittedForReview" or "Approved" or "Rejected";
    }

    private static OpportunityJoinRequestDto ToJoinRequestDto(
        OpportunityJoinRequest joinRequest,
        bool includeRejectionReason,
        AuthUser? founder = null) => new()
    {
        Id = joinRequest.Id,
        OpportunityId = joinRequest.OpportunityId,
        OpportunityTitle = joinRequest.Opportunity?.Title ?? string.Empty,
        InvestorId = joinRequest.InvestorId,
        InvestorName = ResolveUserDisplayName(joinRequest.Investor),
        FounderId = joinRequest.Opportunity?.FounderId ?? Guid.Empty,
        FounderName = ResolveUserDisplayName(founder),
        RequestType = joinRequest.RequestType,
        RequestedAmount = joinRequest.RequestedAmount,
        CalculatedTotalAmount = joinRequest.CalculatedTotalAmount,
        Message = joinRequest.Message,
        TermsSnapshotJson = joinRequest.TermsSnapshotJson,
        Status = joinRequest.Status,
        CreatedAt = joinRequest.CreatedAt,
        ReviewedAt = joinRequest.ReviewedAt,
        RejectionReason = includeRejectionReason ? joinRequest.RejectionReason : null
    };

    private static FounderIncomingJoinRequestDto ToFounderIncomingJoinRequestDto(OpportunityJoinRequest joinRequest) => new()
    {
        RequestId = joinRequest.Id,
        OpportunityId = joinRequest.OpportunityId,
        OpportunityTitle = joinRequest.Opportunity?.Title ?? string.Empty,
        InvestorId = joinRequest.InvestorId,
        InvestorDisplayName = ResolveUserDisplayName(joinRequest.Investor),
        InvestmentModel = joinRequest.Opportunity?.InvestmentModel ?? default,
        RequestType = joinRequest.RequestType,
        RequestedAmount = joinRequest.RequestedAmount,
        Status = joinRequest.Status,
        CreatedAt = joinRequest.CreatedAt,
        CalculatedTotalAmount = joinRequest.CalculatedTotalAmount,
        TermsSnapshotJson = joinRequest.TermsSnapshotJson,
        CanApprove = joinRequest.Status == OpportunityJoinRequestStatus.Pending,
        CanReject = joinRequest.Status == OpportunityJoinRequestStatus.Pending,
        SourceConversationId = joinRequest.SourceConversationId
    };

    private static string ResolveUserDisplayName(AuthUser? user)
    {
        if (user == null) return string.Empty;

        var profileName = user.Profile?.FullName?.Trim();
        if (!string.IsNullOrWhiteSpace(profileName)) return profileName;

        var profileParts = new[] { user.Profile?.FirstName, user.Profile?.LastName }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => part!.Trim());
        var nameFromProfileParts = string.Join(" ", profileParts);
        if (!string.IsNullOrWhiteSpace(nameFromProfileParts)) return nameFromProfileParts;

        var clientParts = new[] { user.Client?.FirstName, user.Client?.LastName }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => part!.Trim());
        var nameFromClient = string.Join(" ", clientParts);
        if (!string.IsNullOrWhiteSpace(nameFromClient)) return nameFromClient;

        return user.Name?.Trim() ?? string.Empty;
    }

    private sealed record JoinRequestDetails(
        OpportunityJoinRequestType RequestType,
        decimal? RequestedAmount,
        decimal? CalculatedTotalAmount,
        string TermsSnapshotJson,
        string EventType,
        string EventTitle,
        string EventDescription);

    private static List<Opportunity> SortAdminList(
        List<Opportunity> opportunities,
        IReadOnlyDictionary<Guid, AuthUser> founders,
        string? sortBy,
        string? sortDirection)
    {
        var descending = !string.Equals(sortDirection, "asc", StringComparison.OrdinalIgnoreCase);
        var normalized = (sortBy ?? "createdAt").Trim().ToLowerInvariant();

        IOrderedEnumerable<Opportunity> ordered = normalized switch
        {
            "title" => descending ? opportunities.OrderByDescending(o => o.Title) : opportunities.OrderBy(o => o.Title),
            "status" => descending ? opportunities.OrderByDescending(o => o.Status) : opportunities.OrderBy(o => o.Status),
            "fundingtarget" => descending ? opportunities.OrderByDescending(o => o.FundingTarget) : opportunities.OrderBy(o => o.FundingTarget),
            "investmentmodel" => descending ? opportunities.OrderByDescending(o => o.InvestmentModel) : opportunities.OrderBy(o => o.InvestmentModel),
            "projectstage" => descending ? opportunities.OrderByDescending(o => o.ProjectStage) : opportunities.OrderBy(o => o.ProjectStage),
            "founder" => descending
                ? opportunities.OrderByDescending(o => founders.TryGetValue(o.FounderId, out var founder) ? founder.Name : string.Empty)
                : opportunities.OrderBy(o => founders.TryGetValue(o.FounderId, out var founder) ? founder.Name : string.Empty),
            _ => descending ? opportunities.OrderByDescending(o => o.CreatedAt) : opportunities.OrderBy(o => o.CreatedAt)
        };

        return ordered.ThenByDescending(o => o.Id).ToList();
    }

    private static OpportunityMediaDto ToMediaDto(OpportunityMedia media) => new()
    {
        Id = media.Id,
        OpportunityId = media.OpportunityId,
        FileUrl = media.FileUrl,
        FileId = media.FileId,
        FileKey = media.FileKey,
        FileName = media.FileName,
        FileType = media.FileType,
        MimeType = media.MimeType,
        FileSize = media.FileSize,
        PreviewUrl = media.PreviewUrl,
        ThumbnailUrl = media.ThumbnailUrl,
        MediaType = media.MediaType,
        Purpose = media.Purpose,
        IsCover = media.IsCover,
        IsPublic = media.IsPublic,
        SortOrder = media.SortOrder,
        CreatedByUserId = media.CreatedByUserId,
        CreatedAt = media.CreatedAt
    };

    private static OpportunityDocumentDto ToDocumentDto(OpportunityDocument document) => new()
    {
        Id = document.Id,
        OpportunityId = document.OpportunityId,
        FileUrl = document.FileUrl,
        FileId = document.FileId,
        FileKey = document.FileKey,
        FileName = document.FileName,
        FileExtension = document.FileExtension,
        MimeType = document.MimeType,
        FileSize = document.FileSize,
        PreviewUrl = document.PreviewUrl,
        ThumbnailUrl = document.ThumbnailUrl,
        DocumentType = document.DocumentType,
        Visibility = document.Visibility,
        Purpose = document.Purpose,
        Category = document.Category,
        SearchTags = document.SearchTags,
        CreatedByUserId = document.CreatedByUserId,
        CreatedAt = document.CreatedAt
    };

    private static OpportunityEventDto ToEventDto(OpportunityEvent opportunityEvent) => new()
    {
        Id = opportunityEvent.Id,
        OpportunityId = opportunityEvent.OpportunityId,
        EventType = opportunityEvent.EventType,
        Title = opportunityEvent.Title,
        Description = opportunityEvent.Description,
        OldValue = opportunityEvent.OldValue,
        NewValue = opportunityEvent.NewValue,
        CreatedByUserId = opportunityEvent.CreatedByUserId,
        CreatedAt = opportunityEvent.CreatedAt,
        IsPublic = opportunityEvent.IsPublic
    };

    private static ProjectActivityTimelineDto ToProjectActivityTimelineDto(OpportunityEvent entry)
    {
        IReadOnlyDictionary<string, string?> metadata = new Dictionary<string, string?>();
        if (!string.IsNullOrWhiteSpace(entry.LocalizedMetadataJson))
        {
            try
            {
                metadata = JsonSerializer.Deserialize<Dictionary<string, string?>>(entry.LocalizedMetadataJson)
                    ?? new Dictionary<string, string?>();
            }
            catch (JsonException)
            {
                metadata = new Dictionary<string, string?>();
            }
        }

        var titleKey = !string.IsNullOrWhiteSpace(entry.Title) && entry.Title.StartsWith("projectActivity.types.")
            ? entry.Title
            : $"projectActivity.types.{entry.EventType}.title";
        var descriptionKey = !string.IsNullOrWhiteSpace(entry.Description) && entry.Description.StartsWith("projectActivity.types.")
            ? entry.Description
            : $"projectActivity.types.{entry.EventType}.description";

        return new ProjectActivityTimelineDto
        {
            Id = entry.Id,
            OpportunityId = entry.OpportunityId,
            EventType = entry.EventType,
            TitleKey = titleKey,
            DescriptionKey = descriptionKey,
            ActorType = entry.ActorType ?? "System",
            OccurredAt = entry.CreatedAt,
            RelatedEntityType = entry.RelatedEntityType,
            RelatedEntityId = entry.RelatedEntityId,
            Metadata = metadata
        };
    }

    private sealed record ParticipationSummary(
        decimal FundedAmount,
        decimal RemainingFundingAmount,
        decimal FundingProgressPercentage,
        int ApprovedParticipantCount,
        int SoldShares,
        int? RemainingShares,
        decimal AllocatedEquityPercentage,
        decimal? RemainingEquityPercentage,
        string FounderDisplayName);
}
