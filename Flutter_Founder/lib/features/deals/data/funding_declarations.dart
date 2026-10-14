class FounderFundingDeclaration {
  const FounderFundingDeclaration({
    required this.id,
    required this.amount,
    required this.currency,
    required this.receivedDate,
    required this.paymentMethod,
    required this.status,
    required this.declaredAt,
    this.externalReference,
    this.notes,
    this.proofAvailable = false,
    this.proofFileName,
    this.confirmedAt,
    this.confirmationComment,
    this.disputedAt,
    this.disputeReason,
    this.allocations = const <FounderFundingAllocation>[],
  });

  final int id;
  final double amount;
  final String currency;
  final DateTime? receivedDate;
  final String paymentMethod;
  final String status;
  final DateTime? declaredAt;
  final String? externalReference;
  final String? notes;
  final bool proofAvailable;
  final String? proofFileName;
  final DateTime? confirmedAt;
  final String? confirmationComment;
  final DateTime? disputedAt;
  final String? disputeReason;
  final List<FounderFundingAllocation> allocations;

  factory FounderFundingDeclaration.fromJson(Map<String, dynamic> json) {
    final rawAllocations = json['legAllocations'];
    return FounderFundingDeclaration(
      id: _int(json['id']),
      amount: _number(json['amount']) ?? 0,
      currency: _string(json['currencyCode']),
      receivedDate: DateTime.tryParse(_string(json['receivedDate'])),
      paymentMethod: _string(json['paymentMethod']),
      status: _string(json['status']),
      declaredAt: DateTime.tryParse(_string(json['declaredAt'])),
      externalReference: _optional(json['externalReference']),
      notes: _optional(json['notes']),
      proofAvailable: json['proofAvailable'] == true,
      proofFileName: _optional(json['proofFileName']),
      confirmedAt: DateTime.tryParse(_string(json['confirmedAt'])),
      confirmationComment: _optional(json['confirmationComment']),
      disputedAt: DateTime.tryParse(_string(json['disputedAt'])),
      disputeReason: _optional(json['disputeReason']),
      allocations:
          rawAllocations is List
              ? rawAllocations
                  .whereType<Map>()
                  .map(
                    (item) => FounderFundingAllocation.fromJson(
                      Map<String, dynamic>.from(item),
                    ),
                  )
                  .toList(growable: false)
              : const <FounderFundingAllocation>[],
    );
  }
}

class FounderFundingAllocation {
  const FounderFundingAllocation({
    required this.legNumber,
    required this.legType,
    required this.amount,
    required this.currency,
  });

  final int legNumber;
  final String legType;
  final double amount;
  final String currency;

  factory FounderFundingAllocation.fromJson(Map<String, dynamic> json) =>
      FounderFundingAllocation(
        legNumber: _int(json['offerLegNumber']),
        legType: _string(json['legType']),
        amount: _number(json['allocatedAmount']) ?? 0,
        currency: _string(json['currencyCode']),
      );
}

class FounderFundingLeg {
  const FounderFundingLeg({
    required this.id,
    required this.number,
    required this.type,
    required this.committed,
    required this.declared,
    required this.currency,
    this.loanObligationId,
    this.loanObligationStatus,
    this.isPersistedSchedule = false,
    this.contractualStartDate,
    this.contractualMaturityDate,
    this.returnRate,
    this.termMonths,
    this.repaymentModel,
    this.cashFlows = const <FounderLoanInstallment>[],
    this.repayment,
  });

  final int id;
  final int number;
  final String type;
  final double committed;
  final double declared;
  final String currency;
  final int? loanObligationId;
  final String? loanObligationStatus;
  final bool isPersistedSchedule;
  final DateTime? contractualStartDate;
  final DateTime? contractualMaturityDate;
  final double? returnRate;
  final int? termMonths;
  final String? repaymentModel;
  final List<FounderLoanInstallment> cashFlows;
  final FounderLoanSummary? repayment;

  double get undeclared =>
      (committed - declared).clamp(0, double.infinity).toDouble();

  factory FounderFundingLeg.fromJson(Map<String, dynamic> json) =>
      FounderFundingLeg(
        id: _int(json['offerLegId']),
        number: _int(json['legNumber']),
        type: _string(json['legType']),
        committed: _number(json['amount']) ?? 0,
        declared: _number(json['declaredAmount']) ?? 0,
        currency: _string(json['currency']),
        loanObligationId: _nullableInt(json['loanObligationId']),
        loanObligationStatus: _optional(json['loanObligationStatus']),
        isPersistedSchedule: json['isPersistedSchedule'] == true,
        contractualStartDate: DateTime.tryParse(
          _string(json['contractualStartDate']),
        ),
        contractualMaturityDate: DateTime.tryParse(
          _string(json['contractualMaturityDate']),
        ),
        returnRate: _number(json['returnRate']),
        termMonths: _nullableInt(json['termMonths']),
        repaymentModel: _optional(json['repaymentModel']),
        cashFlows:
            json['cashFlows'] is List
                ? (json['cashFlows'] as List)
                    .whereType<Map>()
                    .map(
                      (item) => FounderLoanInstallment.fromJson(
                        Map<String, dynamic>.from(item),
                      ),
                    )
                    .toList(growable: false)
                : const <FounderLoanInstallment>[],
        repayment:
            json['repayment'] is Map
                ? FounderLoanSummary.fromJson(
                  Map<String, dynamic>.from(json['repayment'] as Map),
                )
                : null,
      );
}

class FounderLoanInstallment {
  const FounderLoanInstallment({
    required this.number,
    required this.dueDate,
    required this.expectedPrincipal,
    required this.expectedInterest,
    required this.expectedTotal,
    required this.remainingAmount,
    required this.status,
    this.actualPaid,
  });

