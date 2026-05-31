import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_founder/l10n/app_localizations.dart';
import 'package:flutter_founder/screens/engagement_screen.dart';

void main() {
  testWidgets('Engagement screen shows header and actions',
      (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en')],
      home: EngagementScreen(),
    ));

    // Wait for localization & async UI to settle
    await tester.pumpAndSettle();

    // New Chat button present
    expect(find.text('New Chat'), findsOneWidget);

    // At least one tile exists
    await tester.pumpAndSettle();
    expect(find.byIcon(Icons.message), findsWidgets);
    expect(find.byIcon(Icons.person_outline), findsWidgets);
  });
}
