import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fopx_founder/features/profile/data/founder_profile.dart';
import 'package:fopx_founder/features/profile/data/profile_controller.dart';
import 'package:fopx_founder/features/profile/presentation/profile_page.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() => SharedPreferences.setMockInitialValues(<String, Object>{}));

  testWidgets('password change stays disabled until phone is verified', (
    tester,
  ) async {
    final repository = _ProfileRepository(phoneVerified: false);
    await tester.pumpWidget(_profileApp(repository));
    await tester.pumpAndSettle();

    final tile = find.ancestor(
      of: find.text('Change password'),
      matching: find.byType(ListTile),
    );
    await tester.ensureVisible(tile);
    await tester.pumpAndSettle();

    expect(tester.widget<ListTile>(tile).enabled, isFalse);
    expect(
      find.text('Verify your phone number before changing your password.'),
      findsOneWidget,
    );
    await tester.tap(tile, warnIfMissed: false);
    await tester.pumpAndSettle();
    expect(find.text('Current password'), findsNothing);
    expect(repository.sentPasswords, isEmpty);
  });

  testWidgets('password change requires matching passwords after OTP', (
    tester,
  ) async {
    final repository = _ProfileRepository(phoneVerified: true);
    await tester.pumpWidget(_profileApp(repository));
    await tester.pumpAndSettle();

    final tile = find.ancestor(
      of: find.text('Change password'),
      matching: find.byType(ListTile),
    );
    await tester.ensureVisible(tile);
    await tester.pumpAndSettle();
    await tester.tap(tile);
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'old-secret');
    await tester.tap(
      find.widgetWithText(FilledButton, 'Send verification code'),
    );
    await tester.pumpAndSettle();

    expect(repository.sentPasswords, <String>['old-secret']);
    expect(
      find.text('A six-digit code was sent to your verified phone.'),
      findsOneWidget,
    );

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), '123456');
    await tester.enterText(fields.at(1), 'new-secret');
    await tester.enterText(fields.at(2), 'different-secret');
    await tester.tap(find.widgetWithText(FilledButton, 'Change password'));
    await tester.pumpAndSettle();

    expect(find.text('The new passwords do not match.'), findsOneWidget);
    expect(repository.confirmations, isEmpty);

    await tester.enterText(fields.at(2), 'new-secret');
    await tester.tap(find.widgetWithText(FilledButton, 'Change password'));
    await tester.pumpAndSettle();

    expect(repository.confirmations, <({String code, String password})>[
      (code: '123456', password: 'new-secret'),
    ]);
    expect(find.text('Your password was changed.'), findsOneWidget);
    expect(find.text('Verification code'), findsNothing);
  });
}

Widget _profileApp(_ProfileRepository repository) => ProviderScope(
  overrides: [founderProfileRepositoryProvider.overrideWithValue(repository)],
  child: MaterialApp(
    theme: FopxTheme.founderLight(),
    localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
      FopxLocalizationsDelegate(),
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
    home: const ProfilePage(),
  ),
);

class _ProfileRepository implements FounderProfileRepository {
  _ProfileRepository({required this.phoneVerified});

  final bool phoneVerified;
  final sentPasswords = <String>[];
  final confirmations = <({String code, String password})>[];

  @override
  Future<FounderProfile> fetchProfile() async =>
      FounderProfile.fromJson(<String, dynamic>{
        'profileCompletionPercentage': 75,
        'basicInfo': <String, dynamic>{
          'fullName': 'Founder One',
          'firstName': 'Founder',
          'lastName': 'One',
          'companyName': 'Northstar Foods',
        },
        'contactInfo': <String, dynamic>{'email': 'founder@example.test'},
      });

  @override
  Future<FounderTrustScore> fetchTrustScore() async =>
      FounderTrustScore.fromJson(<String, dynamic>{
        'trustLevel': 1,
        'trustLevelLabel': 'Starter',
        'isPhoneVerified': phoneVerified,
      });

  @override
  Future<void> updateBasicProfile({
    required String firstName,
    required String lastName,
    required String mobile,
  }) async {}

  @override
  Future<void> sendPasswordChangeCode(String currentPassword) async {
    sentPasswords.add(currentPassword);
  }

  @override
  Future<void> confirmPasswordChange({
    required String code,
    required String newPassword,
  }) async {
    confirmations.add((code: code, password: newPassword));
  }
}
