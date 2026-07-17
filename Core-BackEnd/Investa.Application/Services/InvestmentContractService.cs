using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public class InvestmentContractService : IInvestmentContractService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = false };
    private readonly IUnitOfWork _uow;
    private readonly IFileStorage _fileStorage;
    private readonly IHtmlToPdfRenderer _pdfRenderer;
    private static readonly ConcurrentDictionary<long, SemaphoreSlim> PdfLocks = new();

    public InvestmentContractService(IUnitOfWork uow, IFileStorage fileStorage, IHtmlToPdfRenderer pdfRenderer)
    {
        _uow = uow;
        _fileStorage = fileStorage;
        _pdfRenderer = pdfRenderer;
    }

    public async Task GenerateForApprovedParticipationAsync(Opportunity opportunity, OpportunityJoinRequest request, DateTime approvedAt, CancellationToken cancellationToken = default)
    {
        if (request.RequestType != OpportunityJoinRequestType.InvestmentParticipation)
            return;

        if (await _uow.Repository<InvestmentContractVersion>().ExistsAsync(v => v.SourceParticipationRequestId == request.Id))
            return;

        var founder = await _uow.Repository<AuthUser>().GetByIdAsync(opportunity.FounderId)
            ?? throw new BusinessValidationException("CONTRACT_FOUNDER_NOT_FOUND", "Contract founder could not be resolved.");
        var investor = await _uow.Repository<AuthUser>().GetByIdAsync(request.InvestorId)
            ?? throw new BusinessValidationException("CONTRACT_INVESTOR_NOT_FOUND", "Contract investor could not be resolved.");

        var contract = await _uow.Repository<InvestmentContract>().GetSingleAsync(c =>
            c.OpportunityId == opportunity.Id && c.FounderUserId == opportunity.FounderId &&
            c.InvestorUserId == request.InvestorId && c.InvestmentModel == opportunity.InvestmentModel,
            c => c.Versions);

        var now = approvedAt;
        var isNewContract = contract == null;
        if (isNewContract)
        {
            contract = new InvestmentContract
            {
                ContractNumber = $"INV-{opportunity.Id}-{request.InvestorId.ToString("N")[..8].ToUpperInvariant()}-1",
                OpportunityId = opportunity.Id,
                FounderUserId = opportunity.FounderId,
                InvestorUserId = request.InvestorId,
                InvestmentModel = opportunity.InvestmentModel,
                Status = InvestmentContractStatus.Active,
                CreatedAt = now,
                UpdatedAt = now
            };
            await _uow.Repository<InvestmentContract>().AddAsync(contract);
        }

        var previous = contract.Versions.SingleOrDefault(v => v.Status == InvestmentContractVersionStatus.Active);
        var versionNumber = contract.CurrentVersionNumber + 1;
        var acceptedOffer = await FindAcceptedOfferAsync(request.SourceConversationId);
        var terms = BuildTermsSnapshot(contract.ContractNumber, versionNumber, opportunity, request, founder, investor, acceptedOffer?.Id, now);
        var changes = previous == null ? null : JsonSerializer.Serialize(new
        {
            PreviousVersion = previous.VersionNumber,
            CurrentVersion = versionNumber,
            PreviousAgreedTerms = JsonDocument.Parse(previous.TermsSnapshotJson).RootElement.GetProperty("sourceAgreedTerms"),
            CurrentAgreedTerms = JsonDocument.Parse(terms).RootElement.GetProperty("sourceAgreedTerms")
        }, JsonOptions);
        var versionType = previous == null ? InvestmentContractVersionType.InitialAgreement : opportunity.InvestmentModel switch
        {
            InvestmentModel.Equity => InvestmentContractVersionType.AdditionalSharePurchase,
            InvestmentModel.LoanInvestment => InvestmentContractVersionType.AdditionalInvestment,
            _ => InvestmentContractVersionType.AdditionalInvestment
        };
        var document = BuildDocument(contract.ContractNumber, versionNumber, opportunity.Title, founder.Name, investor.Name, opportunity.InvestmentModel, terms);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(document))).ToLowerInvariant();

        if (previous != null)
        {
            previous.Status = InvestmentContractVersionStatus.Superseded;
            previous.Events.Add(NewEvent(ContractEventType.Superseded, request.ReviewedByFounderId, "A newer agreement version became active.", now));
            await _uow.Repository<InvestmentContractVersion>().UpdateAsync(previous);
        }

        var version = new InvestmentContractVersion
        {
            Contract = contract,
            VersionNumber = versionNumber,
            VersionType = versionType,
            PreviousVersionId = previous?.Id,
            SourceParticipationRequestId = request.Id,
            SourceNegotiationOfferId = acceptedOffer?.Id,
            Status = InvestmentContractVersionStatus.Active,
            TermsSnapshotJson = terms,
            PreviousTermsSnapshotJson = previous?.TermsSnapshotJson,
            ChangesSnapshotJson = changes,
            DocumentContent = document,
            DocumentHash = hash,
            CreatedAt = now,
            ActivatedAt = now
        };
        version.Events.Add(NewEvent(ContractEventType.Generated, null, "Electronic investment agreement generated from approved participation.", now));
        version.Events.Add(NewEvent(ContractEventType.Activated, request.ReviewedByFounderId, "Agreement version activated automatically on participation approval.", now));
        await _uow.Repository<InvestmentContractVersion>().AddAsync(version);
        contract.CurrentVersionNumber = versionNumber;
        contract.UpdatedAt = now;
        if (!isNewContract)
            await _uow.Repository<InvestmentContract>().UpdateAsync(contract);
    }

    public async Task<IReadOnlyList<InvestmentContractSummaryDto>> GetOpportunityContractsAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default)
    {
        var opportunity = await _uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity not found.");
        var isFounder = opportunity.FounderId == userId;
        var contracts = (await _uow.Repository<InvestmentContract>().FindWithIncludesAsync(
            c => c.OpportunityId == opportunityId && (isFounder || c.InvestorUserId == userId),
            c => c.FounderUser!, c => c.InvestorUser!, c => c.Versions)).ToList();
        if (!isFounder && contracts.Count == 0)
            throw new BusinessValidationException("CONTRACT_ACCESS_DENIED", "Contract access denied.");
        return contracts.OrderByDescending(c => c.UpdatedAt).Select(ToSummary).ToList();
    }

    public async Task<InvestmentContractDetailDto> GetContractAsync(Guid userId, int contractId, CancellationToken cancellationToken = default)
    {
        var contract = await GetAuthorizedContractAsync(userId, contractId);
        var current = contract.Versions.Single(v => v.VersionNumber == contract.CurrentVersionNumber);
        return new InvestmentContractDetailDto(ToSummary(contract), ToVersion(current), contract.Versions.OrderByDescending(v => v.VersionNumber).Select(ToVersionSummary).ToList());
    }

    public async Task<InvestmentContractVersionDto> GetVersionAsync(Guid userId, int contractId, int versionNumber, CancellationToken cancellationToken = default)
    {
        var contract = await GetAuthorizedContractAsync(userId, contractId);
        var version = contract.Versions.SingleOrDefault(v => v.VersionNumber == versionNumber)
            ?? throw new BusinessValidationException("CONTRACT_VERSION_NOT_FOUND", "Contract version not found.");
        return ToVersion(version);
    }

    public async Task<InvestmentContractDocumentDto> GetDocumentAsync(Guid userId, int contractId, int versionNumber, CancellationToken cancellationToken = default)
    {
        var contract = await GetAuthorizedContractAsync(userId, contractId);
        var version = contract.Versions.SingleOrDefault(v => v.VersionNumber == versionNumber)
            ?? throw new BusinessValidationException("CONTRACT_VERSION_NOT_FOUND", "Contract version not found.");
        version.Events.Add(NewEvent(ContractEventType.Viewed, userId, "Contract document viewed.", DateTime.UtcNow));
        await _uow.Repository<InvestmentContractVersion>().UpdateAsync(version);
        await _uow.SaveChangesAsync();
        return new InvestmentContractDocumentDto(contract.ContractNumber, versionNumber, "text/html", version.DocumentContent, version.DocumentHash);
    }

    public async Task<InvestmentContractPdfDto> GetPdfAsync(Guid userId, int contractId, int versionNumber, CancellationToken cancellationToken = default)
    {
        var lockKey = ((long)contractId << 32) | (uint)versionNumber;
        var gate = PdfLocks.GetOrAdd(lockKey, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken);
        try
        {
            var contract = await GetAuthorizedContractAsync(userId, contractId);
            var version = contract.Versions.SingleOrDefault(v => v.VersionNumber == versionNumber)
                ?? throw new BusinessValidationException("CONTRACT_VERSION_NOT_FOUND", "Contract version not found.");
            var fileName = $"{contract.ContractNumber}-V{versionNumber}.pdf";

            if (version.PdfGenerationStatus == PdfGenerationStatus.Ready && !string.IsNullOrWhiteSpace(version.PdfDocumentUrl))
            {
                var stored = await _fileStorage.ReadFileAsync(version.PdfDocumentUrl, cancellationToken);
                EnsureStoredPdfIntegrity(stored, version.PdfDocumentHash);
                return new InvestmentContractPdfDto(fileName, version.PdfMimeType, stored, version.PdfDocumentHash!);
            }

            version.PdfGenerationStatus = PdfGenerationStatus.Generating;
            version.PdfGenerationError = null;
            await _uow.Repository<InvestmentContractVersion>().UpdateAsync(version);
            await _uow.SaveChangesAsync();

            try
            {
                var pdf = await _pdfRenderer.RenderAsync(version.DocumentContent, $"{contract.ContractNumber} - V{versionNumber}", cancellationToken);
                if (pdf.Length < 5 || Encoding.ASCII.GetString(pdf, 0, 5) != "%PDF-")
                    throw new InvalidDataException("Renderer did not return a valid PDF document.");
                var hash = Convert.ToHexString(SHA256.HashData(pdf)).ToLowerInvariant();
                var path = $"contracts/{contract.OpportunityId}/{contract.Id}/v{versionNumber}/{fileName}";
                await using var stream = new MemoryStream(pdf, writable: false);
                var url = await _fileStorage.SaveFileAsync(path, stream, "application/pdf");

                version.PdfDocumentUrl = url;
                version.PdfDocumentHash = hash;
                version.PdfDocumentSize = pdf.LongLength;
                version.PdfGeneratedAt = DateTime.UtcNow;
                version.PdfGenerationStatus = PdfGenerationStatus.Ready;
                version.PdfGenerationError = null;
                version.Events.Add(NewEvent(ContractEventType.Downloaded, userId, "Official PDF generated and downloaded.", DateTime.UtcNow));
                await _uow.Repository<InvestmentContractVersion>().UpdateAsync(version);
                await _uow.SaveChangesAsync();
                return new InvestmentContractPdfDto(fileName, "application/pdf", pdf, hash);
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                version.PdfGenerationStatus = PdfGenerationStatus.Failed;
                version.PdfGenerationError = SafePdfError(ex);
                await _uow.Repository<InvestmentContractVersion>().UpdateAsync(version);
                await _uow.SaveChangesAsync();
                throw new BusinessValidationException("PDF_GENERATION_FAILED", "The official PDF could not be generated. The HTML agreement remains available.");
            }
        }
        finally
        {
            gate.Release();
        }
    }

    private async Task<InvestmentContract> GetAuthorizedContractAsync(Guid userId, int contractId)
    {
        var contract = await _uow.Repository<InvestmentContract>().GetSingleAsync(c => c.Id == contractId,
            c => c.FounderUser!, c => c.InvestorUser!, c => c.Versions);
        if (contract == null) throw new BusinessValidationException("CONTRACT_NOT_FOUND", "Contract not found.");
        if (contract.FounderUserId != userId && contract.InvestorUserId != userId)
            throw new BusinessValidationException("CONTRACT_ACCESS_DENIED", "Contract access denied.");
        return contract;
    }

    private async Task<NegotiationOffer?> FindAcceptedOfferAsync(Guid? conversationId)
    {
        if (!conversationId.HasValue) return null;
        return (await _uow.Repository<NegotiationOffer>().FindAsync(o => o.ConversationId == conversationId && o.Status == NegotiationOfferStatus.Accepted))
            .OrderByDescending(o => o.Version).FirstOrDefault();
    }

    private static string BuildTermsSnapshot(string number, int version, Opportunity opportunity, OpportunityJoinRequest request, AuthUser founder, AuthUser investor, int? offerId, DateTime generatedAt)
    {
        using var source = JsonDocument.Parse(request.TermsSnapshotJson ?? "{}");
        return JsonSerializer.Serialize(new
        {
            contractNumber = number, versionNumber = version, opportunityId = opportunity.Id, opportunityTitle = opportunity.Title,
            founder = new { userId = founder.Id, partyRole = "Founder", displayName = founder.Name, snapshotAt = generatedAt },
            investor = new { userId = investor.Id, partyRole = "Investor", displayName = investor.Name, snapshotAt = generatedAt },
            investmentModel = opportunity.InvestmentModel.ToString(), currency = ReadCurrency(source.RootElement),
            loanTerms = opportunity.InvestmentModel == InvestmentModel.LoanInvestment ? new
            {
                interestRate = opportunity.InterestRate,
                repaymentFrequency = opportunity.RepaymentFrequency,
                finalRepaymentDate = opportunity.FinalRepaymentDate,
                expectedDurationMonths = opportunity.ExpectedDurationMonths
            } : null,
            participationRequestId = request.Id, acceptedOfferId = offerId, investorSubmittedAt = request.CreatedAt,
            founderApprovedAt = request.ReviewedAt ?? generatedAt, generatedAt,
            sourceAgreedTerms = source.RootElement.Clone(),
            platformDisclaimer = "Investa CREDIT is a platform service balance only and is unrelated to investment value, share price, shares, loan principal, or contribution amount."
        }, JsonOptions);
    }

    private static string ReadCurrency(JsonElement source) =>
        source.TryGetProperty("CurrencySnapshot", out var value) || source.TryGetProperty("currencySnapshot", out value) ? value.GetString() ?? "Unspecified" : "Unspecified";

    private static string BuildDocument(string number, int version, string title, string founder, string investor, InvestmentModel model, string terms) =>
        $"<!doctype html><html><head><meta charset=\"utf-8\"><title>{WebUtility.HtmlEncode(number)} v{version}</title></head><body><h1>Electronic Investment Agreement</h1><dl><dt>Contract</dt><dd>{WebUtility.HtmlEncode(number)}</dd><dt>Version</dt><dd>{version}</dd><dt>Opportunity</dt><dd>{WebUtility.HtmlEncode(title)}</dd><dt>Founder</dt><dd>{WebUtility.HtmlEncode(founder)}</dd><dt>Investor</dt><dd>{WebUtility.HtmlEncode(investor)}</dd><dt>Investment model</dt><dd>{model}</dd></dl><h2>Immutable agreed terms record</h2><pre>{WebUtility.HtmlEncode(terms)}</pre></body></html>";

    private static ContractEvent NewEvent(ContractEventType type, Guid? userId, string description, DateTime at) => new() { EventType = type, PerformedByUserId = userId, Description = description, CreatedAt = at };
    private static InvestmentContractSummaryDto ToSummary(InvestmentContract c) => new(c.Id, c.ContractNumber, c.FounderUser?.Name ?? string.Empty, c.InvestorUser?.Name ?? string.Empty, c.InvestmentModel, c.CurrentVersionNumber, c.Status, c.Versions.Max(v => v.ActivatedAt ?? v.CreatedAt), c.Versions.Count);
    private static InvestmentContractVersionSummaryDto ToVersionSummary(InvestmentContractVersion v) => new(v.VersionNumber, v.VersionType, v.Status, v.CreatedAt, v.ActivatedAt, v.DocumentHash);
    private static void EnsureStoredPdfIntegrity(byte[] pdf, string? expectedHash)
    {
        var actual = Convert.ToHexString(SHA256.HashData(pdf)).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(expectedHash) || !CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(actual), Encoding.ASCII.GetBytes(expectedHash)))
            throw new BusinessValidationException("PDF_INTEGRITY_FAILED", "Stored contract PDF failed integrity verification.");
    }

    private static string SafePdfError(Exception ex) => ex.GetType().Name + ": " + (ex.Message.Length <= 900 ? ex.Message : ex.Message[..900]);
    private static InvestmentContractVersionDto ToVersion(InvestmentContractVersion v) => new(v.VersionNumber, v.VersionType, v.Status, v.TermsSnapshotJson, v.PreviousTermsSnapshotJson, v.ChangesSnapshotJson, v.DocumentHash, v.CreatedAt, v.ActivatedAt, !string.IsNullOrWhiteSpace(v.DocumentContent), v.PdfGenerationStatus, v.PdfGenerationStatus == PdfGenerationStatus.Ready, v.PdfGeneratedAt, v.PdfDocumentHash, v.PdfDocumentSize);
}
