class FounderEquitySummary {
  const FounderEquitySummary({
    required this.positions,
    required this.capitalization,
    required this.corporateEvents,
    required this.dividends,
    required this.transfers,
  });

  final List<FounderEquityPosition> positions;
  final List<FounderEquityPosition> capitalization;
  final List<FounderEquityCorporateEvent> corporateEvents;
  final List<FounderEquityDividend> dividends;
  final List<FounderEquityTransfer> transfers;
}

class FounderEquityPosition {
  const FounderEquityPosition({
    required this.id,
    required this.participationId,
    required this.offerId,
    required this.offerVersion,
    required this.offerLegId,
    required this.opportunityId,
    required this.investmentAmount,
    required this.currency,
    required this.ownershipModel,
    required this.status,
    required this.contractualOwnership,
    required this.currentOwnership,
    required this.investorShares,
    required this.totalIssuedShares,
    required this.initialOwnership,
    required this.dilutionPoints,
    required this.shareClass,
    required this.pricePerShare,
    required this.preMoneyValuation,
    required this.postMoneyValuation,
    required this.effectiveDate,
    required this.ledger,
  });

  final int id;
  final int participationId;
  final int offerId;
  final int offerVersion;
  final int offerLegId;
  final int opportunityId;
  final double investmentAmount;
  final String currency;
  final String ownershipModel;
  final String status;
  final double? contractualOwnership;
  final double? currentOwnership;
  final double? investorShares;
  final double? totalIssuedShares;
  final double? initialOwnership;
  final double? dilutionPoints;
  final String? shareClass;
  final double? pricePerShare;
  final double? preMoneyValuation;
  final double? postMoneyValuation;
  final DateTime? effectiveDate;
  final List<FounderEquityLedgerEntry> ledger;

  factory FounderEquityPosition.fromJson(Map<String, dynamic> json) =>
      FounderEquityPosition(
        id: _eqInt(json['id']),
        participationId: _eqInt(json['participationId']),
        offerId: _eqInt(json['offerId']),
        offerVersion: _eqInt(json['offerVersion']),
        offerLegId: _eqInt(json['offerLegId']),
        opportunityId: _eqInt(json['opportunityId']),
        investmentAmount: _eqNum(json['investmentAmount']),
        currency: _eqText(json['currency']),
        ownershipModel: _eqText(json['ownershipModel']),
        status: _eqText(json['status']),
        contractualOwnership: _eqNullableNum(
          json['contractualOwnershipPercentage'],
        ),
        currentOwnership: _eqNullableNum(json['currentOwnershipPercentage']),
        investorShares: _eqNullableNum(
          json['currentInvestorShares'] ?? json['investorShareCount'],
        ),
        totalIssuedShares: _eqNullableNum(
          json['currentTotalIssuedShares'] ?? json['totalIssuedShares'],
        ),
        initialOwnership: _eqNullableNum(json['initialOwnershipPercentage']),
        dilutionPoints: _eqNullableNum(json['dilutionPercentagePoints']),
        shareClass: _eqNullableText(json['shareClass']),
        pricePerShare: _eqNullableNum(json['pricePerShare']),
        preMoneyValuation: _eqNullableNum(json['preMoneyValuation']),
        postMoneyValuation: _eqNullableNum(json['postMoneyValuation']),
        effectiveDate: _eqDate(json['effectiveOwnershipDate']),
        ledger: _eqList(json['ledger'], FounderEquityLedgerEntry.fromJson),
      );
}

class FounderEquityLedgerEntry {
  const FounderEquityLedgerEntry({
    required this.id,
    required this.eventType,
    required this.effectiveDate,
    required this.shareDelta,
    required this.resultingInvestorShares,
    required this.resultingTotalShares,
    required this.resultingOwnership,
    required this.previousOwnership,
    required this.corporateEventId,
  });

  final int id;
  final String eventType;
  final DateTime? effectiveDate;
  final double? shareDelta;
  final double? resultingInvestorShares;
  final double? resultingTotalShares;
  final double? resultingOwnership;
  final double? previousOwnership;
  final int? corporateEventId;

