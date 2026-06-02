import 'dart:convert';
import 'package:flutter_partner/services/api_client.dart';
import 'package:flutter_partner/services/app_logger.dart';
import 'endpoint_resolver.dart';

// ── Models ────────────────────────────────────────────────────────────────────

class CreditPlan {
  final int id;
  final String name;
  final int credits;
  final double price;
  final String billingPeriod;
  final bool isActive;

  const CreditPlan({
    required this.id,
    required this.name,
    required this.credits,
    required this.price,
    required this.billingPeriod,
    required this.isActive,
  });

  factory CreditPlan.fromJson(Map<String, dynamic> json) {
    return CreditPlan(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String? ?? '',
      credits: (json['credits'] as num).toInt(),
      price: (json['price'] as num).toDouble(),
      billingPeriod: json['billingPeriod'] as String? ?? 'monthly',
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  /// Human-readable billing label (EN)
  String get billingLabel {
    switch (billingPeriod.toLowerCase()) {
      case 'yearly':
        return 'Yearly';
      case 'one-time':
        return 'One-Time';
      default:
        return 'Monthly';
    }
  }

  /// Human-readable billing label (AR)
  String get billingLabelAr {
    switch (billingPeriod.toLowerCase()) {
      case 'yearly':
        return 'سنوي';
      case 'one-time':
        return 'مرة واحدة';
      default:
        return 'شهري';
    }
  }

  double get pricePerCredit => credits > 0 ? price / credits : 0;
}

class PurchaseResult {
  final String referenceNumber;
  final String planName;
  final int creditsAdded;
  final double newBalance;

  const PurchaseResult({
    required this.referenceNumber,
    required this.planName,
    required this.creditsAdded,
    required this.newBalance,
  });

  factory PurchaseResult.fromJson(Map<String, dynamic> json) {
    return PurchaseResult(
      referenceNumber: json['referenceNumber'] as String? ?? '',
      planName: json['planName'] as String? ?? '',
      creditsAdded: (json['creditsAdded'] as num?)?.toInt() ?? 0,
      newBalance: (json['newBalance'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

class CreditPlansService {
  final String? _baseOverride;
  final ApiClient _client;

  CreditPlansService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get _baseUrl {
    final u = _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;
    return u.startsWith('http') ? u : 'http://$u';
  }

  /// Fetch all active credit plans from the admin-created catalog.
  /// Endpoint: GET /api/credit-plans
  Future<List<CreditPlan>> fetchPlans() async {
    final uri = '$_baseUrl/api/credit-plans';
    try {
      AppLogger.logInfo('CreditPlansService', 'GET $uri');
      final resp =
          await _client.get(uri, headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('CreditPlansService', 'Response status=$status');

      if (status >= 200 && status < 300) {
        final raw = resp.data;
        final List<dynamic> list;
        if (raw is List) {
          list = raw;
        } else if (raw is Map && raw['data'] is List) {
          list = raw['data'] as List;
        } else {
          list = jsonDecode(resp.toString()) as List;
        }
        return list
            .map((e) => CreditPlan.fromJson(e as Map<String, dynamic>))
            .where((p) => p.isActive)
            .toList();
      }

      AppLogger.logError('CreditPlansService', 'Server error: $status', null);
      return [];
    } catch (e, s) {
      AppLogger.logError('CreditPlansService', 'fetchPlans error: $e', s);
      return [];
    }
  }

  /// Purchase a credit plan.
  /// Endpoint: POST /api/credit-plans/{planId}/purchase
  /// Returns [PurchaseResult] on success, throws on failure.
  Future<PurchaseResult> purchasePlan(int planId) async {
    final uri = '$_baseUrl/api/credit-plans/$planId/purchase';
    try {
      AppLogger.logInfo('CreditPlansService', 'POST $uri (planId=$planId)');
      final resp = await _client.post(
        uri,
        data: <String, dynamic>{},
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json'
        },
      );
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo(
          'CreditPlansService', 'Purchase response status=$status');

      if (status >= 200 && status < 300) {
        final raw = resp.data;
        final Map<String, dynamic> body = raw is Map<String, dynamic>
            ? raw
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return PurchaseResult.fromJson(body);
      }

      final errorMsg =
          _extractErrorMessage(resp.data) ?? 'Purchase failed (HTTP $status)';
      throw Exception(errorMsg);
    } catch (e, s) {
      AppLogger.logError('CreditPlansService', 'purchasePlan error: $e', s);
      rethrow;
    }
  }

  String? _extractErrorMessage(dynamic body) {
    if (body is Map) {
      return body['message']?.toString() ?? body['error']?.toString();
    }
    return null;
  }
}
