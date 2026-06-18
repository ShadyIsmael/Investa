import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_partner/services/api_client.dart';
import 'package:flutter_partner/services/app_logger.dart';
import 'package:flutter_partner/services/app_state.dart';
import 'package:flutter_partner/services/endpoint_resolver.dart';
import 'package:flutter_partner/services/profile_service.dart';
import 'package:flutter_partner/services/messages.dart';

class RequestItem {
  final String id;
  final String founderName;
  final String? avatarUrl;
  final String businessName; // legacy / company name
  final String investmentTitle; // title of the investment/opportunity
  final String shortDescription; // one-line description
  final String senderName; // the sender name (investor for outgoing requests)
  final String
      receiverName; // the recipient name (founder for outgoing requests)
  final double amount;
  RequestStatus status;
  final DateTime createdAt;
  final bool isIncome;
  final int credibilityScore;
  final String? requestType; // ContactFounder or InvestmentInterest
  final Map<String, dynamic>? requestMetadata; // JSON metadata for investment interest details

  RequestItem({
    required this.id,
    required this.founderName,
    this.avatarUrl,
    required this.businessName,
    required this.investmentTitle,
    this.shortDescription = '',
    this.senderName = '',
    this.receiverName = '',
    required this.amount,
    this.status = RequestStatus.pending,
    DateTime? createdAt,
    required this.isIncome,
    this.credibilityScore = 50,
    this.requestType,
    this.requestMetadata,
  }) : createdAt = createdAt ?? DateTime.now();
}

enum RequestStatus { pending, accepted, declined, canceled }

/// Thrown when an investment request operation fails. Contains optional
/// error code for programmatic handling by the UI.
class InvestmentRequestException implements Exception {
  final String message;
  final String? code;
  InvestmentRequestException(this.message, [this.code]);
  @override
  String toString() => message;
}

/// Service for managing investment requests.
///
/// Mirrors the Angular client portal's RequestsService to maintain consistency
/// across platforms. Handles investment request creation with proper credit
/// validation, API integration, and user profile refresh.
class RequestsService {
  final ApiClient _apiClient;
  final ProfileService _profileService;

  RequestsService({
    ApiClient? apiClient,
    ProfileService? profileService,
  })  : _apiClient = apiClient ?? ApiClient(),
        _profileService = profileService ?? ProfileService();

  // In-memory mock lists for backward compatibility
  final List<RequestItem> _income = [
    RequestItem(
        id: 'inc-1',
        founderName: 'Ali Hassan',
        avatarUrl: null,
        businessName: 'GreenTech Co',
        investmentTitle: 'GreenTech Series A',
        shortDescription: 'Sustainable energy solutions for SMEs',
        senderName: 'Ali Hassan',
        receiverName: 'Ali Hassan',
        amount: 1200.0,
        isIncome: true,
        credibilityScore: 88),
    RequestItem(
        id: 'inc-2',
        founderName: 'Sara Omar',
        avatarUrl: null,
        businessName: 'BlueFoods',
        investmentTitle: 'BlueFoods Expansion',
        shortDescription: 'Fast-growing organic food delivery',
        senderName: 'Sara Omar',
        receiverName: 'Sara Omar',
        amount: 450.0,
        isIncome: true,
        credibilityScore: 72),
  ];

  final List<RequestItem> _outcome = [
    RequestItem(
        id: 'out-1',
        founderName: 'My Request',
        avatarUrl: null,
        businessName: 'Your Venture',
        investmentTitle: 'Your Venture Seed',
        shortDescription: 'Pre-seed round for a marketplace app',
        receiverName: 'Founder Name',
        amount: 300.0,
        isIncome: false,
        credibilityScore: 55),
  ];

