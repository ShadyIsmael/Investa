class FounderProfitSharingSummary {
  const FounderProfitSharingSummary({
    required this.participationId,
    required this.obligations,
    required this.totalEntitlement,
    required this.totalConfirmedDistributed,
    required this.totalPendingConfirmation,
    required this.totalDisputed,
    required this.totalDistributionOutstanding,
    required this.totalDeclaredResult,
    required this.completedPeriods,
    required this.totalPeriods,
  });

  final int participationId;
  final List<FounderProfitSharingObligation> obligations;
  final double totalEntitlement;
  final double totalConfirmedDistributed;
  final double totalPendingConfirmation;
  final double totalDisputed;
  final double totalDistributionOutstanding;
  final double totalDeclaredResult;
  final int completedPeriods;
  final int totalPeriods;

  factory FounderProfitSharingSummary.fromJson(Map<String, dynamic> json) =>
      FounderProfitSharingSummary(
        participationId: _psInt(json['participationId']),
        obligations:
            json['obligations'] is List
                ? (json['obligations'] as List)
                    .whereType<Map>()
                    .map(
                      (item) => FounderProfitSharingObligation.fromJson(
                        Map<String, dynamic>.from(item),
                      ),
                    )
                    .toList(growable: false)
                : const <FounderProfitSharingObligation>[],
        totalEntitlement: _psNum(json['totalEntitlement']),
        totalConfirmedDistributed: _psNum(json['totalConfirmedDistributed']),
        totalPendingConfirmation: _psNum(json['totalPendingConfirmation']),
        totalDisputed: _psNum(json['totalDisputed']),
        totalDistributionOutstanding: _psNum(
          json['totalDistributionOutstanding'],
        ),
        totalDeclaredResult: _psNum(json['totalDeclaredResult']),
        completedPeriods: _psInt(json['completedPeriods']),
        totalPeriods: _psInt(json['totalPeriods']),
      );
}

class FounderProfitSharingObligation {
  const FounderProfitSharingObligation({
    required this.id,
    required this.contributionAmount,
    required this.currency,
    required this.profitSharePercentage,
    required this.reportingFrequency,
    required this.calculationBasis,
    required this.contractualStartDate,
    required this.contractualEndDate,
    required this.status,
    required this.activatedAt,
    required this.maturedAt,
    required this.settledAt,
    required this.closedAt,
    required this.closureReason,
    required this.completedPeriods,
    required this.totalPeriods,
    required this.totalEntitlement,
    required this.totalConfirmedDistributed,
    required this.totalPendingConfirmation,
    required this.totalDisputed,
    required this.totalDistributionOutstanding,
    required this.reportingPeriods,
  });

  final int id;
  final double contributionAmount;
  final String currency;
  final double profitSharePercentage;
  final String reportingFrequency;
  final String calculationBasis;
  final DateTime? contractualStartDate;
  final DateTime? contractualEndDate;
  final String status;
  final DateTime? activatedAt;
  final DateTime? maturedAt;
  final DateTime? settledAt;
  final DateTime? closedAt;
  final String? closureReason;
  final int completedPeriods;
  final int totalPeriods;
  final double totalEntitlement;
  final double totalConfirmedDistributed;
  final double totalPendingConfirmation;
  final double totalDisputed;
  final double totalDistributionOutstanding;
  final List<FounderProfitSharingPeriod> reportingPeriods;

  factory FounderProfitSharingObligation.fromJson(Map<String, dynamic> json) =>
      FounderProfitSharingObligation(
        id: _psInt(json['id']),
        contributionAmount: _psNum(json['contributionAmount']),
        currency: _psText(json['currency']),
        profitSharePercentage: _psNum(json['profitSharePercentage']),
        reportingFrequency: _psText(json['reportingFrequency']),
        calculationBasis: _psText(json['calculationBasis']),
        contractualStartDate: _psDate(json['contractualStartDate']),
        contractualEndDate: _psDate(json['contractualEndDate']),
        status: _psText(json['status']),
        activatedAt: _psDate(json['activatedAt']),
        maturedAt: _psDate(json['maturedAt']),
        settledAt: _psDate(json['settledAt']),
        closedAt: _psDate(json['closedAt']),
        closureReason: _psNullableText(json['closureReason']),
        completedPeriods: _psInt(json['completedPeriods']),
        totalPeriods: _psInt(json['totalPeriods']),
        totalEntitlement: _psNum(json['totalEntitlement']),
        totalConfirmedDistributed: _psNum(json['totalConfirmedDistributed']),
        totalPendingConfirmation: _psNum(json['totalPendingConfirmation']),
        totalDisputed: _psNum(json['totalDisputed']),
        totalDistributionOutstanding: _psNum(
          json['totalDistributionOutstanding'],
        ),
        reportingPeriods:
            json['reportingPeriods'] is List
                ? (json['reportingPeriods'] as List)
                    .whereType<Map>()
                    .map(
                      (item) => FounderProfitSharingPeriod.fromJson(
                        Map<String, dynamic>.from(item),
                      ),
                    )
                    .toList(growable: false)
                : const <FounderProfitSharingPeriod>[],
      );
}

class FounderProfitSharingPeriod {
  const FounderProfitSharingPeriod({
    required this.id,
    required this.periodNumber,
    required this.isFinalPeriod,
    required this.startDate,
    required this.endDate,
    required this.reportingDueDate,
    required this.currency,
    required this.status,
    required this.hasDeclaration,
    required this.declaredBasisAmount,
    required this.declaredResultAmount,
    required this.declarationStatus,
    required this.declaration,
    required this.investorEntitlement,
    required this.distributionOutstanding,
    required this.confirmedDistributed,
    required this.pendingConfirmation,
    required this.disputed,
    required this.distributionDeclarations,
  });

