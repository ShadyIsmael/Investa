import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'funding_declarations.dart';

abstract interface class FounderFundingRepository {
  Future<List<FounderFundingDeclaration>> fetch(
    int opportunityId,
    int participationId,
  );
  Future<FounderFundingDeclaration> declare({
    required int opportunityId,
    required int participationId,
    required double amount,
    required String currency,
    required DateTime receivedDate,
    required String paymentMethod,
    String? externalReference,
    String? notes,
    List<int>? proofBytes,
    String? proofFileName,
    String? proofContentType,
    List<({int offerLegId, double amount})> allocations = const [],
  });
  Future<List<int>> downloadProof(int declarationId);
  Future<List<int>> downloadLoanRepaymentProof(int declarationId);
  Future<List<FounderFundingLeg>> fetchAcceptedLegs(
    int opportunityId,
    int participationId,
  );
  Future<FounderLoanRepayment> declareLoanRepayment({
    required int opportunityId,
    required int loanObligationId,
    required double amount,
    required String currency,
    required DateTime externalPaymentDate,
    String? externalReference,
    List<int>? proofBytes,
    String? proofFileName,
    String? proofContentType,
    List<int> installmentIds = const [],
  });
}

class ApiFounderFundingRepository implements FounderFundingRepository {
  const ApiFounderFundingRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<List<FounderFundingLeg>> fetchAcceptedLegs(
    int opportunityId,
    int participationId,
  ) async {
    final response = await _api.get<dynamic>(
      '/opportunities/$opportunityId/room',
    );
    final payload = _data(response.data);
    if (payload is! Map || payload['participations'] is! List) {
      throw const ApiError(
        message: 'Accepted participation terms were not returned.',
      );
    }
    final matches = (payload['participations'] as List)
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .where((item) => _int(item['participationId']) == participationId)
        .toList(growable: false);
    if (matches.length != 1) {
      throw const ApiError(
        message: 'The accepted participation terms were not found.',
      );
    }
    final rawLegs = matches.single['legs'];
    if (rawLegs is! List) {
      throw const ApiError(message: 'Accepted offer legs were not returned.');
    }
    return rawLegs
        .whereType<Map>()
        .map(
          (item) => FounderFundingLeg.fromJson(Map<String, dynamic>.from(item)),
        )
        .where((leg) => leg.id > 0)
        .toList(growable: false);
  }

  @override
  Future<FounderLoanRepayment> declareLoanRepayment({
    required int opportunityId,
    required int loanObligationId,
    required double amount,
    required String currency,
    required DateTime externalPaymentDate,
    String? externalReference,
    List<int>? proofBytes,
    String? proofFileName,
    String? proofContentType,
    List<int> installmentIds = const [],
  }) async {
    final response = await _api.post<dynamic>(
      '/loan-repayments/opportunities/$opportunityId/obligations/$loanObligationId',
      data: FormData.fromMap(<String, dynamic>{
        'Amount': amount.toString(),
        'Currency': currency,
        'ExternalPaymentDate':
            DateTime.utc(
              externalPaymentDate.year,
              externalPaymentDate.month,
              externalPaymentDate.day,
            ).toIso8601String(),
        if (externalReference != null && externalReference.trim().isNotEmpty)
          'ExternalReference': externalReference.trim(),
        if (installmentIds.isNotEmpty)
          'installmentIdsJson': installmentIds.toString(),
        if (proofBytes != null && proofFileName != null)
          'ProofFile': MultipartFile.fromBytes(
            proofBytes,
            filename: proofFileName,
            contentType: DioMediaType.parse(
              proofContentType ?? 'application/octet-stream',
            ),
          ),
      }),
      options: Options(
        headers: <String, dynamic>{
          'Idempotency-Key':
              '${DateTime.now().microsecondsSinceEpoch}-$loanObligationId',
        },
      ),
    );
    final payload = _data(response.data);
    if (payload is! Map) {
      throw const ApiError(
        message: 'The repayment declaration was not returned.',
      );
    }
    return FounderLoanRepayment.fromJson(Map<String, dynamic>.from(payload));
  }