  Future<List<RequestItem>> fetchIncomeRequests() async {
    try {
      final baseUrl = EndpointResolver.instance.selectedApiBaseUrl;
      if (baseUrl.isEmpty) {
        AppLogger.logInfo('RequestsService',
            'API base URL not configured, returning mock data');
        return List<RequestItem>.from(_income);
      }

      final endpoint = '$baseUrl/api/investment-requests';
      final resp = await _apiClient.get(endpoint);

      if (resp.statusCode != 200) {
        AppLogger.logError(
            'RequestsService', 'Failed to fetch requests: ${resp.statusCode}');
        return List<RequestItem>.from(_income);
      }

      final data = resp.data;
      if (data == null || data['incoming'] == null) {
        AppLogger.logInfo(
            'RequestsService', 'No incoming requests data in response');
        return [];
      }

      final incomingList = data['incoming'] as List<dynamic>;
      return incomingList
          .map((json) => _mapRequestItem(json as Map<String, dynamic>, true))
          .toList();
    } catch (e, st) {
      AppLogger.logError(
          'RequestsService', 'Error fetching incoming requests: $e', st);
      return List<RequestItem>.from(_income);
    }
  }

  Future<List<RequestItem>> fetchOutcomeRequests() async {
    try {
      final baseUrl = EndpointResolver.instance.selectedApiBaseUrl;
      if (baseUrl.isEmpty) {
        AppLogger.logInfo('RequestsService',
            'API base URL not configured, returning mock data');
        return List<RequestItem>.from(_outcome);
      }

      final endpoint = '$baseUrl/api/investment-requests';
      final resp = await _apiClient.get(endpoint);

      if (resp.statusCode != 200) {
        AppLogger.logError(
            'RequestsService', 'Failed to fetch requests: ${resp.statusCode}');
        return List<RequestItem>.from(_outcome);
      }

      final data = resp.data;
      if (data == null || data['outgoing'] == null) {
        AppLogger.logInfo(
            'RequestsService', 'No outgoing requests data in response');
        return [];
      }

      final outgoingList = data['outgoing'] as List<dynamic>;
      return outgoingList
          .map((json) => _mapRequestItem(json as Map<String, dynamic>, false))
          .toList();
    } catch (e, st) {
      AppLogger.logError(
          'RequestsService', 'Error fetching outgoing requests: $e', st);
      return List<RequestItem>.from(_outcome);
    }
  }

  RequestItem _mapRequestItem(Map<String, dynamic> json, bool isIncome) {
    final id = json['id']?.toString() ??
        DateTime.now().millisecondsSinceEpoch.toString();
    final amount = (json['amount'] as num?)?.toDouble() ?? 0.0;
    final createdAt = json['createdAt'] != null
        ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
        : DateTime.now();

    // Parse status
    RequestStatus status = RequestStatus.pending;
    final statusStr = json['status']?.toString().toLowerCase() ?? 'pending';
    if (statusStr.contains('accept')) {
      status = RequestStatus.accepted;
    } else if (statusStr.contains('decline') || statusStr.contains('reject')) {
      status = RequestStatus.declined;
    } else if (statusStr.contains('cancel')) {
      status = RequestStatus.canceled;
    }

    // Best-effort extraction of new fields
    final investmentTitle = (json['investmentTitle'] ??
                json['investmentName'] ??
                json['businessName'] ??
                json['investment']?['title'])
            ?.toString() ??
        'Investment';
    final shortDescription = (json['investmentDescription'] ??
                json['description'] ??
                json['investment']?['description'])
            ?.toString() ??
        '';
    final businessName = (json['businessName'] ??
                json['investmentName'] ??
                json['investmentTitle'])
            ?.toString() ??
        'Business';
    final receiverName = (json['founderDisplayName'] ??
                json['receiverName'] ??
                json['founderName'] ??
                json['founderDisplay'] ??
                json['recipientName'])
            ?.toString() ??
        'Receiver';
    final senderName = (json['investorDisplayName'] ??
                json['senderName'] ??
                json['investorName'] ??
                json['investorDisplay'])
            ?.toString() ??
        'Sender';
    final founderName = (json['founderName'] ??
                json['founderDisplayName'] ??
                json['founderDisplay'] ??
                senderName)
            ?.toString() ??
        receiverName;

    return RequestItem(
      id: id,
      founderName: founderName,
      avatarUrl: null,
      businessName: businessName,
      investmentTitle: investmentTitle,
      shortDescription: shortDescription,
      senderName: senderName,
      receiverName: receiverName,
      amount: amount,
      status: status,
      createdAt: createdAt,
      isIncome: isIncome,
      credibilityScore: 50,
      requestType: json['requestType']?.toString(),
      requestMetadata: json['requestMetadata'] as Map<String, dynamic>?,
    );
  }

