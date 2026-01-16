import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_dark_app/screens/requests_screen.dart';

void main() {
  testWidgets('Requests screen shows integer amount and action buttons',
      (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: RequestsScreen()));

    // Wait for async fetch in RequestsService (mocked delay)
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pumpAndSettle();

    // There should be an integer amount shown (from the seeded RequestsService)
    expect(find.text('1200'), findsWidgets);

    // Action buttons should exist for pending income requests
    expect(find.text('Accept'), findsWidgets);
    expect(find.text('Decline'), findsWidgets);

    // Score label/value should be visible (e.g. Score 88)
    expect(find.textContaining('Score'), findsWidgets);
    expect(find.textContaining('88'), findsWidgets);

    // View Profile button present
    expect(find.text('View Profile'), findsWidgets);
  });
}