  factory FounderEquityLedgerEntry.fromJson(
    Map<String, dynamic> json,
  ) => FounderEquityLedgerEntry(
    id: _eqInt(json['id']),
    eventType: _eqText(json['eventType']),
    effectiveDate: _eqDate(json['effectiveDate']),
    shareDelta: _eqNullableNum(json['shareDelta']),
    resultingInvestorShares: _eqNullableNum(json['resultingInvestorShares']),
    resultingTotalShares: _eqNullableNum(json['resultingTotalIssuedShares']),
    resultingOwnership: _eqNullableNum(json['resultingOwnershipPercentage']),
    previousOwnership: _eqNullableNum(json['previousOwnershipPercentage']),
    corporateEventId: _eqNullableInt(json['corporateEventId']),
  );
}

class FounderEquityCorporateEvent {
  const FounderEquityCorporateEvent({
    required this.id,
    required this.eventType,
    required this.status,
    required this.effectiveDate,
    required this.reason,
    required this.sharesIssued,
    required this.splitNumerator,
    required this.splitDenominator,
    required this.previousTotalShares,
    required this.afterTotalShares,
  });

  final int id;
  final String eventType;
  final String status;
  final DateTime? effectiveDate;
  final String reason;
  final double? sharesIssued;
  final double? splitNumerator;
  final double? splitDenominator;
  final double? previousTotalShares;
  final double? afterTotalShares;

  factory FounderEquityCorporateEvent.fromJson(Map<String, dynamic> json) =>
      FounderEquityCorporateEvent(
        id: _eqInt(json['id']),
        eventType: _eqText(json['eventType']),
        status: _eqText(json['status']),
        effectiveDate: _eqDate(json['effectiveDate']),
        reason: _eqText(json['reason']),
        sharesIssued: _eqNullableNum(json['sharesIssued']),
        splitNumerator: _eqNullableNum(json['splitNumerator']),
        splitDenominator: _eqNullableNum(json['splitDenominator']),
        previousTotalShares: _eqNullableNum(json['previousTotalIssuedShares']),
        afterTotalShares: _eqNullableNum(json['afterTotalIssuedShares']),
      );
}

class FounderEquityDividend {
  const FounderEquityDividend({
    required this.id,
    required this.status,
    required this.declarationDate,
    required this.recordDate,
    required this.paymentDueDate,
    required this.currency,
    required this.dividendPerShare,
    required this.totalDeclared,
    required this.reason,
    required this.entitlements,
  });

  final int id;
  final String status;
  final DateTime? declarationDate;
  final DateTime? recordDate;
  final DateTime? paymentDueDate;
  final String currency;
  final double? dividendPerShare;
  final double? totalDeclared;
  final String reason;
  final List<FounderEquityEntitlement> entitlements;

  factory FounderEquityDividend.fromJson(Map<String, dynamic> json) =>
      FounderEquityDividend(
        id: _eqInt(json['id']),
        status: _eqText(json['status']),
        declarationDate: _eqDate(json['declarationDate']),
        recordDate: _eqDate(json['recordDate']),
        paymentDueDate: _eqDate(json['paymentDueDate']),
        currency: _eqText(json['currency']),
        dividendPerShare: _eqNullableNum(json['dividendPerShare']),
        totalDeclared: _eqNullableNum(json['totalDeclaredAmount']),
        reason: _eqText(json['reason']),
        entitlements: _eqList(
          json['entitlements'],
          FounderEquityEntitlement.fromJson,
        ),
      );
}

class FounderEquityEntitlement {
  const FounderEquityEntitlement({
    required this.id,
    required this.entitlementAmount,
    required this.currency,
    required this.confirmed,
    required this.pending,
    required this.disputed,
    required this.outstanding,
  });

  final int id;
  final double entitlementAmount;
  final String currency;
  final double confirmed;
  final double pending;
  final double disputed;
  final double outstanding;

