using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public class EmailTemplateModel
{
    public string? RecipientDisplayName { get; set; }

    [Required(AllowEmptyStrings = false)]
    public string StatusLabel { get; set; } = string.Empty;

    [Required]
    public string AccentColor { get; set; } = "#1E3A5F";

    [Required]
    public string TagBackground { get; set; } = "#e8f0fe";

    [Required]
    public string TagTextColor { get; set; } = "#1E3A5F";

    [Required(AllowEmptyStrings = false)]
    public string Title { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    public string Description { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    public string CardLabel { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    public string CardValue { get; set; } = string.Empty;

    public string CardIcon { get; set; } = "i";

    [Required(AllowEmptyStrings = false)]
    public string CtaText { get; set; } = string.Empty;

    [Required]
    public string CtaUrl { get; set; } = "#";

    public string SupportEmail { get; set; } = "support@fopx.one";

    public string DocumentationUrl { get; set; } = "https://docs.fopx.one";

    public string PrivacyUrl { get; set; } = "https://fopx.one/privacy";

    public string TermsUrl { get; set; } = "https://fopx.one/terms";

    public string PreferencesUrl { get; set; } = "https://fopx.one/preferences";

    [Required(AllowEmptyStrings = false)]
    public string PlainTextFallback { get; set; } = string.Empty;

    public string Preheader { get; set; } = string.Empty;

    public string Language { get; set; } = "en";

    [Obsolete("The FOPX One brand tagline is rendered centrally by the unified email renderer.")]
    public string PlatformName { get; set; } = "Founder • Opportunity • Partner";
}
