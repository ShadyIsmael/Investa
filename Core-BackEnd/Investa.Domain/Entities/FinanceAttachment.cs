using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Supporting document/attachment for a finance transaction.
/// Stores references to uploaded files (invoice, receipt, voucher, etc.).
/// </summary>
public class FinanceAttachment
{
    [Key]
    public int Id { get; set; }

    /// <summary>Reference to the transaction</summary>
    [Required]
    public int TransactionId { get; set; }
    public FinanceTransaction? Transaction { get; set; }

    /// <summary>Original file name</summary>
    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    /// <summary>Storage URL/path for the file</summary>
    [Required]
    [StringLength(1000)]
    public string FileUrl { get; set; } = string.Empty;

    /// <summary>Storage key (for cloud storage)</summary>
    [StringLength(500)]
    public string? FileStorageKey { get; set; }

    /// <summary>File type (e.g., "Invoice", "Receipt", "Voucher", "Bank Statement")</summary>
    [Required]
    [StringLength(50)]
    public string DocumentType { get; set; } = string.Empty;

    /// <summary>File size in bytes</summary>
    public long FileSizeBytes { get; set; }

    /// <summary>MIME type (e.g., "application/pdf")</summary>
    [StringLength(100)]
    public string? MimeType { get; set; }

    /// <summary>Document reference number (e.g., invoice number on the document)</summary>
    [StringLength(100)]
    public string? DocumentReference { get; set; }

    /// <summary>Notes about the attachment</summary>
    [StringLength(500)]
    public string? Notes { get; set; }

    /// <summary>Attachment is required (not optional)</summary>
    public bool IsRequired { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
}
