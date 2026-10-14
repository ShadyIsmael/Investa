import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'equity.dart';

abstract interface class FounderEquityRepository {
  Future<FounderEquitySummary> fetch(int opportunityId, int participationId);
  Future<FounderEquityOwnershipAtDate> ownershipAtDate(
    int positionId,
    DateTime asOf,
  );
  Future<FounderEquityClosureSnapshot?> closureSnapshot(int positionId);
  Future<void> createCorporateEvent({
    required int opportunityId,
    required String eventType,
    required DateTime effectiveDate,
    required String reason,
    double? sharesIssued,
    double? splitNumerator,
    double? splitDenominator,
    String? shareClass,
    List<int> positionIds = const <int>[],
  });
  Future<void> submitCorporateEvent(int eventId);
}

class ApiFounderEquityRepository implements FounderEquityRepository {
  const ApiFounderEquityRepository(this._api);
  final FopxApiClient _api;

  @override
  Future<FounderEquitySummary> fetch(
    int opportunityId,
    int participationId,
  ) async {
    final responses = await Future.wait<dynamic>(<Future<dynamic>>[
      _api.get<dynamic>(
        '/equity/opportunities/$opportunityId/participations/$participationId',
      ),
      _api.get<dynamic>('/equity/opportunities/$opportunityId/capitalization'),
      _api.get<dynamic>(
        '/equity/opportunities/$opportunityId/corporate-events',
      ),
      _api.get<dynamic>(
        '/equity/opportunities/$opportunityId/dividend-declarations',
      ),
      _api.get<dynamic>('/equity/opportunities/$opportunityId/transfers'),
    ]);
    return FounderEquitySummary(
      positions: _items(responses[0].data, FounderEquityPosition.fromJson),
      capitalization: _items(responses[1].data, FounderEquityPosition.fromJson),
      corporateEvents: _items(
        responses[2].data,
        FounderEquityCorporateEvent.fromJson,
      ),
      dividends: _items(responses[3].data, FounderEquityDividend.fromJson),
      transfers: _items(responses[4].data, FounderEquityTransfer.fromJson),
    );
  }

  @override
  Future<FounderEquityOwnershipAtDate> ownershipAtDate(
    int positionId,
    DateTime asOf,
  ) async {
    final response = await _api.get<dynamic>(
      '/equity/positions/$positionId/ownership',
      queryParameters: <String, dynamic>{
        'asOf': asOf.toUtc().toIso8601String(),
      },
    );
    final data = _data(response.data);
    if (data is! Map) {
      throw const ApiError(
        message: 'Equity ownership history was not returned.',
      );
    }
    return FounderEquityOwnershipAtDate.fromJson(
      Map<String, dynamic>.from(data),
    );
  }

  @override
  Future<FounderEquityClosureSnapshot?> closureSnapshot(int positionId) async {
    final response = await _api.get<dynamic>(
      '/equity/positions/$positionId/closure',
    );
    final data = _data(response.data);
    if (data == null) return null;
    if (data is! Map) {
      throw const ApiError(message: 'Equity closure history was not returned.');
    }
    return FounderEquityClosureSnapshot.fromJson(
      Map<String, dynamic>.from(data),
    );
  }

  @override
  Future<void> createCorporateEvent({
    required int opportunityId,
    required String eventType,
    required DateTime effectiveDate,
    required String reason,
    double? sharesIssued,
    double? splitNumerator,
    double? splitDenominator,
    String? shareClass,
    List<int> positionIds = const <int>[],
  }) async {
    final response = await _api.post<dynamic>(
      '/equity/corporate-events',
      data: <String, dynamic>{
        'opportunityId': opportunityId,
        'eventType': eventType,
        'effectiveDate': effectiveDate.toUtc().toIso8601String(),
        'reason': reason.trim(),
        if (sharesIssued != null) 'sharesIssued': sharesIssued,
        if (splitNumerator != null) 'splitNumerator': splitNumerator,
        if (splitDenominator != null) 'splitDenominator': splitDenominator,
        if (shareClass?.trim().isNotEmpty == true)
          'shareClass': shareClass!.trim(),
        if (positionIds.isNotEmpty) 'positionIds': positionIds,
      },
    );
    final data = _data(response.data);
    if (data is! Map || _int(data['id']) <= 0) {
      throw const ApiError(
        message: 'The capitalization event was not returned.',
      );
    }
    await submitCorporateEvent(_int(data['id']));
  }

  @override
  Future<void> submitCorporateEvent(int eventId) async {
    await _api.post<dynamic>('/equity/corporate-events/$eventId/submit');
  }
}

dynamic _data(dynamic payload) =>
    payload is Map && payload.containsKey('data') ? payload['data'] : payload;

List<T> _items<T>(dynamic payload, T Function(Map<String, dynamic>) parse) {
  final data = _data(payload);
  if (data is! List) {
    throw const ApiError(message: 'Equity data was not returned.');
  }
  return data
      .whereType<Map>()
      .map((item) => parse(Map<String, dynamic>.from(item)))
      .toList(growable: false);
}

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(value?.toString() ?? '') ?? 0;

final founderEquityRepositoryProvider = Provider<FounderEquityRepository>(
  (ref) => ApiFounderEquityRepository(ref.read(apiClientProvider)),
);

final founderEquityProvider = FutureProvider.autoDispose
    .family<FounderEquitySummary, ({int opportunityId, int participationId})>(
      (ref, args) => ref
          .read(founderEquityRepositoryProvider)
          .fetch(args.opportunityId, args.participationId),
    );
