using System.Text.Json;
using System.Security.Cryptography;
using System.Text;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.DTOs.Users;
using Investa.Application.Interfaces;
using Investa.Domain;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;

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
    private readonly ICurrencyConversionService _currencyConversionService;
    private readonly IFileStorage _fileStorage;
    private readonly IFileValidationService _fileValidationService;
    private readonly IFileScanService _fileScanService;
    private readonly IOpportunityFileAuditService _fileAuditService;

    public OpportunityService(IUnitOfWork uow, IPaidActionService paidActionService, IReputationService reputationService, IInvestmentContractService investmentContractService, IUserNotificationService userNotificationService, IRealtimeEventPublisher realtimeEventPublisher, ICurrencyConversionService currencyConversionService, IFileStorage fileStorage, IFileValidationService fileValidationService, IFileScanService fileScanService, IOpportunityFileAuditService fileAuditService)
    {
        _uow = uow;
        _paidActionService = paidActionService;
        _reputationService = reputationService;
        _investmentContractService = investmentContractService;
        _userNotificationService = userNotificationService;
        _realtimeEventPublisher = realtimeEventPublisher;
        _currencyConversionService = currencyConversionService;
        _fileStorage = fileStorage;
        _fileValidationService = fileValidationService;
        _fileScanService = fileScanService;
        _fileAuditService = fileAuditService;
    }

    public async Task<OpportunityDetailDto> CreateAsync(Guid founderId, CreateOpportunityRequest request, CancellationToken cancellationToken = default)
    {
        var founder = await ValidateOpportunityCreationFounderAsync(founderId);
        request.FundingCurrency = CurrencyConversionService.NormalizeCurrency(request.FundingCurrency ?? founder?.Profile?.PreferredCurrency ?? CurrencyMasterDefaults.DefaultCurrency);
        ValidateCoreFields(request.Title, request.FundingTarget);
        var stage = ValidateProjectStage(request.ProjectStage, request.ProjectStageCustomName);
        ValidateTextRange(request.ShortDescription, "SHORT_DESCRIPTION_REQUIRED", "ShortDescription", 20, 300);
        ValidateTextRange(request.UseOfFunds, "USE_OF_FUNDS_REQUIRED", "UseOfFunds", 30, 2000);
        await ValidateCurrencySelectionAsync(request.FundingCurrency!, requireFunding: true);
        var tags = await ValidateClassificationAsync(request.FundingGoalId, request.TagIds);

        var now = DateTime.UtcNow;
        Project project;
        if (request.ProjectId.HasValue)
        {
            project = await _uow.Repository<Project>().GetSingleAsync(
                p => p.Id == request.ProjectId.Value && p.FounderId == founderId,
                p => p.Opportunities,
                p => p.Category!);
            if (project == null)
                throw new BusinessValidationException("PROJECT_NOT_FOUND", "A valid founder-owned Project is required.");
            if (project.Status == ProjectStatus.Archived)
                throw new BusinessValidationException("PROJECT_ARCHIVED", "An archived Project cannot have a funding opportunity.");
        }
        else
        {
            // Backward-compatible Phase 1 path for existing API clients. New clients
            // send ProjectId and use the separately managed Project aggregate.
            project = new Project
            {
                FounderId = founderId, DisplayName = request.Title.Trim(), Slug = $"project-{Guid.NewGuid():N}",
                Summary = request.ShortDescription.Trim(), Description = Normalize(request.Description) ?? request.ShortDescription.Trim(),
                BusinessStage = stage.Stage,
                TagsSnapshotJson = JsonSerializer.Serialize(tags.Select(tag => tag.Id).OrderBy(id => id)),
                LogoUrl = Normalize(request.CoverImageUrl), Status = ProjectStatus.Draft, CreatedAt = now, UpdatedAt = now
            };
        }
        if (request.ProjectId.HasValue)
            await EnsureProjectStageAvailableAsync(project.Id, stage, cancellationToken: cancellationToken);

        var opportunity = new Opportunity
        {
            Project = project,
            FounderId = founderId,
            SequenceNumber = project.Opportunities.Count == 0 ? 1 : project.Opportunities.Max(o => o.SequenceNumber) + 1,
            Purpose = Normalize(request.Purpose) ?? "General funding",
            Type = Normalize(request.Type) ?? "Opportunity",
            Title = request.Title.Trim(),
            Description = Normalize(request.Description),
            ShortDescription = request.ShortDescription.Trim(),
            UseOfFunds = request.UseOfFunds.Trim(),
            FundingTarget = request.FundingTarget,
            FundingGoalId = request.FundingGoalId,
            FundingCurrency = request.FundingCurrency,
            InvestmentModel = InvestmentModel.Unspecified,
            ProjectStage = stage.Stage,
            ProjectStageCustomName = stage.CustomName,
            ProjectStageCustomNameNormalized = stage.NormalizedCustomName,
            Status = OpportunityStatus.Draft,
            ModerationStatus = OpportunityModerationStatus.Draft,
            FundingStatus = OpportunityFundingStatus.NotScheduled,
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
            EventType = request.ProjectId.HasValue ? "OpportunityDraftCreated" : "ProjectDraftCreated",
            Title = request.ProjectId.HasValue ? "Opportunity created" : "Project created",
            Description = request.ProjectId.HasValue ? "Opportunity draft was linked to an existing Project." : "Opportunity draft was created through the legacy compatibility path.",
            CreatedByUserId = founderId,
            CreatedAt = now,
            IsPublic = false
        });
        ProjectActivityTimeline.Add(
            opportunity.Events,
            opportunity.Id,
            ProjectActivityTimeline.Types.OpportunityCreated,
            "Founder",
            founderId,
            now,
            "Opportunity",
            $"sequence:{opportunity.SequenceNumber}",
            $"opportunity-created:{project.Id}:{opportunity.SequenceNumber}:{now.Ticks}",
            new Dictionary<string, string?>
            {
                ["opportunityTitle"] = opportunity.Title,
                ["projectStage"] = GetProjectStageLabel(stage),
                ["createdOpenedDate"] = now.ToString("O"),
                ["opportunityReference"] = $"#{opportunity.SequenceNumber}"
            });

        await _uow.Repository<Opportunity>().AddAsync(opportunity);
        try
        {
            await _uow.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (IsProjectStageUniqueConstraint(exception))
        {
            throw ProjectStageConflict();
        }

        await AttachProjectContextAsync(new[] { opportunity });
        return ToDetailDto(opportunity, tagLookup: tags.ToDictionary(t => t.Id));
    }

    public async Task<OpportunityDetailDto> UpdateAsync(Guid founderId, int id, UpdateOpportunityRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        request.FundingCurrency = CurrencyConversionService.NormalizeCurrency(request.FundingCurrency ?? opportunity.FundingCurrency);
        ValidateCoreFields(request.Title, request.FundingTarget);
        var stage = ValidateProjectStage(request.ProjectStage, request.ProjectStageCustomName);
        ValidateTextRange(request.ShortDescription, "SHORT_DESCRIPTION_REQUIRED", "ShortDescription", 20, 300);
        ValidateTextRange(request.UseOfFunds, "USE_OF_FUNDS_REQUIRED", "UseOfFunds", 30, 2000);
        await ValidateCurrencySelectionAsync(request.FundingCurrency!, requireFunding: true);
        var tags = await ValidateClassificationAsync(request.FundingGoalId, request.TagIds);

        if (opportunity.IsLockedForEditing)
            throw new BusinessValidationException("OPPORTUNITY_LOCKED", "Core project fields are locked after the first investor joins. Add a project event instead.");

        await EnsureProjectStageAvailableAsync(opportunity.ProjectId, stage, opportunity.Id, cancellationToken);

        var previousStatus = opportunity.Status;
        var nextStatus = request.Status ?? opportunity.Status;
        ValidateFounderEditStatusTransition(previousStatus, nextStatus);
        if (previousStatus is not (OpportunityStatus.Draft or OpportunityStatus.Rejected)
            && !string.Equals(opportunity.FundingCurrency, request.FundingCurrency, StringComparison.OrdinalIgnoreCase))
            throw new BusinessValidationException("FUNDING_CURRENCY_IMMUTABLE", "Funding Currency cannot be changed after publishing.");

        var oldValue = SnapshotCore(opportunity);

        opportunity.Title = request.Title.Trim();
        opportunity.Purpose = Normalize(request.Purpose) ?? opportunity.Purpose;
        opportunity.Type = Normalize(request.Type) ?? opportunity.Type;
        opportunity.Description = Normalize(request.Description);
        opportunity.ShortDescription = request.ShortDescription.Trim();
        opportunity.UseOfFunds = request.UseOfFunds.Trim();
        opportunity.FundingTarget = request.FundingTarget;
        opportunity.FundingGoalId = request.FundingGoalId;
        opportunity.FundingCurrency = request.FundingCurrency;
        opportunity.MinimumInvestmentAmount = null;
        opportunity.MaximumInvestmentAmount = null;
        opportunity.ExpectedDurationMonths = null;
        opportunity.SharePrice = null;
        opportunity.TotalShares = null;
        opportunity.OfferedShares = null;
        opportunity.EquityOfferedPercentage = null;
        opportunity.ProfitSharePercentage = null;
        opportunity.ProfitSharingPayoutFrequency = null;
        opportunity.ProfitSharingContractStartDate = null;
        opportunity.ProfitSharingContractEndDate = null;
        opportunity.InterestRate = null;
        opportunity.RepaymentFrequency = null;
        opportunity.FinalRepaymentDate = null;
        opportunity.InvestmentModel = InvestmentModel.Unspecified;
        opportunity.ProjectStage = stage.Stage;
        opportunity.ProjectStageCustomName = stage.CustomName;
        opportunity.ProjectStageCustomNameNormalized = stage.NormalizedCustomName;
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
        try
        {
            await _uow.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (IsProjectStageUniqueConstraint(exception))
        {
            throw ProjectStageConflict();
        }

        await AttachProjectContextAsync(new[] { opportunity });
        return ToDetailDto(opportunity, tagLookup: tags.ToDictionary(t => t.Id));
    }

    public async Task<IReadOnlyList<OpportunityDto>> GetMyAsync(Guid founderId, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);

        var opportunities = await _uow.Repository<Opportunity>().FindWithIncludesAsync(
            o => o.FounderId == founderId,
            o => o.Project!,
            o => o.FundingGoal!,
            o => o.OpportunityTags);
        await AttachProjectContextAsync(opportunities);
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
        var contracts = (await _uow.Repository<InvestmentContract>().FindWithIncludesAsync(
                c => c.InvestorUserId == investorId && c.Status == InvestmentContractStatus.Active,
                c => c.Versions))
            .ToList();
        var contractsByParticipation = contracts
            .SelectMany(contract => contract.Versions.Select(version => new { contract, version }))
            .ToDictionary(item => item.version.SourceParticipationRequestId);
        var projectIds = approved.Select(r => r.Opportunity!.ProjectId).Distinct().ToHashSet();
        var projects = (await _uow.Repository<Project>().FindAsync(p => projectIds.Contains(p.Id)))
            .ToDictionary(p => p.Id);
        var projectTotals = approved
            .Where(r => r.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
            .GroupBy(r => r.Opportunity!.ProjectId)
            .ToDictionary(g => g.Key, g => g.Sum(r => r.FundingAmount ?? r.RequestedAmount ?? 0m));

        return relationshipGroups.Select(group =>
        {
            var latest = group.OrderByDescending(r => r.ReviewedAt ?? r.UpdatedAt).First();
            var opportunity = latest.Opportunity!;
            var investmentRequests = group.Where(r => r.RequestType == OpportunityJoinRequestType.InvestmentParticipation).ToList();
            var approvedContribution = investmentRequests.Sum(r => r.FundingAmount ?? r.RequestedAmount ?? 0m);
            var approvedShares = investmentRequests.Sum(r => TryReadSelectedShares(r.TermsSnapshotJson));
            var summary = summaries[opportunity.Id];
            var latestContract = contracts
                .Where(c => c.OpportunityId == opportunity.Id)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefault();
            var parseResult = TermsSnapshotParser.Parse(latest.TermsSnapshotJson);
            var terms = parseResult.Normalized;
            var hasAcceptedOffer = latest.AcceptedOfferId.HasValue;
            var isSnapshotAuthoritative = hasAcceptedOffer;

            return new MyParticipationDto
            {
                ProjectId = opportunity.ProjectId,
                ProjectDisplayName = projects.TryGetValue(opportunity.ProjectId, out var project) ? project.DisplayName : string.Empty,
                ProjectTotalInvestment = projectTotals.GetValueOrDefault(opportunity.ProjectId),
                OpportunityTotalInvestment = approvedContribution,
                Participations = investmentRequests.OrderBy(r => r.ParticipationSequence).Select(r =>
                {
                    contractsByParticipation.TryGetValue(r.Id, out var contractItem);
                    return new ParticipationItemDto
                    {
                        ParticipationId = r.Id,
                        SequenceNumber = r.ParticipationSequence,
                        ApprovedAmount = r.FundingAmount ?? r.RequestedAmount ?? 0m,
                        FundingCurrency = r.FundingCurrency ?? opportunity.FundingCurrency,
                        ApprovedAt = r.ReviewedAt,
                        ContractId = contractItem?.contract.Id,
                        ContractNumber = contractItem?.contract.ContractNumber,
                        ContractVersion = contractItem?.version.VersionNumber,
                        ContractDocumentHash = contractItem?.version.DocumentHash
                    };
                }).ToArray(),
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
                ContractAvailable = latestContract != null,
                CurrentContractId = latestContract?.Id,
                CurrentContractVersion = latestContract?.CurrentVersionNumber,
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
        var acceptedOffer = request.AcceptedOfferId.HasValue
            ? (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => o.Id == request.AcceptedOfferId.Value, o => o.Legs)).SingleOrDefault()
            : null;
        var legs = BuildParticipationLegs(request, request.Opportunity, acceptedOffer);
        return BuildLegAggregateSchedule(request, request.Opportunity, legs);
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
        if (request.Amount <= 0)
            throw new BusinessValidationException("INVALID_PAYMENT_AMOUNT", "Payment amount must be greater than zero.");
        var reference = Normalize(request.Reference);
        var idempotencyKey = NormalizePaymentIdempotencyKey(
            request.IdempotencyKey,
            opportunityId,
            request.ParticipationRequestId,
            request.Amount,
            request.PaymentDate,
            reference);

        var existing = await GetPaymentByIdempotencyKeyAsync(idempotencyKey);
        if (existing != null)
            return existing;

        PaymentTransaction? transaction = null;
        List<PaymentAllocation> allocations = [];
        try
        {
            await _uow.ExecuteWithStrategyAsync(async () =>
            {
                await _uow.BeginTransactionAsync();
                try
                {
                    var opportunity = await GetOpportunityAsync(opportunityId, includeChildren: false);
                    var participation = await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(request.ParticipationRequestId);
                    if (participation == null || participation.OpportunityId != opportunityId)
                        throw new BusinessValidationException("PARTICIPATION_NOT_FOUND", "Participation request was not found for this opportunity.");
                    if (participation.Status != OpportunityJoinRequestStatus.Approved)
                        throw new BusinessValidationException("PARTICIPATION_NOT_APPROVED", "Only approved participations can receive payments.");

                    var replay = await _uow.Repository<PaymentTransaction>().ExistsAsync(pt => pt.IdempotencyKey == idempotencyKey);
                    if (replay)
                        throw new BusinessValidationException("PAYMENT_IDEMPOTENCY_CONFLICT", "This payment request has already been processed.");
                    if (reference != null && await _uow.Repository<PaymentTransaction>().ExistsAsync(pt => pt.Reference == reference))
                        throw new BusinessValidationException("DUPLICATE_PAYMENT_REFERENCE", "A payment with this reference already exists.");

                    transaction = new PaymentTransaction
                    {
                        ParticipationRequestId = request.ParticipationRequestId,
                        Amount = request.Amount,
                        PaymentDate = request.PaymentDate,
                        Reference = reference,
                        IdempotencyKey = idempotencyKey,
                        Notes = request.Notes?.Trim(),
                        ExchangeRateSnapshotId = participation.ExchangeRateSnapshotId,
                        CreatedByUserId = userId,
                        CreatedAt = DateTime.UtcNow
                    };

                    allocations = opportunity.InvestmentModel == InvestmentModel.LoanInvestment
                        ? await ComputeFifoAllocationsAsync(participation, request.Amount)
                        :
                        [
                            new PaymentAllocation
                            {
                                ParticipationRequestId = participation.Id,
                                InstallmentNumber = 0,
                                AllocatedAmount = request.Amount
                            }
                        ];

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
        }
        catch (DbUpdateException)
        {
            var replay = await GetPaymentByIdempotencyKeyAsync(idempotencyKey);
            if (replay != null)
                return replay;
            throw new BusinessValidationException("CONCURRENCY_CONFLICT", "The payment conflicted with another financial write. Reload and retry.");
        }
        catch (BusinessValidationException ex) when (ex.Code == "PAYMENT_IDEMPOTENCY_CONFLICT")
        {
            var replay = await GetPaymentByIdempotencyKeyAsync(idempotencyKey);
            if (replay != null)
                return replay;
            throw;
        }

        if (transaction == null)
            throw new BusinessValidationException("CONCURRENCY_CONFLICT", "The payment was not committed.");

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

        var acceptedOfferIds = approved.Where(r => r.AcceptedOfferId.HasValue).Select(r => r.AcceptedOfferId!.Value).ToHashSet();
        var acceptedOffers = acceptedOfferIds.Count == 0
            ? []
            : await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => acceptedOfferIds.Contains(o.Id), o => o.Legs);
        var acceptedOffersById = acceptedOffers.ToDictionary(o => o.Id);

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
            acceptedOffersById.TryGetValue(participation.AcceptedOfferId ?? 0, out var acceptedOffer);
            var schedule = BuildLegAggregateSchedule(
                participation,
                opportunity,
                BuildParticipationLegs(participation, opportunity, acceptedOffer));
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

            var participation = await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(inst.ParticipationRequestId);
            var confirmationKey = $"bulk:{opportunityId}:{preview.Year}:{preview.Month:D2}:{inst.ParticipationRequestId}:{inst.InstallmentNumber}";
            var transaction = new PaymentTransaction
            {
                ParticipationRequestId = inst.ParticipationRequestId,
                Amount = inst.RemainingAmount,
                PaymentDate = today,
                Reference = $"BULK-{preview.Year}-{preview.Month:D2}-{inst.ParticipationRequestId}-{inst.InstallmentNumber}",
                IdempotencyKey = confirmationKey,
                Notes = $"Bulk confirmation for {preview.Year}-{preview.Month:D2} (installment #{inst.InstallmentNumber})",
                ExchangeRateSnapshotId = participation?.ExchangeRateSnapshotId,
                CreatedByUserId = founderId,
                CreatedAt = now
            };

            var allocations = new List<PaymentAllocation>
            {
                new PaymentAllocation
                {
                    ParticipationRequestId = inst.ParticipationRequestId,
                    InstallmentNumber = inst.InstallmentNumber,
                    AllocatedAmount = inst.RemainingAmount,
                    InstallmentConfirmationKey = confirmationKey
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
                preview = await GetMonthlyUnpaidInstallmentsAsync(founderId, opportunityId, request.Year, request.Month, cancellationToken);
                if (preview.Installments.Count == 0)
                    throw new BusinessValidationException("INSTALLMENT_ALREADY_CONFIRMED", "The installments were already confirmed by another request.");

                createdTransactions.Clear();
                processedIds.Clear();
                foreach (var inst in preview.Installments)
                {
                    var dedupKey = (inst.ParticipationRequestId, inst.InstallmentNumber);
                    if (!processedIds.Add(dedupKey))
                        continue;

                    var participation = await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(inst.ParticipationRequestId);
                    var confirmationKey = $"bulk:{opportunityId}:{preview.Year}:{preview.Month:D2}:{inst.ParticipationRequestId}:{inst.InstallmentNumber}";
                    createdTransactions.Add((
                        new PaymentTransaction
                        {
                            ParticipationRequestId = inst.ParticipationRequestId,
                            Amount = inst.RemainingAmount,
                            PaymentDate = today,
                            Reference = $"BULK-{preview.Year}-{preview.Month:D2}-{inst.ParticipationRequestId}-{inst.InstallmentNumber}",
                            IdempotencyKey = confirmationKey,
                            Notes = $"Bulk confirmation for {preview.Year}-{preview.Month:D2} (installment #{inst.InstallmentNumber})",
                            ExchangeRateSnapshotId = participation?.ExchangeRateSnapshotId,
                            CreatedByUserId = founderId,
                            CreatedAt = now
                        },
                        [
                            new PaymentAllocation
                            {
                                ParticipationRequestId = inst.ParticipationRequestId,
                                InstallmentNumber = inst.InstallmentNumber,
                                AllocatedAmount = inst.RemainingAmount,
                                InstallmentConfirmationKey = confirmationKey
                            }
                        ]));
                }

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
            catch (DbUpdateException)
            {
                await _uow.RollbackTransactionAsync();
                throw new BusinessValidationException("INSTALLMENT_ALREADY_CONFIRMED", "One or more installments were concurrently confirmed.");
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
        var acceptedOffer = participation.AcceptedOfferId.HasValue
            ? (await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => o.Id == participation.AcceptedOfferId.Value, o => o.Legs)).SingleOrDefault()
            : null;
        var legs = BuildParticipationLegs(participation, participation.Opportunity!, acceptedOffer);
        var schedule = BuildLegAggregateSchedule(participation, participation.Opportunity!, legs);
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
        var acceptedOfferIds = requests.Where(r => r.AcceptedOfferId.HasValue).Select(r => r.AcceptedOfferId!.Value).ToHashSet();
        var acceptedOffers = acceptedOfferIds.Count == 0
            ? []
            : await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => acceptedOfferIds.Contains(o.Id), o => o.Legs);
        var acceptedOffersById = acceptedOffers.ToDictionary(o => o.Id);
        return requests
            .Where(r => r.Opportunity != null)
            .Select(r =>
            {
                acceptedOffersById.TryGetValue(r.AcceptedOfferId ?? 0, out var acceptedOffer);
                return BuildLegAggregateSchedule(r, r.Opportunity!, BuildParticipationLegs(r, r.Opportunity!, acceptedOffer));
            })
            .Where(schedule => schedule.Legs.Count > 0)
            .ToList();
    }

    private static ParticipationPaymentScheduleDto BuildLegAggregateSchedule(
        OpportunityJoinRequest request,
        Opportunity opportunity,
        IReadOnlyList<ParticipationLegDto> legs)
    {
        var payments = legs.SelectMany(leg => leg.CashFlows).OrderBy(payment => payment.DueDate).ToList();
        var start = request.ReviewedAt ?? request.CreatedAt;
        return new ParticipationPaymentScheduleDto
        {
            ParticipationRequestId = request.Id,
            OpportunityId = opportunity.Id,
            OpportunityTitle = opportunity.Title,
            Currency = legs.FirstOrDefault()?.Currency ?? request.FundingCurrency,
            Principal = legs.Sum(leg => leg.Amount),
            AnnualInterestRate = 0m,
            DurationMonths = legs.Where(leg => leg.TermMonths.HasValue).Select(leg => leg.TermMonths!.Value).DefaultIfEmpty(0).Max(),
            RepaymentFrequency = legs.Count == 1 ? legs[0].RepaymentModel ?? string.Empty : "Mixed",
            PrincipalRepaymentMethod = LoanPrincipalRepaymentMethod.AtMaturity,
            StartDate = start,
            FinalRepaymentDate = payments.Count == 0 ? start : payments.Max(payment => payment.DueDate),
            TotalExpectedInterest = payments.Sum(payment => payment.ExpectedInterest),
            AverageExpectedMonthlyIncome = payments.Count == 0 ? 0m : payments.Sum(payment => payment.ExpectedInterest) / Math.Max(1, legs.Max(leg => leg.TermMonths ?? 1)),
            ReceivedToDate = null,
            RemainingPrincipal = null,
            Payments = payments,
            Legs = legs.ToList()
        };
    }

    public async Task<OpportunityDetailDto> GetFounderOpportunityAsync(Guid founderId, int id, CancellationToken cancellationToken = default, bool isAdmin = false)
    {
        ValidateFounder(founderId);
        var opportunity = isAdmin
            ? await GetOpportunityAsync(id, includeChildren: true)
            : await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        await AttachProjectContextAsync(new[] { opportunity });
        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        var dto = ToDetailDto(opportunity, founder: founder, tagLookup: await GetActiveTagLookupAsync());
        await ApplyParticipationSummaryAsync(dto);
        return dto;
    }

    public async Task<OpportunityRoomDto> GetOpportunityRoomAsync(Guid userId, int id, CancellationToken cancellationToken = default, bool isAdmin = false)
    {
        if (!isAdmin)
            await ValidateClientAsync(userId, "Only authenticated clients can access an Opportunity Room.");
        var opportunity = await GetOpportunityAsync(id, includeChildren: true);
        var project = await _uow.Repository<Project>().GetByIdAsync(opportunity.ProjectId);
        var isFounder = opportunity.FounderId == userId;
        if (isAdmin)
            return ToRoomDto(opportunity, project?.DisplayName, await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId), isFounder: false, isApprovedParticipant: false, await GetParticipationSummaryAsync(id), await BuildRoomParticipationsAsync(opportunity, userId, isFounder: false, isAdmin: true, cancellationToken), isAdmin: true);
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
            throw new BusinessValidationException("OPPORTUNITY_ROOM_FORBIDDEN", "Opportunity Room access requires founder ownership or an approved join request.");

        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        return ToRoomDto(opportunity, project?.DisplayName, founder, isFounder, isApprovedParticipant, summary, await BuildRoomParticipationsAsync(opportunity, userId, isFounder, isAdmin: false, cancellationToken), isAdmin: false);
    }

    public async Task<OpportunityMediaDto> AddMediaAsync(Guid founderId, int id, CreateOpportunityMediaRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateRequired(request.FileKey, "FILE_KEY_REQUIRED", "FileKey is required.");
        ValidateRequired(request.MediaType, "MEDIA_TYPE_REQUIRED", "MediaType is required.");
        if (!request.IsPublic.HasValue)
            throw new BusinessValidationException("MEDIA_VISIBILITY_REQUIRED", "Media visibility must be explicitly Public or Private.");

        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        await AttachProjectContextAsync(new[] { opportunity });
        var now = DateTime.UtcNow;
        var purpose = ResolveMediaPurpose(request);
        ValidateMediaPurposeVisibility(purpose, request.IsPublic.Value);

        var metadata = await _fileStorage.GetFileMetadataAsync(request.FileKey, cancellationToken);
        if (metadata == null)
            throw new BusinessValidationException("FILE_NOT_FOUND", "The referenced file was not found in storage.");

        var resolved = _fileValidationService.ValidateAndResolve(request.FileKey);

        var scanStatus = await _fileScanService.ScanAsync(request.FileKey, cancellationToken);
        if (scanStatus == Domain.Entities.Enums.FileScanStatus.Rejected)
            throw new BusinessValidationException("FILE_REJECTED", "The referenced file failed security scanning.");

        if (request.IsCover)
        {
            foreach (var existing in opportunity.Media)
                existing.IsCover = false;

            opportunity.CoverImageUrl = metadata.Url;
        }

        var media = new OpportunityMedia
        {
            OpportunityId = id,
            FileKey = request.FileKey,
            FileId = metadata.FileId,
            FileUrl = metadata.Url,
            FileName = Path.GetFileName(metadata.OriginalFileName) != metadata.FileName
                ? metadata.OriginalFileName
                : metadata.FileName,
            FileType = Path.GetExtension(metadata.OriginalFileName).TrimStart('.').ToUpperInvariant(),
            MimeType = metadata.MimeType,
            FileSize = metadata.FileSize,
            PreviewUrl = metadata.PreviewUrl,
            ThumbnailUrl = metadata.ThumbnailUrl,
            MediaType = request.MediaType.Trim(),
            IsCover = request.IsCover,
            IsPublic = request.IsPublic.Value,
            Purpose = purpose,
            SortOrder = request.SortOrder,
            CreatedByUserId = founderId,
            CreatedAt = now,
            ScanStatus = scanStatus,
            ScanCompletedAt = scanStatus != Domain.Entities.Enums.FileScanStatus.Pending ? now : null
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

        await _fileAuditService.RecordUploadAsync(founderId, id, "OpportunityMedia", media.Id.ToString(), media.FileName);
        await _fileAuditService.RecordScanResultAsync("OpportunityMedia", media.Id.ToString(), request.FileKey, scanStatus.ToString());

        return ToMediaDto(media);
    }

    public async Task<OpportunityDocumentDto> AddDocumentAsync(Guid founderId, int id, CreateOpportunityDocumentRequest request, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        ValidateRequired(request.FileKey, "FILE_KEY_REQUIRED", "FileKey is required.");
        ValidateRequired(request.DocumentType, "DOCUMENT_TYPE_REQUIRED", "DocumentType is required.");

        if (!request.Visibility.HasValue || !Enum.IsDefined(request.Visibility.Value))
            throw new BusinessValidationException("INVALID_DOCUMENT_VISIBILITY", "Document visibility must be Public or Private.");

        _fileValidationService.ValidateMetadataSanitization(null, null, request.Category, request.SearchTags);

        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        var now = DateTime.UtcNow;
        var purpose = ResolveDocumentPurpose(request);
        ValidateDocumentPurposeVisibility(purpose, request.Visibility.Value);

        var metadata = await _fileStorage.GetFileMetadataAsync(request.FileKey, cancellationToken);
        if (metadata == null)
            throw new BusinessValidationException("FILE_NOT_FOUND", "The referenced file was not found in storage.");

        var resolved = _fileValidationService.ValidateAndResolve(request.FileKey);

        var scanStatus = await _fileScanService.ScanAsync(request.FileKey, cancellationToken);
        if (scanStatus == Domain.Entities.Enums.FileScanStatus.Rejected)
            throw new BusinessValidationException("FILE_REJECTED", "The referenced file failed security scanning.");

        var ext = Path.GetExtension(metadata.OriginalFileName);
        var fileName = metadata.OriginalFileName;

        var document = new OpportunityDocument
        {
            OpportunityId = id,
            FileKey = request.FileKey,
            FileId = metadata.FileId,
            FileUrl = metadata.Url,
            FileName = fileName,
            FileExtension = ext.TrimStart('.'),
            MimeType = metadata.MimeType,
            FileSize = metadata.FileSize,
            PreviewUrl = metadata.PreviewUrl,
            ThumbnailUrl = metadata.ThumbnailUrl,
            DocumentType = request.DocumentType.Trim(),
            Visibility = request.Visibility.Value,
            Purpose = purpose,
            Category = Normalize(request.Category),
            SearchTags = Normalize(request.SearchTags),
            CreatedByUserId = founderId,
            CreatedAt = now,
            ScanStatus = scanStatus,
            ScanCompletedAt = scanStatus != Domain.Entities.Enums.FileScanStatus.Pending ? now : null
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
                $"document-published:{Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(document.FileKey ?? string.Empty)))}",
                new Dictionary<string, string?> { ["documentName"] = document.FileName });
        }
        opportunity.UpdatedAt = now;

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();

        await _fileAuditService.RecordUploadAsync(founderId, id, "OpportunityDocument", document.Id.ToString(), document.FileName);
        await _fileAuditService.RecordScanResultAsync("OpportunityDocument", document.Id.ToString(), request.FileKey, scanStatus.ToString());

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

    public async Task<OpportunityMilestoneDto> CompleteMilestoneAsync(Guid founderId, int id, int milestoneId, CancellationToken cancellationToken = default)
    {
        ValidateFounder(founderId);
        var opportunity = await GetOwnedOpportunityAsync(founderId, id, includeChildren: true);
        var milestone = opportunity.Events.FirstOrDefault(e =>
            e.Id == milestoneId
            && e.IsImmutableTimelineEntry
            && e.EventType == ProjectActivityTimeline.Types.MilestoneCreated);

        if (milestone == null)
            throw new BusinessValidationException("MILESTONE_NOT_FOUND", "Milestone was not found.");

        var relatedEntityId = milestone.RelatedEntityId ?? $"milestone-event:{milestone.Id}";
        var alreadyCompleted = opportunity.Events.Any(e =>
            e.IsImmutableTimelineEntry
            && e.EventType == ProjectActivityTimeline.Types.MilestoneCompleted
            && e.RelatedEntityId == relatedEntityId);
        if (alreadyCompleted)
            throw new BusinessValidationException("MILESTONE_ALREADY_COMPLETED", "Milestone is already completed.");

        var now = DateTime.UtcNow;
        var metadata = ReadMilestoneMetadata(milestone);
        ProjectActivityTimeline.Add(
            opportunity.Events,
            id,
            ProjectActivityTimeline.Types.MilestoneCompleted,
            "Founder",
            founderId,
            now,
            "OpportunityMilestone",
            relatedEntityId,
            $"milestone:{relatedEntityId}:completed",
            metadata);
        opportunity.UpdatedAt = now;

        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();
        await PublishOpportunityRoomChangedAsync(
            opportunity,
            ProjectActivityTimeline.Types.MilestoneCompleted,
            milestone.Id.ToString(),
            cancellationToken);
        await NotifyApprovedParticipantsOfProjectUpdateAsync(
            opportunity,
            founderId,
            $"milestone:{milestone.Id}:completed",
            metadata.GetValueOrDefault("milestoneTitle") ?? milestone.Title,
            cancellationToken);
        await ApplyReputationActivitySafeAsync(
            founderId,
            "CompleteProjectMilestone",
            "OpportunityEvent",
            milestone.Id.ToString());

        return ToMilestoneDto(milestone, now);
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
                o => o.FundingGoal!,
                o => o.Project!,
                o => o.OpportunityTags);
        await AttachProjectContextAsync(opportunities);
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
            o => o.FundingGoal!,
            o => o.Project!,
            o => o.OpportunityTags);

        if (opportunity == null)
            throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");

        await AttachProjectContextAsync(new[] { opportunity });

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

    private async Task AttachProjectContextAsync(IEnumerable<Opportunity> opportunities)
    {
        var items = opportunities.ToList();
        var projectIds = items.Select(o => o.ProjectId).Distinct().ToArray();
        if (projectIds.Length == 0)
            return;

        // The legacy database migration introduced a composite ProjectId/FounderId
        // relationship. Read-model projection must still resolve the canonical
        // Project by its own id so Project context is available even when an old
        // row has a stale founder relationship value.
        var projectRepository = _uow.Repository<Project>();
        foreach (var opportunity in items)
        {
            var project = await projectRepository.GetSingleAsync(
                p => p.Id == opportunity.ProjectId,
                p => p.Category!);
            if (project != null)
                opportunity.Project = project;
        }
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
        await AttachProjectContextAsync(new[] { opportunity });

        if (opportunity.Status is not (OpportunityStatus.Draft or OpportunityStatus.Rejected))
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", "Only Draft or Rejected opportunities can be published.");

        ValidateCompleteForReview(opportunity);
        opportunity.ModerationStatus = OpportunityModerationStatus.Approved;
        opportunity.FundingStatus = OpportunityFundingStatus.Open;
        opportunity.FundingOpensAt ??= DateTime.UtcNow;
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

    public async Task<OpportunityDetailDto> TransitionFundingAsync(Guid actorId, int id, TransitionOpportunityFundingRequest request, bool isAdmin, CancellationToken cancellationToken = default)
    {
        if (!request.TargetStatus.HasValue || !Enum.IsDefined(request.TargetStatus.Value))
            throw new BusinessValidationException("INVALID_FUNDING_STATUS", "Unknown funding status.");
        var opportunity = isAdmin
            ? await GetOpportunityAsync(id, includeChildren: true)
            : await GetOwnedOpportunityAsync(actorId, id, includeChildren: true);
        ApplyAutomaticLifecycle(opportunity, actorId);
        var target = request.TargetStatus.Value;
        if (!IsAllowedFundingTransition(opportunity.FundingStatus, target))
            throw new BusinessValidationException("INVALID_FUNDING_STATUS_TRANSITION", $"Opportunity cannot transition from {opportunity.FundingStatus} to {target}.");
        if (target is OpportunityFundingStatus.Scheduled or OpportunityFundingStatus.Open)
        {
            if (opportunity.ModerationStatus != OpportunityModerationStatus.Approved && opportunity.Status != OpportunityStatus.Approved && opportunity.Status != OpportunityStatus.Published)
                throw new BusinessValidationException("OPPORTUNITY_NOT_APPROVED", "Only an approved Opportunity can be scheduled or opened.");
            if (request.FundingClosesAt.HasValue && request.FundingClosesAt <= (request.FundingOpensAt ?? DateTime.UtcNow))
                throw new BusinessValidationException("INVALID_FUNDING_DATES", "Funding close date must be after its open date.");
        }
        if (target == OpportunityFundingStatus.Closed && !request.ClosureReason.HasValue)
            throw new BusinessValidationException("CLOSURE_REASON_REQUIRED", "A closure reason is required.");

        var oldValue = SnapshotCore(opportunity);
        opportunity.FundingOpensAt = request.FundingOpensAt ?? opportunity.FundingOpensAt;
        opportunity.FundingClosesAt = request.FundingClosesAt ?? opportunity.FundingClosesAt;
        opportunity.FundingStatus = target;
        opportunity.ClosureReason = target == OpportunityFundingStatus.Closed ? request.ClosureReason : null;
        opportunity.ClosedAt = target == OpportunityFundingStatus.Closed ? DateTime.UtcNow : null;
        opportunity.Status = target switch {
            OpportunityFundingStatus.Open => OpportunityStatus.Funding,
            OpportunityFundingStatus.Closed when request.ClosureReason == OpportunityClosureReason.TargetReached => OpportunityStatus.FullyFunded,
            OpportunityFundingStatus.Closed => OpportunityStatus.Completed,
            _ => opportunity.Status
        };
        opportunity.UpdatedAt = DateTime.UtcNow;
        opportunity.Events.Add(new OpportunityEvent {
            EventType = "FundingStatusChanged", Title = $"Funding {target}",
            Description = request.Reason?.Trim() ?? $"Funding transitioned to {target}.",
            OldValue = oldValue, NewValue = SnapshotCore(opportunity), CreatedByUserId = actorId,
            CreatedAt = DateTime.UtcNow, IsPublic = target is OpportunityFundingStatus.Open or OpportunityFundingStatus.Closed
        });
        await _uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await _uow.SaveChangesAsync();
        return ToDetailDto(opportunity, tagLookup: await GetActiveTagLookupAsync());
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
        var investor = await _uow.Repository<AuthUser>().GetSingleAsync(u => u.Id == userId, u => u.Profile!);
        var displayCurrency = CurrencyConversionService.NormalizeCurrency(investor?.Profile?.PreferredCurrency ?? CurrencyMasterDefaults.DefaultCurrency);
        var displayTarget = await _currencyConversionService.ConvertForDisplayAsync(opportunity.FundingTarget, opportunity.FundingCurrency, displayCurrency, cancellationToken);
        var displayFunded = await _currencyConversionService.ConvertForDisplayAsync(Math.Max(alreadyFundedAmount, 0.01m), opportunity.FundingCurrency, displayCurrency, cancellationToken);
        var displayRemaining = await _currencyConversionService.ConvertForDisplayAsync(Math.Max(remainingFundingAmount, 0.01m), opportunity.FundingCurrency, displayCurrency, cancellationToken);

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
            FundingCurrency = opportunity.FundingCurrency,
            DisplayCurrency = displayCurrency,
            ApproximateDisplayFundingTarget = displayTarget.ConvertedAmount,
            ApproximateDisplayAlreadyFundedAmount = alreadyFundedAmount == 0 ? 0 : displayFunded.ConvertedAmount,
            ApproximateDisplayRemainingFundingAmount = remainingFundingAmount == 0 ? 0 : displayRemaining.ConvertedAmount,
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

        var idempotencyKey = Normalize(request.IdempotencyKey);
        if (idempotencyKey != null)
        {
            var replay = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId && r.InvestorId == investorId && r.IdempotencyKey == idempotencyKey))
                .SingleOrDefault();
            if (replay != null)
                return await GetJoinRequestDtoAsync(replay.Id, includeRejectionReason: true);
        }

        if (!IsEligibleForJoin(opportunity))
            throw new BusinessValidationException("OPPORTUNITY_NOT_ELIGIBLE", "Opportunity is not currently eligible for join requests.");

        var hasActiveRequest = await _uow.Repository<OpportunityJoinRequest>().ExistsAsync(r =>
            r.OpportunityId == opportunityId
            && r.InvestorId == investorId
            && r.Status == OpportunityJoinRequestStatus.Pending);

        if (hasActiveRequest)
        {
            var existingRequest = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                    r.OpportunityId == opportunityId
                    && r.InvestorId == investorId
                    && r.Status == OpportunityJoinRequestStatus.Pending))
                .OrderByDescending(r => r.CreatedAt)
                .First();
            return await GetJoinRequestDtoAsync(existingRequest.Id, includeRejectionReason: true);
        }

        CurrencyConversionResult? fxConversion = null;
        var enteredAmount = request.RequestedAmount;
        if ((request.RequestType ?? OpportunityJoinRequestType.GeneralParticipation) == OpportunityJoinRequestType.InvestmentParticipation
            && request.RequestedAmount.HasValue)
        {
            var investor = await _uow.Repository<AuthUser>().GetSingleAsync(u => u.Id == investorId, u => u.Profile!);
            var enteredCurrency = CurrencyConversionService.NormalizeCurrency(investor?.Profile?.PreferredCurrency ?? CurrencyMasterDefaults.DefaultCurrency);
            if (!string.IsNullOrWhiteSpace(request.EnteredCurrency)
                && !string.Equals(enteredCurrency, request.EnteredCurrency.Trim(), StringComparison.OrdinalIgnoreCase))
                throw new BusinessValidationException("ENTERED_CURRENCY_MISMATCH", "Investment amount must be entered in the investor's preferred display currency.");

            fxConversion = await _currencyConversionService.ConvertForExecutionAsync(
                request.RequestedAmount.Value,
                enteredCurrency,
                opportunity.FundingCurrency,
                cancellationToken);
            request.RequestedAmount = fxConversion.ConvertedAmount;
        }

        var requestDetails = await BuildJoinRequestDetailsAsync(opportunity, request);
        var participationSequence = requestDetails.RequestType == OpportunityJoinRequestType.InvestmentParticipation
            ? (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                r.OpportunityId == opportunityId
                && r.InvestorId == investorId
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation))
                .Select(r => r.ParticipationSequence).DefaultIfEmpty(0).Max() + 1
            : 0;
        var now = DateTime.UtcNow;
        var joinRequest = new OpportunityJoinRequest
        {
            OpportunityId = opportunityId,
            InvestorId = investorId,
            ParticipationSequence = participationSequence,
            IdempotencyKey = idempotencyKey ?? Guid.NewGuid().ToString("N"),
            RequestType = requestDetails.RequestType,
            RequestedAmount = requestDetails.RequestedAmount,
            EnteredAmount = fxConversion == null ? requestDetails.RequestedAmount : enteredAmount,
            EnteredCurrency = fxConversion?.SourceCurrency ?? opportunity.FundingCurrency,
            FundingAmount = requestDetails.RequestedAmount,
            FundingCurrency = opportunity.FundingCurrency,
            ExchangeRateSnapshotId = fxConversion?.Snapshot.Id,
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

        try
        {
            await _uow.ExecuteWithStrategyAsync(async () =>
            {
                await _uow.BeginTransactionAsync();
                try
                {
                    await _paidActionService.ChargeAsync(
                        investorId,
                        PricingAction.SubmitParticipationRequest,
                        ReferenceType.OpportunityJoinRequest,
                        $"{opportunityId}:{investorId}:{joinRequest.IdempotencyKey}",
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
        }
        catch (DbUpdateException)
        {
            var concurrentRequest = (await _uow.Repository<OpportunityJoinRequest>().FindAsync(r =>
                    r.OpportunityId == opportunityId
                    && r.InvestorId == investorId
                    && (r.IdempotencyKey == joinRequest.IdempotencyKey || r.Status == OpportunityJoinRequestStatus.Pending)))
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefault();
            if (concurrentRequest != null)
                return await GetJoinRequestDtoAsync(concurrentRequest.Id, includeRejectionReason: true);
            throw new BusinessValidationException("CONCURRENCY_CONFLICT", "The join request conflicted with another write. Reload and retry.");
        }

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

        if (joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation
            && EffectiveFundingStatus(opportunity) == OpportunityFundingStatus.Open)
        {
            var committed = (await GetParticipationSummaryAsync(opportunity.Id)).FundedAmount
                + (joinRequest.FundingAmount ?? joinRequest.RequestedAmount ?? 0m);
            if (committed >= opportunity.FundingTarget)
            {
                opportunity.FundingStatus = OpportunityFundingStatus.Closed;
                opportunity.Status = OpportunityStatus.FullyFunded;
                opportunity.ClosedAt = now;
                opportunity.ClosureReason = OpportunityClosureReason.TargetReached;
                opportunity.Events.Add(new OpportunityEvent {
                    EventType="FundingAutomaticallyClosed", Title="Funding target reached",
                    Description="Opportunity funding closed automatically after the approved Participation reached its target.",
                    CreatedByUserId=founderId, CreatedAt=now, IsPublic=true
                });
            }
        }

        opportunity.UpdatedAt = now;

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                // Re-read committed participation totals inside the transaction. The
                // Opportunity row-version below ensures only one competing approval
                // can commit after evaluating this availability.
                if (opportunity.InvestmentModel == InvestmentModel.Equity && joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
                    await ValidateEquityAvailabilityForApprovalAsync(opportunity, joinRequest);
                if (opportunity.InvestmentModel == InvestmentModel.LoanInvestment && joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
                    await ValidateLoanFundingAvailabilityForApprovalAsync(opportunity, joinRequest);
                if (opportunity.InvestmentModel == InvestmentModel.CapitalContributionProfitSharing && joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
                    await ValidateProfitSharingFundingAvailabilityForApprovalAsync(opportunity, joinRequest);

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
            catch (DbUpdateConcurrencyException)
            {
                await _uow.RollbackTransactionAsync();
                throw new BusinessValidationException("CONCURRENCY_CONFLICT", "The participation was changed by another approval. Reload and retry.");
            }
            catch (DbUpdateException)
            {
                await _uow.RollbackTransactionAsync();
                throw new BusinessValidationException("CONCURRENCY_CONFLICT", "The approval conflicted with another financial write. Reload and retry.");
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        if (joinRequest.RequestType == OpportunityJoinRequestType.InvestmentParticipation)
        {
            var snapshot = joinRequest.ExchangeRateSnapshotId.HasValue
                ? await _uow.Repository<ExchangeRateSnapshot>().GetByIdAsync(joinRequest.ExchangeRateSnapshotId.Value)
                : null;
            var fxSummary = snapshot == null
                ? string.Empty
                : $" Entered Amount: {joinRequest.EnteredAmount} {joinRequest.EnteredCurrency}; Official Funding Amount: {joinRequest.FundingAmount} {joinRequest.FundingCurrency}; Exchange Rate: {snapshot.ExchangeRate}; Execution Timestamp: {snapshot.RateTimestamp:O}.";
            await _userNotificationService.CreateEventAsync(new NotificationEventCreation(
                joinRequest.InvestorId,
                "ParticipationRequestApproved",
                joinRequest.Id.ToString(),
                "Participation request approved",
                $"Your participation request for {opportunity.Title} was approved.{fxSummary}",
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
        await AttachProjectContextAsync(new[] { opportunity });
        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId);
        return ToAdminDetailDto(opportunity, founder, await GetActiveTagLookupAsync());
    }

    public async Task<AdminOpportunityDetailDto> ApproveAsync(Guid reviewerId, int id, CancellationToken cancellationToken = default)
    {
        ValidateFounder(reviewerId);
        var opportunity = await GetOpportunityAsync(id, includeChildren: true);
        await AttachProjectContextAsync(new[] { opportunity });

        if (opportunity.Status != OpportunityStatus.UnderReview)
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", "Only UnderReview opportunities can be approved.");

        ChangeStatusWithEvent(opportunity, OpportunityStatus.Approved, "Approved", "Opportunity approved", "Admin approved opportunity for the next workflow step.", reviewerId, isPublic: false);
        opportunity.ModerationStatus = OpportunityModerationStatus.Approved;

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
        await AttachProjectContextAsync(new[] { opportunity });

        if (opportunity.Status != OpportunityStatus.UnderReview)
            throw new BusinessValidationException("INVALID_STATUS_TRANSITION", "Only UnderReview opportunities can be rejected.");

        ChangeStatusWithEvent(opportunity, OpportunityStatus.Rejected, "Rejected", "Opportunity rejected", request.Reason.Trim(), reviewerId, isPublic: false);
        opportunity.ModerationStatus = OpportunityModerationStatus.Rejected;

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

    private static void ValidateCoreFields(string title, decimal fundingTarget)
    {
        ValidateRequired(title, "TITLE_REQUIRED", "Title is required.");

        if (fundingTarget <= 0)
            throw new BusinessValidationException("INVALID_FUNDING_TARGET", "FundingTarget must be greater than zero.");

    }

    private static ProjectStageAssignment ValidateProjectStage(ProjectStage? stage, string? customName)
    {
        if (!stage.HasValue || !Enum.IsDefined(stage.Value))
            throw new BusinessValidationException("INVALID_PROJECT_STAGE", "ProjectStage is required.");

        if (stage.Value != ProjectStage.Other)
            return new ProjectStageAssignment(stage.Value, null, null);

        var trimmedName = Normalize(customName);
        if (trimmedName == null)
            throw new BusinessValidationException("CUSTOM_PROJECT_STAGE_REQUIRED", "A custom ProjectStage name is required when ProjectStage is Other.");

        return new ProjectStageAssignment(stage.Value, trimmedName, trimmedName.ToUpperInvariant());
    }

    private async Task EnsureProjectStageAvailableAsync(
        int projectId,
        ProjectStageAssignment stage,
        int? excludedOpportunityId = null,
        CancellationToken cancellationToken = default)
    {
        var duplicate = stage.Stage == ProjectStage.Other
            ? await _uow.Repository<Opportunity>().ExistsAsync(o =>
                o.ProjectId == projectId
                && (!excludedOpportunityId.HasValue || o.Id != excludedOpportunityId.Value)
                && o.ProjectStage == ProjectStage.Other
                && o.ProjectStageCustomNameNormalized == stage.NormalizedCustomName)
            : await _uow.Repository<Opportunity>().ExistsAsync(o =>
                o.ProjectId == projectId
                && (!excludedOpportunityId.HasValue || o.Id != excludedOpportunityId.Value)
                && o.ProjectStage == stage.Stage);

        if (duplicate)
            throw ProjectStageConflict();
    }

    private static BusinessValidationException ProjectStageConflict() =>
        new("PROJECT_STAGE_ALREADY_USED", "This Project stage is already assigned to another Opportunity in the same Project.");

    private static bool IsProjectStageUniqueConstraint(DbUpdateException exception)
    {
        var message = exception.ToString();
        return message.Contains("UX_Opportunities_Project_StandardStage", StringComparison.Ordinal)
            || message.Contains("UX_Opportunities_Project_OtherStage", StringComparison.Ordinal);
    }

    private static string GetProjectStageLabel(ProjectStageAssignment stage) =>
        stage.Stage == ProjectStage.Other ? $"Other: {stage.CustomName}" : stage.Stage.ToString();

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

        ValidateProjectStage(opportunity.ProjectStage, opportunity.ProjectStageCustomName);

        if (opportunity.Project?.CategoryId is null)
            throw new BusinessValidationException("CATEGORY_REQUIRED", "Project category is required before review.");

        if (!opportunity.FundingGoalId.HasValue)
            throw new BusinessValidationException("FUNDING_GOAL_REQUIRED", "FundingGoalId is required before review.");

        ValidateTextRange(opportunity.ShortDescription, "SHORT_DESCRIPTION_REQUIRED", "ShortDescription", 20, 300);
        ValidateTextRange(opportunity.UseOfFunds, "USE_OF_FUNDS_REQUIRED", "UseOfFunds", 30, 2000);
        ValidateFundingCurrency(opportunity.FundingCurrency);
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

    private async Task<IReadOnlyList<OpportunityTag>> ValidateClassificationAsync(int? fundingGoalId, IReadOnlyList<int>? tagIds)
    {
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

    private static void ValidateTextRange(string? value, string errorCode, string fieldName, int minLength, int maxLength)
    {
        var normalized = Normalize(value);
        if (normalized == null)
            throw new BusinessValidationException(errorCode, $"{fieldName} is required.");

        if (normalized.Length < minLength || normalized.Length > maxLength)
            throw new BusinessValidationException($"INVALID_{fieldName.ToUpperInvariant()}", $"{fieldName} must be between {minLength} and {maxLength} characters.");
    }

    private static List<Opportunity> ApplyDiscoveryFilters(List<Opportunity> opportunities, OpportunityDiscoveryQuery query)
    {
        if (query.InvestmentModel.HasValue)
            opportunities = opportunities.Where(o => o.InvestmentModel == query.InvestmentModel.Value).ToList();

        if (query.CategoryId.HasValue)
            opportunities = opportunities.Where(o => o.Project?.CategoryId == query.CategoryId.Value).ToList();

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
                    || (o.Project?.Category?.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
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

    private async Task<AuthUser> ValidateOpportunityCreationFounderAsync(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new BusinessValidationException("FOUNDER_ACCESS_REQUIRED", "An active Founder account is required to create an opportunity.");

        var user = await _uow.Repository<AuthUser>().GetSingleAsync(u => u.Id == userId, u => u.Profile!);
        var isSuspended = user?.SuspendedUntil.HasValue == true && user.SuspendedUntil.Value > DateTime.UtcNow;
        var hasFounderCapability = user?.UserType == UserType.Client
            && user.ClientType is ClientType.Founder or ClientType.Both;

        if (user == null || !user.Status || isSuspended || !hasFounderCapability)
            throw new BusinessValidationException("FOUNDER_ACCESS_REQUIRED", "An active Founder account is required to create an opportunity.");

        return user;
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

        return approvedRequests.Sum(r => r.FundingAmount ?? r.RequestedAmount ?? 0m);
    }

    public async Task<IReadOnlyList<ApprovedInvestorDto>> GetApprovedInvestorsAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default, bool isAdmin = false)
    {
        var opportunity = await GetOpportunityAsync(opportunityId, includeChildren: false);
        var isFounder = opportunity.FounderId == userId;
        var isApprovedParticipant = await _uow.Repository<OpportunityJoinRequest>().ExistsAsync(request =>
            request.OpportunityId == opportunityId
            && request.InvestorId == userId
            && request.Status == OpportunityJoinRequestStatus.Approved
            && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation);
        if (!isAdmin && !isFounder && !isApprovedParticipant)
            throw new BusinessValidationException("OPPORTUNITY_ROOM_FORBIDDEN", "Approved investors are only available inside an authorized Opportunity Room.");

        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            request => request.OpportunityId == opportunityId
                && request.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && request.Status == OpportunityJoinRequestStatus.Approved
                && (isAdmin || isFounder || request.InvestorId == userId),
            request => request.Investor!,
            request => request.Investor!.Profile!);

        return approved
            .GroupBy(request => request.InvestorId)
            .Select(group => new
            {
                First = group.OrderBy(request => request.ReviewedAt ?? request.UpdatedAt).First(),
                TotalContribution = group.Sum(r => r.FundingAmount ?? r.RequestedAmount ?? 0m),
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
                    ApprovedContribution = request.FundingAmount ?? request.RequestedAmount ?? 0m,
                    Currency = SnapshotString(TermsSnapshotParser.Parse(request.TermsSnapshotJson).Normalized, "currencySnapshot")
                        ?? opportunity.Currency,
                    ApprovedAt = request.ReviewedAt ?? request.UpdatedAt
                }).ToList()
            })
            .ToList();
    }

    public async Task<IReadOnlyList<InvestorPaymentSummaryDto>> GetOpportunityPaymentsAsync(Guid founderId, int id, CancellationToken cancellationToken = default, bool isAdmin = false)
    {
        var opportunity = isAdmin
            ? await GetOpportunityAsync(id, includeChildren: false)
            : await GetOwnedOpportunityAsync(founderId, id, includeChildren: false);

        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.OpportunityId == id
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Approved
                && (isAdmin || opportunity.FounderId == founderId || r.InvestorId == founderId),
            r => r.Investor!,
            r => r.Investor!.Profile!);

        var groupByInvestor = approved
            .GroupBy(r => r.InvestorId)
            .ToList();

        var acceptedOfferIds = approved.Where(r => r.AcceptedOfferId.HasValue).Select(r => r.AcceptedOfferId!.Value).ToHashSet();
        var acceptedOffers = acceptedOfferIds.Count == 0
            ? []
            : await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => acceptedOfferIds.Contains(o.Id), o => o.Legs);
        var acceptedOffersById = acceptedOffers.ToDictionary(o => o.Id);

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
            var schedules = group.Select(r =>
            {
                acceptedOffersById.TryGetValue(r.AcceptedOfferId ?? 0, out var acceptedOffer);
                var schedule = BuildLegAggregateSchedule(r, opportunity, BuildParticipationLegs(r, opportunity, acceptedOffer));
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
            var legTypes = group.SelectMany(r =>
            {
                acceptedOffersById.TryGetValue(r.AcceptedOfferId ?? 0, out var acceptedOffer);
                return BuildParticipationLegs(r, opportunity, acceptedOffer).Select(leg => leg.LegType);
            }).Distinct().ToList();

            return new InvestorPaymentSummaryDto
            {
                InvestorId = group.Key,
                DisplayName = first.Investor?.Profile?.FullName?.Trim() ?? first.Investor?.Name?.Trim() ?? string.Empty,
                AvatarUrl = first.Investor?.Profile?.AvatarUrl,
                TotalApprovedContribution = group.Sum(r => r.FundingAmount ?? r.RequestedAmount ?? 0m),
                TotalPaid = totalPaid,
                TotalOutstanding = totalOutstanding,
                OverdueAmount = totalOverdue,
                NextDueDate = next?.DueDate,
                UnpaidInstallmentCount = unpaidCount,
                Status = overallStatus,
                Currency = schedules.FirstOrDefault()?.Currency ?? opportunity.FundingCurrency,
                InvestmentModelLabel = string.Join(" / ", legTypes),
                LegTypes = legTypes
            };
        }).ToList();
    }

    public async Task<InvestorPaymentDetailDto> GetInvestorPaymentDetailsAsync(Guid founderId, int id, Guid investorId, CancellationToken cancellationToken = default, bool isAdmin = false)
    {
        var opportunity = isAdmin
            ? await GetOpportunityAsync(id, includeChildren: false)
            : await GetOwnedOpportunityAsync(founderId, id, includeChildren: false);

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

        if (!isAdmin && opportunity.FounderId != founderId && investorId != founderId)
            throw new BusinessValidationException("OPPORTUNITY_ROOM_FORBIDDEN", "Payment details are limited to the authorized Opportunity Room participant.");

        var first = approved.First();
        var acceptedOfferIds = approved.Where(r => r.AcceptedOfferId.HasValue).Select(r => r.AcceptedOfferId!.Value).ToHashSet();
        var acceptedOffers = acceptedOfferIds.Count == 0
            ? []
            : await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => acceptedOfferIds.Contains(o.Id), o => o.Legs);
        var acceptedOffersById = acceptedOffers.ToDictionary(o => o.Id);
        var legTypes = acceptedOffers.SelectMany(o => o.Legs).Select(l => l.LegType.ToString()).Distinct().ToList();
        var investmentModel = string.Join(" / ", legTypes);
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
            acceptedOffersById.TryGetValue(r.AcceptedOfferId ?? 0, out var acceptedOffer);
            var schedule = BuildLegAggregateSchedule(r, opportunity, BuildParticipationLegs(r, opportunity, acceptedOffer));
            var payments = txnByParticipation.TryGetValue(r.Id, out var pts) ? pts : [];
            var allocs = allocsByParticipation.TryGetValue(r.Id, out var al) ? al : new List<PaymentAllocation>().ToLookup(a => a.InstallmentNumber);
            EnrichScheduleWithPayments(schedule.Payments, allocs, payments);
            return schedule;
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
            Currency = opportunity.FundingCurrency,
            FundingCurrency = opportunity.FundingCurrency,
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
            .Sum(request => request.FundingAmount ?? request.RequestedAmount ?? 0m);
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
            var fundedAmount = financialRequests.Sum(r => r.FundingAmount ?? r.RequestedAmount ?? 0m);
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

    private static void ValidateFundingCurrency(string? currency)
    {
        var value = currency?.Trim();
        if (value == null || value.Length != 3 || !value.All(char.IsLetter))
            throw new BusinessValidationException("INVALID_CURRENCY", "Funding currency must be a three-letter currency code.");
    }

    private async Task<IReadOnlyList<OpportunityRoomParticipationDto>> BuildRoomParticipationsAsync(
        Opportunity opportunity,
        Guid actorId,
        bool isFounder,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var approved = await _uow.Repository<OpportunityJoinRequest>().FindWithIncludesAsync(
            r => r.OpportunityId == opportunity.Id
                && r.RequestType == OpportunityJoinRequestType.InvestmentParticipation
                && r.Status == OpportunityJoinRequestStatus.Approved
                && (isFounder || isAdmin || r.InvestorId == actorId),
            r => r.Investor!,
            r => r.Investor!.Profile!);

        var offerIds = approved.Where(r => r.AcceptedOfferId.HasValue).Select(r => r.AcceptedOfferId!.Value).ToHashSet();
        var offers = offerIds.Count == 0
            ? []
            : await _uow.Repository<NegotiationOffer>().FindWithIncludesAsync(o => offerIds.Contains(o.Id), o => o.Legs);
        var offersById = offers.ToDictionary(o => o.Id);

        var requestIds = approved.Select(r => r.Id).ToHashSet();
        var contracts = requestIds.Count == 0
            ? []
            : await _uow.Repository<InvestmentContract>().FindWithIncludesAsync(
                c => c.OpportunityId == opportunity.Id && (isFounder || isAdmin || c.InvestorUserId == actorId),
                c => c.Versions);
        var contractByParticipation = contracts
            .SelectMany(c => c.Versions.Select(v => new { Contract = c, Version = v }))
            .Where(x => requestIds.Contains(x.Version.SourceParticipationRequestId))
            .GroupBy(x => x.Version.SourceParticipationRequestId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(x => x.Version.VersionNumber).First());

        return approved
            .OrderBy(r => r.ParticipationSequence)
            .Select(request =>
            {
                offersById.TryGetValue(request.AcceptedOfferId ?? 0, out var acceptedOffer);
                contractByParticipation.TryGetValue(request.Id, out var contractItem);
                var termsJson = request.TermsSnapshotJson ?? string.Empty;
                return new OpportunityRoomParticipationDto
                {
                    ParticipationId = request.Id,
                    SequenceNumber = request.ParticipationSequence,
                    InvestorId = request.InvestorId,
                    InvestorDisplayName = request.Investor?.Profile?.FullName?.Trim() ?? request.Investor?.Name?.Trim() ?? string.Empty,
                    Status = request.Status,
                    ApprovedAmount = request.FundingAmount ?? request.RequestedAmount ?? 0m,
                    FundingCurrency = request.FundingCurrency ?? opportunity.FundingCurrency,
                    AcceptedAt = request.ReviewedAt ?? request.UpdatedAt,
                    AcceptedOfferId = request.AcceptedOfferId,
                    TermsImmutable = request.AcceptedOfferId.HasValue && !string.IsNullOrWhiteSpace(request.TermsSnapshotJson),
                    TermsSnapshotHash = string.IsNullOrWhiteSpace(termsJson) ? string.Empty : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(termsJson))).ToLowerInvariant(),
                    Legs = BuildParticipationLegs(request, opportunity, acceptedOffer),
                    Contract = contractItem == null ? null : new OpportunityRoomContractDto
                    {
                        ContractId = contractItem.Contract.Id,
                        ContractNumber = contractItem.Contract.ContractNumber,
                        CurrentVersionNumber = contractItem.Contract.CurrentVersionNumber,
                        Status = contractItem.Contract.Status,
                        DocumentHash = contractItem.Version.DocumentHash,
                        ActivatedAt = contractItem.Version.ActivatedAt
                    }
                };
            })
            .ToList();
    }

    private static IReadOnlyList<ParticipationLegDto> BuildParticipationLegs(
        OpportunityJoinRequest request,
        Opportunity opportunity,
        NegotiationOffer? acceptedOffer)
    {
        if (acceptedOffer?.OpportunityId is int offerOpportunityId && offerOpportunityId != opportunity.Id)
            acceptedOffer = null;

        var sources = ParseAcceptedOfferLegs(request.TermsSnapshotJson);
        var currency = acceptedOffer?.Currency ?? request.FundingCurrency;
        var startDate = request.ReviewedAt ?? request.CreatedAt;

        return sources.Select((leg, index) =>
        {
            var type = leg.LegType.ToString();
            var cashFlows = BuildLegCashFlows(request.Id, opportunity, leg, currency, startDate);
            return new ParticipationLegDto
            {
                LegNumber = index + 1,
                LegType = type,
                Amount = leg.Amount,
                Currency = currency,
                EquityPercentage = leg.EquityPercentage,
                SharesTerms = leg.SharesTerms,
                ReturnRate = leg.ReturnRate,
                TermMonths = leg.TermMonths,
                RepaymentModel = leg.RepaymentModel,
                ProfitSharePercentage = leg.ProfitSharePercentage,
                ExitTerms = leg.ExitTerms,
                Status = request.Status.ToString(),
                CashFlows = cashFlows,
                Obligations = BuildLegObligations(leg)
            };
        }).ToList();
    }

    private static List<ParticipationLegSource> ParseAcceptedOfferLegs(string? termsJson)
    {
        var parsed = TermsSnapshotParser.Parse(termsJson);
        if (parsed.Kind != TermsSnapshotKind.ArrayAcceptedOffer || string.IsNullOrWhiteSpace(termsJson))
            return [];
        try
        {
            using var document = JsonDocument.Parse(termsJson);
            return document.RootElement.EnumerateArray().Select(leg => new ParticipationLegSource(
                ReadLegType(leg),
                ReadDecimal(leg, "Amount"),
                ReadDecimal(leg, "EquityPercentage"),
                ReadString(leg, "SharesTerms"),
                ReadDecimal(leg, "ReturnRate"),
                ReadInt(leg, "TermMonths"),
                ReadString(leg, "RepaymentModel"),
                ReadDecimal(leg, "ProfitSharePercentage"),
                ReadString(leg, "ExitTerms"))).ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static List<ExpectedPaymentScheduleItemDto> BuildLegCashFlows(int requestId, Opportunity opportunity, ParticipationLegSource leg, string? currency, DateTime startDate)
    {
        if (leg.LegType == NegotiationOfferLegType.Loan
            && leg.Amount > 0
            && leg.ReturnRate is > 0
            && leg.TermMonths is > 0
            && !string.IsNullOrWhiteSpace(leg.RepaymentModel))
        {
            var finalDate = startDate.AddMonths(leg.TermMonths.Value);
            return LoanCashFlowCalculator.Calculate(requestId, opportunity.Id, opportunity.Title, currency, leg.Amount, leg.ReturnRate.Value, leg.TermMonths.Value, leg.RepaymentModel, startDate, finalDate).Payments;
        }
        return [];
    }

    private static List<ParticipationObligationDto> BuildLegObligations(ParticipationLegSource leg) => leg.LegType switch
    {
        NegotiationOfferLegType.Equity => [new() { Party = "Investor", Description = $"Hold the agreed equity interest{(string.IsNullOrWhiteSpace(leg.SharesTerms) ? string.Empty : $": {leg.SharesTerms}")}." }],
        NegotiationOfferLegType.Loan => [new() { Party = "Investor", Description = $"Repay principal and agreed return at the selected {leg.RepaymentModel ?? "repayment"} cadence." }, new() { Party = "Founder", Description = "Provide repayments according to the accepted loan terms." }],
        NegotiationOfferLegType.ProfitSharing => [new() { Party = "Founder", Description = $"Report and share profits at the accepted {leg.ProfitSharePercentage:0.##}% rate." }, new() { Party = "Investor", Description = $"Receive the accepted profit-sharing return{(string.IsNullOrWhiteSpace(leg.ExitTerms) ? string.Empty : $": {leg.ExitTerms}")}." }],
        _ => []
    };

    private static NegotiationOfferLegType ReadLegType(JsonElement leg)
    {
        if (TryGetProperty(leg, "LegType", out var value))
        {
            if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var numeric) && Enum.IsDefined(typeof(NegotiationOfferLegType), numeric))
                return (NegotiationOfferLegType)numeric;
            if (Enum.TryParse<NegotiationOfferLegType>(value.ToString(), true, out var parsed)) return parsed;
        }
        return NegotiationOfferLegType.Equity;
    }

    private static decimal ReadDecimal(JsonElement value, params string[] names) => SnapshotDecimal(value, names) ?? 0m;
    private static int? ReadInt(JsonElement value, params string[] names) => SnapshotInt(value, names);
    private static string? ReadString(JsonElement value, params string[] names) => SnapshotString(value, names);
    private static bool TryGetProperty(JsonElement value, string name, out JsonElement result)
    {
        foreach (var property in value.EnumerateObject())
            if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase)) { result = property.Value; return true; }
        result = default;
        return false;
    }

    private sealed record ParticipationLegSource(
        NegotiationOfferLegType LegType,
        decimal Amount,
        decimal? EquityPercentage,
        string? SharesTerms,
        decimal? ReturnRate,
        int? TermMonths,
        string? RepaymentModel,
        decimal? ProfitSharePercentage,
        string? ExitTerms);

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

    private async Task ValidateCurrencySelectionAsync(string isoCode, bool requireFunding)
    {
        var currency = await _uow.Repository<Currency>().GetSingleAsync(x => x.ISOCode == isoCode);
        if (currency == null || !currency.IsActive || (requireFunding && !currency.SupportsFunding))
            throw new BusinessValidationException("UNSUPPORTED_CURRENCY", $"Currency {isoCode} is not available for opportunity funding.");
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
        var fundingStatus = EffectiveFundingStatus(opportunity);
        return fundingStatus == OpportunityFundingStatus.Open
            && (!opportunity.FundingOpensAt.HasValue || opportunity.FundingOpensAt <= DateTime.UtcNow)
            && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > DateTime.UtcNow);
    }

    private static OpportunityFundingStatus EffectiveFundingStatus(Opportunity opportunity)
    {
        var now = DateTime.UtcNow;
        if (opportunity.FundingStatus == OpportunityFundingStatus.Scheduled
            && opportunity.FundingOpensAt <= now
            && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > now))
            return OpportunityFundingStatus.Open;
        if (opportunity.FundingStatus == OpportunityFundingStatus.Open
            && opportunity.FundingClosesAt.HasValue && opportunity.FundingClosesAt <= now)
            return OpportunityFundingStatus.Closed;
        return opportunity.FundingStatus == OpportunityFundingStatus.NotScheduled
            && opportunity.Status is OpportunityStatus.Published or OpportunityStatus.Funding or OpportunityStatus.FullyFunded or OpportunityStatus.InProgress
                ? OpportunityFundingStatus.Open
                : opportunity.FundingStatus;
    }

    private static bool IsAllowedFundingTransition(OpportunityFundingStatus from, OpportunityFundingStatus to) =>
        from == to || (from, to) switch {
            (OpportunityFundingStatus.NotScheduled, OpportunityFundingStatus.Scheduled) => true,
            (OpportunityFundingStatus.NotScheduled, OpportunityFundingStatus.Open) => true,
            (OpportunityFundingStatus.Scheduled, OpportunityFundingStatus.Open) => true,
            (OpportunityFundingStatus.Open, OpportunityFundingStatus.Paused) => true,
            (OpportunityFundingStatus.Paused, OpportunityFundingStatus.Open) => true,
            (OpportunityFundingStatus.Open, OpportunityFundingStatus.Closed) => true,
            (OpportunityFundingStatus.Paused, OpportunityFundingStatus.Closed) => true,
            (OpportunityFundingStatus.Scheduled, OpportunityFundingStatus.Closed) => true,
            _ => false
        };

    private static void ApplyAutomaticLifecycle(Opportunity opportunity, Guid actorId)
    {
        var now = DateTime.UtcNow;
        if (opportunity.FundingStatus == OpportunityFundingStatus.Scheduled
            && opportunity.FundingOpensAt <= now
            && (!opportunity.FundingClosesAt.HasValue || opportunity.FundingClosesAt > now))
        {
            opportunity.FundingStatus = OpportunityFundingStatus.Open;
            opportunity.Status = OpportunityStatus.Funding;
        }
        if (EffectiveFundingStatus(opportunity) == OpportunityFundingStatus.Open
            && opportunity.FundingClosesAt.HasValue && opportunity.FundingClosesAt <= now)
        {
            opportunity.FundingStatus = OpportunityFundingStatus.Closed;
            opportunity.Status = OpportunityStatus.Completed;
            opportunity.ClosedAt = now;
            opportunity.ClosureReason = OpportunityClosureReason.DeadlineReached;
        }
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string SnapshotCore(Opportunity opportunity)
    {
        var snapshot = new
        {
            opportunity.ProjectId,
            opportunity.SequenceNumber,
            opportunity.Purpose,
            opportunity.Type,
            opportunity.Title,
            opportunity.Description,
            opportunity.ShortDescription,
            opportunity.UseOfFunds,
            opportunity.FundingTarget,
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
            opportunity.ProjectStageCustomName,
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
            ProjectId = opportunity.ProjectId,
            ProjectDisplayName = opportunity.Project?.DisplayName,
            ProjectSummary = opportunity.Project?.Summary,
            ProjectDescription = opportunity.Project?.Description,
            ProjectIndustry = opportunity.Project?.Industry,
            ProjectLogoUrl = opportunity.Project?.LogoUrl,
            SequenceNumber = opportunity.SequenceNumber,
            Purpose = opportunity.Purpose,
            Type = opportunity.Type,
            FounderId = opportunity.FounderId,
            LegacyInvestmentId = legacyInvestmentId,
            Founder = ToFounderSummary(founder, opportunity.FounderId),
            Title = opportunity.Title,
            Description = opportunity.Description,
            ShortDescription = opportunity.ShortDescription,
            UseOfFunds = opportunity.UseOfFunds,
            FundingTarget = opportunity.FundingTarget,
            FundingGoal = ToLookupDto(opportunity.FundingGoal),
            FundingPurpose = opportunity.UseOfFunds,
            MinimumInvestmentAmount = opportunity.MinimumInvestmentAmount,
            MaximumInvestmentAmount = opportunity.MaximumInvestmentAmount,
            ExpectedDurationMonths = opportunity.ExpectedDurationMonths,
            Currency = opportunity.FundingCurrency,
            FundingCurrency = opportunity.FundingCurrency,
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
            ProjectStageCustomName = opportunity.ProjectStageCustomName,
            Status = opportunity.Status,
            CoverImageUrl = opportunity.CoverImageUrl,
            IsLockedForEditing = opportunity.IsLockedForEditing,
            FirstInvestorJoinedAt = opportunity.FirstInvestorJoinedAt,
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt,
            ProjectContext = opportunity.Project == null ? null : ToProjectContextDto(opportunity.Project),
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

    private static OpportunityProjectContextDto ToProjectContextDto(Project project) => new()
    {
        Id = project.Id,
        DisplayName = project.DisplayName,
        LegalName = project.LegalName,
        Slug = project.Slug,
        Summary = project.Summary,
        Description = project.Description,
        CategoryId = project.CategoryId,
        Category = ToLookupDto(project.Category),
        Industry = project.Industry,
        BusinessStage = project.BusinessStage,
        Geography = project.Geography,
        FoundedOn = project.FoundedOn,
        WebsiteUrl = project.WebsiteUrl,
        LogoUrl = project.LogoUrl,
        TeamDescription = project.TeamDescription,
        BusinessModel = project.BusinessModel,
        RiskLevel = project.RiskLevel,
        RiskDisclosure = project.RiskDisclosure,
        Status = project.Status,
        DefaultCurrency = project.DefaultCurrency,
        CreatedAt = project.CreatedAt,
        UpdatedAt = project.UpdatedAt
    };

    private static OpportunityDto ToDto(
        Opportunity opportunity,
        AuthUser? founder = null,
        IReadOnlyDictionary<int, OpportunityTag>? tagLookup = null,
        int? legacyInvestmentId = null) => new()
    {
        Id = opportunity.Id,
        ProjectId = opportunity.ProjectId,
        ProjectDisplayName = opportunity.Project?.DisplayName,
        ProjectSummary = opportunity.Project?.Summary,
        ProjectDescription = opportunity.Project?.Description,
        ProjectIndustry = opportunity.Project?.Industry,
        ProjectLogoUrl = opportunity.Project?.LogoUrl,
        SequenceNumber = opportunity.SequenceNumber,
        Purpose = opportunity.Purpose,
        Type = opportunity.Type,
        FounderId = opportunity.FounderId,
        LegacyInvestmentId = legacyInvestmentId,
        Founder = ToFounderSummary(founder, opportunity.FounderId),
        Title = opportunity.Title,
        Description = opportunity.Description,
        ShortDescription = opportunity.ShortDescription,
        UseOfFunds = opportunity.UseOfFunds,
        FundingTarget = opportunity.FundingTarget,
        FundingGoal = ToLookupDto(opportunity.FundingGoal),
        FundingPurpose = opportunity.UseOfFunds,
        MinimumInvestmentAmount = opportunity.MinimumInvestmentAmount,
        MaximumInvestmentAmount = opportunity.MaximumInvestmentAmount,
        ExpectedDurationMonths = opportunity.ExpectedDurationMonths,
        Currency = opportunity.FundingCurrency,
        FundingCurrency = opportunity.FundingCurrency,
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
        ProjectStageCustomName = opportunity.ProjectStageCustomName,
        Status = opportunity.Status,
        ModerationStatus = opportunity.ModerationStatus,
        FundingStatus = EffectiveFundingStatus(opportunity),
        FundingOpensAt = opportunity.FundingOpensAt,
        FundingClosesAt = opportunity.FundingClosesAt,
        ClosedAt = opportunity.ClosedAt,
        ClosureReason = opportunity.ClosureReason,
        ObligationCompletionStatus = opportunity.ObligationCompletionStatus,
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

    private static OpportunityRoomDto ToRoomDto(Opportunity opportunity, string? projectDisplayName, AuthUser? founder, bool isFounder, bool isApprovedParticipant, ParticipationSummary summary, IReadOnlyList<OpportunityRoomParticipationDto> participations, bool isAdmin)
    {
        var canAccessRoom = isFounder || isApprovedParticipant || isAdmin;
        var canViewPrivateFiles = canAccessRoom;
        var milestoneEvents = opportunity.Events
            .Where(e => e.IsImmutableTimelineEntry && e.EventType is
                ProjectActivityTimeline.Types.MilestoneCreated or
                ProjectActivityTimeline.Types.MilestoneCompleted or
                ProjectActivityTimeline.Types.MilestoneDelayed or
                ProjectActivityTimeline.Types.MilestoneUpdated)
            .OrderByDescending(e => e.CreatedAt)
            .ToList();
        var milestones = milestoneEvents
            .GroupBy(e => e.RelatedEntityId ?? $"event:{e.Id}")
            .Select(group =>
            {
                var created = group
                    .Where(e => e.EventType == ProjectActivityTimeline.Types.MilestoneCreated)
                    .OrderBy(e => e.CreatedAt)
                    .FirstOrDefault() ?? group.OrderBy(e => e.CreatedAt).First();
                var completed = group
                    .Where(e => e.EventType == ProjectActivityTimeline.Types.MilestoneCompleted)
                    .OrderByDescending(e => e.CreatedAt)
                    .FirstOrDefault();
                return ToMilestoneDto(created, completed?.CreatedAt);
            })
            .OrderByDescending(m => m.CreatedAt)
            .ToList();

        return new OpportunityRoomDto
        {
            ProjectId = opportunity.ProjectId,
            ProjectDisplayName = projectDisplayName ?? string.Empty,
            Overview = new OpportunityRoomOverviewDto
            {
                Id = opportunity.Id,
                Title = opportunity.Title,
                Status = opportunity.Status,
        ProjectStage = opportunity.ProjectStage,
        ProjectStageCustomName = opportunity.ProjectStageCustomName,
                Founder = ToFounderSummary(founder, opportunity.FounderId),
                FundingTarget = opportunity.FundingTarget,
                FundingProgress = summary.FundingProgressPercentage,
                FundingProgressPercent = summary.FundingProgressPercentage,
                FundedAmount = summary.FundedAmount,
                RemainingFundingAmount = summary.RemainingFundingAmount,
                FundingProgressPercentage = summary.FundingProgressPercentage,
                ApprovedParticipantCount = summary.ApprovedParticipantCount,
                UseOfFunds = opportunity.UseOfFunds
            },
            MediaLibrary = BuildRoomMediaLibrary(opportunity.Media, canViewPrivateFiles),
            DocumentsLibrary = BuildRoomDocumentsLibrary(opportunity.Documents, canViewPrivateFiles),
            Timeline = opportunity.Events
                .Where(e => isFounder || isAdmin || ProjectActivityTimeline.IsInvestorVisible(e))
                .OrderByDescending(e => e.CreatedAt)
                .Select(ToProjectActivityTimelineDto)
                .ToList(),
            Milestones = milestones,
            LatestMilestone = milestones.FirstOrDefault(),
            Participations = participations,
            ParticipantContext = new OpportunityRoomParticipantContextDto
            {
                IsFounder = isFounder,
                IsAdmin = isAdmin,
                IsApprovedParticipant = isApprovedParticipant,
                ApprovedParticipantCount = summary.ApprovedParticipantCount,
                CanAccessProjectRoom = canAccessRoom || isAdmin,
                CanEditCoreProject = isFounder && summary.ApprovedParticipantCount == 0,
                CanAddUpdate = isFounder || isAdmin,
                CanAddDocument = isFounder || isAdmin,
                CanAddMilestone = isFounder || isAdmin,
                CanUpload = isFounder || isAdmin,
                CanPostUpdate = isFounder || isAdmin,
                CanViewPrivateFiles = canViewPrivateFiles,
                CanDownloadFiles = canAccessRoom
            }
        };
    }

    private static OpportunityMilestoneDto ToMilestoneDto(OpportunityEvent milestone, DateTime? completedAt = null)
    {
        var isCompleted = completedAt.HasValue || milestone.EventType.Contains("completed", StringComparison.OrdinalIgnoreCase);
        var isStarted = milestone.EventType.Contains("started", StringComparison.OrdinalIgnoreCase);
        var metadata = ReadMilestoneMetadata(milestone);

        return new OpportunityMilestoneDto
        {
            MilestoneId = milestone.Id,
            Title = metadata.GetValueOrDefault("milestoneTitle") ?? milestone.Title,
            Description = metadata.GetValueOrDefault("milestoneDescription") ?? milestone.Description,
            Status = isCompleted ? "Completed" : isStarted ? "InProgress" : "Created",
            CreatedAt = milestone.CreatedAt,
            CompletedAt = isCompleted ? completedAt ?? milestone.CreatedAt : null
        };
    }

    private async Task<PaymentTransactionDetailDto?> GetPaymentByIdempotencyKeyAsync(string idempotencyKey)
    {
        var transaction = (await _uow.Repository<PaymentTransaction>()
                .FindAsync(t => t.IdempotencyKey == idempotencyKey))
            .SingleOrDefault();
        if (transaction == null)
            return null;

        var allocations = await _uow.Repository<PaymentAllocation>()
            .FindAsync(a => a.PaymentTransactionId == transaction.Id);
        var creator = await _uow.Repository<AuthUser>().GetByIdAsync(transaction.CreatedByUserId);
        return ToPaymentTransactionDetailDto(transaction, allocations.ToList(), creator?.Name);
    }

    private static string NormalizePaymentIdempotencyKey(
        string? suppliedKey,
        int opportunityId,
        int participationRequestId,
        decimal amount,
        DateTime paymentDate,
        string? reference)
    {
        var normalized = Normalize(suppliedKey);
        if (normalized is { Length: > 200 })
            throw new BusinessValidationException("INVALID_IDEMPOTENCY_KEY", "Idempotency key cannot exceed 200 characters.");
        if (normalized != null)
            return normalized;

        var canonical = FormattableString.Invariant(
            $"{opportunityId}|{participationRequestId}|{amount:0.00####}|{paymentDate.ToUniversalTime():O}|{reference ?? string.Empty}");
        return $"generated:{Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical)))}";
    }

    private static Dictionary<string, string?> ReadMilestoneMetadata(OpportunityEvent milestone)
    {
        if (string.IsNullOrWhiteSpace(milestone.LocalizedMetadataJson))
            return new Dictionary<string, string?>();

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string?>>(milestone.LocalizedMetadataJson)
                ?? new Dictionary<string, string?>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, string?>();
        }
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
        ParticipationSequence = joinRequest.ParticipationSequence,
        InvestorName = ResolveUserDisplayName(joinRequest.Investor),
        FounderId = joinRequest.Opportunity?.FounderId ?? Guid.Empty,
        FounderName = ResolveUserDisplayName(founder),
        RequestType = joinRequest.RequestType,
        RequestedAmount = joinRequest.RequestedAmount,
        CalculatedTotalAmount = joinRequest.CalculatedTotalAmount,
        EnteredAmount = joinRequest.EnteredAmount,
        EnteredCurrency = joinRequest.EnteredCurrency,
        FundingAmount = joinRequest.FundingAmount,
        FundingCurrency = joinRequest.FundingCurrency,
        ExchangeRateSnapshotId = joinRequest.ExchangeRateSnapshotId,
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

    private sealed record ProjectStageAssignment(
        ProjectStage Stage,
        string? CustomName,
        string? NormalizedCustomName);

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