  Future<void> acceptRequest(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final it = _income.firstWhere((e) => e.id == id,
        orElse: () => throw StateError('Not found'));
    it.status = RequestStatus.accepted;
  }

  Future<void> declineRequest(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final it = _income.firstWhere((e) => e.id == id,
        orElse: () => throw StateError('Not found'));
    it.status = RequestStatus.declined;
  }

  Future<void> cancelRequest(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final it = _outcome.firstWhere((e) => e.id == id,
        orElse: () => throw StateError('Not found'));
    it.status = RequestStatus.canceled;
  }

  /// Creates an investment request.
  ///
  /// This mirrors the Angular client portal's createInvestmentRequest flow:
  /// 1. Validates user authentication
  /// 2. Validates credits locally (client-side pre-check)
  /// 3. Calls backend API to:
  ///    - Validate credits server-side
  ///    - Create credit transaction with audit trail (bilingual justification)
  ///    - Create investment request for founder approval
  ///    - Return updated user balance
  /// 4. Refreshes user profile to reflect server-side credit update
  /// 5. Updates local outgoing requests state
  ///
  /// **Parameters:**
  /// - `investment`: The investment object containing id, name, imageUrl, etc.
  /// - `amount`: The investment amount in credits
  /// - `shares`: Number of shares (for equity investments, 0 for funding/engagement)
  /// - `requestType`: Type of request (ContactFounder or InvestmentInterest)
  /// - `requestMetadata`: JSON metadata for investment interest details
  ///
  /// **Throws:**
  /// - Exception if user is not authenticated
  /// - Exception if insufficient credits
  /// - Exception on API failure
  Future<void> createInvestmentRequest({
    required Map<String, dynamic> investment,
    required double amount,
    required int shares,
    String? requestType,
    Map<String, dynamic>? requestMetadata,
  }) async {
    final profile = AppState.instance.profile;
    if (profile == null) {
      throw InvestmentRequestException(
          AppMessages.notAuthenticated, 'not_authenticated');
    }

    final currentCredits = (profile.credit?.toDouble()) ??
        profile.coreMetrics?.walletBalance ??
        0.0;

    // Validate credits locally before API call
    if (currentCredits < amount) {
      throw InvestmentRequestException(
          'Insufficient credits. Please add more credits to your account.',
          'insufficient_credits');
    }

    // Sanity checks
    if (investment['id'] == null || investment['id'].toString().isEmpty) {
      throw InvestmentRequestException(
          'Investment id is required', 'invalid_arguments');
    }
    if (amount <= 0) {
      throw InvestmentRequestException(
          'Amount must be greater than zero', 'invalid_arguments');
    }
    if (shares < 0) {
      throw InvestmentRequestException(
          'Shares cannot be negative', 'invalid_arguments');
    }

    final baseUrl = EndpointResolver.instance.selectedApiBaseUrl;
    if (baseUrl.isEmpty) {
      throw InvestmentRequestException(
          'API base URL is not configured', 'api_not_configured');
    }

    final endpoint = '$baseUrl/api/investment-requests';

    try {
      AppLogger.logInfo('RequestsService',
          'Creating investment request: investmentId=${investment['id']}, amount=$amount, shares=$shares');

      // Ensure investmentId is an int
      final investmentId = investment['id'];
      final investmentIdInt = investmentId is int
          ? investmentId
          : int.tryParse(investmentId.toString()) ?? 0;

      if (investmentIdInt == 0) {
        throw InvestmentRequestException(
            'Invalid investment ID', 'invalid_investment_id');
      }

      final payload = <String, dynamic>{
        'investmentId': investmentIdInt,
        // Keep amount as numeric value expected by backend DTO (decimal)
        'amount': amount,
      };

      // For engagement/founding flows, shares should be omitted (or null).
      // Some backend variants reject explicit 0 due to legacy constraints.
      if (shares > 0) {
        payload['shares'] = shares;
        // Backward-compat alias used by some older API variants.
        payload['numberOfShares'] = shares;
      }

      // Add requestType and requestMetadata if provided
      if (requestType != null) {
        payload['requestType'] = requestType;
      }
      if (requestMetadata != null) {
        payload['requestMetadata'] = requestMetadata;
      }

      final resp = await _apiClient.post(endpoint, data: payload);

      final status = resp.statusCode ?? 0;
      if (status < 200 || status >= 300) {
        AppLogger.logError('RequestsService',
            'API returned non-success status: $status, body=${resp.data}');
        throw StateError(
            'Failed to create investment request (status: $status)');
      }

      AppLogger.logInfo('RequestsService',
          'Investment request created successfully: $status');

      // Refresh user credits from API to reflect server-side update
      // This mirrors the Angular implementation's refreshUser() call
      await refreshUserProfile();

      // Create outgoing request for local UI state (supports new { request, updatedCreditBalance } shape)
      final requestJson =
          resp.data?['request'] ?? resp.data?['outgoingRequest'];
      final outgoingId = requestJson?['id']?.toString() ??
          DateTime.now().millisecondsSinceEpoch.toString();

      DateTime createdAt = DateTime.now();
      try {
        final createdStr = requestJson?['createdAt'] as String?;
        if (createdStr != null && createdStr.isNotEmpty) {
          createdAt = DateTime.tryParse(createdStr) ?? DateTime.now();
        }
      } catch (_) {}

      // If backend returned updatedCreditBalance, update AppState immediately (will also refresh via fetch)
      final updatedBalance = resp.data?['updatedCreditBalance'];
      if (updatedBalance != null) {
        try {
          final bal = (updatedBalance as num).toDouble();
          final current = AppState.instance.profile;
          if (current != null) {
            final newCoreMetrics = current.coreMetrics != null
                ? CoreMetrics(
                    email: current.coreMetrics!.email,
                    role: current.coreMetrics!.role,
                    clientType: current.coreMetrics!.clientType,
                    credibilityScore: current.coreMetrics!.credibilityScore,
                    walletBalance: bal)
                : CoreMetrics(walletBalance: bal);
            final newProfile = Profile(
              userId: current.userId,
              coreMetrics: newCoreMetrics,
              basicInfo: current.basicInfo,
              contactInfo: current.contactInfo,
              identityCompliance: current.identityCompliance,
              auditUsage: current.auditUsage,
              score: current.score,
              credit: bal.toInt(),
              currentCredibilityScore: current.currentCredibilityScore,
              createdAt: current.createdAt,
              updatedAt: DateTime.now(),
            );
            // Update raw JSON copy if present
            final raw = AppState.instance.profileJson;
            Map<String, dynamic>? rawClone;
            if (raw != null) {
              rawClone = Map<String, dynamic>.from(raw);
              rawClone['credit'] = bal.toInt();
              rawClone['coreMetrics'] = {
                ...(rawClone['coreMetrics'] ?? {}),
                'walletBalance': bal
              };
            }
            AppState.instance.setProfile(newProfile, rawClone ?? raw);
          }
        } catch (_) {}
      }

      final outgoingRequest = RequestItem(
        id: outgoingId,
        founderName: investment['founderDisplay'] ?? 'Founder',
        avatarUrl: null,
        businessName: investment['name'] ?? 'Investment',
        investmentTitle:
            investment['name'] ?? investment['title'] ?? 'Investment',
        shortDescription:
            investment['description']?.toString().split('\n').first ?? '',
        senderName: profile.basicInfo?.fullName ?? 'You',
        receiverName: investment['founderDisplay'] ?? '',
        amount: amount,
        status: RequestStatus.pending,
        createdAt: createdAt,
        isIncome: false,
        credibilityScore: 50,
        requestType: requestType,
        requestMetadata: requestMetadata,
      );

      _outcome.add(outgoingRequest);

      AppLogger.logInfo('RequestsService',
          'Outgoing request added to local state: ${outgoingRequest.id}');
    } catch (e, st) {
      // Try to produce a clean, actionable error message
      String message = 'Failed to create investment request.';
      String code = 'api_error';

      try {
        if (e is DioException) {
          final statusCode = e.response?.statusCode;
          AppLogger.logError(
              'RequestsService',
              'Create request failed: status=$statusCode, response=${e.response?.data}, payload={investmentId:${investment['id']}, amount:$amount, shares:$shares}',
              st);

          // Extract error message from backend response
          if (e.response?.data != null) {
            try {
              final responseData = e.response!.data;
              if (responseData is Map) {
                // For 5xx prefer explicit `error` details over generic `message`
                if ((statusCode ?? 0) >= 500) {
                  message = responseData['error']?.toString() ??
                      responseData['detail']?.toString() ??
                      responseData['message']?.toString() ??
                      message;
                } else {
                  message = responseData['message']?.toString() ??
                      responseData['error']?.toString() ??
                      responseData['detail']?.toString() ??
                      message;
                }
              } else if (responseData is String) {
                message = responseData;
              }
            } catch (_) {}
          }

          // Normalize generic internal error labels
          if (message.toLowerCase() == 'internalservererror') {
            message =
                'Server error occurred while creating investment request. Please try again in a moment.';
          }

          // Add HTTP status context if still generic
          if (message == 'Failed to create investment request.' &&
              statusCode != null) {
            if (statusCode == 500) {
              message =
                  'Server error occurred. The backend service encountered an error while processing your request.';
            } else if (statusCode == 400) {
              message =
                  'Invalid request. Please check your input and try again.';
            } else if (statusCode == 401) {
              message = 'Authentication required. Please log in again.';
            } else if (statusCode == 403) {
              message =
                  'Access denied. You do not have permission to perform this action.';
            } else if (statusCode == 404) {
              message = 'Investment not found or endpoint unavailable.';
            } else {
              message = 'Request failed with status $statusCode.';
            }
          }

          code = statusCode != null ? 'http_$statusCode' : code;
        } else if (e is InvestmentRequestException) {
          message = e.message;
          code = e.code ?? code;
        } else {
          message = e.toString();
        }
      } catch (_) {}

      AppLogger.logError('RequestsService',
          'Failed to create investment request: $message (code: $code)', st);
      throw InvestmentRequestException(message, code);
    }
  }

  /// Refreshes the user profile from the backend.
  ///
  /// This mirrors the Angular UserService.refreshUser() method.
  /// Fetches the latest profile data including wallet balance and updates
  /// the global AppState.
  Future<void> refreshUserProfile() async {
    try {
      AppLogger.logInfo(
          'RequestsService', 'Refreshing user profile to get latest credits');

      final profile = await _profileService.fetchProfile();

      // Update global app state with fresh profile
      // Note: fetchProfile already updates AppState internally in ProfileService
    } catch (e) {
      AppLogger.logError('RequestsService',
          'Failed to refresh user profile: $e', StackTrace.current);
      // Don't throw - allow the request creation to succeed even if refresh fails
    }
  }
}
