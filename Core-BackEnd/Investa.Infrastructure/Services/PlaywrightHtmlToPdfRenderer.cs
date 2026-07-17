using Investa.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Playwright;

namespace Investa.Infrastructure.Services;

public sealed class PlaywrightHtmlToPdfRenderer : IHtmlToPdfRenderer
{
    private readonly IConfiguration _configuration;
    public PlaywrightHtmlToPdfRenderer(IConfiguration configuration) => _configuration = configuration;

    public async Task<byte[]> RenderAsync(string immutableHtml, string footerText, CancellationToken cancellationToken = default)
    {
        using var playwright = await Playwright.CreateAsync();
        var executablePath = _configuration["Pdf:ChromiumExecutablePath"];
        await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            ExecutablePath = string.IsNullOrWhiteSpace(executablePath) ? null : executablePath,
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
}
