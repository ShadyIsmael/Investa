import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_investor/screens/support_chat_intro_screen.dart';

void main() {
  testWidgets('Support intro shows Live Support button',
      (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: SupportChatIntroScreen()));

    // Verify presence of Live Support button
    expect(find.text('Live Support'), findsOneWidget);
    expect(find.byIcon(Icons.headset_mic), findsOneWidget);
  });
}
