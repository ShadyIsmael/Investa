using System.Text.Json;
using System.Globalization;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

public sealed class LoanObligationService(IUnitOfWork uow, ILogger<LoanObligationService> logger) : ILoanObligationService
{
    public async Task<LoanObligation?> EnsureActivatedForConfirmedFundingAsync(
        int participationRequestId,
        Guid activatedByUserId,
        CancellationToken cancellationToken = default)
    {
        var participation = await uow.Repository<OpportunityJoinRequest>().GetByIdAsync(participationRequestId);
        if (participation is null
            || participation.RequestType != OpportunityJoinRequestType.InvestmentParticipation
            || participation.Status != OpportunityJoinRequestStatus.Approved)
            return null;

        var contractCommittedAmount = participation.FundingAmount ?? participation.RequestedAmount ?? 0m;
        if (contractCommittedAmount <= 0m)
            return null;

        var declarations = await uow.Repository<FundingDeclaration>().FindAsync(x => x.ParticipationId == participationRequestId);
        var confirmedAmount = FundingSemantics.SumConfirmed(declarations);
        if (confirmedAmount <= 0m)
            return null;

        var contract = await uow.Repository<InvestmentContract>().GetSingleAsync(
            x => x.ParticipationRequestId == participationRequestId && x.Status == InvestmentContractStatus.Active,
            x => x.Versions);
        if (contract is null || !contract.AcceptedOfferId.HasValue || !contract.AcceptedOfferVersionNumber.HasValue)
            return null;

        var contractVersion = contract.Versions
            .Where(x => x.VersionNumber == contract.CurrentVersionNumber && x.Status == InvestmentContractVersionStatus.Active)
            .SingleOrDefault();
        if (contractVersion is null)
            return null;

        var acceptedOffer = await uow.Repository<NegotiationOffer>().GetSingleAsync(
            x => x.Id == contract.AcceptedOfferId.Value && x.Status == NegotiationOfferStatus.Accepted,
            x => x.Legs);
        if (acceptedOffer is null || acceptedOffer.OpportunityId != contract.OpportunityId || acceptedOffer.Version != contract.AcceptedOfferVersionNumber.Value)
            return null;

        var loanLegs = acceptedOffer.Legs.Where(x => x.LegType == NegotiationOfferLegType.Loan).OrderBy(x => x.Id).ToList();
        if (loanLegs.Count != 1)
        {
            logger.LogWarning("Loan obligation activation skipped for participation {ParticipationId}: exactly one Loan OfferLeg is required.", participationRequestId);
            return null;
        }

        var loanLeg = loanLegs[0];
        var snapshot = ReadContractSnapshot(contractVersion.TermsSnapshotJson, acceptedOffer, loanLeg);
        var confirmedForLeg = await ConfirmedAmountForLegAsync(participationRequestId, declarations, loanLeg.Id, acceptedOffer.Legs.Count == 1 ? confirmedAmount : 0m);
        var committedAmount = loanLeg.Amount;
        if (confirmedForLeg <= 0m)
            return null;
        var repaymentModel = RepaymentModelCatalog.NormalizeOrThrow(snapshot.RepaymentModel);
        if (snapshot.Principal <= 0m
            || snapshot.InterestRate <= 0m
            || snapshot.TermMonths <= 0
            || string.IsNullOrWhiteSpace(snapshot.Currency)
            || snapshot.ContractualStartDate == default
            || snapshot.ContractualMaturityDate <= snapshot.ContractualStartDate)
            throw new BusinessValidationException("LOAN_CONTRACT_TERMS_INVALID", "The immutable Loan contract snapshot does not contain valid principal, currency, interest rate, term, and contractual date values.");

        var calculation = LoanCashFlowCalculator.Calculate(
            participation.Id,
            contract.OpportunityId,
            contract.OpportunityTitleSnapshot,
            snapshot.Currency,
            snapshot.Principal,
            snapshot.InterestRate,
            snapshot.TermMonths,
            repaymentModel,
            snapshot.ContractualStartDate,
            snapshot.ContractualMaturityDate);

        var now = DateTime.UtcNow;
        var isFullyConfirmed = confirmedForLeg >= committedAmount;
        var existingForLeg = await uow.Repository<LoanObligation>().GetSingleAsync(
            x => x.ParticipationRequestId == participationRequestId && x.OfferLegId == loanLeg.Id,
            x => x.Installments);
        if (existingForLeg is not null)
        {
            if (existingForLeg.Status == LoanObligationStatus.PendingFunding && isFullyConfirmed)
            {
                existingForLeg.Status = LoanObligationStatus.Active;
                existingForLeg.ActivatedAt = now;
                if (existingForLeg.Installments.Count == 0)
                    AddInstallments(existingForLeg, calculation.Payments, snapshot.Currency, now);

                await uow.Repository<AuditLog>().AddAsync(BuildAudit(
                    activatedByUserId,
                    "Activate",
                    existingForLeg,
                    participationRequestId,
                    contract,
                    contractVersion,
                    acceptedOffer,
                    loanLeg,
                    snapshot,
                    repaymentModel,
                    confirmedForLeg,
                    now));
            }
            return existingForLeg;
        }

        var obligation = new LoanObligation
        {
            ParticipationRequestId = participationRequestId,
            ContractId = contract.Id,
            ContractVersionId = contractVersion.Id,
            AcceptedOfferId = acceptedOffer.Id,
            AcceptedOfferVersionNumber = acceptedOffer.Version,
            OfferLegId = loanLeg.Id,
            OfferLegNumber = snapshot.LegNumber,
            FounderUserId = contract.FounderUserId,
            InvestorUserId = contract.InvestorUserId,
            Principal = snapshot.Principal,
            Currency = snapshot.Currency,
            InterestRate = snapshot.InterestRate,
            TermMonths = snapshot.TermMonths,
            RepaymentModel = repaymentModel,
            PrincipalRepaymentMethod = LoanPrincipalRepaymentMethod.AtMaturity,
            ContractualStartDate = snapshot.ContractualStartDate,
            ContractualMaturityDate = snapshot.ContractualMaturityDate,
            Status = isFullyConfirmed ? LoanObligationStatus.Active : LoanObligationStatus.PendingFunding,
            ActivatedAt = now,
            CreatedAt = now
        };

        if (isFullyConfirmed)
            AddInstallments(obligation, calculation.Payments, snapshot.Currency, now);

        await uow.Repository<LoanObligation>().AddAsync(obligation);
        await uow.Repository<AuditLog>().AddAsync(BuildAudit(
            activatedByUserId,
            isFullyConfirmed ? "Activate" : "CreatePendingFunding",
            obligation,
            participationRequestId,
            contract,
            contractVersion,
            acceptedOffer,
            loanLeg,
            snapshot,
            repaymentModel,
            confirmedForLeg,
            now));

        return obligation;
    }

