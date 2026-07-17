using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

public sealed record OpportunityRoomDemoDataBackfillResult(
    int Scanned,
    int OpportunitiesPopulated,
    int TimelineEventsCreated,
    int DocumentsCreated,
    int MediaCreated,
    int JoinRequestsCreated,
    int Skipped);

public class OpportunityRoomDemoDataBackfillService
{
    private const string DemoFileKeyPrefix = "demo-room";
    private readonly ApplicationDbContext _context;
    private readonly ILogger<OpportunityRoomDemoDataBackfillService> _logger;

    public OpportunityRoomDemoDataBackfillService(
        ApplicationDbContext context,
        ILogger<OpportunityRoomDemoDataBackfillService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<OpportunityRoomDemoDataBackfillResult> BackfillAsync(CancellationToken cancellationToken = default)
    {
        var opportunities = await _context.Opportunities
            .Include(o => o.Media)
            .Include(o => o.Documents)
            .Include(o => o.Events)
            .Include(o => o.JoinRequests)
            .OrderBy(o => o.Id)
            .ToListAsync(cancellationToken);

        var investors = await _context.AuthUsers
            .Where(u => u.UserType == UserType.Client && (u.ClientType == ClientType.Investor || u.ClientType == ClientType.Both))
            .OrderBy(u => u.CreatedAt)
            .ToListAsync(cancellationToken);

        var timelineEventsCreated = 0;
        var documentsCreated = 0;
        var mediaCreated = 0;
        var joinRequestsCreated = 0;
        var populated = 0;
        var skipped = 0;

        foreach (var opportunity in opportunities)
        {
            var changed = false;

            if (!opportunity.Media.Any(m => m.FileKey != null && m.FileKey.StartsWith($"{DemoFileKeyPrefix}/{opportunity.Id}/", StringComparison.OrdinalIgnoreCase)))
            {
                var media = BuildMedia(opportunity);
                _context.OpportunityMedia.AddRange(media);
                mediaCreated += media.Count;
                changed = true;
            }

            if (!opportunity.Documents.Any(d => d.FileKey != null && d.FileKey.StartsWith($"{DemoFileKeyPrefix}/{opportunity.Id}/", StringComparison.OrdinalIgnoreCase)))
            {
                var documents = BuildDocuments(opportunity);
                _context.OpportunityDocuments.AddRange(documents);
                documentsCreated += documents.Count;
                changed = true;
            }

            var timeline = BuildTimeline(opportunity);
            var missingTimeline = timeline
                .Where(item => !opportunity.Events.Any(e => e.Title == item.Title && e.EventType == item.EventType))
                .ToList();
            if (missingTimeline.Count > 0)
            {
                _context.OpportunityEvents.AddRange(missingTimeline);
                timelineEventsCreated += missingTimeline.Count;
                changed = true;
            }

            var createdRequests = AddMissingJoinRequests(opportunity, investors);
            if (createdRequests > 0)
            {
                joinRequestsCreated += createdRequests;
                changed = true;
            }

            if (changed)
                populated++;
            else
                skipped++;
        }

        if (populated > 0)
            await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Opportunity room demo data backfill completed. Scanned={Scanned}, Populated={Populated}, TimelineEventsCreated={TimelineEventsCreated}, DocumentsCreated={DocumentsCreated}, MediaCreated={MediaCreated}, JoinRequestsCreated={JoinRequestsCreated}, Skipped={Skipped}.",
            opportunities.Count,
            populated,
            timelineEventsCreated,
            documentsCreated,
            mediaCreated,
            joinRequestsCreated,
            skipped);

        return new OpportunityRoomDemoDataBackfillResult(
            opportunities.Count,
            populated,
            timelineEventsCreated,
            documentsCreated,
            mediaCreated,
            joinRequestsCreated,
            skipped);
    }

