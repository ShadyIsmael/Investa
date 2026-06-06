namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the lifecycle states for investment participation.
/// Tracks the journey from initial interest through to full participation or rejection.
/// </summary>
public enum ParticipationLifecycle
{
    /// <summary>
    /// Partner has expressed interest in the investment opportunity
    /// Initial stage before formal request submission
    /// </summary>
    Interested = 0,

    /// <summary>
    /// Partner has submitted a participation request
    /// Discussion phase is active between partner and founder
    /// </summary>
    InDiscussion = 1,

    /// <summary>
    /// Founder has approved the participation request
    /// Partner gains access to detailed project information
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Approved partner is viewing full project details
    /// Participant-only updates and private documents are accessible
    /// </summary>
    ViewingFullAccess = 3,

    /// <summary>
    /// Partner has completed the investment participation
    /// Formal investment has been made
    /// </summary>
    Participated = 4,

    /// <summary>
    /// Founder has rejected the participation request
    /// Partner cannot proceed with this investment
    /// </summary>
    Rejected = 5,

    /// <summary>
    /// Participation is inactive
    /// Request withdrawn, expired, or otherwise inactive
    /// </summary>
    Inactive = 6
}
