import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

class FounderJoinRequest {
  const FounderJoinRequest({
    required this.id,
    required this.opportunityId,
    required this.investorName,
    required this.status,
    required this.requestType,
    required this.amount,
    required this.currency,
    required this.message,
    required this.createdAt,
    required this.canApprove,
    required this.canReject,
  });

  final int id;
  final int opportunityId;
  final String investorName;
  final String status;
  final String requestType;
  final double? amount;
  final String currency;
  final String message;
  final DateTime? createdAt;
  final bool canApprove;
  final bool canReject;

  factory FounderJoinRequest.fromJson(Map<String, dynamic> json) {
    final amount =
        json['fundingAmount'] ??
        json['calculatedTotalAmount'] ??
        json['requestedAmount'];
    return FounderJoinRequest(
      id: _int(json['id'] ?? json['requestId']),
      opportunityId: _int(json['opportunityId']),
      investorName: _string(
        json['investorName'] ?? json['investorDisplayName'],
      ),
      status: _string(json['status']),
      requestType: _string(json['requestType']),
      amount: amount is num ? amount.toDouble() : null,
      currency: _string(json['fundingCurrency'] ?? json['enteredCurrency']),
      message: _string(json['message']),
      createdAt: DateTime.tryParse(_string(json['createdAt'])),
      canApprove:
          json['canApprove'] == true ||
          _string(json['status']).toLowerCase() == 'pending',
      canReject:
          json['canReject'] == true ||
          _string(json['status']).toLowerCase() == 'pending',
    );
  }
}

abstract interface class FounderJoinRequestsRepository {
  Future<List<FounderJoinRequest>> fetch(int opportunityId);
  Future<void> approve(int requestId);
  Future<void> reject(int requestId, String reason);
}

class ApiFounderJoinRequestsRepository
    implements FounderJoinRequestsRepository {
  const ApiFounderJoinRequestsRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<List<FounderJoinRequest>> fetch(int opportunityId) async {
    final response = await _api.get<dynamic>(
      '/opportunities/$opportunityId/join-requests',
    );
    final root = response.data;
    final data = root is Map && root.containsKey('data') ? root['data'] : root;
    if (data is! List) {
      throw const ApiError(message: 'Join request data was not returned.');
    }
    return data
        .whereType<Map>()
        .map(
          (item) =>
              FounderJoinRequest.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }

  @override
  Future<void> approve(int requestId) async {
    await _api.post<dynamic>('/opportunity-join-requests/$requestId/approve');
  }

  @override
  Future<void> reject(int requestId, String reason) async {
    await _api.post<dynamic>(
      '/opportunity-join-requests/$requestId/reject',
      data: <String, dynamic>{'reason': reason.trim()},
    );
  }
}

final founderJoinRequestsRepositoryProvider =
    Provider<FounderJoinRequestsRepository>(
      (ref) => ApiFounderJoinRequestsRepository(ref.read(apiClientProvider)),
    );

final founderJoinRequestsProvider = FutureProvider.autoDispose
    .family<List<FounderJoinRequest>, int>(
      (ref, opportunityId) =>
          ref.read(founderJoinRequestsRepositoryProvider).fetch(opportunityId),
    );

String _string(dynamic value) => value?.toString() ?? '';

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;
