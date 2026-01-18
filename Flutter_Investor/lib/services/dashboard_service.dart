import 'dart:convert';
import 'package:flutter_investor/services/api_client.dart';
import 'package:flutter_investor/services/app_logger.dart';
import 'package:flutter_investor/services/config.dart';
import 'endpoint_resolver.dart';

class CreditTxnDto {
  final int id;
  final String userId;
  final double amount;
  final String type;
  final String? referenceId;
  final String? description;
  final DateTime createdAt;

  CreditTxnDto(
      {required this.id,
      required this.userId,
      required this.amount,
      required this.type,
      this.referenceId,
      this.description,
      required this.createdAt});

  factory CreditTxnDto.fromJson(Map<String, dynamic> json) {
    return CreditTxnDto(
      id: (json['id'] as num).toInt(),
      userId: json['userId']?.toString() ?? '',
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] as String? ?? '',
      referenceId: json['referenceId']?.toString(),
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class ScoreTxnDto {
  final int id;
  final String userId;
  final double score;
  final int transactionTypeId;
  final String transactionTypeKey;
  final String? reviewerId;
  final DateTime createdAt;

  ScoreTxnDto(
      {required this.id,
      required this.userId,
      required this.score,
      required this.transactionTypeId,
      required this.transactionTypeKey,
      this.reviewerId,
      required this.createdAt});

  factory ScoreTxnDto.fromJson(Map<String, dynamic> json) {
    return ScoreTxnDto(
      id: (json['id'] as num).toInt(),
      userId: json['userId']?.toString() ?? '',
      score: (json['score'] as num).toDouble(),
      transactionTypeId: (json['transactionTypeId'] as num?)?.toInt() ?? 0,
      transactionTypeKey: json['transactionTypeKey'] as String? ?? '',
      reviewerId: json['reviewerId']?.toString(),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class DashboardSummary {
  final int credibilityScore;
  final double walletBalance;
  final double clientScore;
  final double credit;
  final List<CreditTxnDto> creditTransactions;
  final List<ScoreTxnDto> scoreTransactions;

  DashboardSummary(
      {required this.credibilityScore,
      required this.walletBalance,
      required this.clientScore,
      required this.credit,
      required this.creditTransactions,
      required this.scoreTransactions});

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    final creditTx = (json['creditTransactions'] as List?)
            ?.map((e) => CreditTxnDto.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    final scoreTx = (json['scoreTransactions'] as List?)
            ?.map((e) => ScoreTxnDto.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return DashboardSummary(
      credibilityScore: (json['credibilityScore'] as num?)?.toInt() ?? 0,
      walletBalance: (json['walletBalance'] as num?)?.toDouble() ?? 0.0,
      clientScore: (json['clientScore'] as num?)?.toDouble() ?? 0.0,
      credit: (json['credit'] as num?)?.toDouble() ?? 0.0,
      creditTransactions: creditTx,
      scoreTransactions: scoreTx,
    );
  }
}

// DTO for /api/dashboard/my/top-categories

class TopCategoryDto {
  final int businessCategoryId;
  final String businessCategoryName;
  final int investmentCount;

  TopCategoryDto(
      {required this.businessCategoryId,
      required this.businessCategoryName,
      required this.investmentCount});

  factory TopCategoryDto.fromJson(Map<String, dynamic> json) {
    return TopCategoryDto(
      businessCategoryId: (json['businessCategoryId'] as num?)?.toInt() ?? 0,
      businessCategoryName: json['businessCategoryName'] as String? ?? '',
      investmentCount: (json['investmentCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class DashboardService {
  final String? _baseOverride;
  final ApiClient _client;

  DashboardService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ??
      EndpointResolver.instance.selectedApiBaseUrl ??
      Env.apiBaseUrl;

  Future<DashboardSummary?> fetchSummary() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/dashboard/summary');

    try {
      AppLogger.logInfo('DashboardService', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('DashboardService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return DashboardSummary.fromJson(body);
      }
      AppLogger.logError('DashboardService', 'Server error: $status', null);
      return null;
    } catch (e, s) {
      AppLogger.logError('DashboardService', 'Network/parse error: $e', s);
      return null;
    }
  }

  Future<List<TopCategoryDto>> fetchTopCategories({int take = 5}) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri =
        Uri.parse('$apiBase/api/dashboard/my/top-categories?take=$take');

    try {
      AppLogger.logInfo('DashboardService', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('DashboardService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data;
        final list = body is List
            ? (body)
                .map((e) => TopCategoryDto.fromJson(e as Map<String, dynamic>))
                .toList()
            : (jsonDecode(resp.toString()) as List)
                .map((e) => TopCategoryDto.fromJson(e as Map<String, dynamic>))
                .toList();
        return list;
      }
      AppLogger.logError('DashboardService', 'Server error: $status', null);
      return [];
    } catch (e, s) {
      AppLogger.logError('DashboardService', 'Network/parse error: $e', s);
      return [];
    }
  }
}
