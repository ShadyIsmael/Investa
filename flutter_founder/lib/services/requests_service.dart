import 'dart:async';

class RequestItem {
  final String id;
  final String founderName;
  final String? avatarUrl;
  final String businessName;
  final double amount;
  RequestStatus status;
  final DateTime createdAt;
  final bool isIncome;
  final int credibilityScore;

  RequestItem({
    required this.id,
    required this.founderName,
    this.avatarUrl,
    required this.businessName,
    required this.amount,
    this.status = RequestStatus.pending,
    DateTime? createdAt,
    required this.isIncome,
    this.credibilityScore = 50,
  }) : createdAt = createdAt ?? DateTime.now();

  factory RequestItem.fromJson(Map<String, dynamic> json) {
    return RequestItem(
      id: json['id']?.toString() ?? '',
      founderName: json['founderDisplayName'] ?? json['investorDisplayName'] ?? 'Unknown',
      avatarUrl: null,
      businessName: json['businessName'] ?? json['investmentTitle'] ?? 'Unknown',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      status: _parseStatus(json['status']),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      isIncome: json['isIncome'] ?? false,
      credibilityScore: json['credibilityScore'] ?? 50,
    );
  }

  static RequestStatus _parseStatus(String? status) {
    if (status == null) return RequestStatus.pending;
    switch (status.toLowerCase()) {
      case 'pending':
        return RequestStatus.pending;
      case 'accepted':
        return RequestStatus.accepted;
      case 'declined':
        return RequestStatus.declined;
      case 'canceled':
        return RequestStatus.canceled;
      default:
        return RequestStatus.pending;
    }
  }
}

enum RequestStatus { pending, accepted, declined, canceled }

class RequestsService {
  final Dio _dio = Dio();
  final String _baseUrl = Env.apiBaseUrl;

  Future<List<RequestItem>> fetchIncomeRequests() async {
    try {
      final response = await _dio.get('$_baseUrl/api/investment-requests');
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final incoming = data['incoming'] as List<dynamic>? ?? [];
        return incoming.map((json) => RequestItem.fromJson(json as Map<String, dynamic>)).toList();
      }
      
      throw Exception('Failed to load requests');
    } catch (e) {
      throw Exception('Failed to load requests: $e');
    }
  }

  Future<List<RequestItem>> fetchOutcomeRequests() async {
    try {
      final response = await _dio.get('$_baseUrl/api/investment-requests');
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final outgoing = data['outgoing'] as List<dynamic>? ?? [];
        return outgoing.map((json) => RequestItem.fromJson(json as Map<String, dynamic>)).toList();
      }
      
      throw Exception('Failed to load requests');
    } catch (e) {
      throw Exception('Failed to load requests: $e');
    }
  }

  Future<void> acceptRequest(String id) async {
    try {
      final response = await _dio.post('$_baseUrl/api/investment-requests/$id/approve');
      
      if (response.statusCode != 200) {
        throw Exception('Failed to accept request');
      }
    } catch (e) {
      throw Exception('Failed to accept request: $e');
    }
  }

  Future<void> declineRequest(String id) async {
    try {
      final response = await _dio.post('$_baseUrl/api/investment-requests/$id/reject');
      
      if (response.statusCode != 200) {
        throw Exception('Failed to decline request');
      }
    } catch (e) {
      throw Exception('Failed to decline request: $e');
    }
  }

  Future<void> cancelRequest(String id) async {
    try {
      // Cancel endpoint may not exist, using decline for now
      final response = await _dio.post('$_baseUrl/api/investment-requests/$id/reject');
      
      if (response.statusCode != 200) {
        throw Exception('Failed to cancel request');
      }
    } catch (e) {
      throw Exception('Failed to cancel request: $e');
    }
  }
}
