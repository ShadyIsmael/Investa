import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_founder/features/notifications/data/notifications_controller.dart';

void main() {
  test('maps supported backend actions to app-owned routes', () {
    expect(
      founderNotificationRoute(
        'https://notifications.example.test/projects/12/opportunities/9/requests?tab=pending',
      ),
      '/projects/12/opportunities/9/requests?tab=pending',
    );
    expect(founderNotificationRoute('/api/v1/deals/35'), '/deals/35');
    expect(
      founderNotificationRoute('/chat/d3949910-5625-45e3-9380-80c1a369d971'),
      '/chat/d3949910-5625-45e3-9380-80c1a369d971',
    );
  });

  test('does not route external pages or unknown backend actions', () {
    expect(founderNotificationRoute('https://evil.test/login'), isNull);
    expect(founderNotificationRoute('/api/v1/admin/users'), isNull);
    expect(founderNotificationRoute(null), isNull);
  });

  test('typed notification events target safe Founder surfaces', () {
    expect(
      founderNotificationRouteForEvent(
        eventType: 'FundingDeclarationDisputed',
        actionUrl: '/admin/opportunities/45/room',
      ),
      '/deals',
    );
    expect(
      founderNotificationRouteForEvent(
        eventType: 'ConversationRequestCreated',
        actionUrl: '/admin/requests',
      ),
      '/chat',
    );
    expect(
      founderNotificationRouteForEvent(
        eventType: 'ConversationRequestApproved',
        actionUrl:
            '/admin/chat?conversationId=d3949910-5625-45e3-9380-80c1a369d971',
      ),
      '/chat/d3949910-5625-45e3-9380-80c1a369d971',
    );
    expect(
      founderNotificationRouteForEvent(
        eventType: 'NewConversationMessage',
        actionUrl:
            '/admin/chat?conversationId=d3949910-5625-45e3-9380-80c1a369d971',
      ),
      '/chat/d3949910-5625-45e3-9380-80c1a369d971',
    );
    expect(
      founderNotificationRouteForEvent(
        eventType: 'UnregisteredEvent',
        actionUrl: '/admin/opportunities/45/room',
      ),
      isNull,
    );
  });
}