    private static List<OpportunityMedia> BuildMedia(Opportunity opportunity)
    {
        var titleSlug = Slug(opportunity.Title);
        var baseDate = StableBaseDate(opportunity);

        return new List<OpportunityMedia>
        {
            Media(opportunity, "cover", "Cover image", "image/jpeg", 421_000, OpportunityFilePurpose.Cover, "Cover", true, true, 0, baseDate.AddDays(-18), ImageUrl(opportunity.Id, "cover")),
            Media(opportunity, "gallery-office", "Office workspace", "image/jpeg", 382_000, OpportunityFilePurpose.Gallery, "Image", false, true, 1, baseDate.AddDays(-16), ImageUrl(opportunity.Id, "office")),
            Media(opportunity, "gallery-team", "Founder team", "image/jpeg", 348_000, OpportunityFilePurpose.Gallery, "Image", false, true, 2, baseDate.AddDays(-15), ImageUrl(opportunity.Id, "team")),
            Media(opportunity, "gallery-product", "Product preview", "image/jpeg", 397_000, OpportunityFilePurpose.Gallery, "Image", false, true, 3, baseDate.AddDays(-13), ImageUrl(opportunity.Id, "product")),
            Media(opportunity, "pitch-video", "Pitch video", "video/mp4", 8_400_000, OpportunityFilePurpose.PitchVideo, "Video", false, true, 4, baseDate.AddDays(-12), $"https://cdn.investa.demo/opportunities/{opportunity.Id}/{titleSlug}-pitch-video.mp4"),
            Media(opportunity, "update-media", "Milestone update media", "image/jpeg", 456_000, OpportunityFilePurpose.ProjectUpdateMedia, "Image", false, false, 5, baseDate.AddDays(-6), ImageUrl(opportunity.Id, "milestone")),
            Media(opportunity, "general-screenshot", "Dashboard screenshot", "image/png", 289_000, OpportunityFilePurpose.General, "Image", false, true, 6, baseDate.AddDays(-4), $"https://cdn.investa.demo/opportunities/{opportunity.Id}/{titleSlug}-dashboard.png")
        };
    }

    private static OpportunityMedia Media(
        Opportunity opportunity,
        string key,
        string fileName,
        string mimeType,
        long size,
        OpportunityFilePurpose purpose,
        string mediaType,
        bool isCover,
        bool isPublic,
        int sortOrder,
        DateTime createdAt,
        string url)
    {
        var extension = mimeType.Contains("png", StringComparison.OrdinalIgnoreCase) ? "png"
            : mimeType.Contains("video", StringComparison.OrdinalIgnoreCase) ? "mp4"
            : "jpg";

        return new OpportunityMedia
        {
            OpportunityId = opportunity.Id,
            FileId = $"demo-media-{opportunity.Id}-{key}",
            FileKey = $"{DemoFileKeyPrefix}/{opportunity.Id}/media/{key}.{extension}",
            FileName = $"{fileName}.{extension}",
            FileType = mediaType,
            MimeType = mimeType,
            FileSize = size,
            FileUrl = url,
            PreviewUrl = url,
            ThumbnailUrl = mimeType.StartsWith("video", StringComparison.OrdinalIgnoreCase) ? ImageUrl(opportunity.Id, "video-thumb") : url,
            MediaType = mediaType,
            IsCover = isCover,
            IsPublic = isPublic,
            Purpose = purpose,
            SortOrder = sortOrder,
            CreatedByUserId = opportunity.FounderId,
            CreatedAt = createdAt
        };
    }

    private static List<OpportunityDocument> BuildDocuments(Opportunity opportunity)
    {
        var baseDate = StableBaseDate(opportunity);

        return new List<OpportunityDocument>
        {
            Document(opportunity, "executive-summary", "Executive Summary.pdf", "pdf", "application/pdf", 512_000, OpportunityFilePurpose.PublicDocument, OpportunityDocumentVisibility.Public, "PublicDocument", "OpportunityPublicDocument", "executive summary,public,overview", baseDate.AddDays(-17)),
            Document(opportunity, "business-overview", "Business Overview.pdf", "pdf", "application/pdf", 748_000, OpportunityFilePurpose.PublicDocument, OpportunityDocumentVisibility.Public, "PublicDocument", "OpportunityPublicDocument", "business overview,public,founder", baseDate.AddDays(-16)),
            Document(opportunity, "pitch-deck", "Pitch Deck.pdf", "pdf", "application/pdf", 1_840_000, OpportunityFilePurpose.PublicDocument, OpportunityDocumentVisibility.Public, "PublicDocument", "Presentation", "pitch deck,public,presentation", baseDate.AddDays(-15)),
            Document(opportunity, "financial-model", "Financial Model.xlsx", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 923_000, OpportunityFilePurpose.FinancialReport, OpportunityDocumentVisibility.Private, "FinancialReport", "FinancialReport", "financial model,private,forecast", baseDate.AddDays(-10)),
            Document(opportunity, "revenue-forecast", "Revenue Forecast.xlsx", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 694_000, OpportunityFilePurpose.FinancialReport, OpportunityDocumentVisibility.Private, "FinancialReport", "FinancialReport", "revenue forecast,private,financials", baseDate.AddDays(-9)),
            Document(opportunity, "founder-agreement", "Founder Agreement.pdf", "pdf", "application/pdf", 431_000, OpportunityFilePurpose.Contract, OpportunityDocumentVisibility.Private, "Contract", "Contract", "founder agreement,private,contract", baseDate.AddDays(-8)),
            Document(opportunity, "shareholder-agreement", "Shareholder Agreement.pdf", "pdf", "application/pdf", 612_000, OpportunityFilePurpose.Contract, OpportunityDocumentVisibility.Private, "Contract", "Contract", "shareholder agreement,private,contract", baseDate.AddDays(-7)),
            Document(opportunity, "budget-breakdown", "Budget Breakdown.xlsx", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 558_000, OpportunityFilePurpose.PrivateDocument, OpportunityDocumentVisibility.Private, "PrivateDocument", "Spreadsheet", "budget breakdown,private,use of funds", baseDate.AddDays(-6)),
            Document(opportunity, "internal-planning", "Internal Planning.pdf", "pdf", "application/pdf", 477_000, OpportunityFilePurpose.InternalFile, OpportunityDocumentVisibility.Private, "InternalFile", "General", "internal planning,private,operations", baseDate.AddDays(-5)),
            Document(opportunity, "legal-summary", "Legal Summary.pdf", "pdf", "application/pdf", 389_000, OpportunityFilePurpose.Legal, OpportunityDocumentVisibility.Private, "Legal", "Legal", "legal,private,due diligence", baseDate.AddDays(-4))
        };
    }