    private async Task<decimal> ConfirmedAmountForLegAsync(int participationId, IEnumerable<FundingDeclaration> declarations, int offerLegId, decimal legacySingleLegAmount)
    {
        var allocations = await uow.Repository<FundingDeclarationLegAllocation>().FindAsync(x => x.ParticipationId == participationId && x.OfferLegId == offerLegId);
        if (!allocations.Any())
            return legacySingleLegAmount;
        var confirmedIds = declarations.Where(x => x.Status == FundingDeclarationStatus.Confirmed).Select(x => x.Id).ToHashSet();
        return allocations.Where(x => confirmedIds.Contains(x.FundingDeclarationId)).Sum(x => x.AllocatedAmount);
    }

    private static void AddInstallments(
        LoanObligation obligation,
        IEnumerable<ExpectedPaymentScheduleItemDto> payments,
        string currency,
        DateTime now)
    {
        foreach (var item in payments)
            obligation.Installments.Add(new LoanRepaymentInstallment
            {
                InstallmentNumber = item.InstallmentNumber,
                DueDate = item.DueDate,
                PrincipalDue = item.ExpectedPrincipal,
                InterestDue = item.ExpectedInterest,
                TotalDue = item.ExpectedTotal,
                Currency = currency,
                Status = ToStatus(item.Status),
                CreatedAt = now
            });
    }

    private static AuditLog BuildAudit(
        Guid actorId,
        string action,
        LoanObligation obligation,
        int participationRequestId,
        InvestmentContract contract,
        InvestmentContractVersion contractVersion,
        NegotiationOffer acceptedOffer,
        NegotiationOfferLeg loanLeg,
        ContractLoanSnapshot snapshot,
        string repaymentModel,
        decimal confirmedAmount,
        DateTime now) => new()
    {
        UserId = actorId,
        EntityType = nameof(LoanObligation),
        EntityId = $"participation:{participationRequestId}:leg:{loanLeg.Id}",
        Action = action,
        Changes = JsonSerializer.Serialize(new
        {
            participationRequestId,
            contractId = contract.Id,
            contractVersionId = contractVersion.Id,
            acceptedOfferId = acceptedOffer.Id,
            acceptedOfferVersion = acceptedOffer.Version,
            offerLegId = loanLeg.Id,
            principal = snapshot.Principal,
            currency = snapshot.Currency,
            interestRate = snapshot.InterestRate,
            termMonths = snapshot.TermMonths,
            repaymentModel,
            contractualStartDate = snapshot.ContractualStartDate,
            contractualMaturityDate = snapshot.ContractualMaturityDate,
            confirmedFundingAmount = confirmedAmount,
            status = obligation.Status.ToString()
        }),
        Timestamp = now
    };

    public async Task<IReadOnlyDictionary<int, IReadOnlyList<LoanObligation>>> GetByParticipationAsync(
        IEnumerable<int> participationRequestIds,
        CancellationToken cancellationToken = default)
    {
        var ids = participationRequestIds.Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<int, IReadOnlyList<LoanObligation>>();

        var obligations = await uow.Repository<LoanObligation>().FindWithIncludesAsync(
            x => ids.Contains(x.ParticipationRequestId),
            x => x.Installments);
        return obligations
            .GroupBy(x => x.ParticipationRequestId)
            .ToDictionary(x => x.Key, x => (IReadOnlyList<LoanObligation>)x.OrderBy(o => o.OfferLegNumber).ThenBy(o => o.Id).ToList());
    }