  final int number;
  final DateTime? dueDate;
  final double expectedPrincipal;
  final double expectedInterest;
  final double expectedTotal;
  final double remainingAmount;
  final double? actualPaid;
  final String status;

  factory FounderLoanInstallment.fromJson(Map<String, dynamic> json) =>
      FounderLoanInstallment(
        number: _int(json['installmentNumber']),
        dueDate: DateTime.tryParse(_string(json['dueDate'])),
        expectedPrincipal: _number(json['expectedPrincipal']) ?? 0,
        expectedInterest: _number(json['expectedInterest']) ?? 0,
        expectedTotal: _number(json['expectedTotal']) ?? 0,
        remainingAmount: _number(json['remainingAmount']) ?? 0,
        actualPaid: _number(json['actualPaid']),
        status: _string(json['status']),
      );
}

class FounderLoanSummary {
  const FounderLoanSummary({
    required this.loanObligationId,
    required this.principalOutstanding,
    required this.interestOutstanding,
    required this.totalOutstanding,
    required this.confirmedRepaidAmount,
    required this.pendingConfirmationAmount,
    required this.disputedAmount,
    required this.overdueAmount,
    required this.lifecycleStatus,
    this.nextDueAmount,
    this.nextDueDate,
    this.maturityDate,
    this.fullyRepaidAt,
    this.defaultedAt,
    this.defaultReason,
    this.closedAt,
    this.closureReason,
    this.records = const <FounderLoanRepayment>[],
  });

  final int loanObligationId;
  final double principalOutstanding;
  final double interestOutstanding;
  final double totalOutstanding;
  final double confirmedRepaidAmount;
  final double pendingConfirmationAmount;
  final double disputedAmount;
  final double overdueAmount;
  final String lifecycleStatus;
  final double? nextDueAmount;
  final DateTime? nextDueDate;
  final DateTime? maturityDate;
  final DateTime? fullyRepaidAt;
  final DateTime? defaultedAt;
  final String? defaultReason;
  final DateTime? closedAt;
  final String? closureReason;
  final List<FounderLoanRepayment> records;

  factory FounderLoanSummary.fromJson(Map<String, dynamic> json) =>
      FounderLoanSummary(
        loanObligationId: _int(json['loanObligationId']),
        principalOutstanding: _number(json['principalOutstanding']) ?? 0,
        interestOutstanding: _number(json['interestOutstanding']) ?? 0,
        totalOutstanding: _number(json['totalOutstanding']) ?? 0,
        confirmedRepaidAmount: _number(json['confirmedRepaidAmount']) ?? 0,
        pendingConfirmationAmount:
            _number(json['pendingConfirmationAmount']) ?? 0,
        disputedAmount: _number(json['disputedAmount']) ?? 0,
        overdueAmount: _number(json['overdueAmount']) ?? 0,
        lifecycleStatus: _string(json['loanLifecycleStatus']),
        nextDueAmount: _number(json['nextDueAmount']),
        nextDueDate: DateTime.tryParse(_string(json['nextDueDate'])),
        maturityDate: DateTime.tryParse(_string(json['maturityDate'])),
        fullyRepaidAt: DateTime.tryParse(_string(json['fullyRepaidAt'])),
        defaultedAt: DateTime.tryParse(_string(json['defaultedAt'])),
        defaultReason: _optional(json['defaultReason']),
        closedAt: DateTime.tryParse(_string(json['closedAt'])),
        closureReason: _optional(json['closureReason']),
        records:
            json['records'] is List
                ? (json['records'] as List)
                    .whereType<Map>()
                    .map(
                      (item) => FounderLoanRepayment.fromJson(
                        Map<String, dynamic>.from(item),
                      ),
                    )
                    .toList(growable: false)
                : const <FounderLoanRepayment>[],
      );
}

class FounderLoanRepayment {
  const FounderLoanRepayment({
    required this.id,
    required this.amount,
    required this.currency,
    required this.externalPaymentDate,
    required this.status,
    required this.declaredAt,
    this.externalReference,
    this.proofAvailable = false,
    this.proofFileName,
    this.confirmationComment,
    this.disputeReason,
    this.targetInstallmentNumbers = const <int>[],
  });

  final int id;
  final double amount;
  final String currency;
  final DateTime? externalPaymentDate;
  final String status;
  final DateTime? declaredAt;
  final String? externalReference;
  final bool proofAvailable;
  final String? proofFileName;
  final String? confirmationComment;
  final String? disputeReason;
  final List<int> targetInstallmentNumbers;

  factory FounderLoanRepayment.fromJson(Map<String, dynamic> json) =>
      FounderLoanRepayment(
        id: _int(json['id']),
        amount: _number(json['amount']) ?? 0,
        currency: _string(json['currency']),
        externalPaymentDate: DateTime.tryParse(
          _string(json['externalPaymentDate']),
        ),
        status: _string(json['status']),
        declaredAt: DateTime.tryParse(_string(json['declaredAt'])),
        externalReference: _optional(json['externalReference']),
        proofAvailable: json['proofAvailable'] == true,
        proofFileName: _optional(json['proofFileName']),
        confirmationComment: _optional(json['confirmationComment']),
        disputeReason: _optional(json['disputeReason']),
        targetInstallmentNumbers:
            json['targetInstallmentNumbers'] is List
                ? (json['targetInstallmentNumbers'] as List)
                    .whereType<num>()
                    .map((item) => item.toInt())
                    .toList(growable: false)
                : const <int>[],
      );
}

String _string(dynamic value) => value?.toString() ?? '';
String? _optional(dynamic value) {
  final result = value?.toString().trim();
  return result == null || result.isEmpty ? null : result;
}

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;
int? _nullableInt(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value));
double? _number(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_string(value));
