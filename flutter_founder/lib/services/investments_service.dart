import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_founder/services/api_client.dart';
import 'package:flutter_founder/services/app_logger.dart';
import 'package:flutter_founder/services/secure_storage.dart';
import 'file_store_service.dart';
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
  final int?
      investmentTypeId; // 1 = Founding, 2 = Equity, 3 = Revenue Sharing, 4 = Loan

  // Timeline
  final String? startDate;
  final String? endDate;

  // Media
  final String? imageUrl;
  final String? videoUrl;

  // Founding-specific fields
  final int? durationMonths;
  final double? profitPercentage;
  final String? payoutFrequency;

  // ==================== Equity Exit Strategy Fields ====================
  final double? currentValuation;
  final double? estimatedFutureValuation;
  final int? equityExitType;
  final String? exitTargetDate;
  final String? expectedExitStrategy;

  // ==================== Revenue Sharing Exit Strategy Fields ====================
  final String? contractStartDate;
  final String? contractEndDate;
  final double? totalExpectedPayout;
  final double? remainingPayoutAmount;
  final String? revenueDistributionFrequency;
  final String? contractCompletionStatus;

  // ==================== Loan/Debt Exit Strategy Fields ====================
  final String? repaymentStartDate;
  final String? finalRepaymentDate;
  final double? remainingBalance;
  final double? totalPaidAmount;
  final String? nextInstallmentDate;
  final String? defaultRiskLevel;
  final String? loanCompletionStatus;

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
    // Founding-specific fields
    this.durationMonths,
    this.profitPercentage,
    this.payoutFrequency,
    // Equity exit strategy fields
    this.currentValuation,
    this.estimatedFutureValuation,
    this.equityExitType,
    this.exitTargetDate,
    this.expectedExitStrategy,
    // Revenue sharing exit strategy fields
    this.contractStartDate,
    this.contractEndDate,
    this.totalExpectedPayout,
    this.remainingPayoutAmount,
    this.revenueDistributionFrequency,
    this.contractCompletionStatus,
    // Loan/Debt exit strategy fields
    this.repaymentStartDate,
    this.finalRepaymentDate,
    this.remainingBalance,
    this.totalPaidAmount,
    this.nextInstallmentDate,
    this.defaultRiskLevel,
    this.loanCompletionStatus,
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
        // Founding-specific fields
        if (durationMonths != null) 'durationMonths': durationMonths,
        if (profitPercentage != null) 'profitPercentage': profitPercentage,
        if (payoutFrequency != null) 'payoutFrequency': payoutFrequency,
        // Equity exit strategy fields
        if (currentValuation != null) 'currentValuation': currentValuation,
        if (estimatedFutureValuation != null)
          'estimatedFutureValuation': estimatedFutureValuation,
        if (equityExitType != null) 'equityExitType': equityExitType,
        if (exitTargetDate != null) 'exitTargetDate': exitTargetDate,
        if (expectedExitStrategy != null)
          'expectedExitStrategy': expectedExitStrategy,
        // Revenue sharing exit strategy fields
        if (contractStartDate != null) 'contractStartDate': contractStartDate,
        if (contractEndDate != null) 'contractEndDate': contractEndDate,
        if (totalExpectedPayout != null)
          'totalExpectedPayout': totalExpectedPayout,
        if (remainingPayoutAmount != null)
          'remainingPayoutAmount': remainingPayoutAmount,
        if (revenueDistributionFrequency != null)
          'revenueDistributionFrequency': revenueDistributionFrequency,
        if (contractCompletionStatus != null)
          'contractCompletionStatus': contractCompletionStatus,
        // Loan/Debt exit strategy fields
        if (repaymentStartDate != null)
          'repaymentStartDate': repaymentStartDate,
        if (finalRepaymentDate != null)
          'finalRepaymentDate': finalRepaymentDate,
        if (remainingBalance != null) 'remainingBalance': remainingBalance,
        if (totalPaidAmount != null) 'totalPaidAmount': totalPaidAmount,
        if (nextInstallmentDate != null)
          'nextInstallmentDate': nextInstallmentDate,
        if (defaultRiskLevel != null) 'defaultRiskLevel': defaultRiskLevel,
        if (loanCompletionStatus != null)
          'loanCompletionStatus': loanCompletionStatus,
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

  /// Alias for fetchByCategory(null)
  Future<List<dynamic>> fetchMyInvestments() async {
    return fetchByCategory(null);
  }

  /// Upload an investment image via Investa.FileStore (centralized storage).
  Future<String?> uploadInvestmentImage(
      String filePath, int investmentId) async {
    return FileStoreService().uploadInvestmentImage(filePath, investmentId);
  }

  /// Alias for uploadInvestmentImage using File object and standard parameter order
  Future<String?> uploadImage(int investmentId, File file) async {
    return uploadInvestmentImage(file.path, investmentId);
  }

  /// Upload an investment video via Investa.FileStore (centralized storage).
  Future<String?> uploadInvestmentVideo(
      String filePath, int investmentId) async {
    return FileStoreService().uploadInvestmentVideo(filePath, investmentId);
  }

  /// Fetch a single investment by ID.
  Future<Map<String, dynamic>?> getById(String investmentId) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/investments/$investmentId');
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
          return body['data'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(body['data'] as Map)
              : null;
        } catch (e, s) {
          AppLogger.logError('InvestmentsService', 'Parse error: $e', s);
        }
      }
      return null;
    } on DioException catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Unexpected: $e', s);
      return null;
    }
  }

  /// Set an image as primary for an investment.
  Future<bool> setPrimaryImage(int investmentId, int imageId) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse(
        '$apiBase/api/v1/investments/$investmentId/images/$imageId/set-primary');
    try {
      final token = await SecureStorage().read('auth_token');
      final headers = <String, String>{'content-type': 'application/json'};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      final resp =
          await _client.put(uri.toString(), data: {}, headers: headers);
      return (resp.statusCode ?? 0) >= 200 && (resp.statusCode ?? 0) < 300;
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Set primary failed: $e', s);
      return false;
    }
  }

  /// Delete an image from an investment.
  Future<bool> deleteImage(int investmentId, int imageId) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri =
        Uri.parse('$apiBase/api/v1/investments/$investmentId/images/$imageId');
    try {
      final token = await SecureStorage().read('auth_token');
      final headers = <String, String>{};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      final resp = await _client.delete(uri.toString(), headers: headers);
      return (resp.statusCode ?? 0) >= 200 && (resp.statusCode ?? 0) < 300;
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Delete image failed: $e', s);
      return false;
    }
  }

  /// Fetch a single investment by ID (int version).
  Future<Map<String, dynamic>?> getInvestmentById(int investmentId) async {
    return getById(investmentId.toString());
  }

  /// Update an existing investment.
  Future<Map<String, dynamic>?> updateInvestment(
      String investmentId, Map<String, dynamic> updates) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/investments/$investmentId');
    try {
      final token = await SecureStorage().read('auth_token');
      final headers = <String, String>{'content-type': 'application/json'};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      AppLogger.logInfo('InvestmentsService', 'PUT ${uri.toString()}');
      final resp =
          await _client.put(uri.toString(), data: updates, headers: headers);
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('InvestmentsService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        try {
          final body = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
          return body['data'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(body['data'] as Map)
              : null;
        } catch (e, s) {
          AppLogger.logError('InvestmentsService', 'Parse error: $e', s);
        }
      }
      return null;
    } on DioException catch (e) {
      AppLogger.logError(
          'InvestmentsService', 'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('InvestmentsService', 'Unexpected: $e', s);
      return null;
    }
  }
}
