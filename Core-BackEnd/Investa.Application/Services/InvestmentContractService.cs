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
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public class InvestmentContractService : IInvestmentContractService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = false };
    private readonly IUnitOfWork _uow;
    private readonly IFileStorage _fileStorage;
    private readonly IHtmlToPdfRenderer _pdfRenderer;
    private readonly IEmailService? _emailService;
    private readonly ILogger<InvestmentContractService> _logger;
    private static readonly ConcurrentDictionary<long, SemaphoreSlim> PdfLocks = new();

    public InvestmentContractService(
        IUnitOfWork uow,
        IFileStorage fileStorage,
        IHtmlToPdfRenderer pdfRenderer,
        ILogger<InvestmentContractService> logger,
        IEmailService? emailService = null)
    {
        _uow = uow;
        _fileStorage = fileStorage;
        _pdfRenderer = pdfRenderer;
        _logger = logger;
        _emailService = emailService;
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

        var participationModel = ResolveParticipationInvestmentModel(request, opportunity.InvestmentModel);
        var now = approvedAt;
        var contract = new InvestmentContract
        {
            ContractNumber = $"INV-{opportunity.Id}-{request.Id}-{request.InvestorId.ToString("N")[..8].ToUpperInvariant()}",
            OpportunityId = opportunity.Id,
            FounderUserId = opportunity.FounderId,
            InvestorUserId = request.InvestorId,
            InvestmentModel = participationModel,
            Status = InvestmentContractStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };
        await _uow.Repository<InvestmentContract>().AddAsync(contract);

        const int versionNumber = 1;
        var acceptedOffer = await FindAcceptedOfferAsync(request.SourceConversationId, request.AcceptedOfferId);
        var exchangeRateSnapshot = request.ExchangeRateSnapshotId.HasValue
            ? await _uow.Repository<ExchangeRateSnapshot>().GetByIdAsync(request.ExchangeRateSnapshotId.Value)
            : null;
        if (request.ExchangeRateSnapshotId.HasValue && exchangeRateSnapshot == null)
            throw new BusinessValidationException("FX_SNAPSHOT_NOT_FOUND", "The participation exchange-rate snapshot could not be resolved.");
        var terms = BuildTermsSnapshot(contract.ContractNumber, versionNumber, opportunity, request, founder, investor, acceptedOffer?.Id, exchangeRateSnapshot, now);
        const InvestmentContractVersionType versionType = InvestmentContractVersionType.InitialAgreement;
        var document = BuildDocument(contract.ContractNumber, versionNumber, opportunity.Title, founder.Name, investor.Name, participationModel, terms);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(document))).ToLowerInvariant();

        var version = new InvestmentContractVersion
        {
            Contract = contract,
            VersionNumber = versionNumber,
            VersionType = versionType,
            PreviousVersionId = null,
            SourceParticipationRequestId = request.Id,
            SourceNegotiationOfferId = acceptedOffer?.Id,
            Status = InvestmentContractVersionStatus.Active,
            TermsSnapshotJson = terms,
            PreviousTermsSnapshotJson = null,
            ChangesSnapshotJson = null,
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
        ProjectActivityTimeline.Add(
            opportunity.Events,
            opportunity.Id,
            ProjectActivityTimeline.Types.ContractActivated,
            "System",
            opportunity.FounderId,
            now,
            "InvestmentContractVersion",
            request.Id.ToString(),
            $"contract-activated:participation:{request.Id}",
            new Dictionary<string, string?> { ["versionNumber"] = versionNumber.ToString() });
    }

    public async Task<IReadOnlyList<InvestmentContractSummaryDto>> GetOpportunityContractsAsync(Guid userId, int opportunityId, CancellationToken cancellationToken = default, bool isAdmin = false)
    {
        var opportunity = await _uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity not found.");
        var isFounder = opportunity.FounderId == userId;
        var contracts = (await _uow.Repository<InvestmentContract>().FindWithIncludesAsync(
            c => c.OpportunityId == opportunityId && (isAdmin || isFounder || c.InvestorUserId == userId),
            c => c.FounderUser!, c => c.InvestorUser!, c => c.Versions)).ToList();
        if (!isAdmin && !isFounder && contracts.Count == 0)
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
        var displayDocument = BuildDocument(contract.ContractNumber, versionNumber,
            contract.Opportunity?.Title ?? string.Empty, contract.FounderUser?.Name ?? string.Empty,
            contract.InvestorUser?.Name ?? string.Empty, contract.InvestmentModel, version.TermsSnapshotJson);
        var displayHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(displayDocument))).ToLowerInvariant();
        return new InvestmentContractDocumentDto(contract.ContractNumber, versionNumber, "text/html", displayDocument, displayHash);
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
            var fileName = $"{contract.ContractNumber}-V{versionNumber}-design-v2.pdf";

            if (version.PdfGenerationStatus == PdfGenerationStatus.Ready &&
                !string.IsNullOrWhiteSpace(version.PdfDocumentUrl) &&
                version.PdfDocumentUrl.Contains("-design-v2.pdf", StringComparison.OrdinalIgnoreCase))
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
                var displayDocument = BuildDocument(contract.ContractNumber, versionNumber,
                    contract.Opportunity?.Title ?? string.Empty, contract.FounderUser?.Name ?? string.Empty,
                    contract.InvestorUser?.Name ?? string.Empty, contract.InvestmentModel, version.TermsSnapshotJson);
                var pdf = await _pdfRenderer.RenderAsync(displayDocument, $"{contract.ContractNumber} - V{versionNumber}", cancellationToken);
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
                _logger.LogError(
                    "Contract PDF generation failed. contractId={ContractId} version={VersionNumber} errorType={ErrorType} reason={Reason}",
                    contractId,
                    versionNumber,
                    ex.GetType().Name,
                    version.PdfGenerationError);
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

    public async Task<EmailInvestmentContractResultDto> EmailContractAsync(
        Guid userId,
        int contractId,
        int versionNumber,
        string language,
        Guid operationId,
        CancellationToken cancellationToken = default)
    {
        var contract = await GetAuthorizedContractAsync(userId, contractId);
        var version = contract.Versions.SingleOrDefault(v => v.VersionNumber == versionNumber)
            ?? throw new BusinessValidationException("CONTRACT_VERSION_NOT_FOUND", "Contract version not found.");
        var user = contract.FounderUserId == userId ? contract.FounderUser : contract.InvestorUser;
        if (user == null || !user.IsEmailVerified || string.IsNullOrWhiteSpace(user.Email))
            throw new BusinessValidationException("EMAIL_NOT_VERIFIED", "Please verify your email address before sending the contract.");

        var existing = (await _uow.Repository<EmailOutbox>().FindAsync(x => x.CorrelationId == operationId)).SingleOrDefault();
        if (existing != null)
            return new EmailInvestmentContractResultDto(existing.Id, operationId);

        if (_emailService == null)
            throw new InvalidOperationException("Email service is not configured.");

        var pdf = await GetPdfAsync(userId, contractId, versionNumber, cancellationToken);
        var isArabic = language.Equals("ar", StringComparison.OrdinalIgnoreCase);
        var opportunityTitle = contract.Opportunity?.Title ?? "Investment Opportunity";
        var subject = isArabic
            ? $"عقدك على FOPX One — {opportunityTitle}"
            : $"Your FOPX One Contract — {opportunityTitle}";
        var description = isArabic
            ? $"مرفق بهذه الرسالة عقد الاستثمار الخاص بك لفرصة:\n“{opportunityTitle}”\n\nرقم العقد:\n{contract.ContractNumber}\n\nالإصدار:\n{versionNumber}\n\nهذا هو نفس العقد المتاح داخل غرفة المشروع."
            : $"Your investment contract for “{opportunityTitle}” is attached to this email.\n\nContract reference:\n{contract.ContractNumber}\n\nVersion:\n{versionNumber}\n\nThis is the same contract available in your Project Room.";
        var fileName = $"FOPX-One-Contract-{contract.ContractNumber}-v{versionNumber}.pdf";
        var outboxId = await _emailService.SendTemplatedEmailAsync(new SendTemplatedEmailRequest
        {
            Recipient = user.Email.Trim(),
            TemplateName = "investment-contract",
            CorrelationId = operationId,
            Category = EmailCategory.System,
            Model = new EmailTemplateModel
            {
                RecipientDisplayName = user.Name,
                Language = isArabic ? "ar" : "en",
                Title = subject,
                Description = description,
                StatusLabel = isArabic ? "عقد الاستثمار" : "Investment contract",
                CardLabel = isArabic ? "رقم العقد / الإصدار" : "Contract reference / Version",
                CardValue = $"{contract.ContractNumber} / V{versionNumber}",
                CtaText = isArabic ? "فتح غرفة المشروع" : "Open Project Room",
                CtaUrl = "#",
                PlainTextFallback = description,
                Preheader = subject
            },
            Attachments =
            [
                new EmailAttachment
                {
                    FileName = fileName,
                    ContentType = "application/pdf",
                    Content = pdf.Content
                }
            ]
        }, cancellationToken);

        var requestedAt = DateTime.UtcNow;
        version.Events.Add(new ContractEvent
        {
            EventType = ContractEventType.ContractEmailed,
            PerformedByUserId = userId,
            Description = "Contract email queued for the requesting contract party.",
            MetadataJson = JsonSerializer.Serialize(new
            {
                ContractId = contract.Id,
                VersionId = version.Id,
                VersionNumber = version.VersionNumber,
                RequestedByUserId = userId,
                RecipientUserId = userId,
                RequestedAtUtc = requestedAt,
                EmailOutboxId = outboxId,
                DeliveryStatusReference = EmailOutboxStatus.Queued
            }, JsonOptions),
            CreatedAt = requestedAt
        });
        await _uow.Repository<InvestmentContractVersion>().UpdateAsync(version);
        await _uow.SaveChangesAsync();
        return new EmailInvestmentContractResultDto(outboxId, operationId);
    }

    private async Task<InvestmentContract> GetAuthorizedContractAsync(Guid userId, int contractId)
    {
        var contract = await _uow.Repository<InvestmentContract>().GetSingleAsync(c => c.Id == contractId,
            c => c.FounderUser!, c => c.InvestorUser!, c => c.Opportunity!, c => c.Versions);
        if (contract == null) throw new BusinessValidationException("CONTRACT_NOT_FOUND", "Contract not found.");
        if (contract.FounderUserId != userId && contract.InvestorUserId != userId)
            throw new BusinessValidationException("CONTRACT_ACCESS_DENIED", "Contract access denied.");
        return contract;
    }

    private async Task<NegotiationOffer?> FindAcceptedOfferAsync(Guid? conversationId, int? offerId)
    {
        if (offerId.HasValue)
            return (await _uow.Repository<NegotiationOffer>().FindAsync(o => o.Id == offerId && o.Status == NegotiationOfferStatus.Accepted)).FirstOrDefault();
        if (!conversationId.HasValue) return null;
        return (await _uow.Repository<NegotiationOffer>().FindAsync(o => o.ConversationId == conversationId && o.Status == NegotiationOfferStatus.Accepted))
            .OrderByDescending(o => o.Version).FirstOrDefault();
    }

    private static string BuildTermsSnapshot(string number, int version, Opportunity opportunity, OpportunityJoinRequest request, AuthUser founder, AuthUser investor, int? offerId, ExchangeRateSnapshot? exchangeRateSnapshot, DateTime generatedAt)
    {
        using var source = JsonDocument.Parse(request.TermsSnapshotJson ?? "{}");
        return JsonSerializer.Serialize(new
        {
            contractNumber = number, versionNumber = version, opportunityId = opportunity.Id, opportunityTitle = opportunity.Title,
            founder = new { userId = founder.Id, partyRole = "Founder", displayName = founder.Name, snapshotAt = generatedAt },
            investor = new { userId = investor.Id, partyRole = "Investor", displayName = investor.Name, snapshotAt = generatedAt },
            investmentModel = ResolveParticipationInvestmentModel(request, opportunity.InvestmentModel).ToString(), currency = ReadCurrency(source.RootElement, request.FundingCurrency ?? opportunity.FundingCurrency),
            fxExecution = new
            {
                enteredAmount = request.EnteredAmount,
                enteredCurrency = request.EnteredCurrency,
                officialFundingAmount = request.FundingAmount,
                officialFundingCurrency = request.FundingCurrency,
                exchangeRate = exchangeRateSnapshot?.ExchangeRate,
                executionTimestamp = exchangeRateSnapshot?.RateTimestamp
            },
            loanTerms = ResolveParticipationInvestmentModel(request, opportunity.InvestmentModel) == InvestmentModel.LoanInvestment ? new
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

    private static string ReadCurrency(JsonElement source, string? fallback)
    {
        if (source.ValueKind == JsonValueKind.Object
            && (source.TryGetProperty("CurrencySnapshot", out var value)
                || source.TryGetProperty("currencySnapshot", out value)))
        {
            return value.ValueKind == JsonValueKind.String
                ? value.GetString() ?? fallback ?? "Unspecified"
                : value.ToString();
        }

        return string.IsNullOrWhiteSpace(fallback) ? "Unspecified" : fallback;
    }

    private static InvestmentModel ResolveParticipationInvestmentModel(OpportunityJoinRequest request, InvestmentModel fallback)
    {
        var terms = TermsSnapshotParser.Parse(request.TermsSnapshotJson).Normalized;
        if (terms is not { ValueKind: JsonValueKind.Object }) return fallback;

        string? Read(params string[] names)
        {
            foreach (var property in terms.Value.EnumerateObject())
                if (names.Any(name => string.Equals(name, property.Name, StringComparison.OrdinalIgnoreCase)))
                    return property.Value.ToString();
            return null;
        }

        var legType = Read("legTypeName");
        var raw = !string.IsNullOrWhiteSpace(legType) ? legType : Read("InvestmentModel", "investmentModel");
        if (string.IsNullOrWhiteSpace(raw)) return fallback;
        if (string.IsNullOrWhiteSpace(legType) && int.TryParse(raw, out var numeric) && Enum.IsDefined(typeof(InvestmentModel), numeric))
            return (InvestmentModel)numeric;

        var normalized = raw.Replace(" ", string.Empty, StringComparison.Ordinal)
            .Replace("_", string.Empty, StringComparison.Ordinal)
            .Replace("-", string.Empty, StringComparison.Ordinal)
            .ToLowerInvariant();
        if (normalized.Contains("loan")) return InvestmentModel.LoanInvestment;
        if (normalized.Contains("profit")) return InvestmentModel.CapitalContributionProfitSharing;
        if (normalized.Contains("equity")) return InvestmentModel.Equity;
        return fallback;
    }

    private static string BuildDocument(string number, int version, string title, string founder, string investor, InvestmentModel model, string terms)
    {
        using var snapshot = JsonDocument.Parse(string.IsNullOrWhiteSpace(terms) ? "{}" : terms);
        var root = snapshot.RootElement;
        var approvedAt = ReadJsonText(root, "founderApprovedAt");
        var currency = ReadJsonText(root, "currency");
        var fx = root.TryGetProperty("fxExecution", out var fxExecution) ? fxExecution : default;
        var enteredAmount = ReadJsonText(fx, "enteredAmount");
        var enteredCurrency = ReadJsonText(fx, "enteredCurrency");
        var fundingAmount = ReadJsonText(fx, "officialFundingAmount");
        var fundingCurrency = ReadJsonText(fx, "officialFundingCurrency");
        var exchangeRate = ReadJsonText(fx, "exchangeRate");
        var executionTimestamp = ReadJsonText(fx, "executionTimestamp");
        var agreedTerms = root.TryGetProperty("sourceAgreedTerms", out var source) ? source : default;
        var termRows = new StringBuilder();
        if (agreedTerms.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in agreedTerms.EnumerateObject())
            {
                termRows.Append("<div class=\"term-row\"><span>")
                    .Append(WebUtility.HtmlEncode(Humanize(property.Name)))
                    .Append("</span><strong>")
                    .Append(WebUtility.HtmlEncode(FormatJsonValue(property.Value)))
                    .Append("</strong></div>");
            }
        }
        if (termRows.Length == 0)
            termRows.Append("<p class=\"empty\">No additional negotiated terms were recorded.</p>");

        string E(string value) => WebUtility.HtmlEncode(value);
        return $$$"""
        <!doctype html><html lang="en" dir="ltr" data-template-version="2"><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{{{E(number)}}} v{{{version}}}</title>
        <style>
        :root{color-scheme:light;--ink:#172033;--muted:#667085;--line:#dfe4ea;--soft:#f6f8fa;--brand:#173d35;--accent:#c9a96e}
        *{box-sizing:border-box}html,body{margin:0;padding:0;background:#eef1f4;color:var(--ink);font-family:Arial,"Segoe UI",sans-serif;line-height:1.5}body{padding:24px}
        .contract{width:min(900px,100%);margin:0 auto;background:#fff;border:1px solid var(--line);box-shadow:0 12px 36px rgba(16,24,40,.09)}
        .brand-bar{height:8px;background:linear-gradient(90deg,var(--brand),#275f53 70%,var(--accent))}
        header{padding:34px 42px 28px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
        .brand-mark{font-size:26px;font-weight:800;letter-spacing:-.7px;color:var(--brand)}.brand-mark b{color:var(--accent)}
        .tagline{margin-top:3px;color:var(--muted);font-size:10px;letter-spacing:1.5px;text-transform:uppercase}.doc-meta{text-align:right}
        .eyebrow{color:var(--accent);font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase}
        h1{margin:7px 0 3px;font-size:23px;line-height:1.2}.reference{color:var(--muted);font-size:12px}main{padding:30px 42px 38px}
        .intro{margin:0 0 24px;color:#475467;font-size:13px}h2{margin:26px 0 12px;padding-bottom:8px;border-bottom:2px solid var(--brand);font-size:14px;color:var(--brand)}
        .overview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:8px;overflow:hidden}
        .field{min-height:72px;padding:13px 15px;background:#fff}.field.wide{grid-column:1/-1}
        .field span,.term-row span{display:block;margin-bottom:4px;color:var(--muted);font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase}
        .field strong{display:block;font-size:13px;overflow-wrap:anywhere}.parties{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .party{padding:16px;border:1px solid var(--line);border-radius:8px;background:var(--soft)}.party small{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.8px}
        .party strong{display:block;margin-top:5px;font-size:14px}.terms{border:1px solid var(--line);border-radius:8px;overflow:hidden}
        .term-row{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(0,1.2fr);gap:18px;padding:11px 14px;border-bottom:1px solid var(--line)}
        .term-row:last-child{border-bottom:0}.term-row span{margin:0}.term-row strong{font-size:12px;font-weight:600;text-align:right;overflow-wrap:anywhere}
        .empty{margin:0;padding:14px;color:var(--muted);font-size:12px}.ack{padding:15px 17px;border-left:4px solid var(--accent);background:#fbf8f1;color:#475467;font-size:12px}
        .signatures{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:34px}.signature{padding-top:26px;border-top:1px solid #98a2b3}
        .signature strong,.signature span{display:block}.signature strong{font-size:12px}.signature span{margin-top:3px;color:var(--muted);font-size:10px}
        footer{padding:15px 42px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:16px;color:var(--muted);font-size:9px}
        @media(max-width:640px){body{padding:0}.contract{border:0;box-shadow:none}header{padding:24px;display:block}.doc-meta{margin-top:20px;text-align:left}main{padding:24px}.overview,.parties,.signatures{grid-template-columns:1fr}.field.wide{grid-column:auto}.term-row{grid-template-columns:1fr;gap:4px}.term-row strong{text-align:left}footer{padding:14px 24px;display:block}}
        @media print{@page{size:A4;margin:0}html,body{background:#fff}body{padding:0}.contract{width:100%;border:0;box-shadow:none}h2,.party,.terms,.ack,.signatures{break-inside:avoid}}
        </style></head><body><article class="contract"><div class="brand-bar"></div><header><div>
        <div class="brand-mark">FOPX <b>One</b></div><div class="tagline">Founder • Opportunity • Partner</div></div>
        <div class="doc-meta"><div class="eyebrow">Official agreement</div><h1>Electronic Investment Agreement</h1><div class="reference">{{{E(number)}}} · Version {{{version}}}</div></div>
        </header><main><p class="intro">This agreement records the approved participation terms between the parties below through the FOPX One platform.</p>
        <section><h2>Agreement overview</h2><div class="overview">
        <div class="field wide"><span>Opportunity</span><strong>{{{E(title)}}}</strong></div>
        <div class="field"><span>Contract reference</span><strong>{{{E(number)}}}</strong></div>
        <div class="field"><span>Effective date</span><strong>{{{E(FormatContractDate(approvedAt))}}}</strong></div>
        <div class="field"><span>Investment model</span><strong>{{{E(Humanize(model.ToString()))}}}</strong></div>
        <div class="field"><span>Currency</span><strong>{{{E(string.IsNullOrWhiteSpace(currency) ? "—" : currency)}}}</strong></div>
        <div class="field"><span>Entered Amount + Currency</span><strong>{{{E($"{enteredAmount} {enteredCurrency}".Trim())}}}</strong></div>
        <div class="field"><span>Official Funding Amount + Currency</span><strong>{{{E($"{fundingAmount} {fundingCurrency}".Trim())}}}</strong></div>
        <div class="field"><span>Exchange Rate</span><strong>{{{E(string.IsNullOrWhiteSpace(exchangeRate) ? "—" : exchangeRate)}}}</strong></div>
        <div class="field"><span>Execution Timestamp</span><strong>{{{E(FormatContractTimestamp(executionTimestamp))}}}</strong></div></div></section>
        <section><h2>Contracting parties</h2><div class="parties"><div class="party"><small>Founder</small><strong>{{{E(founder)}}}</strong></div>
        <div class="party"><small>Investor / Partner</small><strong>{{{E(investor)}}}</strong></div></div></section>
        <section><h2>Approved participation terms</h2><div class="terms">{{{termRows}}}</div></section>
        <section><h2>Electronic acknowledgement</h2><div class="ack">The parties acknowledge that these terms reflect the participation approved on the FOPX One platform. The immutable version record and document hash provide the electronic audit reference for this agreement.</div>
        <div class="signatures"><div class="signature"><strong>{{{E(founder)}}}</strong><span>Founder · Electronically acknowledged</span></div>
        <div class="signature"><strong>{{{E(investor)}}}</strong><span>Investor / Partner · Electronically acknowledged</span></div></div></section>
        </main><footer><span>FOPX One · Founder • Opportunity • Partner</span><span>{{{E(number)}}} · V{{{version}}}</span></footer></article></body></html>
        """;
    }

    private static string ReadJsonText(JsonElement source, string propertyName) =>
        source.ValueKind == JsonValueKind.Object && source.TryGetProperty(propertyName, out var value)
            ? value.ValueKind == JsonValueKind.String ? value.GetString() ?? string.Empty : value.ToString()
            : string.Empty;

    private static string FormatContractDate(string raw) =>
        DateTimeOffset.TryParse(raw, out var date) ? date.ToString("dd MMMM yyyy") : "—";

    private static string FormatContractTimestamp(string raw) =>
        DateTimeOffset.TryParse(raw, out var date) ? date.ToString("dd MMMM yyyy HH:mm:ss 'UTC'") : "—";

    private static string Humanize(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "—";
        var result = new StringBuilder(value.Length + 8);
        for (var i = 0; i < value.Length; i++)
        {
            var current = value[i];
            if (i > 0 && char.IsUpper(current) && !char.IsUpper(value[i - 1])) result.Append(' ');
            result.Append(i == 0 ? char.ToUpperInvariant(current) : current);
        }
        return result.ToString().Replace('_', ' ');
    }

    private static string FormatJsonValue(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.String => value.GetString() ?? "—",
        JsonValueKind.Number => value.TryGetDecimal(out var number) ? number.ToString("N2") : value.ToString(),
        JsonValueKind.True => "Yes",
        JsonValueKind.False => "No",
        JsonValueKind.Null or JsonValueKind.Undefined => "—",
        JsonValueKind.Array => string.Join(", ", value.EnumerateArray().Select(FormatJsonValue)),
        JsonValueKind.Object => string.Join(" · ", value.EnumerateObject().Select(p => $"{Humanize(p.Name)}: {FormatJsonValue(p.Value)}")),
        _ => value.ToString()
    };

    private static ContractEvent NewEvent(ContractEventType type, Guid? userId, string description, DateTime at) => new() { EventType = type, PerformedByUserId = userId, Description = description, CreatedAt = at };
    private static InvestmentContractSummaryDto ToSummary(InvestmentContract c) => new(c.Id, c.ContractNumber, c.InvestorUserId, c.FounderUser?.Name ?? string.Empty, c.InvestorUser?.Name ?? string.Empty, c.InvestmentModel, c.CurrentVersionNumber, c.Status, c.Versions.Max(v => v.ActivatedAt ?? v.CreatedAt), c.Versions.Count);
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
