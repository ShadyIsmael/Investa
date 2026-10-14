class FounderDeal {
  const FounderDeal({
    required this.opportunityId,
    this.participationRequestId = 0,
    required this.opportunityTitle,
    required this.investorName,
    required this.status,
    required this.amount,
    required this.currency,
    required this.contractId,
    required this.contractNumber,
    required this.contractStatus,
    required this.acceptedAt,
  });

  final int opportunityId;
  final int participationRequestId;
  final String opportunityTitle;
  final String investorName;
  final String status;
  final double? amount;
  final String currency;
  final int? contractId;
  final String contractNumber;
  final String contractStatus;
  final DateTime? acceptedAt;
}

class FounderOwnedOpportunity {
  const FounderOwnedOpportunity({required this.id, required this.title});

  final int id;
  final String title;
}

class _ApprovedParticipation {
  const _ApprovedParticipation({
    required this.opportunityId,
    required this.opportunityTitle,
    required this.participationRequestId,
    required this.investorName,
    required this.status,
    required this.amount,
    required this.currency,
    required this.acceptedAt,
  });

  final int opportunityId;
  final String opportunityTitle;
  final int participationRequestId;
  final String investorName;
  final String status;
  final double? amount;
  final String currency;
  final DateTime? acceptedAt;
}

class _DealContract {
  const _DealContract({
    required this.id,
    required this.participationRequestId,
    required this.number,
    required this.status,
    required this.amount,
    required this.currency,
    required this.acceptedAt,
  });

  final int id;
  final int? participationRequestId;
  final String number;
  final String status;
  final double? amount;
  final String currency;
  final DateTime? acceptedAt;
}

FounderDeal? _combine(
  _ApprovedParticipation participation,
  List<_DealContract> contracts,
) {
  _DealContract? contract;
  for (final candidate in contracts) {
    if (candidate.participationRequestId ==
        participation.participationRequestId) {
      contract = candidate;
      break;
    }
  }
  return FounderDeal(
    opportunityId: participation.opportunityId,
    participationRequestId: participation.participationRequestId,
    opportunityTitle: participation.opportunityTitle,
    investorName: participation.investorName,
    status: participation.status,
    amount: contract?.amount ?? participation.amount,
    currency:
        contract?.currency.isNotEmpty == true
            ? contract!.currency
            : participation.currency,
    contractId: contract?.id,
    contractNumber: contract?.number ?? '',
    contractStatus: contract?.status ?? '',
    acceptedAt: contract?.acceptedAt ?? participation.acceptedAt,
  );
}

Map<String, dynamic> dealMap(dynamic value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

String dealString(dynamic value) => value?.toString() ?? '';

int dealInt(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(dealString(value)) ?? 0;

double? dealNumber(dynamic value) => value is num ? value.toDouble() : null;

DateTime? dealDate(dynamic value) => DateTime.tryParse(dealString(value));

List<dynamic> dealItems(dynamic payload) {
  final data =
      payload is Map && payload.containsKey('data') ? payload['data'] : payload;
  return data is List ? data : const <dynamic>[];
}

_ApprovedParticipation? _approvedParticipation(
  Map<String, dynamic> json,
  int opportunityId,
  String opportunityTitle,
) {
  final status = dealString(json['status']);
  final type = dealString(json['requestType']);
  if (status.toLowerCase() != 'approved' ||
      !type.toLowerCase().contains('investmentparticipation')) {
    return null;
  }
  return _ApprovedParticipation(
    opportunityId: opportunityId,
    opportunityTitle:
        dealString(json['opportunityTitle']).isNotEmpty
            ? dealString(json['opportunityTitle'])
            : opportunityTitle,
    participationRequestId: dealInt(json['id']),
    investorName: dealString(json['investorName']),
    status: status,
    amount:
        dealNumber(json['fundingAmount']) ??
        dealNumber(json['calculatedTotalAmount']) ??
        dealNumber(json['requestedAmount']),
    currency:
        dealString(json['fundingCurrency']).isNotEmpty
            ? dealString(json['fundingCurrency'])
            : dealString(json['enteredCurrency']),
    acceptedAt: dealDate(json['reviewedAt']),
  );
}

_DealContract _dealContract(Map<String, dynamic> json) => _DealContract(
  id: dealInt(json['contractId']),
  participationRequestId:
      json['participationRequestId'] == null
          ? null
          : dealInt(json['participationRequestId']),
  number: dealString(json['contractNumber']),
  status: dealString(json['status']),
  amount: dealNumber(json['acceptedAmount']),
  currency: dealString(json['acceptedCurrency']),
  acceptedAt:
      dealDate(json['acceptanceTimestamp']) ??
      dealDate(json['latestAgreementDate']),
);

List<FounderDeal> assembleFounderDeals({
  required List<FounderOwnedOpportunity> opportunities,
  required Map<int, List<Map<String, dynamic>>> joinRequests,
  required Map<int, List<Map<String, dynamic>>> contracts,
}) {
  final results = <FounderDeal>[];
  for (final opportunity in opportunities) {
    final approved =
        (joinRequests[opportunity.id] ?? const [])
            .map(
              (request) => _approvedParticipation(
                request,
                opportunity.id,
                opportunity.title,
              ),
            )
            .whereType<_ApprovedParticipation>();
    final opportunityContracts = (contracts[opportunity.id] ?? const [])
        .map(_dealContract)
        .toList(growable: false);
    results.addAll(
      approved.map(
        (participation) => _combine(participation, opportunityContracts)!,
      ),
    );
  }
  return results;
}
