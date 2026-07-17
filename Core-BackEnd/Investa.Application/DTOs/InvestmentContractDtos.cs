using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public record InvestmentContractSummaryDto(int ContractId, string ContractNumber, string FounderDisplayName, string InvestorDisplayName, InvestmentModel InvestmentModel, int CurrentVersionNumber, InvestmentContractStatus Status, DateTime LatestAgreementDate, int VersionCount);
public record InvestmentContractVersionSummaryDto(int VersionNumber, InvestmentContractVersionType VersionType, InvestmentContractVersionStatus Status, DateTime CreatedAt, DateTime? ActivatedAt, string DocumentHash);
public record InvestmentContractDetailDto(InvestmentContractSummaryDto Contract, InvestmentContractVersionDto CurrentVersion, IReadOnlyList<InvestmentContractVersionSummaryDto> VersionHistory);
public record InvestmentContractVersionDto(int VersionNumber, InvestmentContractVersionType VersionType, InvestmentContractVersionStatus Status, string TermsSnapshotJson, string? PreviousTermsSnapshotJson, string? ChangesSnapshotJson, string DocumentHash, DateTime CreatedAt, DateTime? ActivatedAt, bool HtmlPreviewAvailable, PdfGenerationStatus PdfStatus, bool PdfDownloadAvailable, DateTime? PdfGeneratedAt, string? PdfHash, long? PdfDocumentSize);
public record InvestmentContractDocumentDto(string ContractNumber, int VersionNumber, string ContentType, string Content, string DocumentHash);
public record InvestmentContractPdfDto(string FileName, string ContentType, byte[] Content, string DocumentHash);