  final int id;
  final int periodNumber;
  final bool isFinalPeriod;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime? reportingDueDate;
  final String currency;
  final String status;
  final bool hasDeclaration;
  final double? declaredBasisAmount;
  final double? declaredResultAmount;
  final String? declarationStatus;
  final FounderProfitSharingDeclaration? declaration;
  final double? investorEntitlement;
  final double? distributionOutstanding;
  final double? confirmedDistributed;
  final double? pendingConfirmation;
  final double? disputed;
  final List<FounderProfitSharingDistribution> distributionDeclarations;

  factory FounderProfitSharingPeriod.fromJson(Map<String, dynamic> json) =>
      FounderProfitSharingPeriod(
        id: _psInt(json['id']),
        periodNumber: _psInt(json['periodNumber']),
        isFinalPeriod: json['isFinalPeriod'] == true,
        startDate: _psDate(json['startDate']),
        endDate: _psDate(json['endDate']),
        reportingDueDate: _psDate(json['reportingDueDate']),
        currency: _psText(json['currency']),
        status: _psText(json['status']),
        hasDeclaration: json['hasDeclaration'] == true,
        declaredBasisAmount: _psNullableNum(json['declaredBasisAmount']),
        declaredResultAmount: _psNullableNum(json['declaredResultAmount']),
        declarationStatus: _psNullableText(json['declarationStatus']),
        declaration:
            json['declaration'] is Map
                ? FounderProfitSharingDeclaration.fromJson(
                  Map<String, dynamic>.from(json['declaration'] as Map),
                )
                : null,
        investorEntitlement: _psNullableNum(json['investorEntitlement']),
        distributionOutstanding: _psNullableNum(
          json['distributionOutstanding'],
        ),
        confirmedDistributed: _psNullableNum(json['confirmedDistributed']),
        pendingConfirmation: _psNullableNum(json['pendingConfirmation']),
        disputed: _psNullableNum(json['disputed']),
        distributionDeclarations:
            json['distributionDeclarations'] is List
                ? (json['distributionDeclarations'] as List)
                    .whereType<Map>()
                    .map(
                      (item) => FounderProfitSharingDistribution.fromJson(
                        Map<String, dynamic>.from(item),
                      ),
                    )
                    .toList(growable: false)
                : const <FounderProfitSharingDistribution>[],
      );
}

class FounderProfitSharingDeclaration {
  const FounderProfitSharingDeclaration({
    required this.id,
    required this.declaredBasisAmount,
    required this.declaredResultAmount,
    required this.currency,
    required this.declarationDate,
    required this.externalReference,
    required this.notes,
    required this.evidenceAvailable,
    required this.evidenceFileName,
    required this.status,
    required this.calculationError,
  });

  final int id;
  final double declaredBasisAmount;
  final double declaredResultAmount;
  final String currency;
  final DateTime? declarationDate;
  final String? externalReference;
  final String? notes;
  final bool evidenceAvailable;
  final String? evidenceFileName;
  final String status;
  final String? calculationError;

  factory FounderProfitSharingDeclaration.fromJson(Map<String, dynamic> json) =>
      FounderProfitSharingDeclaration(
        id: _psInt(json['id']),
        declaredBasisAmount: _psNum(json['declaredBasisAmount']),
        declaredResultAmount: _psNum(json['declaredResultAmount']),
        currency: _psText(json['currency']),
        declarationDate: _psDate(json['declarationDate']),
        externalReference: _psNullableText(json['externalReference']),
        notes: _psNullableText(json['notes']),
        evidenceAvailable: json['evidenceAvailable'] == true,
        evidenceFileName: _psNullableText(json['evidenceFileName']),
        status: _psText(json['status']),
        calculationError: _psNullableText(json['calculationError']),
      );
}

class FounderProfitSharingDistribution {
  const FounderProfitSharingDistribution({
    required this.id,
    required this.declaredAmount,
    required this.currency,
    required this.declaredAt,
    required this.externalReference,
    required this.notes,
    required this.evidenceAvailable,
    required this.evidenceFileName,
    required this.status,
    required this.confirmationComment,
    required this.disputeReason,
  });

  final int id;
  final double declaredAmount;
  final String currency;
  final DateTime? declaredAt;
  final String? externalReference;
  final String? notes;
  final bool evidenceAvailable;
  final String? evidenceFileName;
  final String status;
  final String? confirmationComment;
  final String? disputeReason;

  factory FounderProfitSharingDistribution.fromJson(
    Map<String, dynamic> json,
  ) => FounderProfitSharingDistribution(
    id: _psInt(json['id']),
    declaredAmount: _psNum(json['declaredAmount']),
    currency: _psText(json['currency']),
    declaredAt: _psDate(json['declaredAt']),
    externalReference: _psNullableText(json['externalReference']),
    notes: _psNullableText(json['notes']),
    evidenceAvailable: json['evidenceAvailable'] == true,
    evidenceFileName: _psNullableText(json['evidenceFileName']),
    status: _psText(json['status']),
    confirmationComment: _psNullableText(json['confirmationComment']),
    disputeReason: _psNullableText(json['disputeReason']),
  );
}

String _psText(dynamic value) => value?.toString().trim() ?? '';
String? _psNullableText(dynamic value) {
  final result = _psText(value);
  return result.isEmpty ? null : result;
}

int _psInt(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_psText(value)) ?? 0;
double _psNum(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_psText(value)) ?? 0;
double? _psNullableNum(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_psText(value));
DateTime? _psDate(dynamic value) => DateTime.tryParse(_psText(value));
