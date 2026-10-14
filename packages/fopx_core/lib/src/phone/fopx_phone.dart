import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/fopx_api_client.dart';
import '../auth/session_controller.dart';

/// Backend country-master data used by shared phone controls.
///
/// The API is authoritative at runtime. The seeded list is a deliberately
/// small offline snapshot so login remains usable while the public countries
/// endpoint is unavailable. It mirrors the current FOPX country seed.
class FopxCountry {
  const FopxCountry({
    required this.identifier,
    required this.isoAlpha2,
    required this.nameEn,
    required this.nameAr,
    required this.callingCode,
    required this.flag,
    this.sortOrder = 0,
  });

  final String identifier;
  final String isoAlpha2;
  final String nameEn;
  final String nameAr;
  final String callingCode;
  final String flag;
  final int sortOrder;

  String nameFor(Locale locale) =>
      locale.languageCode == 'ar' ? nameAr : nameEn;

  factory FopxCountry.fromJson(Map<String, dynamic> json) {
    final callingCode = (json['phoneCode'] ?? json['callingCode'] ?? '')
        .toString()
        .trim();
    final isoAlpha2 = (json['isoAlpha2'] ?? json['countryCode'] ?? '')
        .toString()
        .trim()
        .toUpperCase();
    final nameEn = (json['nameEn'] ?? json['name'] ?? '').toString().trim();
    final nameAr = (json['nameAr'] ?? nameEn).toString().trim();
    if (isoAlpha2.length != 2 ||
        nameEn.isEmpty ||
        !RegExp(r'^\+\d{1,15}$').hasMatch(callingCode)) {
      throw const FormatException('Invalid country master item.');
    }
    return FopxCountry(
      identifier: (json['code'] ?? isoAlpha2).toString().trim(),
      isoAlpha2: isoAlpha2,
      nameEn: nameEn,
      nameAr: nameAr.isEmpty ? nameEn : nameAr,
      callingCode: callingCode,
      flag: _flagForIso(isoAlpha2),
      sortOrder: json['sortOrder'] is num
          ? (json['sortOrder'] as num).toInt()
          : 0,
    );
  }

  static String _flagForIso(String iso) {
    if (iso.length != 2) return '🌐';
    return String.fromCharCodes(
      iso.codeUnits.map((unit) => 0x1F1E6 + unit - 0x41),
    );
  }
}

class FopxCountryCatalog {
  const FopxCountryCatalog._();

  static const egypt = FopxCountry(
    identifier: 'EGYPT',
    isoAlpha2: 'EG',
    nameEn: 'Egypt',
    nameAr: 'مصر',
    callingCode: '+20',
    flag: '🇪🇬',
    sortOrder: 10,
  );

  static const fallback = <FopxCountry>[
    egypt,
    FopxCountry(
      identifier: 'SAUDIARABIA',
      isoAlpha2: 'SA',
      nameEn: 'Saudi Arabia',
      nameAr: 'المملكة العربية السعودية',
      callingCode: '+966',
      flag: '🇸🇦',
      sortOrder: 20,
    ),
    FopxCountry(
      identifier: 'UNITEDARABEMIRATES',
      isoAlpha2: 'AE',
      nameEn: 'United Arab Emirates',
      nameAr: 'الإمارات العربية المتحدة',
      callingCode: '+971',
      flag: '🇦🇪',
      sortOrder: 30,
    ),
    FopxCountry(
      identifier: 'JORDAN',
      isoAlpha2: 'JO',
      nameEn: 'Jordan',
      nameAr: 'الأردن',
      callingCode: '+962',
      flag: '🇯🇴',
      sortOrder: 40,
    ),
    FopxCountry(
      identifier: 'LEBANON',
      isoAlpha2: 'LB',
      nameEn: 'Lebanon',
      nameAr: 'لبنان',
      callingCode: '+961',
      flag: '🇱🇧',
      sortOrder: 50,
    ),
    FopxCountry(
      identifier: 'UNITEDSTATES',
      isoAlpha2: 'US',
      nameEn: 'United States',
      nameAr: 'الولايات المتحدة',
      callingCode: '+1',
      flag: '🇺🇸',
      sortOrder: 60,
    ),
    FopxCountry(
      identifier: 'UNITEDKINGDOM',
      isoAlpha2: 'GB',
      nameEn: 'United Kingdom',
      nameAr: 'المملكة المتحدة',
      callingCode: '+44',
      flag: '🇬🇧',
      sortOrder: 70,
    ),
    FopxCountry(
      identifier: 'INDIA',
      isoAlpha2: 'IN',
      nameEn: 'India',
      nameAr: 'الهند',
      callingCode: '+91',
      flag: '🇮🇳',
      sortOrder: 80,
    ),
    FopxCountry(
      identifier: 'CANADA',
      isoAlpha2: 'CA',
      nameEn: 'Canada',
      nameAr: 'كندا',
      callingCode: '+1',
      flag: '🇨🇦',
      sortOrder: 90,
    ),
    FopxCountry(
      identifier: 'AUSTRALIA',
      isoAlpha2: 'AU',
      nameEn: 'Australia',
      nameAr: 'أستراليا',
      callingCode: '+61',
      flag: '🇦🇺',
      sortOrder: 100,
    ),
    FopxCountry(
      identifier: 'JAPAN',
      isoAlpha2: 'JP',
      nameEn: 'Japan',
      nameAr: 'اليابان',
      callingCode: '+81',
      flag: '🇯🇵',
      sortOrder: 110,
    ),
    FopxCountry(
      identifier: 'GERMANY',
      isoAlpha2: 'DE',
      nameEn: 'Germany',
      nameAr: 'ألمانيا',
      callingCode: '+49',
      flag: '🇩🇪',
      sortOrder: 120,
    ),
  ];