    private static OpportunityDocument Document(
        Opportunity opportunity,
        string key,
        string fileName,
        string extension,
        string mimeType,
        long size,
        OpportunityFilePurpose purpose,
        OpportunityDocumentVisibility visibility,
        string documentType,
        string category,
        string searchTags,
        DateTime createdAt)
    {
        var fileKey = $"{DemoFileKeyPrefix}/{opportunity.Id}/documents/{key}.{extension}";
        var url = $"https://cdn.investa.demo/{fileKey}";

        return new OpportunityDocument
        {
            OpportunityId = opportunity.Id,
            FileId = $"demo-doc-{opportunity.Id}-{key}",
            FileKey = fileKey,
            FileName = fileName,
            FileExtension = extension,
            MimeType = mimeType,
            FileSize = size,
            FileUrl = url,
            PreviewUrl = url,
            ThumbnailUrl = extension == "pdf" ? $"https://cdn.investa.demo/{DemoFileKeyPrefix}/{opportunity.Id}/documents/{key}-thumb.jpg" : null,
            DocumentType = documentType,
            Visibility = visibility,
            Purpose = purpose,
            Category = category,
            SearchTags = searchTags,
            CreatedByUserId = opportunity.FounderId,
            CreatedAt = createdAt
        };
    }

    private static List<OpportunityEvent> BuildTimeline(Opportunity opportunity)
    {
        var baseDate = StableBaseDate(opportunity);

        return new List<OpportunityEvent>
        {
            Event(opportunity, "Published", "Opportunity published", "The founder published the opportunity and made the public overview available to investors.", true, baseDate.AddDays(-20)),
            Event(opportunity, "InvestorApproved", "First investor approved", "A qualified investor was approved and gained access to the Project Room.", false, baseDate.AddDays(-18)),
            Event(opportunity, "DocumentUpdated", "Business plan updated", "The founder uploaded an updated business overview and refined the operating plan.", true, baseDate.AddDays(-15)),
            Event(opportunity, "DocumentUploaded", "Financial projection uploaded", "A private financial model and revenue forecast were added for approved participants.", false, baseDate.AddDays(-11)),
            Event(opportunity, "MilestoneStarted", "Execution phase started", "The team began the first operational phase after completing supplier and resource planning.", true, baseDate.AddDays(-9)),
            Event(opportunity, "MilestoneCompleted", "First milestone completed", "The first milestone was completed and supporting media was added to the room.", true, baseDate.AddDays(-7)),
            Event(opportunity, "Progress", "Progress reached 25%", "The opportunity reached 25% progress against its initial execution plan.", true, baseDate.AddDays(-5)),
            Event(opportunity, "Progress", "Progress reached 50%", "The team reported stronger traction and reached the halfway point of the current phase.", false, baseDate.AddDays(-3)),
            Event(opportunity, "FounderUpdate", "Equipment purchased", "Core equipment and operating tools were purchased and recorded in the private file library.", false, baseDate.AddDays(-2)),
            Event(opportunity, "FounderUpdate", "Supplier contracts signed", "Key supplier contracts were signed and stored in the private documents section.", false, baseDate.AddDays(-1))
        };
    }

