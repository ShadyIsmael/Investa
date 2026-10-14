import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

class FounderNotification {
  const FounderNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    required this.actionUrl,
    this.eventType,
    this.opportunityId,
    this.relatedEntityId,
    required this.createdAt,
  });

  final int id;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final String? actionUrl;
  final String? eventType;
  final int? opportunityId;
  final String? relatedEntityId;
  final DateTime? createdAt;

  factory FounderNotification.fromJson(Map<String, dynamic> json) =>
      FounderNotification(
        id: _int(json['id']),
        title: _string(json['title']),
        body: _string(json['body']),
        type: _string(json['type']),
        isRead: json['isRead'] == true,
        actionUrl: json['actionUrl'] as String?,
        eventType: _optionalString(json['eventType']),
        opportunityId: _optionalInt(json['opportunityId']),
        relatedEntityId: _optionalString(json['relatedEntityId']),
        createdAt: DateTime.tryParse(_string(json['createdAt'])),
      );
}

class FounderNotificationsPage {
  const FounderNotificationsPage({
    required this.items,
    required this.totalCount,
    required this.unreadCount,
  });

  final List<FounderNotification> items;
  final int totalCount;
  final int unreadCount;

  factory FounderNotificationsPage.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    return FounderNotificationsPage(
      items:
          rawItems is List
              ? rawItems
                  .whereType<Map>()
                  .map(
                    (item) => FounderNotification.fromJson(
                      Map<String, dynamic>.from(item),
                    ),
                  )
                  .toList(growable: false)
              : const <FounderNotification>[],
      totalCount: _int(json['totalCount']),
      unreadCount: _int(json['unreadCount']),
    );
  }
}

abstract interface class FounderNotificationsRepository {
  Future<FounderNotificationsPage> fetch({int page = 1, int pageSize = 30});
  Future<void> markRead(List<int> ids);
  Future<void> delete(int id);
}

class ApiFounderNotificationsRepository
    implements FounderNotificationsRepository {
  const ApiFounderNotificationsRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<FounderNotificationsPage> fetch({
    int page = 1,
    int pageSize = 30,
  }) async {
    final response = await _api.get<dynamic>(
      '/user-notifications',
      queryParameters: <String, dynamic>{'page': page, 'pageSize': pageSize},
    );
    final root = response.data;
    final data = root is Map && root.containsKey('data') ? root['data'] : root;
    if (data is! Map) {
      throw const ApiError(message: 'Notification data was not returned.');
    }
    return FounderNotificationsPage.fromJson(Map<String, dynamic>.from(data));
  }

  @override
  Future<void> markRead(List<int> ids) async {
    await _api.post<dynamic>(
      '/user-notifications/mark-read',
      data: <String, dynamic>{'ids': ids.isEmpty ? null : ids},
    );
  }

  @override
  Future<void> delete(int id) async {
    await _api.delete<dynamic>('/user-notifications/$id');
  }
}

final founderNotificationsRepositoryProvider =
    Provider<FounderNotificationsRepository>(
      (ref) => ApiFounderNotificationsRepository(ref.read(apiClientProvider)),
    );

final founderNotificationsProvider =
    FutureProvider.autoDispose<FounderNotificationsPage>(
      (ref) => ref.read(founderNotificationsRepositoryProvider).fetch(),
    );

final founderUnreadNotificationCountProvider = FutureProvider.autoDispose<int>((
  ref,
) async {
  final page = await ref
      .read(founderNotificationsRepositoryProvider)
      .fetch(pageSize: 1);
  return page.unreadCount;
});

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;
int? _optionalInt(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value));
String? _optionalString(dynamic value) {
  final result = value?.toString().trim();
  return result == null || result.isEmpty ? null : result;
}

String _string(dynamic value) => value?.toString() ?? '';

