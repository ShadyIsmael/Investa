import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_founder/screens/edit_profile_screen.dart';
import 'package:flutter_founder/services/profile_service.dart';
import 'package:flutter_founder/l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

class FakeProfileService extends ProfileService {
  bool called = false;
  Map<String, dynamic>? lastPayload;
  final bool succeed;

  FakeProfileService({this.succeed = true});

  @override
  Future<Profile?> updateProfile(Map<String, dynamic> payload) async {
    called = true;
    lastPayload = payload;
    await Future.delayed(Duration(milliseconds: 10));
    if (succeed) {
      return Profile(
          basicInfo:
              BasicInfo(fullName: payload['basicInfo']?['fullName'] ?? ''));
    }
    return null;
  }
}

void main() {
  testWidgets('save calls ProfileService and pops on success',
      (WidgetTester tester) async {
    final fake = FakeProfileService(succeed: true);

    await tester.pumpWidget(MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en')],
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              final res = await Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => EditProfileScreen(
                      service: fake,
                      profile:
                          Profile(basicInfo: BasicInfo(fullName: 'Tester')))));
              // store to a place test can read by showing it in ScaffoldMessenger
              if (res != null && res is Map && res['saved'] == true) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(const SnackBar(content: Text('SAVED')));
              }
            },
            child: const Text('Open'),
          ),
        ),
      ),
    ));

    await tester.pumpAndSettle();

    // Open the screen
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    // Tap save via Key
    final saveBtn = find.byKey(const Key('edit_profile_save_button'));
    expect(saveBtn, findsOneWidget);
    await tester.tap(saveBtn);
    await tester.pumpAndSettle();

    // ProfileService was called
    expect(fake.called, isTrue);

    // The route popped and our SnackBar was shown
    expect(find.text('SAVED'), findsOneWidget);
  });

  testWidgets('save shows failure SnackBar when updateProfile fails',
      (WidgetTester tester) async {
    final fake = FakeProfileService(succeed: false);

    await tester.pumpWidget(MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en')],
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              await Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => EditProfileScreen(
                      service: fake,
                      profile:
                          Profile(basicInfo: BasicInfo(fullName: 'Tester')))));
            },
            child: const Text('Open'),
          ),
        ),
      ),
    ));

    await tester.pumpAndSettle();

    // Open the screen
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    // Tap save via AppBar TextButton (descendant finder)
    final saveBtn = find.descendant(
        of: find.byType(AppBar), matching: find.byType(TextButton));
    expect(saveBtn, findsWidgets);
    await tester.tap(saveBtn.first);
    await tester.pumpAndSettle();

    // Failure SnackBar appears with localized message
    expect(
        find.text('Failed to save profile. Please try again.'), findsOneWidget);
  });

  testWidgets('save proceeds even when required fields missing',
      (WidgetTester tester) async {
    final fake = FakeProfileService(succeed: true);

    // Provide a profile with empty fullName to check save proceeds
    await tester.pumpWidget(MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en')],
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              await Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => EditProfileScreen(
                      service: fake,
                      profile: Profile(basicInfo: BasicInfo(fullName: '')))));
            },
            child: const Text('Open'),
          ),
        ),
      ),
    ));

    await tester.pumpAndSettle();

    // Open the screen
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    // Tap save via AppBar TextButton (descendant finder)
    final saveBtn = find.descendant(
        of: find.byType(AppBar), matching: find.byType(TextButton));
    expect(saveBtn, findsWidgets);
    await tester.tap(saveBtn.first);
    await tester.pumpAndSettle();

    // Service should have been called
    expect(fake.called, isTrue);

    // Ensure no validation SnackBar is present
    expect(find.text('Please review the form and fill required fields.'),
        findsNothing);

    // Ensure no validation SnackBar is present
    expect(find.text('Please review the form and fill required fields.'),
        findsNothing);
  });

  testWidgets('save allows when first or last name provided',
      (WidgetTester tester) async {
    final fake = FakeProfileService(succeed: true);

    // Provide a profile with firstName set and empty display name
    await tester.pumpWidget(MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en')],
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              await Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => EditProfileScreen(
                      service: fake,
                      profile: Profile(
                          basicInfo:
                              BasicInfo(firstName: 'John', fullName: '')))));
            },
            child: const Text('Open'),
          ),
        ),
      ),
    ));

    await tester.pumpAndSettle();

    // Open the screen
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
    // Tap save via AppBar TextButton (descendant finder)
    final saveBtn = find.descendant(
        of: find.byType(AppBar), matching: find.byType(TextButton));
    expect(saveBtn, findsWidgets);
    await tester.tap(saveBtn.first);
    await tester.pumpAndSettle();

    // Service should have been called
    expect(fake.called, isTrue);
  });
}