    private static OpportunityEvent Event(
        Opportunity opportunity,
        string eventType,
        string title,
        string description,
        bool isPublic,
        DateTime createdAt)
        => new()
        {
            OpportunityId = opportunity.Id,
            EventType = eventType,
            Title = title,
            Description = description,
            CreatedByUserId = opportunity.FounderId,
            CreatedAt = createdAt,
            IsPublic = isPublic
        };

    private int AddMissingJoinRequests(Opportunity opportunity, IReadOnlyList<AuthUser> investors)
    {
        var candidates = investors
            .Where(u => u.Id != opportunity.FounderId)
            .ToList();

        if (candidates.Count == 0)
            return 0;

        var created = 0;
        created += AddRequestForStatus(opportunity, candidates, OpportunityJoinRequestStatus.Approved, 0);
        created += AddRequestForStatus(opportunity, candidates, OpportunityJoinRequestStatus.Pending, 1);
        created += AddRequestForStatus(opportunity, candidates, OpportunityJoinRequestStatus.Rejected, 2);

        if (created > 0 && opportunity.FirstInvestorJoinedAt == null && opportunity.JoinRequests.Any(r => r.Status == OpportunityJoinRequestStatus.Approved))
            opportunity.FirstInvestorJoinedAt = opportunity.JoinRequests.Where(r => r.Status == OpportunityJoinRequestStatus.Approved).Min(r => r.CreatedAt);

        return created;
    }

    private int AddRequestForStatus(
        Opportunity opportunity,
        IReadOnlyList<AuthUser> candidates,
        OpportunityJoinRequestStatus status,
        int preferredOffset)
    {
        if (opportunity.JoinRequests.Any(r => r.Status == status))
            return 0;

        var alreadyUsed = opportunity.JoinRequests.Select(r => r.InvestorId).ToHashSet();
        var investor = candidates
            .Skip(preferredOffset)
            .Concat(candidates)
            .FirstOrDefault(u => !alreadyUsed.Contains(u.Id));

        if (investor == null)
            return 0;

        var createdAt = StableBaseDate(opportunity).AddDays(status switch
        {
            OpportunityJoinRequestStatus.Approved => -18,
            OpportunityJoinRequestStatus.Pending => -6,
            OpportunityJoinRequestStatus.Rejected => -4,
            _ => -3
        });

        var request = new OpportunityJoinRequest
        {
            OpportunityId = opportunity.Id,
            InvestorId = investor.Id,
            RequestType = OpportunityJoinRequestType.GeneralParticipation,
            RequestedAmount = opportunity.MinimumInvestmentAmount ?? Math.Min(25_000m, opportunity.FundingTarget),
            CalculatedTotalAmount = opportunity.MinimumInvestmentAmount ?? Math.Min(25_000m, opportunity.FundingTarget),
            Message = $"I am interested in participating in {opportunity.Title} and reviewing the founder's execution updates.",
            TermsSnapshotJson = $$"""{"source":"demo","investmentModel":"{{opportunity.InvestmentModel}}","fundingTarget":{{opportunity.FundingTarget}}}""",
            Status = status,
            RejectionReason = status == OpportunityJoinRequestStatus.Rejected ? "Demo rejection: investor profile did not match the current participation criteria." : null,
            ReviewedByFounderId = status == OpportunityJoinRequestStatus.Pending ? null : opportunity.FounderId,
            ReviewedAt = status == OpportunityJoinRequestStatus.Pending ? null : createdAt.AddDays(1),
            CreatedAt = createdAt,
            UpdatedAt = status == OpportunityJoinRequestStatus.Pending ? createdAt : createdAt.AddDays(1)
        };

        opportunity.JoinRequests.Add(request);
        _context.OpportunityJoinRequests.Add(request);
        return 1;
    }

    private static DateTime StableBaseDate(Opportunity opportunity)
    {
        var seed = opportunity.CreatedAt == default ? DateTime.UtcNow.AddDays(-30) : opportunity.CreatedAt;
        return seed > DateTime.UtcNow.AddDays(-3) ? DateTime.UtcNow.AddDays(-30) : seed;
    }

    private static string ImageUrl(int opportunityId, string label)
        => $"https://picsum.photos/seed/investa-{opportunityId}-{label}/1200/800";

    private static string Slug(string value)
    {
        var chars = value
            .Trim()
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
            .ToArray();

        var slug = new string(chars);
        while (slug.Contains("--", StringComparison.Ordinal))
            slug = slug.Replace("--", "-", StringComparison.Ordinal);

        return string.IsNullOrWhiteSpace(slug.Trim('-')) ? "opportunity" : slug.Trim('-');
    }
}
