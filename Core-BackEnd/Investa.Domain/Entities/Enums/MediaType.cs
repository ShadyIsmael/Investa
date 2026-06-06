namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Defines the type of media asset for investment opportunities
/// </summary>
public enum MediaType
{
    /// <summary>
    /// Primary cover image for the investment opportunity
    /// Displayed on project cards and details page header
    /// </summary>
    CoverImage = 0,

    /// <summary>
    /// Additional image asset (product screenshots, business photos, etc.)
    /// Part of the media gallery
    /// </summary>
    Image = 1,

    /// <summary>
    /// Video asset (demo videos, pitch videos, product walkthroughs, etc.)
    /// Part of the media gallery
    /// </summary>
    Video = 2
}
