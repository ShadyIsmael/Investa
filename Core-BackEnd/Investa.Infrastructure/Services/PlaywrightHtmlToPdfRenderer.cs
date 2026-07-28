using Investa.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Playwright;

namespace Investa.Infrastructure.Services;

public sealed class PlaywrightHtmlToPdfRenderer : IHtmlToPdfRenderer
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PlaywrightHtmlToPdfRenderer> _logger;

    public PlaywrightHtmlToPdfRenderer(
        IConfiguration configuration,
        ILogger<PlaywrightHtmlToPdfRenderer> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<byte[]> RenderAsync(string immutableHtml, string footerText, CancellationToken cancellationToken = default)
    {
        using var playwright = await Playwright.CreateAsync();
        var executablePath = ResolveExecutablePath(playwright.Chromium);
        try
        {
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true,
                ExecutablePath = executablePath,
                Args = ["--no-sandbox", "--disable-dev-shm-usage"]
            });
            var page = await browser.NewPageAsync();
            await page.SetContentAsync(immutableHtml, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });
            await page.EmulateMediaAsync(new PageEmulateMediaOptions { Media = Media.Print });
            return await page.PdfAsync(new PagePdfOptions
            {
                Format = "A4",
                PrintBackground = true,
                DisplayHeaderFooter = true,
                HeaderTemplate = "<span></span>",
                FooterTemplate = $"<div style='font-size:8px;width:100%;padding:0 12mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif'><span>{System.Net.WebUtility.HtmlEncode(footerText)}</span><span><span class='pageNumber'></span>/<span class='totalPages'></span></span></div>",
                Margin = new Margin { Top = "15mm", Right = "15mm", Bottom = "20mm", Left = "15mm" },
                PreferCSSPageSize = false
            });
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(
                "Contract PDF rendering failed. errorType={ErrorType} reason={Reason}",
                ex.GetType().Name,
                SafeReason(ex.Message));
            throw;
        }
    }

    private string ResolveExecutablePath(IBrowserType chromium)
    {
        var configured = _configuration["Pdf:ChromiumExecutablePath"]?.Trim();
        if (!string.IsNullOrWhiteSpace(configured))
        {
            if (!File.Exists(configured))
                throw new FileNotFoundException("The configured PDF browser executable does not exist.");
            return configured;
        }

        if (File.Exists(chromium.ExecutablePath))
            return chromium.ExecutablePath;

        var candidates = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft", "Edge", "Application", "msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Google", "Chrome", "Application", "chrome.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Google", "Chrome", "Application", "chrome.exe")
        };
        return candidates.FirstOrDefault(File.Exists)
            ?? throw new FileNotFoundException("No supported Chromium browser executable is available for PDF generation.");
    }

    private static string SafeReason(string value) =>
        value.Replace('\r', ' ').Replace('\n', ' ').Trim() is var safe && safe.Length > 500
            ? safe[..500]
            : safe;
}
