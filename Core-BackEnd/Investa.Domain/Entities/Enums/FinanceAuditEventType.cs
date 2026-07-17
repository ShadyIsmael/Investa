namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Types of audit events recorded in the finance audit trail.
/// </summary>
public enum FinanceAuditEventType
{
    /// <summary>Transaction was created</summary>
    Created = 1,

    /// <summary>Transaction was edited (before confirmation)</summary>
    Edited = 2,

    /// <summary>Attachment added to transaction</summary>
    AttachmentAdded = 3,

    /// <summary>Attachment removed from transaction</summary>
    AttachmentRemoved = 4,

    /// <summary>Transaction was confirmed and locked</summary>
    Confirmed = 5,

    /// <summary>Transaction was reversed with reason</summary>
    Reversed = 6,

    /// <summary>Transaction was cancelled with reason</summary>
    Cancelled = 7,

    /// <summary>Transaction status was updated</summary>
    StatusChanged = 8,

    /// <summary>Transaction was submitted for review</summary>
    Submitted = 9,

    /// <summary>Transaction was approved by reviewer</summary>
    Approved = 10,

    /// <summary>Transaction was rejected by reviewer</summary>
    Rejected = 11,

    /// <summary>Reconciliation was created</summary>
    ReconciliationCreated = 20,

    /// <summary>Reconciliation was recalculated</summary>
    ReconciliationRecalculated = 21,

    /// <summary>Reconciliation was confirmed</summary>
    ReconciliationConfirmed = 22,

    /// <summary>Reconciliation difference was detected or changed</summary>
    ReconciliationDifferenceDetected = 23
}
