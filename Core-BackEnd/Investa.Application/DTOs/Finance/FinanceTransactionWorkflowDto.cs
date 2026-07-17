namespace Investa.Application.DTOs.Finance;

/// <summary>
/// DTO for submitting a transaction for review by the Maker.
/// </summary>
public class SubmitFinanceTransactionDto
{
    /// <summary>Optional notes when submitting</summary>
    public string? SubmissionNotes { get; set; }
}

/// <summary>
/// DTO for approving a transaction by the Checker.
/// </summary>
public class ApproveFinanceTransactionDto
{
    /// <summary>Optional approval notes/comments</summary>
    public string? ApprovalNotes { get; set; }
}

/// <summary>
/// DTO for rejecting a transaction by the Checker.
/// </summary>
public class RejectFinanceTransactionDto
{
    /// <summary>Required reason for rejection</summary>
    public string RejectionReason { get; set; } = string.Empty;
}

/// <summary>
/// DTO for reviewer/workflow related information in transaction response.
/// </summary>
public class FinanceTransactionReviewDto
{
    /// <summary>Can current user edit this transaction</summary>
    public bool CanEdit { get; set; }

    /// <summary>Can current user submit this transaction for review</summary>
    public bool CanSubmit { get; set; }

    /// <summary>Can current user review this transaction</summary>
    public bool CanReview { get; set; }

    /// <summary>Can current user approve this transaction</summary>
    public bool CanApprove { get; set; }

    /// <summary>Can current user reject this transaction</summary>
    public bool CanReject { get; set; }

    /// <summary>Can current user confirm this transaction</summary>
    public bool CanConfirm { get; set; }

    /// <summary>Can current user reverse this transaction</summary>
    public bool CanReverse { get; set; }

    /// <summary>Current review status (Draft, ReadyForReview, Approved, Rejected, etc.)</summary>
    public string? ReviewStatus { get; set; }

    /// <summary>Display name of transaction maker/creator</summary>
    public string? MakerDisplayName { get; set; }

    /// <summary>Display name of transaction checker/reviewer</summary>
    public string? CheckerDisplayName { get; set; }

    /// <summary>Reason for review decision or rejection</summary>
    public string? ReviewReason { get; set; }

    /// <summary>When transaction was submitted for review</summary>
    public DateTime? SubmittedAt { get; set; }

    /// <summary>When transaction was reviewed</summary>
    public DateTime? ReviewedAt { get; set; }
}
