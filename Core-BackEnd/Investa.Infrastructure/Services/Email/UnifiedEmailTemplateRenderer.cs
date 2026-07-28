using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Email;

public sealed partial class UnifiedEmailTemplateRenderer : IEmailTemplateRenderer
{
    private static readonly string[] RequiredKeys =
    [
        "TITLE", "DESCRIPTION", "GREETING", "STATUS_LABEL", "CARD_LABEL", "CARD_VALUE",
        "CTA_TEXT", "PLAIN_TEXT_FALLBACK"
    ];

    private static readonly HashSet<string> UrlKeys =
    [
        "CTA_URL", "SUPPORT_EMAIL", "DOCS_URL", "PRIVACY_URL", "TERMS_URL", "PREFERENCES_URL"
    ];

    private static readonly HashSet<string> HtmlContentKeys =
    [
        "TITLE", "DESCRIPTION", "GREETING", "STATUS_LABEL", "CARD_LABEL", "CARD_VALUE",
        "CTA_TEXT", "PLAIN_TEXT_FALLBACK", "PREHEADER", "BRAND_TAGLINE",
        "HELP_HEADING", "HELP_CONTACT_LABEL", "DOCS_LABEL",
        "PRIVACY_LABEL", "TERMS_LABEL", "PREFERENCES_LABEL", "COPYRIGHT"
    ];

    private readonly ILogger<UnifiedEmailTemplateRenderer> _logger;
    private string? _enTemplate;
    private string? _arTemplate;

    public UnifiedEmailTemplateRenderer(ILogger<UnifiedEmailTemplateRenderer> logger)
    {
        _logger = logger;
    }

    public Task<EmailTemplateResult> RenderAsync(string templateName, object model, CancellationToken cancellationToken = default)
    {
        if (model is not EmailTemplateModel m)
        {
            throw new ArgumentException(
                $"Expected model of type {nameof(EmailTemplateModel)}, but got {model.GetType().Name}.",
                nameof(model));
        }

        EnsureTemplatesLoaded();

        bool isArabic = m.Language?.Equals("ar", StringComparison.OrdinalIgnoreCase) == true;
        string template = isArabic ? _arTemplate! : _enTemplate!;
        string dir = isArabic ? "rtl" : "ltr";
        string dirAlign = isArabic ? "right" : "left";

        var placeholders = BuildPlaceholders(m, templateName, dir, dirAlign);
        ValidateRequired(placeholders);

        string htmlBody = ApplyTemplate(template, placeholders);
        string subject = m.Title;

        return Task.FromResult(new EmailTemplateResult
        {
            Subject = subject,
            HtmlBody = htmlBody,
            PlainTextBody = m.PlainTextFallback
        });
    }