  static Future<List<FopxCountry>> fetch(FopxApiClient api) async {
    final response = await api.get<dynamic>('/countries');
    final root = response.data is Map
        ? Map<String, dynamic>.from(response.data as Map)
        : null;
    final rawItems = root?['data'];
    if (rawItems is! List) return fallback;
    final countries = <FopxCountry>[];
    for (final item in rawItems.whereType<Map>()) {
      try {
        countries.add(FopxCountry.fromJson(Map<String, dynamic>.from(item)));
      } on FormatException {
        // Ignore malformed administrative data and keep the valid items.
      }
    }
    if (countries.isEmpty) return fallback;
    countries.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
    return List<FopxCountry>.unmodifiable(countries);
  }
}

final fopxCountryCatalogProvider = FutureProvider<List<FopxCountry>>((
  ref,
) async {
  try {
    return await FopxCountryCatalog.fetch(ref.read(apiClientProvider))
        .timeout(const Duration(seconds: 3));
  } catch (_) {
    return FopxCountryCatalog.fallback;
  }
});

enum FopxPhoneIssue { empty, malformed, unsupportedCountry, ambiguousCountry }

class FopxPhoneNormalizationResult {
  const FopxPhoneNormalizationResult.valid({
    required this.value,
    required this.country,
  }) : issue = null;
  const FopxPhoneNormalizationResult.invalid(this.issue)
    : value = null,
      country = null;

  final String? value;
  final FopxCountry? country;
  final FopxPhoneIssue? issue;

  bool get isValid => value != null && country != null;
}

/// Client-side normalization compatible with the backend's canonical
/// E.164-like representation. The backend remains authoritative on submit.
class FopxPhoneNormalizer {
  const FopxPhoneNormalizer._();

  static FopxPhoneNormalizationResult normalize({
    required String rawValue,
    required FopxCountry selectedCountry,
    List<FopxCountry> countries = FopxCountryCatalog.fallback,
  }) {
    if (rawValue.trim().isEmpty)
      return const FopxPhoneNormalizationResult.invalid(FopxPhoneIssue.empty);

    final sanitized = _sanitize(rawValue);
    if (sanitized == null || sanitized.digits.isEmpty) {
      return const FopxPhoneNormalizationResult.invalid(
        FopxPhoneIssue.malformed,
      );
    }

    var digits = sanitized.digits;
    final isInternational =
        sanitized.leadingPlus || sanitized.leadingDoubleZero;
    FopxCountry? country = selectedCountry;
    if (isInternational) {
      country = _matchCountry(digits, selectedCountry, countries);
      if (country == null) {
        final matchedCodes = countries
            .where((item) => digits.startsWith(item.callingCode.substring(1)))
            .map((item) => item.callingCode)
            .toSet();
        return FopxPhoneNormalizationResult.invalid(
          matchedCodes.length == 1
              ? FopxPhoneIssue.ambiguousCountry
              : FopxPhoneIssue.unsupportedCountry,
        );
      }
    } else if (!countries.any(
      (item) => item.isoAlpha2 == selectedCountry.isoAlpha2,
    )) {
      return const FopxPhoneNormalizationResult.invalid(
        FopxPhoneIssue.unsupportedCountry,
      );
    }

    final effectiveCountry = country;
    if (effectiveCountry == null) {
      return const FopxPhoneNormalizationResult.invalid(
        FopxPhoneIssue.unsupportedCountry,
      );
    }
    final countryDigits = effectiveCountry.callingCode.substring(1);
    if (digits.startsWith(countryDigits) &&
        countryDigits.length > 1 &&
        digits.length >= countryDigits.length * 2 + 7 &&
        digits.substring(countryDigits.length).startsWith(countryDigits)) {
      // Handles pasted values such as +20+201022322291 after separators and
      // the equivalent duplicated numeric country-code form.
      digits = countryDigits + digits.substring(countryDigits.length * 2);
    }

    String subscriber;
    if (isInternational ||
        (digits.startsWith(countryDigits) &&
            digits.length >= countryDigits.length + 7)) {
      if (!digits.startsWith(countryDigits)) {
        return const FopxPhoneNormalizationResult.invalid(
          FopxPhoneIssue.unsupportedCountry,
        );
      }
      subscriber = digits.substring(countryDigits.length);
    } else {
      subscriber = digits;
    }

    if (subscriber.startsWith('0') && subscriber.length > 1)
      subscriber = subscriber.substring(1);
    if (subscriber.length < 7 || subscriber.length > 15) {
      return const FopxPhoneNormalizationResult.invalid(
        FopxPhoneIssue.malformed,
      );
    }

    return FopxPhoneNormalizationResult.valid(
      value: '+$countryDigits$subscriber',
      country: effectiveCountry,
    );
  }

