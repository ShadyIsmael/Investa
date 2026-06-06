import 'dart:convert';
import 'package:flutter_partner/models/trust_profile.dart';
import 'package:flutter_partner/services/api_client.dart';
import 'package:flutter_partner/services/app_logger.dart';
import 'package:flutter_partner/services/endpoint_resolver.dart';

/// Service for Progressive Trust System API calls.
class TrustService {
  final ApiClient _client;
  final String? _baseOverride;

  TrustService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;

  String get _trustBase => '$baseUrl/api/v1/trust';

  /// Fetch the current user's trust profile.
  Future<TrustProfile?> fetchMyTrustProfile() async {
    try {
      final uri = '$_trustBase/me';
      AppLogger.logInfo('TrustService', 'GET $uri');
      final resp = await _client.get(uri, headers: {'accept': 'application/json'});
      if ((resp.statusCode ?? 0) >= 200 && (resp.statusCode ?? 0) < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.data.toString()) as Map<String, dynamic>;
        final data = body['data'] as Map<String, dynamic>? ?? body;
        return TrustProfile.fromJson(data);
      }
    } catch (e, s) {
      AppLogger.logError('TrustService', 'fetchMyTrustProfile failed: $e', s);
    }
    return null;
  }

  /// Trigger trust recalculation after profile update.
  Future<TrustProfile?> recalculate() async {
    try {
      final uri = '$_trustBase/me/recalculate';
      final resp = await _client.post(uri, data: {});
      if ((resp.statusCode ?? 0) >= 200 && (resp.statusCode ?? 0) < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.data.toString()) as Map<String, dynamic>;
        final data = body['data'] as Map<String, dynamic>? ?? body;
        return TrustProfile.fromJson(data);
      }
    } catch (e, s) {
      AppLogger.logError('TrustService', 'recalculate failed: $e', s);
    }
    return null;
  }

  /// Submit a verification document.
  Future<bool> submitVerification({
    required int verificationType,
    String? documentUrl,
    String? provider,
    String? providerReferenceId,
  }) async {
    try {
      final uri = '$_trustBase/me/verifications';
      final payload = {
        'verificationType': verificationType,
        if (documentUrl != null) 'documentUrl': documentUrl,
        if (provider != null) 'provider': provider,
        if (providerReferenceId != null)
          'providerReferenceId': providerReferenceId,
      };
      final resp = await _client.post(uri, data: payload);
      return (resp.statusCode ?? 0) >= 200 && (resp.statusCode ?? 0) < 300;
    } catch (e, s) {
      AppLogger.logError('TrustService', 'submitVerification failed: $e', s);
      return false;
    }
  }
}