/// Converts backend action links into routes owned by the Founder app.
/// External hosts and unrecognized routes are never opened.
String? founderNotificationRoute(String? actionUrl) {
  final raw = actionUrl?.trim();
  if (raw == null || raw.isEmpty) return null;
  final uri = Uri.tryParse(raw);
  if (uri == null) return null;
  var path = uri.path;
  if (path.startsWith('/api/v1/')) path = path.substring('/api/v1'.length);
  final supported =
      path == '/home' ||
      path == '/projects' ||
      path == '/deals' ||
      path == '/chat' ||
      path == '/profile' ||
      path == '/notifications' ||
      RegExp(
        r'^/projects/\d+(?:/edit|/room|/opportunities(?:/(?:new|\d+(?:/requests)?))?)?$',
      ).hasMatch(path) ||
      RegExp(r'^/projects/\d+/participations/\d+$').hasMatch(path) ||
      RegExp(r'^/deals/\d+$').hasMatch(path) ||
      RegExp(r'^/chat/[A-Za-z0-9-]+$').hasMatch(path);
  if (!supported) return null;
  final query = uri.hasQuery ? '?${uri.query}' : '';
  return '$path$query';
}

/// Routes known notification event families to safe Founder-owned surfaces.
/// Event metadata chooses the destination; notification copy and external hosts
/// are never trusted as navigation instructions.
String? founderNotificationRouteForEvent({
  required String? eventType,
  required String? actionUrl,
}) {
  final event = eventType?.trim().toLowerCase() ?? '';
  const chatEvents = <String>{
    'conversationrequestcreated',
    'conversationrequestrejected',
    'conversationrequestwithdrawn',
  };
  const dealEvents = <String>{
    'fundingdeclared',
    'fundingdeclarationconfirmed',
    'fundingdeclarationdisputed',
    'fundingautomaticallyclosed',
    'fundingstatuschanged',
    'loanclosed',
    'loandefaulted',
    'loanfullyrepaid',
    'loaninstallmentdue',
    'loaninstallmentoverdue',
    'loaninstallmentupcoming',
    'loanmaturityreached',
    'loanrepaymentconfirmed',
    'loanrepaymentdeclared',
    'loanrepaymentdisputed',
    'equitycorporateeventapplied',
    'equitypositionactivated',
    'equitypositionpendingfunding',
    'profitsharingclosed',
    'profitsharingdistributionconfirmed',
    'profitsharingdistributiondeclared',
    'profitsharingdistributiondisputed',
    'profitsharingentitlementcalculated',
    'profitsharingperioddeclared',
    'contractactivated',
    'fundingcompleted',
    'fundingprogressreached',
    'participationapprovedfromacceptedoffer',
  };
  if (event == 'newconversationmessage') {
    return _conversationRouteFromAction(actionUrl) ?? '/chat';
  }
  if (event == 'conversationrequestapproved' ||
      event == 'conversationofferschanged' ||
      event == 'conversationmessagesaved' ||
      event == 'negotiationofferreceived' ||
      event == 'negotiationofferreplacementreceived') {
    return _conversationRouteFromAction(actionUrl) ?? '/chat';
  }
  if (chatEvents.contains(event)) return '/chat';
  if (dealEvents.contains(event)) return '/deals';
  if (event == 'participationrequestcreated') return '/projects';

  final safeActionRoute = founderNotificationRoute(actionUrl);
  if (safeActionRoute != null) return safeActionRoute;
  return null;
}

String? _conversationRouteFromAction(String? actionUrl) {
  final uri = Uri.tryParse(actionUrl?.trim() ?? '');
  final id =
      uri?.queryParameters['conversationId'] ??
      uri?.queryParameters['conversationid'];
  if (id == null ||
      !RegExp(
        r'^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$',
      ).hasMatch(id)) {
    return null;
  }
  return '/chat/$id';
}

/// Deactivates this installation's registered push token while the current
/// authenticated session is still available (called before explicit logout).
Future<void> deactivateFounderPushToken(FopxApiClient api) async {
  if (!FirebaseFoundation.instance.isInitialized) return;
  final token = await FirebaseFoundation.instance.readToken();
  if (token == null || token.isEmpty) return;
  final response = await api.get<dynamic>('/notifications/devices');
  final root = response.data;
  final data = root is Map && root.containsKey('data') ? root['data'] : root;
  if (data is! List) return;
  for (final raw in data.whereType<Map>()) {
    final device = Map<String, dynamic>.from(raw);
    if (device['token']?.toString() == token && device['id'] is num) {
      await api.delete<dynamic>('/notifications/devices/${device['id']}');
      return;
    }
  }
}