    private static Dictionary<string, string> BuildPlaceholders(EmailTemplateModel m, string templateName, string dir, string dirAlign)
    {
        bool isArabic = dir == "rtl";
        var displayName = m.RecipientDisplayName?.Trim();
        var greeting = isArabic
            ? (string.IsNullOrWhiteSpace(displayName) ? "مرحبًا" : $"مرحبًا، {displayName}")
            : (string.IsNullOrWhiteSpace(displayName) ? "Hello" : $"Hello, {displayName}");

        var dict = new Dictionary<string, string>
        {
            ["LANG"] = isArabic ? "ar" : "en",
            ["DIR"] = dir,
            ["DIR_ALIGN"] = dirAlign,
            ["CARD_SECTION_NAME"] = templateName.Equals("email-verification-otp", StringComparison.OrdinalIgnoreCase)
                ? "verification-code"
                : "information-card",
            ["TITLE"] = HtmlEncode(m.Title),
            ["DESCRIPTION"] = HtmlEncode(m.Description),
            ["GREETING"] = HtmlEncode(greeting),
            ["STATUS_LABEL"] = HtmlEncode(m.StatusLabel),
            ["ACCENT_COLOR"] = m.AccentColor,
            ["TAG_BACKGROUND"] = m.TagBackground,
            ["TAG_TEXT_COLOR"] = m.TagTextColor,
            ["CARD_LABEL"] = HtmlEncode(m.CardLabel),
            ["CARD_VALUE"] = HtmlEncode(m.CardValue),
            ["CARD_ICON"] = HtmlEncode(m.CardIcon),
            ["CTA_TEXT"] = HtmlEncode(m.CtaText),
            ["CTA_URL"] = UrlEncode(m.CtaUrl),
            ["SUPPORT_EMAIL"] = m.SupportEmail,
            ["DOCS_URL"] = UrlEncode(m.DocumentationUrl),
            ["PRIVACY_URL"] = UrlEncode(m.PrivacyUrl),
            ["TERMS_URL"] = UrlEncode(m.TermsUrl),
            ["PREFERENCES_URL"] = UrlEncode(m.PreferencesUrl),
            ["PLAIN_TEXT_FALLBACK"] = HtmlEncode(m.PlainTextFallback),
            ["PREHEADER"] = HtmlEncode(m.Preheader),
            ["BRAND_TAGLINE"] = "Founder • Opportunity • Partner",
        };

        if (isArabic)
        {
            dict["HELP_HEADING"] = "هل تحتاج مساعدة؟";
            dict["HELP_CONTACT_LABEL"] = "اتصل بنا على";
            dict["DOCS_LABEL"] = "الوثائق";
            dict["PRIVACY_LABEL"] = "سياسة الخصوصية";
            dict["TERMS_LABEL"] = "الشروط";
            dict["PREFERENCES_LABEL"] = "تفضيلات البريد";
            dict["COPYRIGHT"] = "© 2026 FOPX One. جميع الحقوق محفوظة.";
        }
        else
        {
            dict["HELP_HEADING"] = "Need help?";
            dict["HELP_CONTACT_LABEL"] = "Contact us at";
            dict["DOCS_LABEL"] = "Documentation";
            dict["PRIVACY_LABEL"] = "Privacy Policy";
            dict["TERMS_LABEL"] = "Terms";
            dict["PREFERENCES_LABEL"] = "Email Preferences";
            dict["COPYRIGHT"] = "© 2026 FOPX One. All rights reserved.";
        }

        return dict;
    }

    private static void ValidateRequired(Dictionary<string, string> placeholders)
    {
        var missing = new List<string>();
        foreach (var key in RequiredKeys)
        {
            if (string.IsNullOrEmpty(placeholders.GetValueOrDefault(key)))
            {
                missing.Add(key);
            }
        }

        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                $"Missing required email template fields: {string.Join(", ", missing)}");
        }
    }

    private static string ApplyTemplate(string template, Dictionary<string, string> placeholders)
    {
        var sb = new StringBuilder(template);
        foreach (var (key, value) in placeholders)
        {
            sb.Replace($"{{{{{key}}}}}", value);
        }
        return sb.ToString();
    }

    private static string HtmlEncode(string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        return System.Net.WebUtility.HtmlEncode(value);
    }

    private static string UrlEncode(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "#";
        if (value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("mailto:", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("#"))
        {
            return value;
        }
        return value;
    }

    private void EnsureTemplatesLoaded()
    {
        if (_enTemplate != null && _arTemplate != null) return;

        var assembly = Assembly.GetExecutingAssembly();
        const string enResource = "Investa.Infrastructure.Templates.email_master_en.html";
        const string arResource = "Investa.Infrastructure.Templates.email_master_ar.html";

        _enTemplate = ReadEmbeddedResource(assembly, enResource);
        _arTemplate = ReadEmbeddedResource(assembly, arResource);

        if (_enTemplate == null)
            throw new InvalidOperationException($"Embedded resource '{enResource}' not found.");
        if (_arTemplate == null)
            throw new InvalidOperationException($"Embedded resource '{arResource}' not found.");
    }

    private static string? ReadEmbeddedResource(Assembly assembly, string resourceName)
    {
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null) return null;
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
