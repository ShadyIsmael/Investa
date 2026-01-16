import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_dark_app/screens/engagement_screen.dart';

void main() {
  testWidgets('Engagement screen shows header and actions',
      (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: EngagementScreen()));

    // New Chat button present
    expect(find.text('New Chat'), findsOneWidget);

    // At least one tile exists
    await tester.pumpAndSettle();
    expect(find.byIcon(Icons.message), findsWidgets);
    expect(find.byIcon(Icons.person_outline), findsWidgets);
  });
}
