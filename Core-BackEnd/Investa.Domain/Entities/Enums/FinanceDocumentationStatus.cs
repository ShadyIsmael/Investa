namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Documentation/attachment status for finance transactions.
/// Tracks completeness of required supporting documents.
/// </summary>
public enum FinanceDocumentationStatus
{
    /// <summary>All required documents attached and verified</summary>
    FullyDocumented = 1,

    /// <summary>Some required documents missing</summary>
    PartiallyDocumented = 2,

    /// <summary>Required documents are missing</summary>
    MissingDocuments = 3,

    /// <summary>No documents submitted</summary>
    NoDocuments = 4,

    /// <summary>Submitted documents need review or clarification</summary>
    NeedsReview = 5
}
