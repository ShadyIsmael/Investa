using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IEmailAttachmentProvider
{
    Task<IReadOnlyList<EmailAttachment>> GetAttachmentsAsync(string referenceType, string referenceId, CancellationToken cancellationToken = default);
}
