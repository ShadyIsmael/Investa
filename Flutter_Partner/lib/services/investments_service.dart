import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_partner/services/api_client.dart';
import 'package:flutter_partner/services/app_logger.dart';
import 'package:flutter_partner/services/secure_storage.dart';
import 'endpoint_resolver.dart';

class InvestmentRequest {
  final String investorId;
  final int projectId;
  final double amount;
  final String businessName;
  final String description;
  final String startDate;
  final int businessStageId;
  final int businessCategoryId;
  final int projectPhaseId;
  final String milestone;
  final String riskLevel;
  final double targetFund;
  final String currency;

  InvestmentRequest({
    required this.investorId,
    required this.projectId,
    required this.amount,
    required this.businessName,
    required this.description,
    required this.startDate,
    required this.businessStageId,
    required this.businessCategoryId,
    required this.projectPhaseId,
    required this.milestone,
    required this.riskLevel,
    required this.targetFund,
    required this.currency,
  });

  Map<String, dynamic> toJson() => {
        'investorId': investorId,
        'projectId': projectId,
        'amount': amount,
        'businessName': businessName,
        'description': description,
        'startDate': startDate,
        'businessStageId': businessStageId,
        'businessCategoryId': businessCategoryId,
        'projectPhaseId': projectPhaseId,
        'milestone': milestone,
        'riskLevel': riskLevel,
        'targetFund': targetFund,
        'currency': currency,
      };
}

class InvestmentsService {
  final String? _baseOverride;
  final ApiClient _client;

  InvestmentsService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;

  /// Creates an investment and returns the created investment payload on success.
  /// Returns `null` on failure.
  Future<Map<String, dynamic>?> createInvestment(dynamic req) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/investments');
    try {
      AppLogger.logInfo(
          'InvestmentsService', 'POST ${uri.toString()} body=${req.toJson()}');
      // Ensure auth token is included explicitly (helps web where secure storage may differ)
      final token = await SecureStorage().read('auth_token');
      final headers = {'content-type': 'application/json'};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
        try {
          final masked = token.length > 8
              ? '${token.substring(0, 4)}...${token.substring(token.length - 4)}'
              : '***';
          AppLogger.logInfo('InvestmentsService',
              'Using auth token (masked=$masked) for request');
        } catch (_) {}
      } else {
        AppLogger.logInfo('InvestmentsService',
            'No auth token found in SecureStorage when creating investment');
      }
      AppLogger.logInfo('InvestmentsService',
          'Request headers keys=${headers.keys.toList()}');
      final payload = req is Map<String, dynamic> ? req : req.toJson();
      final resp =
          await _client.post(uri.toString(), data: payload, headers: headers);
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('InvestmentsService', 'Response status=$status');
      try {
        AppLogger.logInfo('InvestmentsService', 'Response body=${resp.data}');
      } catch (_) {}

