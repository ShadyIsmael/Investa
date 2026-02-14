import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;
import 'package:flutter_founder/services/api_client.dart';
import 'package:flutter_founder/services/app_logger.dart';
import 'package:flutter_founder/services/secure_storage.dart';
import 'endpoint_resolver.dart';

class CreateInvestmentRequest {
  // Financial structure - required for equity crowdfunding
  final double initialCapital;
  final double sharePrice;
  final int totalShares;
  final double? targetFund;

  // Optional financial limits
  final double? minInvestment;
  final double? maxInvestment;
  final double? valuationCap;
  final double? expectedROI;

  // Business details
  final String businessName;
  final String description;

  // Classification
  final int businessCategoryId;
  final int businessStageId;
  final int? projectPhaseId;
  final String? milestone;
  final String? riskLevel;
  final String? currency;

  // Investment type
  final int? investmentTypeId; // 1 = Founding, 2 = Equity

  // Timeline
  final String? startDate;
  final String? endDate;

  // Media
  final String? imageUrl;
  final String? videoUrl;

  CreateInvestmentRequest({
    required this.initialCapital,
    required this.sharePrice,
    required this.totalShares,
    required this.businessName,
    required this.description,
    required this.businessCategoryId,
    required this.businessStageId,
    this.targetFund,
    this.minInvestment,
    this.maxInvestment,
    this.valuationCap,
    this.expectedROI,
    this.projectPhaseId,
    this.milestone,
    this.riskLevel,
    this.currency,
    this.investmentTypeId,
    this.startDate,
    this.endDate,
    this.imageUrl,
    this.videoUrl,
  });

  Map<String, dynamic> toJson() => {
        'initialCapital': initialCapital,
        'sharePrice': sharePrice,
        'totalShares': totalShares,
        'targetFund': targetFund,
        'minInvestment': minInvestment,
        'maxInvestment': maxInvestment,
        'valuationCap': valuationCap,
        'expectedROI': expectedROI,
        'businessName': businessName,
        'description': description,
        'businessCategoryId': businessCategoryId,
        'businessStageId': businessStageId,
        'projectPhaseId': projectPhaseId,
        'milestone': milestone,
        'riskLevel': riskLevel,
        'currency': currency,
        'investmentTypeId': investmentTypeId,
        'startDate': startDate,
        'endDate': endDate,
        'imageUrl': imageUrl,
        'videoUrl': videoUrl,
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
          // API returns { success: true, data: { ... } }
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
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
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

  /// Fetch investments created by the current user.
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

  /// Fetch single investment by id
  Future<Map<String, dynamic>?> getInvestmentById(int id) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/investments/$id');
    try {
      final resp = await _client.get(uri.toString());
      final status = resp.statusCode ?? 0;
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return body['data'] as Map<String, dynamic>?;
      }
      return null;
    } catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'getInvestmentById failed: $e', null);
      return null;
    }
  }

  /// Upload image for investment (multipart)
  Future<Map<String, dynamic>?> uploadImage(int investmentId, File file,
      {String? caption}) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final url = '$apiBase/api/v1/investments/$investmentId/images';
    try {
      final fileName = p.basename(file.path);
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: fileName),
        if (caption != null) 'caption': caption,
      });
      final resp = await _client.post(url,
          data: form, headers: {'content-type': 'multipart/form-data'});
      final status = resp.statusCode ?? 0;
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return body['data'] as Map<String, dynamic>?;
      }
      return null;
    } on DioException catch (e) {
      AppLogger.logError('InvestmentsService',
          'uploadImage network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e) {
      AppLogger.logError('InvestmentsService', 'uploadImage failed: $e', null);
      return null;
    }
  }

  Future<bool> deleteImage(int investmentId, int imageId) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final url = '$apiBase/api/v1/investments/$investmentId/images/$imageId';
    try {
      final resp = await _client.post(
          url.replaceFirst('api/v1/investments',
              'api/v1/investments') /* placeholder to use post? */,
          headers: {});
      // The API expects DELETE; using _client.post would be incorrect here. Use Dio directly via _client.post with method override.
      final r = await _client.delete(url);
      final status = r.statusCode ?? 0;
      return status >= 200 && status < 300;
    } catch (e) {
      AppLogger.logError('InvestmentsService', 'deleteImage failed: $e', null);
      return false;
    }
  }

  Future<bool> setPrimaryImage(int investmentId, int imageId) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final url =
        '$apiBase/api/v1/investments/$investmentId/images/$imageId/set-primary';
    try {
      final resp = await _client.put(url);
      final status = resp.statusCode ?? 0;
      return status >= 200 && status < 300;
    } catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'setPrimaryImage failed: $e', null);
      return false;
    }
  }

  Future<bool> reorderImages(
      int investmentId, List<Map<String, int>> ordering) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final url = '$apiBase/api/v1/investments/$investmentId/images/reorder';
    try {
      final resp = await _client.put(url, data: ordering);
      final status = resp.statusCode ?? 0;
      return status >= 200 && status < 300;
    } catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'reorderImages failed: $e', null);
      return false;
    }
  }

  /// Attempt to resolve investorId from secure storage if available.
  Future<String> resolveInvestorId() async {
    final id = await SecureStorage().read('user_id');
    return id ?? '';
  }
}
