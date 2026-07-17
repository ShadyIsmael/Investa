namespace Investa.Application.Interfaces;

public interface IHtmlToPdfRenderer
{
    Task<byte[]> RenderAsync(string immutableHtml, string footerText, CancellationToken cancellationToken = default);
}