      if (status >= 200 && status < 300) {
        try {
          final body = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
          final data = body['data'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(body['data'] as Map)
              : (body['data'] != null ? {'result': body['data']} : null);
          return data ?? <String, dynamic>{};
        } catch (e, s) {
          AppLogger.logError('InvestmentsService', 'Parse error: $e', s);
          return <String, dynamic>{};
        }
      }

      // Try to parse server error details
      try {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        final message = body['message'] ?? body['errors'] ?? body;
        return {'error': message};
      } catch (_) {
        AppLogger.logError('InvestmentsService', 'Server error: $status', null);
        return {'error': 'Server error: $status'};
      }
    } on DioException catch (e) {
      // Log detailed response info when available to help debug 403/401 cases
      try {
        final r = e.response;
        if (r != null) {
          AppLogger.logError(
              'InvestmentsService',
              'Network error status=${r.statusCode} data=${r.data}',
              e.stackTrace);
        } else {
          AppLogger.logError('InvestmentsService',
              'Network error: ${e.message}', e.stackTrace);
        }
      } catch (logErr) {
        AppLogger.logError('InvestmentsService',
            'Network error (no response): ${e.message}', e.stackTrace);
      }
      return null;
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Unexpected: $e', s);
      return null;
    }
  }

  /// Fetch investments by category. If [categoryId] is null, fetches all investments.
  Future<List<dynamic>> fetchByCategory(int? categoryId) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse(
        '$apiBase/api/v1/investments/GetByCategory${categoryId != null ? '?categoryId=$categoryId' : ''}');
    try {
      AppLogger.logInfo('InvestmentsService', 'GET ${uri.toString()}');
      final resp = await _client.get(
        uri.toString(),
        headers: {'accept': 'application/json'},
      );
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('InvestmentsService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        try {
          final body = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
          final data = body['data'] as List? ?? (body['items'] as List?);
          if (data == null) return <dynamic>[];
          // Normalize investment item keys so UI can rely on consistent names
          for (var i = 0; i < data.length; i++) {
            final item = data[i];
            if (item is Map) {
              final m = Map<String, dynamic>.from(item);
              // Founder display can come under multiple keys
              final founder = m['FounderDisplay'] ??
                  m['founderDisplay'] ??
                  m['founderName'] ??
                  m['authorName'];
              if (founder != null) m['FounderDisplay'] = founder;
              // Credibility score normalization
              final cred = m['CredibilityScore'] ??
                  m['credibilityScore'] ??
                  m['credibility'] ??
                  m['authorScore'];
              if (cred != null) {
                if (cred is num) {
                  m['CredibilityScore'] = cred;
                } else if (cred is String) {
                  final parsed = double.tryParse(cred);
                  if (parsed != null) m['CredibilityScore'] = parsed;
                }
              }
              data[i] = m;
            }
          }
          return data;
        } catch (_) {
          // Fallback: if response is a raw list
          if (resp.data is List) return resp.data as List<dynamic>;
          return <dynamic>[];
        }
      }
      AppLogger.logError('InvestmentsService', 'Server error: $status', null);
      return <dynamic>[];
    } on DioException catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'Network error: ${e.message}', e.stackTrace);
      return <dynamic>[];
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Unexpected: $e', s);
      return <dynamic>[];
    }
  }

  /// Fetch investments the current user has engaged/joined.
  Future<List<dynamic>> fetchMyInvestments() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/investments/GetMyInvestments');
    try {
      AppLogger.logInfo('InvestmentsService', 'GET ${uri.toString()}');
      final token = await SecureStorage().read('auth_token');
      final headers = {'accept': 'application/json'};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      final resp = await _client.get(uri.toString(), headers: headers);
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('InvestmentsService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        try {
          final body = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
          final data = body['data'] as List? ?? (body['items'] as List?);
          if (data == null) return <dynamic>[];
          // Normalize investment item keys
          for (var i = 0; i < data.length; i++) {
            final item = data[i];
            if (item is Map) {
              final m = Map<String, dynamic>.from(item);
              final founder = m['FounderDisplay'] ??
                  m['founderDisplay'] ??
                  m['founderName'] ??
                  m['authorName'];
              if (founder != null) m['FounderDisplay'] = founder;
              final cred = m['CredibilityScore'] ??
                  m['credibilityScore'] ??
                  m['credibility'] ??
                  m['authorScore'];
              if (cred != null) {
                if (cred is num) {
                  m['CredibilityScore'] = cred;
                } else if (cred is String) {
                  final parsed = double.tryParse(cred);
                  if (parsed != null) m['CredibilityScore'] = parsed;
                }
              }
              data[i] = m;
            }
          }
          return data;
        } catch (_) {
          if (resp.data is List) return resp.data as List<dynamic>;
          return <dynamic>[];
        }
      }
      AppLogger.logError('InvestmentsService', 'Server error: $status', null);
      return <dynamic>[];
    } on DioException catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'Network error: ${e.message}', e.stackTrace);
      return <dynamic>[];
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Unexpected: $e', s);
      return <dynamic>[];
    }
  }

  /// Attempt to resolve investorId from secure storage if available.
  Future<String> resolveInvestorId() async {
    final id = await SecureStorage().read('user_id');
    return id ?? '';
  }
}