  factory FounderEquityEntitlement.fromJson(Map<String, dynamic> json) =>
      FounderEquityEntitlement(
        id: _eqInt(json['id']),
        entitlementAmount: _eqNum(json['entitlementAmount']),
        currency: _eqText(json['currency']),
        confirmed: _eqNum(json['confirmedDistributed']),
        pending: _eqNum(json['pendingConfirmation']),
        disputed: _eqNum(json['disputedAmount']),
        outstanding: _eqNum(json['outstanding']),
      );
}

class FounderEquityTransfer {
  const FounderEquityTransfer({
    required this.id,
    required this.status,
    required this.type,
    required this.quantity,
    required this.effectiveDate,
    required this.reason,
    required this.appliedAt,
  });

  final int id;
  final String status;
  final String type;
  final double quantity;
  final DateTime? effectiveDate;
  final String reason;
  final DateTime? appliedAt;

  factory FounderEquityTransfer.fromJson(Map<String, dynamic> json) =>
      FounderEquityTransfer(
        id: _eqInt(json['id']),
        status: _eqText(json['status']),
        type: _eqText(json['transferType']),
        quantity: _eqNum(json['quantity']),
        effectiveDate: _eqDate(json['effectiveDate']),
        reason: _eqText(json['reason']),
        appliedAt: _eqDate(json['appliedAt']),
      );
}

class FounderEquityOwnershipAtDate {
  const FounderEquityOwnershipAtDate({
    required this.asOf,
    required this.ownershipModel,
    required this.ownershipPercentage,
    required this.investorShares,
    required this.totalIssuedShares,
  });

  final DateTime? asOf;
  final String ownershipModel;
  final double? ownershipPercentage;
  final double? investorShares;
  final double? totalIssuedShares;

  factory FounderEquityOwnershipAtDate.fromJson(Map<String, dynamic> json) =>
      FounderEquityOwnershipAtDate(
        asOf: _eqDate(json['asOf']),
        ownershipModel: _eqText(json['ownershipModel']),
        ownershipPercentage: _eqNullableNum(json['ownershipPercentage']),
        investorShares: _eqNullableNum(json['investorShares']),
        totalIssuedShares: _eqNullableNum(json['totalIssuedShares']),
      );
}

class FounderEquityClosureSnapshot {
  const FounderEquityClosureSnapshot({
    required this.closedAt,
    required this.fullyExitedAt,
    required this.finalOwnership,
    required this.finalInvestorShares,
    required this.totalDistributionsConfirmed,
    required this.closureReason,
  });

  final DateTime? closedAt;
  final DateTime? fullyExitedAt;
  final double? finalOwnership;
  final double? finalInvestorShares;
  final double? totalDistributionsConfirmed;
  final String closureReason;

  factory FounderEquityClosureSnapshot.fromJson(Map<String, dynamic> json) =>
      FounderEquityClosureSnapshot(
        closedAt: _eqDate(json['closedAt']),
        fullyExitedAt: _eqDate(json['fullyExitedAt']),
        finalOwnership: _eqNullableNum(json['finalOwnershipPercentage']),
        finalInvestorShares: _eqNullableNum(json['finalInvestorShares']),
        totalDistributionsConfirmed: _eqNullableNum(
          json['totalDistributionsConfirmed'],
        ),
        closureReason: _eqText(json['closureReason']),
      );
}

String _eqText(dynamic value) => value?.toString().trim() ?? '';
String? _eqNullableText(dynamic value) {
  final text = _eqText(value);
  return text.isEmpty ? null : text;
}

int _eqInt(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_eqText(value)) ?? 0;
int? _eqNullableInt(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_eqText(value));
double _eqNum(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_eqText(value)) ?? 0;
double? _eqNullableNum(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_eqText(value));
DateTime? _eqDate(dynamic value) => DateTime.tryParse(_eqText(value));
List<T> _eqList<T>(dynamic json, T Function(Map<String, dynamic>) parse) =>
    json is List
        ? json
            .whereType<Map>()
            .map((item) => parse(Map<String, dynamic>.from(item)))
            .toList(growable: false)
        : const <Never>[];
