import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_dark_app/services/api_client.dart';
import 'package:flutter_dark_app/services/app_logger.dart';
import 'package:flutter_dark_app/services/config.dart';
import 'endpoint_resolver.dart';

class ProjectPhase {
  final int id;
  final int? type;
  final String key;
  final String value;
  final String valueAr;
  final int? sortOrder;
  final String? slug;
  final String? displayName;

  ProjectPhase({
    required this.id,
    this.type,
    required this.key,
    required this.value,
    required this.valueAr,
    this.sortOrder,
    this.slug,
    this.displayName,
  });

  factory ProjectPhase.fromJson(Map<String, dynamic> json) {
    return ProjectPhase(
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

class ProjectPhasesService {
  final String? _baseOverride;
  final ApiClient _client;

  ProjectPhasesService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ??
      EndpointResolver.instance.selectedApiBaseUrl ??
      Env.apiBaseUrl;

  Future<List<ProjectPhase>> fetchPhases() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/lookups/project-phases');
    try {
      AppLogger.logInfo('ProjectPhasesService', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('ProjectPhasesService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        final data = body['data'] as List?;
        if (data == null) return <ProjectPhase>[];
        final list = data
            .map((e) => ProjectPhase.fromJson(e as Map<String, dynamic>))
            .toList();
        AppLogger.logInfo(
            'ProjectPhasesService', 'Loaded ${list.length} phases');
        return list;
      }
      AppLogger.logError('ProjectPhasesService', 'Server error: $status', null);
      return <ProjectPhase>[];
    } on DioException catch (e) {
      AppLogger.logError(
          'ProjectPhasesService', 'Network error: ${e.message}', e.stackTrace);
      return <ProjectPhase>[];
    } catch (e, s) {
      AppLogger.logError('ProjectPhasesService', 'Unexpected: $e', s);
      return <ProjectPhase>[];
    }
  }
}