  static _Sanitized? _sanitize(String value) {
    final converted = _toAsciiDigits(value.trim());
    final leadingPlus = converted.startsWith('+');
    var leadingDoubleZero = !leadingPlus && converted.startsWith('00');
    final digits = StringBuffer();
    var hasUnexpectedCharacter = false;
    var plusSeen = false;
    for (final rune in converted.runes) {
      final character = String.fromCharCode(rune);
      if (character == '+') {
        if (plusSeen || digits.isNotEmpty) hasUnexpectedCharacter = true;
        plusSeen = true;
      } else if (rune >= 48 && rune <= 57) {
        digits.write(character);
      } else if (' -()./'.contains(character) || character.trim().isEmpty) {
        // Common formatting separators are intentionally ignored.
      } else {
        hasUnexpectedCharacter = true;
      }
    }
    if (hasUnexpectedCharacter) {
      // A duplicated plus is recoverable when it represents a duplicated
      // country prefix; other unexpected characters are not.
      final onlyPlusAndFormatting = converted
          .replaceAll(RegExp(r'[+\d\s().\-/]'), '')
          .isEmpty;
      if (!onlyPlusAndFormatting) return null;
    }
    if (leadingDoubleZero && digits.toString().startsWith('00')) {
      leadingDoubleZero = true;
      return _Sanitized(
        digits: digits.toString().substring(2),
        leadingPlus: false,
        leadingDoubleZero: true,
      );
    }
    return _Sanitized(
      digits: digits.toString(),
      leadingPlus: leadingPlus,
      leadingDoubleZero: leadingDoubleZero,
    );
  }

  static String _toAsciiDigits(String value) {
    final output = StringBuffer();
    for (final rune in value.runes) {
      if (rune >= 0x660 && rune <= 0x669) {
        output.writeCharCode(48 + rune - 0x660);
      } else if (rune >= 0x6F0 && rune <= 0x6F9) {
        output.writeCharCode(48 + rune - 0x6F0);
      } else {
        output.writeCharCode(rune);
      }
    }
    return output.toString();
  }

  static FopxCountry? _matchCountry(
    String digits,
    FopxCountry selectedCountry,
    List<FopxCountry> countries,
  ) {
    final matches = countries
        .where((country) => digits.startsWith(country.callingCode.substring(1)))
        .toList();
    if (matches.isEmpty) return null;
    matches.sort(
      (a, b) => b.callingCode.length.compareTo(a.callingCode.length),
    );
    final longestCode = matches.first.callingCode;
    final sameCode = matches
        .where((item) => item.callingCode == longestCode)
        .toList();
    if (sameCode.length > 1) {
      for (final item in sameCode) {
        if (item.isoAlpha2 == selectedCountry.isoAlpha2) return item;
      }
      return null;
    }
    return matches.first;
  }
}

class _Sanitized {
  const _Sanitized({
    required this.digits,
    required this.leadingPlus,
    required this.leadingDoubleZero,
  });

  final String digits;
  final bool leadingPlus;
  final bool leadingDoubleZero;
}
