import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_investor/services/api_client.dart';
import 'package:flutter_investor/services/app_logger.dart';
import 'package:flutter_investor/services/config.dart';
import 'package:flutter_investor/services/endpoint_resolver.dart';

class Category {
  final int id;
  final String key;
  final String value;
  final String valueAr;
  final int? sortOrder;
  final String? slug;

  Category(
      {required this.id,
      required this.key,
      required this.value,
      required this.valueAr,
      this.sortOrder,
      this.slug});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as int,
      key: json['key'] as String? ?? '',
      value: json['value'] as String? ?? '',
      valueAr: json['valueAr'] as String? ?? '',
      sortOrder: json['sortOrder'] as int?,
      slug: json['slug'] as String?,
    );
  }
}

class CategoriesService {
  final String? _baseOverride;
  final ApiClient _client;

  CategoriesService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ??
      EndpointResolver.instance.selectedApiBaseUrl ??
      Env.apiBaseUrl;

  Future<List<Category>> fetchCategories() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/v1/categories');
    try {
      AppLogger.logInfo('CategoriesService', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('CategoriesService', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        final data = body['data'] as List?;
        if (data == null) return <Category>[];
        final list = data
            .map((e) => Category.fromJson(e as Map<String, dynamic>))
            .toList();
        AppLogger.logInfo(
            'CategoriesService', 'Loaded ${list.length} categories');
        return list;
      }
      AppLogger.logError('CategoriesService', 'Server error: $status', null);
      return <Category>[];
    } on DioException catch (e) {
      AppLogger.logError(
          'CategoriesService', 'Network error: ${e.message}', e.stackTrace);
      return <Category>[];
    } catch (e, s) {
      AppLogger.logError('CategoriesService', 'Unexpected: $e', s);
      return <Category>[];
    }
  }
}
