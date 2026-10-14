import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';

import 'package:fopx_founder/features/notifications/data/notifications_controller.dart';
import 'package:fopx_founder/features/notifications/presentation/notifications_page.dart';

void main() {
  test('parses notification content and unread state', () {
    final notification = FounderNotification.fromJson(<String, dynamic>{
      'id': 7,
      'title': 'Project update',
      'body': 'An investor joined the conversation.',
      'type': 'conversation',
      'isRead': false,
      'actionUrl': '/chat/abc',
      'eventType': 'ConversationRequestCreated',
      'opportunityId': 14,
      'relatedEntityId': 'request-uuid',
      'createdAt': '2026-09-23T08:00:00Z',
    });

    expect(notification.id, 7);
    expect(notification.title, 'Project update');
    expect(notification.isRead, isFalse);
    expect(notification.eventType, 'ConversationRequestCreated');
    expect(notification.opportunityId, 14);
    expect(notification.relatedEntityId, 'request-uuid');
    expect(notification.createdAt, isNotNull);
  });

  testWidgets('renders authoritative notifications and unread count', (
    tester,
  ) async {
    final repository = _FakeNotificationsRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          founderNotificationsRepositoryProvider.overrideWithValue(repository),
        ],
        child: MaterialApp(
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            FopxLocalizationsDelegate(),
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
          home: const NotificationsPage(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Project update'), findsOneWidget);
    expect(find.textContaining('1 unread notifications'), findsOneWidget);
    expect(find.text('No notifications yet'), findsNothing);

    await tester.tap(find.byTooltip('Delete notification'));
    await tester.pumpAndSettle();
    final dialog = find.byType(AlertDialog);
    await tester.tap(
      find
          .descendant(of: dialog, matching: find.text('Delete notification'))
          .last,
    );
    await tester.pumpAndSettle();
    expect(repository.deletedIds, <int>[7]);
  });
}

class _FakeNotificationsRepository implements FounderNotificationsRepository {
  final List<int> deletedIds = <int>[];

  @override
  Future<FounderNotificationsPage> fetch({
    int page = 1,
    int pageSize = 30,
  }) async => FounderNotificationsPage(
    items: const <FounderNotification>[
      FounderNotification(
        id: 7,
        title: 'Project update',
        body: 'An investor joined the conversation.',
        type: 'conversation',
        isRead: false,
        actionUrl: null,
        createdAt: null,
      ),
    ],
    totalCount: 1,
    unreadCount: 1,
  );

  @override
  Future<void> markRead(List<int> ids) async {}

  @override
  Future<void> delete(int id) async => deletedIds.add(id);
}
