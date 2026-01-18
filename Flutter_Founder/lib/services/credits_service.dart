import 'dart:convert';
import 'package:flutter_founder/services/api_client.dart';
import 'package:flutter_founder/services/app_logger.dart';
import 'package:flutter_founder/services/config.dart';
import 'endpoint_resolver.dart';

class TimeseriesPoint {
  final DateTime date;
  final double value;

  TimeseriesPoint({required this.date, required this.value});

  factory TimeseriesPoint.fromJson(Map<String, dynamic> json) {
    final d = json['date'] as String? ?? json['timestamp'] as String? ?? '';
    final v = json['value'] as num? ?? json['amount'] as num? ?? 0;
    return TimeseriesPoint(date: DateTime.parse(d), value: (v).toDouble());
  }
}

class CreditsService {
  final String? _baseOverride;
  final ApiClient _client;

  CreditsService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ??
      EndpointResolver.instance.selectedApiBaseUrl ??
      Env.apiBaseUrl;

  /// Fetch monthly timeseries for a client by numeric clientId.
  /// Example endpoint: https://{host}/api/credits/{clientId}/timeseries?from=2024-01-01&to=2024-12-31&metric=balance&interval=month
  Future<List<TimeseriesPoint>> fetchTimeSeries(
    String clientId, {
    required DateTime from,
    required DateTime to,
    String metric = 'balance',
    String interval = 'month',
  }) async {
    var apiBase =
        baseUrl; // clientId is a string (GUID) and will be interpolated into the path
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';

    final uri = Uri.parse('$apiBase/api/credits/$clientId/timeseries');

    String fmt(DateTime d) =>
        '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

    try {
      AppLogger.logInfo('CreditsService',
          'GET ${uri.toString()} from=${fmt(from)} to=${fmt(to)} metric=$metric interval=$interval');
      final resp = await _client.get(uri.toString(), queryParameters: {
        'from': fmt(from),
        'to': fmt(to),
        'metric': metric,
        'interval': interval,
      }, headers: {
        'accept': 'application/json'
      });

      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('CreditsService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is List
            ? resp.data as List
            : jsonDecode(resp.toString()) as List;
        final list = body
            .map((e) => TimeseriesPoint.fromJson(e as Map<String, dynamic>))
            .toList();
        AppLogger.logInfo(
            'CreditsService', 'Loaded ${list.length} timeseries points');
        return list;
      }

      AppLogger.logError('CreditsService', 'Server error: $status', null);
      return <TimeseriesPoint>[];
    } catch (e, s) {
      AppLogger.logError('CreditsService', 'Network/parse error: $e', s);
      return <TimeseriesPoint>[];
    }
  }

  /// Credit transaction model returned by GET /api/credits/{userId}
  /// Example item:
  /// {
  ///   "id": 6,
  ///   "userId": "168b6970-...",
  ///   "amount": 10.00,
  ///   "type": "Adjustment",
  ///   "referenceId": null,
  ///   "description": "Test adj +10",
  ///   "createdAt": "2025-12-28T13:58:01Z"
  /// }
  ///
  /// Note: `userId` is kept as a string in the model, while API calls now take a numeric id parameter.

  Future<List<CreditTransaction>> fetchTransactions(String userId) async {
    var apiBase =
        baseUrl; // userId is a string (GUID) and interpolated into the path
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';

    final uri = Uri.parse('$apiBase/api/credits/$userId');
    try {
      AppLogger.logInfo('CreditsService', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('CreditsService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is List
            ? resp.data as List
            : jsonDecode(resp.toString()) as List;
        final list = body
            .map((e) => CreditTransaction.fromJson(e as Map<String, dynamic>))
            .toList();
        AppLogger.logInfo(
            'CreditsService', 'Loaded ${list.length} credit transactions');
        return list;
      }
      AppLogger.logError('CreditsService', 'Server error: $status', null);
      return <CreditTransaction>[];
    } catch (e, s) {
      AppLogger.logError('CreditsService', 'Network/parse error: $e', s);
      return <CreditTransaction>[];
    }
  }
}

class CreditTransaction {
  final int id;
  final String userId;
  final int amount;
  final String type;
  final String? referenceId;
  final String? description;
  final DateTime createdAt;

  CreditTransaction(
      {required this.id,
      required this.userId,
      required this.amount,
      required this.type,
      this.referenceId,
      this.description,
      required this.createdAt});

  factory CreditTransaction.fromJson(Map<String, dynamic> json) {
    return CreditTransaction(
      id: (json['id'] as num).toInt(),
      userId: json['userId']?.toString() ?? '',
      amount: (json['amount'] as num).toInt(),
      type: json['type'] as String? ?? '',
      referenceId: json['referenceId']?.toString(),
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
