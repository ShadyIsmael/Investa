import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

void main() {
  test('preserves the backend error contract and field validation', () {
    final error = ApiError.fromPayload(
      <String, dynamic>{
        'success': false,
        'code': 'ValidationFailed',
        'message': 'Please review the form.',
        'errors': <String, dynamic>{'email': <String>['Email is invalid.']},
      },
      statusCode: 422,
    );

    expect(error.success, isFalse);
    expect(error.code, 'ValidationFailed');
    expect(error.message, 'Please review the form.');
    expect(error.statusCode, 422);
    expect(error.errors.single.field, 'email');
    expect(error.errors.single.message, 'Email is invalid.');
  });

  test('currency formatting preserves currency identity', () {
    expect(FopxFormatters.currency(1250, 'USD'), contains('USD'));
    expect(FopxFormatters.currency(1250, 'EGP'), contains('EGP'));
    expect(FopxFormatters.formatCurrency(null, currencyCode: 'USD'), 'Unavailable');
    expect(FopxFormatters.formatCurrency(1250, currencyCode: 'USD', approximate: true), startsWith('~'));
  });

  test('theme exposes explicit type and semantic state tokens', () {
    final light = FopxTheme.founderLight();
    final dark = FopxTheme.founderDark();

    expect(light.brightness, Brightness.light);
    expect(dark.brightness, Brightness.dark);
    expect(light.textTheme.displaySmall?.fontFamily, FopxTypography.englishFamily);
    expect(light.textTheme.displaySmall?.fontFamilyFallback, contains(FopxTypography.arabicFamily));
    expect(light.extension<FopxSemanticColors>(), isNotNull);
    expect(light.extension<FopxFinancialTextStyles>(), isNotNull);
    expect(light.extension<FopxChartColors>()?.primarySeries, const Color(0xFF6D4AFF));
    expect(dark.extension<FopxChartColors>()?.tooltip, const Color(0xFF25202C));
    expect(FopxTypography.financialValue(FopxPersonaTokens.founder).fontFeatures, isNotEmpty);
  });

  test('notification badge uses an explicit overflow state', () {
    expect(FopxNotificationBell.badgeLabel(1), '1');
    expect(FopxNotificationBell.badgeLabel(9), '9');
    expect(FopxNotificationBell.badgeLabel(10), '10+');
  });

  testWidgets('localization supports Arabic as an RTL locale', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        locale: Locale('ar'),
        supportedLocales: <Locale>[Locale('en'), Locale('ar')],
        localizationsDelegates: <LocalizationsDelegate<dynamic>>[
          FopxLocalizationsDelegate(),
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: const Directionality(textDirection: TextDirection.rtl, child: Text('rtl')),
      ),
    );
    await tester.pumpAndSettle();

    expect(const FopxLocalizations(Locale('ar')).projects, 'المشاريع');
    expect(find.text('rtl'), findsOneWidget);
  });

  testWidgets('notification bell renders an accessible unread badge', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: FopxNotificationBell(onPressed: () {}, unreadCount: 2),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('2'), findsOneWidget);
    expect(find.bySemanticsLabel('Notifications, 2 unread'), findsOneWidget);
  });

  testWidgets('loading state honors reduced motion', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: FopxTheme.founderLight(),
        home: const MediaQuery(
          data: MediaQueryData(disableAnimations: true),
          child: FopxLoadingState(height: 80),
        ),
      ),
    );

    await tester.pump();
    expect(find.byType(FopxLoadingState), findsOneWidget);
    expect(tester.binding.hasScheduledFrame, isFalse);
  });

  testWidgets('primary control remains usable at compact width', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: FopxTheme.founderLight(),
        home: const MediaQuery(
          data: MediaQueryData(size: Size(320, 700)),
          child: Padding(
            padding: EdgeInsets.all(FopxSpacing.compactPageGutter),
            child: FopxButton(label: 'Continue', onPressed: null, expanded: true),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(tester.getSize(find.byType(FopxButton)).height, greaterThanOrEqualTo(48));
  });
}
