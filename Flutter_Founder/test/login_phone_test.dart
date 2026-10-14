import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FOPX phone contract', () {
    test('defaults to the backend-approved Egypt country', () {
      expect(FopxCountryCatalog.egypt.callingCode, '+20');
      expect(FopxCountryCatalog.egypt.isoAlpha2, 'EG');
    });

    test('normalizes the Egyptian local number to the backend value', () {
      final result = FopxPhoneNormalizer.normalize(
        rawValue: '010 2232 2291',
        selectedCountry: FopxCountryCatalog.egypt,
      );

      expect(result.isValid, isTrue);
      expect(result.value, '+201022322291');
    });

    test('builds the LoginDto with only the canonical phone identity', () {
      expect(
        SessionController.loginPayload(
          phoneNumber: ' +201022322291 ',
          password: 'secret',
        ),
        <String, String>{'phoneNumber': '+201022322291', 'password': 'secret'},
      );
    });

    test(
      'normalizes a full international paste without duplicating the code',
      () {
        final result = FopxPhoneNormalizer.normalize(
          rawValue: '+201022322291',
          selectedCountry: FopxCountryCatalog.egypt,
        );
        final duplicate = FopxPhoneNormalizer.normalize(
          rawValue: '+20+201022322291',
          selectedCountry: FopxCountryCatalog.egypt,
        );

        expect(result.value, '+201022322291');
        expect(duplicate.value, '+201022322291');
      },
    );

    test('detects a supported country from an international paste', () {
      final result = FopxPhoneNormalizer.normalize(
        rawValue: '+966501234567',
        selectedCountry: FopxCountryCatalog.egypt,
      );

      expect(result.value, '+966501234567');
      expect(result.country?.isoAlpha2, 'SA');
    });

    test('rejects empty, malformed, and unsupported values', () {
      expect(
        FopxPhoneNormalizer.normalize(
          rawValue: '',
          selectedCountry: FopxCountryCatalog.egypt,
        ).issue,
        FopxPhoneIssue.empty,
      );
      expect(
        FopxPhoneNormalizer.normalize(
          rawValue: '123',
          selectedCountry: FopxCountryCatalog.egypt,
        ).issue,
        FopxPhoneIssue.malformed,
      );
      expect(
        FopxPhoneNormalizer.normalize(
          rawValue: '+999123456789',
          selectedCountry: FopxCountryCatalog.egypt,
        ).issue,
        FopxPhoneIssue.unsupportedCountry,
      );
    });
  });

  testWidgets('renders EN phone control and changes country', (tester) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      _PhoneHarness(locale: const Locale('en'), controller: controller),
    );

    expect(find.text('+20'), findsOneWidget);
    expect(
      find.bySemanticsLabel(RegExp('Country and calling code')),
      findsOneWidget,
    );

    await tester.tap(find.byType(FopxCountryCodeSelector));
    await tester.pumpAndSettle();
    expect(find.text('Saudi Arabia'), findsOneWidget);
    await tester.tap(find.text('Saudi Arabia'));
    await tester.pumpAndSettle();

    expect(find.text('+966'), findsOneWidget);
  });

  testWidgets('renders AR/RTL phone control with LTR phone digits', (
    tester,
  ) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      _PhoneHarness(locale: const Locale('ar'), controller: controller),
    );

    expect(find.text('رقم الهاتف'), findsOneWidget);
    expect(find.text('+20'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.byType(FopxPhoneField))),
      TextDirection.rtl,
    );
  });
}

class _PhoneHarness extends StatefulWidget {
  const _PhoneHarness({required this.locale, required this.controller});

  final Locale locale;
  final TextEditingController controller;

  @override
  State<_PhoneHarness> createState() => _PhoneHarnessState();
}

class _PhoneHarnessState extends State<_PhoneHarness> {
  FopxCountry _selected = FopxCountryCatalog.egypt;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      locale: widget.locale,
      theme: FopxTheme.founderLight(),
      home: Directionality(
        textDirection:
            widget.locale.languageCode == 'ar'
                ? TextDirection.rtl
                : TextDirection.ltr,
        child: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(24),
            child: FopxPhoneField(
              label:
                  widget.locale.languageCode == 'ar'
                      ? 'رقم الهاتف'
                      : 'Phone number',
              hintText: '010 2232 2291',
              countrySemanticLabel:
                  widget.locale.languageCode == 'ar'
                      ? 'الدولة ومفتاح الاتصال'
                      : 'Country and calling code',
              searchCountriesLabel:
                  widget.locale.languageCode == 'ar'
                      ? 'ابحث عن دولة'
                      : 'Search countries',
              countries: FopxCountryCatalog.fallback,
              selectedCountry: _selected,
              onCountryChanged:
                  (country) => setState(() => _selected = country),
              controller: widget.controller,
            ),
          ),
        ),
      ),
    );
  }
}
