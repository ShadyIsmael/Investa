using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Application.Services;

public sealed class ProjectService(
    IUnitOfWork uow,
    ICurrencyConversionService currencyConversion,
    ICurrencyDisplayService currencyDisplay) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> GetMineAsync(Guid founderId)
    {
        await ValidateFounderAsync(founderId);
        var projects = (await uow.Repository<Project>().FindWithIncludesAsync(
            p => p.FounderId == founderId, p => p.Opportunities, p => p.Category!)).ToList();
        var result = new List<ProjectDto>(projects.Count);
        foreach (var project in projects.OrderByDescending(p => p.UpdatedAt))
            result.Add(await ToDtoAsync(project));
        return result;
    }

    public async Task<ProjectDto> GetAsync(Guid founderId, int id) => await ToDtoAsync(await GetOwnedAsync(founderId, id));

    public async Task<ProjectDto> CreateAsync(Guid founderId, CreateProjectRequest request)
    {
        await ValidateFounderAsync(founderId);
        Validate(request);
        await ValidateCategoryAsync(request.CategoryId);
        var now = DateTime.UtcNow;
        var project = new Project { FounderId = founderId, Slug = $"project-{Guid.NewGuid():N}", Status = ProjectStatus.Draft, CreatedAt = now, UpdatedAt = now };
        project.DefaultCurrency = await ResolveDefaultCurrencyAsync(founderId, request.DefaultCurrency);
        Apply(project, request);
        project.Category = request.CategoryId.HasValue
            ? await uow.Repository<OpportunityCategory>().GetByIdAsync(request.CategoryId.Value)
            : null;
        await uow.Repository<Project>().AddAsync(project);
        await uow.SaveChangesAsync();
        await AddAuditAsync(founderId, project, "Create", null);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(project);
    }

    public async Task<ProjectDto> UpdateAsync(Guid founderId, int id, UpdateProjectRequest request)
    {
        Validate(request);
        await ValidateCategoryAsync(request.CategoryId);
        var project = await GetOwnedAsync(founderId, id);
        if (project.Status == ProjectStatus.Archived)
            throw new BusinessValidationException("PROJECT_ARCHIVED", "Archived projects cannot be edited.");
        var before = JsonSerializer.Serialize(await ToDtoAsync(project));
        Apply(project, request);
        project.Category = request.CategoryId.HasValue
            ? await uow.Repository<OpportunityCategory>().GetByIdAsync(request.CategoryId.Value)
            : null;
        if (!string.IsNullOrWhiteSpace(request.DefaultCurrency))
            project.DefaultCurrency = await ResolveDefaultCurrencyAsync(founderId, request.DefaultCurrency);
        project.UpdatedAt = DateTime.UtcNow;
        await uow.Repository<Project>().UpdateAsync(project);
        await AddAuditAsync(founderId, project, "Update", before);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(project);
    }

    public async Task<ProjectDto> ArchiveAsync(Guid founderId, int id, ArchiveProjectRequest request)
    {
        var project = await GetOwnedAsync(founderId, id);
        if (project.Status == ProjectStatus.Archived) return await ToDtoAsync(project);
        var before = JsonSerializer.Serialize(await ToDtoAsync(project));
        project.Status = ProjectStatus.Archived;
        project.ArchiveReason = request.Reason.Trim();
        project.UpdatedAt = DateTime.UtcNow;
        await uow.Repository<Project>().UpdateAsync(project);
        await AddAuditAsync(founderId, project, "Archive", before);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(project);
    }

    public async Task<ProjectDto> TransitionStatusAsync(Guid actorId, int id, TransitionProjectStatusRequest request, bool isAdmin)
    {
        if (!Enum.IsDefined(request.TargetStatus))
            throw new BusinessValidationException("INVALID_PROJECT_STATUS", "Unknown Project status.");
        var project = isAdmin
            ? await uow.Repository<Project>().GetSingleAsync(p => p.Id == id, p => p.Opportunities, p => p.Category!)
            : await GetOwnedAsync(actorId, id);
        if (project == null) throw new BusinessValidationException("PROJECT_NOT_FOUND", "Project was not found.");
        if (!IsAllowed(project.Status, request.TargetStatus, isAdmin))
            throw new BusinessValidationException("INVALID_PROJECT_STATUS_TRANSITION", $"Project cannot transition from {project.Status} to {request.TargetStatus}.");
        if (request.TargetStatus == ProjectStatus.Archived && string.IsNullOrWhiteSpace(request.Reason))
            throw new BusinessValidationException("PROJECT_REASON_REQUIRED", "An archive reason is required.");
        var before = JsonSerializer.Serialize(await ToDtoAsync(project));
        project.Status = request.TargetStatus;
        project.ArchiveReason = request.TargetStatus == ProjectStatus.Archived ? request.Reason!.Trim() : null;
        project.UpdatedAt = DateTime.UtcNow;
        await uow.Repository<Project>().UpdateAsync(project);
        await AddAuditAsync(actorId, project, "StatusTransition", before);
        await uow.SaveChangesAsync();
        return await ToDtoAsync(project);
    }

    private static bool IsAllowed(ProjectStatus from, ProjectStatus to, bool isAdmin) =>
        from == to || (from, to) switch {
            (ProjectStatus.Draft, ProjectStatus.Active) => true,
            (ProjectStatus.Active, ProjectStatus.Paused) => true,
            (ProjectStatus.Paused, ProjectStatus.Active) => true,
            (ProjectStatus.Active, ProjectStatus.Completed) => true,
            (ProjectStatus.Paused, ProjectStatus.Completed) => true,
            (_, ProjectStatus.Archived) => isAdmin || from != ProjectStatus.Archived,
            _ => false
        };

    /// <summary>
    /// Resolves the Project Default Currency: an explicitly supplied code wins,
    /// otherwise the Founder's preferred currency, otherwise the platform default.
    /// The result is normalized and validated against the active Currency Master.
    /// </summary>
    private async Task<string> ResolveDefaultCurrencyAsync(Guid founderId, string? requested)
    {
        var code = requested;
        if (string.IsNullOrWhiteSpace(code))
        {
            var user = await uow.Repository<AuthUser>().GetSingleAsync(u => u.Id == founderId, u => u.Profile!);
            code = string.IsNullOrWhiteSpace(user?.Profile?.PreferredCurrency)
                ? CurrencyMasterDefaults.DefaultCurrency
                : user.Profile.PreferredCurrency;
        }

        var normalized = currencyDisplay.Normalize(code);
        var info = await currencyDisplay.GetInfoAsync(normalized);
        return info.ISOCode;
    }

    /// <summary>
    /// Sums all opportunity targets into the Project Default Currency.
    /// Conversion for display is approximate; identity (same currency) is exact.
    /// Historical FX snapshots from the funding currency are never re-priced.
    /// </summary>
    private async Task<decimal> TotalFundingTargetInDefaultCurrencyAsync(Project p, string defaultCurrency)
    {
        var total = 0m;
        foreach (var opp in p.Opportunities)
        {
            if (string.Equals(opp.FundingCurrency, defaultCurrency, StringComparison.OrdinalIgnoreCase))
            {
                total += opp.FundingTarget;
            }
            else
            {
                try
                {
                    var converted = await currencyConversion.ConvertForDisplayAsync(opp.FundingTarget, opp.FundingCurrency, defaultCurrency);
                    total += converted.ConvertedAmount;
                }
                catch
                {
                    total += opp.FundingTarget;
                }
            }
        }
        return total;
    }

    private async Task<ProjectDto> ToDtoAsync(Project p)
    {
        if (p.Category == null && p.CategoryId.HasValue)
            p.Category = await uow.Repository<OpportunityCategory>().GetByIdAsync(p.CategoryId.Value);
        var defaultCurrency = string.IsNullOrWhiteSpace(p.DefaultCurrency)
            ? CurrencyMasterDefaults.DefaultCurrency
            : p.DefaultCurrency;

        var dto = new ProjectDto {
            Id=p.Id, FounderId=p.FounderId, DisplayName=p.DisplayName, LegalName=p.LegalName, Slug=p.Slug,
            Summary=p.Summary, Description=p.Description, CategoryId=p.CategoryId, Category=ToLookupDto(p.Category), Industry=p.Industry,
            BusinessStage=p.BusinessStage, Geography=p.Geography, FoundedOn=p.FoundedOn, WebsiteUrl=p.WebsiteUrl,
            LogoUrl=p.LogoUrl, TeamDescription=p.TeamDescription, BusinessModel=p.BusinessModel, RiskLevel=p.RiskLevel,
            RiskDisclosure=p.RiskDisclosure, Status=p.Status, ArchiveReason=p.ArchiveReason,
            DefaultCurrency=defaultCurrency,
            OpportunityCount=p.Opportunities.Count,
            Opportunities=p.Opportunities.OrderBy(o=>o.SequenceNumber).Select(o=>new ProjectOpportunityDto {
                Id=o.Id, SequenceNumber=o.SequenceNumber, Title=o.Title, Purpose=o.Purpose, Type=o.Type,
                ProjectStage=o.ProjectStage, ProjectStageCustomName=o.ProjectStageCustomName,
                Status=o.Status, ModerationStatus=o.ModerationStatus, FundingStatus=o.FundingStatus,
                FundingOpensAt=o.FundingOpensAt, FundingClosesAt=o.FundingClosesAt, ClosureReason=o.ClosureReason,
                FundingTarget=o.FundingTarget, FundingCurrency=o.FundingCurrency, CreatedAt=o.CreatedAt
            }).ToArray(),
            CreatedAt=p.CreatedAt, UpdatedAt=p.UpdatedAt
        };

        try { dto.DefaultCurrencyInfo = await currencyDisplay.GetInfoAsync(defaultCurrency); }
        catch { dto.DefaultCurrencyInfo = null; }

        dto.TotalFundingTargetInDefaultCurrency = await TotalFundingTargetInDefaultCurrencyAsync(p, defaultCurrency);
        return dto;
    }

    private async Task AddAuditAsync(Guid userId, Project project, string action, string? before) =>
        await uow.Repository<AuditLog>().AddAsync(new AuditLog {
            UserId = userId, EntityType = nameof(Project), EntityId = project.Id.ToString(),
            Action = action, Changes = JsonSerializer.Serialize(new { Before = before, After = await ToDtoAsync(project) }),
            Timestamp = DateTime.UtcNow, Severity = AuditSeverity.Information
        });

    private async Task<Project> GetOwnedAsync(Guid founderId, int id)
    {
        await ValidateFounderAsync(founderId);
        var project = await uow.Repository<Project>().GetSingleAsync(
            p => p.Id == id && p.FounderId == founderId, p => p.Opportunities, p => p.Category!);
        return project ?? throw new BusinessValidationException("PROJECT_NOT_FOUND", "Project was not found.");
    }

    private async Task ValidateFounderAsync(Guid founderId)
    {
        var user = await uow.Repository<AuthUser>().GetByIdAsync(founderId);
        var suspended = user?.SuspendedUntil is DateTime until && until > DateTime.UtcNow;
        if (user == null || !user.Status || suspended || user.UserType != UserType.Client
            || user.ClientType is not (ClientType.Founder or ClientType.Both))
            throw new BusinessValidationException("FOUNDER_ACCESS_REQUIRED", "An active Founder account is required.");
    }

    private static void Validate(CreateProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DisplayName) || string.IsNullOrWhiteSpace(request.Summary)
            || string.IsNullOrWhiteSpace(request.Description))
            throw new BusinessValidationException("PROJECT_FIELDS_REQUIRED", "Project name, summary, and description are required.");
        if (request.BusinessStage.HasValue && !Enum.IsDefined(request.BusinessStage.Value))
            throw new BusinessValidationException("INVALID_PROJECT_STAGE", "Unknown project stage.");
        if (request.FoundedOn > DateOnly.FromDateTime(DateTime.UtcNow))
            throw new BusinessValidationException("INVALID_FOUNDED_DATE", "Founded date cannot be in the future.");
    }

    private static void Apply(Project p, CreateProjectRequest r)
    {
        p.DisplayName = r.DisplayName.Trim(); p.LegalName = Normalize(r.LegalName);
        p.Summary = r.Summary.Trim(); p.Description = r.Description.Trim();
        p.CategoryId = r.CategoryId; p.Industry = Normalize(r.Industry);
        p.BusinessStage = r.BusinessStage ?? ProjectStage.Idea; p.Geography = Normalize(r.Geography);
        p.FoundedOn = r.FoundedOn; p.WebsiteUrl = Normalize(r.WebsiteUrl); p.LogoUrl = Normalize(r.LogoUrl);
        p.TeamDescription = Normalize(r.TeamDescription); p.BusinessModel = Normalize(r.BusinessModel);
        p.RiskLevel = Normalize(r.RiskLevel); p.RiskDisclosure = Normalize(r.RiskDisclosure);
    }

    private async Task ValidateCategoryAsync(int? categoryId)
    {
        if (!categoryId.HasValue) return;
        var category = await uow.Repository<OpportunityCategory>().GetByIdAsync(categoryId.Value);
        if (category == null || !category.IsActive)
            throw new BusinessValidationException("INVALID_CATEGORY", "CategoryId must reference an active project category.");
    }

    private static OpportunityLookupDto? ToLookupDto(OpportunityCategory? category) => category == null ? null : new()
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description
    };

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
