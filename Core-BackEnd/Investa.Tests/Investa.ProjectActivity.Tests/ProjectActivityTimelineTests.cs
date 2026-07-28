using FluentAssertions;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Xunit;

namespace Investa.ProjectActivity.Tests;

public sealed class ProjectActivityTimelineTests
{
    [Fact]
    public void Add_IsIdempotent_AndRemovesSensitiveMetadata()
    {
        var events = new List<OpportunityEvent>();
        var relatedId = Guid.NewGuid().ToString();
        var metadata = new Dictionary<string, string?>
        {
            ["milestoneTitle"] = "Permits approved",
            ["investorName"] = "Must not leak",
            ["approvedAmount"] = "250000",
            ["auditDetails"] = "Internal"
        };

        var first = ProjectActivityTimeline.Add(events, 42,
            ProjectActivityTimeline.Types.MilestoneCompleted, "Founder", Guid.NewGuid(),
            DateTime.UtcNow, "Milestone", relatedId, $"milestone:{relatedId}:completed", metadata);
        var duplicate = ProjectActivityTimeline.Add(events, 42,
            ProjectActivityTimeline.Types.MilestoneCompleted, "Founder", Guid.NewGuid(),
            DateTime.UtcNow, "Milestone", relatedId, $"milestone:{relatedId}:completed", metadata);

        first.Should().BeTrue();
        duplicate.Should().BeFalse();
        var entry = events.Should().ContainSingle().Subject;
        entry.IsImmutableTimelineEntry.Should().BeTrue();
        entry.LocalizedMetadataJson.Should().Contain("milestoneTitle");
        entry.LocalizedMetadataJson.Should().NotContain("investorName");
        entry.LocalizedMetadataJson.Should().NotContain("approvedAmount");
        entry.LocalizedMetadataJson.Should().NotContain("auditDetails");
    }

    [Fact]
    public void Add_RejectsNonMaterialAuditEvents()
    {
        var action = () => ProjectActivityTimeline.Add(new List<OpportunityEvent>(), 42,
            "AuditLogViewed", "Admin", Guid.NewGuid(), DateTime.UtcNow,
            "Audit", Guid.NewGuid().ToString(), "audit:viewed");

        action.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void SelectPublic_ReturnsOnlyImmutableAllowListedEvents_NewestFirst_AndLimited()
    {
        var events = Enumerable.Range(1, 7).Select(index => new OpportunityEvent
        {
            Id = index,
            EventType = ProjectActivityTimeline.Types.ParticipationApproved,
            IsPublic = true,
            IsImmutableTimelineEntry = true,
            CreatedAt = new DateTime(2026, 7, index, 0, 0, 0, DateTimeKind.Utc)
        }).ToList();
        events.Add(new OpportunityEvent
        {
            Id = 99,
            EventType = "ManualUpdate",
            IsPublic = true,
            IsImmutableTimelineEntry = false,
            CreatedAt = DateTime.UtcNow
        });

        var result = ProjectActivityTimeline.SelectPublic(events, 0, 5);

        result.Should().HaveCount(5);
        result.Select(entry => entry.Id).Should().Equal(7, 6, 5, 4, 3);
        result.Should().NotContain(entry => entry.Id == 99);
    }
}
