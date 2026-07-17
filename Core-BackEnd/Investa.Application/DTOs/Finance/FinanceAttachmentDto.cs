using System;

namespace Investa.Application.DTOs.Finance;

/// <summary>DTO for Finance Attachment (supporting document).</summary>
public class FinanceAttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? MimeType { get; set; }
    public string? DocumentReference { get; set; }
    public string? Notes { get; set; }
    public bool IsRequired { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>DTO for uploading an attachment to a transaction.</summary>
public class UploadFinanceAttachmentDto
{
    public int TransactionId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string? DocumentReference { get; set; }
    public string? Notes { get; set; }
    public bool IsRequired { get; set; } = false;
    // File binary data would be sent separately in multipart form
}