    private static LoanRepaymentInstallmentStatus ToStatus(ExpectedPaymentStatus status) => status switch
    {
        ExpectedPaymentStatus.Due => LoanRepaymentInstallmentStatus.Due,
        ExpectedPaymentStatus.Overdue => LoanRepaymentInstallmentStatus.Overdue,
        ExpectedPaymentStatus.Cancelled => LoanRepaymentInstallmentStatus.Cancelled,
        ExpectedPaymentStatus.PartiallyPaid => LoanRepaymentInstallmentStatus.PartiallyPaid,
        ExpectedPaymentStatus.Paid => LoanRepaymentInstallmentStatus.Paid,
        _ => LoanRepaymentInstallmentStatus.Upcoming
    };

    private static ContractLoanSnapshot ReadContractSnapshot(string json, NegotiationOffer acceptedOffer, NegotiationOfferLeg loanLeg)
    {
        if (string.IsNullOrWhiteSpace(json))
            throw new BusinessValidationException("LOAN_CONTRACT_SNAPSHOT_REQUIRED", "The active Loan contract snapshot is missing.");

        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;
        var acceptedOfferSnapshot = Property(root, "acceptedOffer");
        var snapshotOfferId = Int(Property(acceptedOfferSnapshot, "id"));
        var snapshotOfferVersion = Int(Property(acceptedOfferSnapshot, "versionNumber"));
        if (snapshotOfferId != acceptedOffer.Id || snapshotOfferVersion != acceptedOffer.Version)
            throw new BusinessValidationException("LOAN_CONTRACT_SNAPSHOT_MISMATCH", "The active Loan contract snapshot does not match the accepted Offer version.");

        var terms = Property(root, "sourceAgreedTerms");
        if (terms.ValueKind != JsonValueKind.Array)
            throw new BusinessValidationException("LOAN_CONTRACT_LOAN_LEG_REQUIRED", "The active Loan contract snapshot has no accepted OfferLeg terms.");

        var orderedLegs = acceptedOffer.Legs.OrderBy(x => x.Id).ToList();
        var index = orderedLegs.FindIndex(x => x.Id == loanLeg.Id);
        var candidate = terms.EnumerateArray().FirstOrDefault(x => Int(Property(x, "offerLegId")) == loanLeg.Id);
        if (candidate.ValueKind == JsonValueKind.Undefined && index >= 0)
            candidate = terms.EnumerateArray().Skip(index).FirstOrDefault();
        if (candidate.ValueKind == JsonValueKind.Undefined)
            throw new BusinessValidationException("LOAN_CONTRACT_LEG_SNAPSHOT_REQUIRED", "The exact Loan OfferLeg is not present in the active contract snapshot.");

        var legType = String(Property(candidate, "legType"));
        if (!string.Equals(legType, NegotiationOfferLegType.Loan.ToString(), StringComparison.OrdinalIgnoreCase))
            throw new BusinessValidationException("LOAN_CONTRACT_LEG_INVALID", "The selected contract leg is not a Loan leg.");

        var currency = String(Property(candidate, "currency"));
        if (string.IsNullOrWhiteSpace(currency)) currency = String(Property(root, "currency"));
        var start = Date(Property(candidate, "contractualStartDate"));
        if (start == default) start = Date(Property(root, "acceptanceTimestamp"));
        var termMonths = Int(Property(candidate, "termMonths"));
        var maturity = Date(Property(candidate, "contractualMaturityDate"));
        if (maturity == default && start != default && termMonths > 0) maturity = start.AddMonths(termMonths);

        return new ContractLoanSnapshot(
            Math.Round(Decimal(Property(candidate, "amount")), 2),
            Math.Round(Decimal(Property(candidate, "returnRate")), 2),
            termMonths,
            String(Property(candidate, "repaymentModel")),
            currency.Trim().ToUpperInvariant(),
            start,
            maturity,
            Int(Property(candidate, "legNumber")) > 0 ? Int(Property(candidate, "legNumber")) : index + 1);
    }

    private static JsonElement Property(JsonElement element, string name)
    {
        if (element.ValueKind == JsonValueKind.Object)
            foreach (var property in element.EnumerateObject())
                if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase)) return property.Value;
        return default;
    }

    private static string String(JsonElement value) => value.ValueKind == JsonValueKind.String ? value.GetString() ?? string.Empty : value.ToString();
    private static int Int(JsonElement value) => value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number) ? number : int.TryParse(value.ToString(), out number) ? number : 0;
    private static decimal Decimal(JsonElement value) => value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var number) ? number : decimal.TryParse(value.ToString(), out number) ? number : 0m;
    private static DateTime Date(JsonElement value) => DateTime.TryParse(String(value), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var date) ? date : default;

    private sealed record ContractLoanSnapshot(
        decimal Principal,
        decimal InterestRate,
        int TermMonths,
        string RepaymentModel,
        string Currency,
        DateTime ContractualStartDate,
        DateTime ContractualMaturityDate,
        int LegNumber);
}
