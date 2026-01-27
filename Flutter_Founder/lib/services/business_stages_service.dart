import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_founder/services/api_client.dart';
import 'package:flutter_founder/services/app_logger.dart';
import 'endpoint_resolver.dart';

class BusinessStage {
  final int id;
  final int? type;
  final String key;
  final String value;
  final String valueAr;
  final int? sortOrder;
  final String? slug;
  final String? displayName;

  BusinessStage({
    required this.id,
    this.type,
    required this.key,
    required this.value,
    required this.valueAr,
    this.sortOrder,
    this.slug,
    this.displayName,
  });

  factory BusinessStage.fromJson(Map<String, dynamic> json) {
    return BusinessStage(
      id: json['id'] as int,
      type: json['type'] as int?,
      key: json['key'] as String? ?? '',
      value: json['value'] as String? ?? '',
      valueAr: json['valueAr'] as String? ?? '',
      sortOrder: json['sortOrder'] as int?,
      slug: json['slug'] as String?,
      displayName:
          json['displayName'] as String? ?? json['value'] as String? ?? '',
    );
  }
}

class BusinessStagesService {
  final String? _baseOverride;
  final ApiClient _client;

  BusinessStagesService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;

  Future<List<BusinessStage>> fetchStages() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/lookups/business-stages');
    try {
      AppLogger.logInfo('BusinessStagesService', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('BusinessStagesService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        final data = body['data'] as List?;
        if (data == null) return <BusinessStage>[];
        final list = data
            .map((e) => BusinessStage.fromJson(e as Map<String, dynamic>))
            .toList();
        AppLogger.logInfo(
            'BusinessStagesService', 'Loaded ${list.length} stages');
        return list;
      }
      AppLogger.logError(
          'BusinessStagesService', 'Server error: $status', null);
      return <BusinessStage>[];
    } on DioException catch (e) {
      AppLogger.logError(
          'BusinessStagesService', 'Network error: ${e.message}', e.stackTrace);
      return <BusinessStage>[];
    } catch (e, s) {
      AppLogger.logError('BusinessStagesService', 'Unexpected: $e', s);
      return <BusinessStage>[];
    }
  }
}