  @override
  Future<List<FounderFundingDeclaration>> fetch(
    int opportunityId,
    int participationId,
  ) async {
    final response = await _api.get<dynamic>(
      '/funding-declarations/opportunities/$opportunityId/participations/$participationId',
    );
    final payload = _data(response.data);
    if (payload is! List) {
      throw const ApiError(
        message: 'Funding declaration data was not returned.',
      );
    }
    return payload
        .whereType<Map>()
        .map(
          (item) => FounderFundingDeclaration.fromJson(
            Map<String, dynamic>.from(item),
          ),
        )
        .toList(growable: false);
  }

  @override
  Future<FounderFundingDeclaration> declare({
    required int opportunityId,
    required int participationId,
    required double amount,
    required String currency,
    required DateTime receivedDate,
    required String paymentMethod,
    String? externalReference,
    String? notes,
    List<int>? proofBytes,
    String? proofFileName,
    String? proofContentType,
    List<({int offerLegId, double amount})> allocations = const [],
  }) async {
    final fields = <String, dynamic>{
      'Amount': amount.toString(),
      'CurrencyCode': currency,
      'ReceivedDate':
          DateTime.utc(
            receivedDate.year,
            receivedDate.month,
            receivedDate.day,
          ).toIso8601String(),
      'PaymentMethod': paymentMethod,
      if (externalReference != null && externalReference.trim().isNotEmpty)
        'ExternalReference': externalReference.trim(),
      if (notes != null && notes.trim().isNotEmpty) 'Notes': notes.trim(),
      if (proofBytes != null && proofFileName != null)
        'ProofFile': MultipartFile.fromBytes(
          proofBytes,
          filename: proofFileName,
          contentType: DioMediaType.parse(
            proofContentType ?? 'application/octet-stream',
          ),
        ),
    };
    for (var index = 0; index < allocations.length; index++) {
      fields['LegAllocations[$index].OfferLegId'] =
          allocations[index].offerLegId.toString();
      fields['LegAllocations[$index].AllocatedAmount'] =
          allocations[index].amount.toString();
    }
    final form = FormData.fromMap(fields);
    final key = '${DateTime.now().microsecondsSinceEpoch}-$participationId';
    final response = await _api.post<dynamic>(
      '/funding-declarations/opportunities/$opportunityId/participations/$participationId',
      data: form,
      options: Options(headers: <String, dynamic>{'Idempotency-Key': key}),
    );
    final payload = _data(response.data);
    if (payload is! Map) {
      throw const ApiError(
        message: 'The funding declaration was not returned.',
      );
    }
    return FounderFundingDeclaration.fromJson(
      Map<String, dynamic>.from(payload),
    );
  }

  @override
  Future<List<int>> downloadProof(int declarationId) async {
    return _downloadBytes('/funding-declarations/$declarationId/proof');
  }

  @override
  Future<List<int>> downloadLoanRepaymentProof(int declarationId) =>
      _downloadBytes('/loan-repayments/$declarationId/proof');

  Future<List<int>> _downloadBytes(String path) async {
    final response = await _api.getBytes(path);
    final bytes = response.data;
    if (bytes == null || bytes.isEmpty) {
      throw const ApiError(message: 'The evidence file was empty.');
    }
    return bytes;
  }
}

dynamic _data(dynamic value) =>
    value is Map && value.containsKey('data') ? value['data'] : value;

final founderFundingRepositoryProvider = Provider<FounderFundingRepository>(
  (ref) => ApiFounderFundingRepository(ref.read(apiClientProvider)),
);

final founderFundingDeclarationsProvider = FutureProvider.autoDispose.family<
  List<FounderFundingDeclaration>,
  ({int opportunityId, int participationId})
>(
  (ref, args) => ref
      .read(founderFundingRepositoryProvider)
      .fetch(args.opportunityId, args.participationId),
);

final founderFundingLegsProvider = FutureProvider.autoDispose.family<
  List<FounderFundingLeg>,
  ({int opportunityId, int participationId})
>(
  (ref, args) => ref
      .read(founderFundingRepositoryProvider)
      .fetchAcceptedLegs(args.opportunityId, args.participationId),
);

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(value?.toString() ?? '') ?? 0;
