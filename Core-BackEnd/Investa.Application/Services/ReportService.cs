using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _uow;
    private readonly IReputationService _reputationService;

    public ReportService(IUnitOfWork uow, IReputationService reputationService)
    {
        _uow = uow;
        _reputationService = reputationService;
    }

    public async Task<ReportDto> CreateAsync(Guid reporterUserId, CreateReportRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureUserExistsAsync(reporterUserId, "REPORTER_NOT_FOUND", "Reporter user was not found.");
        var targetId = NormalizeTargetId(request.TargetId);
        await ValidateTargetAsync(reporterUserId, request.TargetType, targetId);

        var existingPending = (await _uow.Repository<Report>().FindAsync(r =>
                r.ReporterUserId == reporterUserId
                && r.TargetType == request.TargetType
                && r.TargetId == targetId
                && r.Status == ReportStatus.Pending))
            .FirstOrDefault();

        if (existingPending != null)
            throw new BusinessValidationException("DUPLICATE_PENDING_REPORT", "You already have a pending report for this target.");

        var report = new Report
        {
            ReporterUserId = reporterUserId,
            TargetType = request.TargetType,
            TargetId = targetId,
            ReasonCode = request.ReasonCode,
            Description = NormalizeOptional(request.Description),
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _uow.Repository<Report>().AddAsync(report);
        await _uow.SaveChangesAsync();

        return ToDto(report);
    }

    public async Task<IReadOnlyList<ReportDto>> GetMineAsync(Guid reporterUserId, CancellationToken cancellationToken = default)
    {
        var reports = await _uow.Repository<Report>().FindAsync(r => r.ReporterUserId == reporterUserId);
        return reports
            .OrderByDescending(r => r.CreatedAt)
            .Select(ToDto)
            .ToList();
    }

    public async Task<IReadOnlyList<ReportDto>> GetAdminReportsAsync(AdminReportQuery query, CancellationToken cancellationToken = default)
    {
        var reports = (await _uow.Repository<Report>().GetAllAsync()).ToList();

        if (query.Status.HasValue)
            reports = reports.Where(r => r.Status == query.Status.Value).ToList();

        if (query.TargetType.HasValue)
            reports = reports.Where(r => r.TargetType == query.TargetType.Value).ToList();

        return reports
            .OrderByDescending(r => r.CreatedAt)
            .Select(ToDto)
            .ToList();
    }

    public Task<ReportDto> ConfirmAsync(int id, Guid reviewerUserId, ResolveReportRequest request, CancellationToken cancellationToken = default) =>
        ResolveAsync(id, reviewerUserId, ReportStatus.Confirmed, request, cancellationToken);

    public Task<ReportDto> RejectAsync(int id, Guid reviewerUserId, ResolveReportRequest request, CancellationToken cancellationToken = default) =>
        ResolveAsync(id, reviewerUserId, ReportStatus.Rejected, request, cancellationToken);

    public Task<ReportDto> DismissAsync(int id, Guid reviewerUserId, ResolveReportRequest request, CancellationToken cancellationToken = default) =>
        ResolveAsync(id, reviewerUserId, ReportStatus.Dismissed, request, cancellationToken);

    private async Task<ReportDto> ResolveAsync(int id, Guid reviewerUserId, ReportStatus status, ResolveReportRequest request, CancellationToken cancellationToken)
    {
        await EnsureUserExistsAsync(reviewerUserId, "REVIEWER_NOT_FOUND", "Reviewer user was not found.");

        var report = await _uow.Repository<Report>().GetByIdAsync(id)
            ?? throw new BusinessValidationException("REPORT_NOT_FOUND", "Report was not found.");

        if (report.Status != ReportStatus.Pending)
            throw new BusinessValidationException("REPORT_ALREADY_REVIEWED", "Only pending reports can be reviewed.");

        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                report.Status = status;
                report.ReviewedByUserId = reviewerUserId;
                report.ReviewedAt = DateTime.UtcNow;
                report.ResolutionNote = NormalizeOptional(request.ResolutionNote);

                await _uow.Repository<Report>().UpdateAsync(report);
                await _uow.SaveChangesAsync();

                if (status == ReportStatus.Confirmed)
                    await ApplyConfirmedReportReputationAsync(report, reviewerUserId);

                await _uow.CommitTransactionAsync();
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        }, cancellationToken);

        return ToDto(report);
    }

    private async Task ApplyConfirmedReportReputationAsync(Report report, Guid reviewerUserId)
    {
        var targetUserId = await ResolveReputationTargetUserIdAsync(report);
        if (targetUserId == null)
            return;

        var referenceType = "Report";
        var referenceId = report.Id.ToString();

        if (report.TargetType == ReportTargetType.User)
        {
            await _reputationService.ApplyActivityAsync(targetUserId.Value, "ConfirmedUserReport", referenceType, referenceId, reviewerUserId);
        }
        else if (report.TargetType == ReportTargetType.Opportunity)
        {
            await _reputationService.ApplyActivityAsync(targetUserId.Value, "ConfirmedOpportunityReport", referenceType, referenceId, reviewerUserId);
        }

        if (report.ReasonCode == ReportReasonCode.Spam)
            await _reputationService.ApplyActivityAsync(targetUserId.Value, "SpamBehaviorConfirmed", referenceType, referenceId, reviewerUserId);
    }

    private async Task<Guid?> ResolveReputationTargetUserIdAsync(Report report)
    {
        return report.TargetType switch
        {
            ReportTargetType.User => Guid.TryParse(report.TargetId, out var userId) ? userId : null,
            ReportTargetType.Opportunity => int.TryParse(report.TargetId, out var opportunityId)
                ? (await _uow.Repository<Opportunity>().GetByIdAsync(opportunityId))?.FounderId
                : null,
            ReportTargetType.Participant => int.TryParse(report.TargetId, out var participantId)
                ? (await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participantId))?.InvestorId
                : null,
            _ => null
        };
    }

    private async Task ValidateTargetAsync(Guid reporterUserId, ReportTargetType targetType, string targetId)
    {
        switch (targetType)
        {
            case ReportTargetType.User:
                if (!Guid.TryParse(targetId, out var targetUserId))
                    throw new BusinessValidationException("INVALID_TARGET_ID", "TargetId must be a valid user id.");
                if (targetUserId == reporterUserId)
                    throw new BusinessValidationException("CANNOT_REPORT_SELF", "You cannot report yourself.");
                await EnsureUserExistsAsync(targetUserId, "TARGET_NOT_FOUND", "Target user was not found.");
                break;

            case ReportTargetType.Opportunity:
                if (!int.TryParse(targetId, out var opportunityId))
                    throw new BusinessValidationException("INVALID_TARGET_ID", "TargetId must be a valid opportunity id.");
                if (await _uow.Repository<Opportunity>().GetByIdAsync(opportunityId) == null)
                    throw new BusinessValidationException("TARGET_NOT_FOUND", "Target opportunity was not found.");
                break;

            case ReportTargetType.Conversation:
                if (!Guid.TryParse(targetId, out var conversationId))
                    throw new BusinessValidationException("INVALID_TARGET_ID", "TargetId must be a valid conversation id.");
                if (await _uow.Repository<Conversation>().GetByIdAsync(conversationId) == null)
                    throw new BusinessValidationException("TARGET_NOT_FOUND", "Target conversation was not found.");
                break;

            case ReportTargetType.Participant:
                if (!int.TryParse(targetId, out var participantId))
                    throw new BusinessValidationException("INVALID_TARGET_ID", "TargetId must be a valid participant request id.");
                if (await _uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participantId) == null)
                    throw new BusinessValidationException("TARGET_NOT_FOUND", "Target participant was not found.");
                break;

            default:
                throw new BusinessValidationException("INVALID_TARGET_TYPE", "Unknown report target type.");
        }
    }

    private async Task EnsureUserExistsAsync(Guid userId, string code, string message)
    {
        if (await _uow.Repository<AuthUser>().GetByIdAsync(userId) == null)
            throw new BusinessValidationException(code, message);
    }

    private static string NormalizeTargetId(string targetId) => targetId.Trim();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ReportDto ToDto(Report report) => new()
    {
        Id = report.Id,
        ReporterUserId = report.ReporterUserId,
        TargetType = report.TargetType,
        TargetId = report.TargetId,
        ReasonCode = report.ReasonCode,
        Description = report.Description,
        Status = report.Status,
        ReviewedByUserId = report.ReviewedByUserId,
        ReviewedAt = report.ReviewedAt,
        ResolutionNote = report.ResolutionNote,
        CreatedAt = report.CreatedAt
    };
}
