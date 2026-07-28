using System.Text.Json;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public static class ProjectActivityTimeline
{
    public static class Types
    {
        public const string ParticipationApproved = "ParticipationApproved";
        public const string FundingProgressReached = "FundingProgressReached";
        public const string ProjectStatusChanged = "ProjectStatusChanged";
        public const string MilestoneCreated = "MilestoneCreated";
        public const string MilestoneCompleted = "MilestoneCompleted";
        public const string MilestoneDelayed = "MilestoneDelayed";
        public const string MilestoneUpdated = "MilestoneUpdated";
        public const string DocumentPublished = "InvestorDocumentPublished";
        public const string ContractActivated = "ContractActivated";
        public const string FundingCompleted = "FundingCompleted";
    }

    private static readonly HashSet<string> MaterialTypes = new(StringComparer.Ordinal)
    {
        Types.ParticipationApproved,
        Types.FundingProgressReached,
        Types.ProjectStatusChanged,
        Types.MilestoneCreated,
        Types.MilestoneCompleted,
        Types.MilestoneDelayed,
        Types.MilestoneUpdated,
        Types.DocumentPublished,
        Types.ContractActivated,
        Types.FundingCompleted
    };

    public static bool IsInvestorVisible(OpportunityEvent entry) =>
        entry.IsPublic && entry.IsImmutableTimelineEntry && MaterialTypes.Contains(entry.EventType);

    public static IReadOnlyList<OpportunityEvent> SelectPublic(
        IEnumerable<OpportunityEvent> entries,
        int skip,
        int take) => entries
        .Where(IsInvestorVisible)
        .OrderByDescending(entry => entry.CreatedAt)
        .ThenByDescending(entry => entry.Id)
        .Skip(Math.Max(0, skip))
        .Take(Math.Clamp(take, 1, 50))
        .ToList();

    public static bool Add(
        ICollection<OpportunityEvent> events,
        int opportunityId,
        string eventType,
        string actorType,
        Guid actorUserId,
        DateTime occurredAt,
        string relatedEntityType,
        string relatedEntityId,
        string idempotencyKey,
        IReadOnlyDictionary<string, string?>? metadata = null)
    {
        if (!MaterialTypes.Contains(eventType))
            throw new ArgumentOutOfRangeException(nameof(eventType), eventType, "Unsupported project activity type.");

        if (events.Any(e => e.IdempotencyKey == idempotencyKey))
            return false;

        var safeMetadata = metadata?
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Key) && !IsSensitiveKey(pair.Key))
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        events.Add(new OpportunityEvent
        {
            OpportunityId = opportunityId,
            EventType = eventType,
            Title = $"projectActivity.types.{eventType}.title",
            Description = $"projectActivity.types.{eventType}.description",
            CreatedByUserId = actorUserId,
            CreatedAt = occurredAt,
            IsPublic = true,
            ActorType = NormalizeActorType(actorType),
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            LocalizedMetadataJson = safeMetadata is { Count: > 0 } ? JsonSerializer.Serialize(safeMetadata) : null,
            IdempotencyKey = idempotencyKey,
            IsImmutableTimelineEntry = true
        });

        return true;
    }

    private static string NormalizeActorType(string actorType) => actorType.Trim().ToLowerInvariant() switch
    {
        "founder" => "Founder",
        "admin" => "Admin",
        _ => "System"
    };

    private static bool IsSensitiveKey(string key) => key.Contains("investor", StringComparison.OrdinalIgnoreCase)
        || key.Contains("amount", StringComparison.OrdinalIgnoreCase)
        || key.Contains("audit", StringComparison.OrdinalIgnoreCase)
        || key.Contains("user", StringComparison.OrdinalIgnoreCase);
}
