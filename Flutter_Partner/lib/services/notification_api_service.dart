import 'dart:convert';
import 'package:flutter_partner/services/api_client.dart';
import 'package:flutter_partner/services/app_logger.dart';
import 'endpoint_resolver.dart';

// ── Models ────────────────────────────────────────────────────────────────────

class AppNotification {
  final int id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    dynamic get(String lower, String pascal) => json[lower] ?? json[pascal];
    return AppNotification(
      id: (get('id', 'Id') as num).toInt(),
      title: get('title', 'Title') as String? ?? '',
      message: get('message', 'Message') as String? ?? '',
      type: get('type', 'Type') as String? ?? 'info',
      isRead: get('isRead', 'IsRead') as bool? ?? false,
      createdAt: DateTime.tryParse(
            (get('createdAt', 'CreatedAt') as String?) ?? '',
          ) ??
          DateTime.now(),
    );
  }

  AppNotification copyWith({bool? isRead}) {
    return AppNotification(
      id: id,
      title: title,
      message: message,
      type: type,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }
}

class NotificationPage {
  final List<AppNotification> items;
  final int totalCount;
  final int unreadCount;

  const NotificationPage({
    required this.items,
    required this.totalCount,
    required this.unreadCount,
  });
}

// ── Service ───────────────────────────────────────────────────────────────────

class NotificationApiService {
  final String? _baseOverride;
  final ApiClient _client;

  NotificationApiService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get _baseUrl {
    final u = _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;
    return u.startsWith('http') ? u : 'http://$u';
  }

  /// Fetch a page of notifications.
  /// Endpoint: GET /api/v1/user-notifications?page={page}&pageSize={pageSize}
  Future<NotificationPage> fetchNotifications({
    int page = 1,
    int pageSize = 20,
  }) async {
    final uri =
        '$_baseUrl/api/v1/user-notifications?page=$page&pageSize=$pageSize';
    try {
      AppLogger.logInfo('NotificationApiService', 'GET $uri');
      final resp =
          await _client.get(uri, headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;

      if (status >= 200 && status < 300) {
        final raw = resp.data;
        final Map<String, dynamic> body = raw is Map<String, dynamic>
            ? raw
            : jsonDecode(resp.toString()) as Map<String, dynamic>;

        // Support wrapped { data: [...], totalCount, unreadCount } or bare array
        final List<dynamic> dataList;
        if (body['data'] is List) {
          dataList = body['data'] as List;
        } else if (raw is List) {
          dataList = raw;
        } else {
          dataList = [];
        }

        final items = dataList
            .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
            .toList();

        return NotificationPage(
          items: items,
          totalCount: (body['totalCount'] as num?)?.toInt() ?? items.length,
          unreadCount: (body['unreadCount'] as num?)?.toInt() ??
              items.where((n) => !n.isRead).length,
        );
      }

      AppLogger.logError(
          'NotificationApiService', 'Server error: $status', null);
      return const NotificationPage(items: [], totalCount: 0, unreadCount: 0);
    } catch (e, s) {
      AppLogger.logError(
          'NotificationApiService', 'fetchNotifications error: $e', s);
      return const NotificationPage(items: [], totalCount: 0, unreadCount: 0);
    }
  }

  /// Mark a single notification as read.
  /// Endpoint: POST /api/v1/user-notifications/mark-read  body: { ids: [id] }
  Future<void> markAsRead(int id) async {
    final uri = '$_baseUrl/api/v1/user-notifications/mark-read';
    try {
      AppLogger.logInfo('NotificationApiService', 'POST $uri id=$id');
      await _client.post(
        uri,
        data: {
          'ids': [id]
        },
        headers: {'content-type': 'application/json'},
      );
    } catch (e, s) {
      AppLogger.logError('NotificationApiService', 'markAsRead error: $e', s);
    }
  }

  /// Mark ALL notifications as read.
  /// Endpoint: POST /api/v1/user-notifications/mark-read  body: {} (all)
  Future<void> markAllAsRead() async {
    final uri = '$_baseUrl/api/v1/user-notifications/mark-read';
    try {
      AppLogger.logInfo('NotificationApiService', 'POST $uri (all)');
      await _client.post(
        uri,
        data: <String, dynamic>{},
        headers: {'content-type': 'application/json'},
      );
    } catch (e, s) {
      AppLogger.logError(
          'NotificationApiService', 'markAllAsRead error: $e', s);
    }
  }

  /// Delete a notification permanently.
  /// Endpoint: DELETE /api/v1/user-notifications/{id}
  Future<void> deleteNotification(int id) async {
    final uri = '$_baseUrl/api/v1/user-notifications/$id';
    try {
      AppLogger.logInfo('NotificationApiService', 'DELETE $uri');
      await _client.delete(uri, headers: {'accept': 'application/json'});
    } catch (e, s) {
      AppLogger.logError(
          'NotificationApiService', 'deleteNotification error: $e', s);
    }
  }
}
