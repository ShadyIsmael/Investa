import 'package:intl/intl.dart';

/// Shared display formatter for fiat amounts across the Investa mobile clients.
///
/// Mirrors the backend Currency Master + [CurrencyDisplayService] formatting
/// semantics: amounts are rounded to the currency's decimal digits, grouped,
/// prefixed with the currency symbol (NBSP), and rendered with Arabic-Indic
/// digits when the active language is Arabic. The symbol map below is the
/// mobile snapshot of the Currency Master seed and MUST stay in sync with the
/// database. Unknown/fallback codes use the platform default `EGP`.
class CurrencyDisplay {
  /// Platform default ISO 4217 currency code (see `CurrencyMasterDefaults`).
  static const String defaultIsoCode = 'EGP';

  static const Map<String, String> _symbols = {
    'AED': 'د.إ',
    'EGP': 'ج.م',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'KWD': 'د.ك',
    'SAR': 'ر.س',
    'USD': '\$',
  };

  static const Map<String, int> _digits = {
    'JPY': 0,
    'KWD': 3,
  };

  static const Map<String, String> _namesAr = {
    'AED': 'درهم إماراتي',
    'EGP': 'جنيه مصري',
    'EUR': 'يورو',
    'GBP': 'جنيه إسترليني',
    'JPY': 'ين ياباني',
    'KWD': 'دينار كويتي',
    'SAR': 'ريال سعودي',
    'USD': 'دولار أمريكي',
  };

  static const Map<String, String> _namesEn = {
    'AED': 'UAE Dirham',
    'EGP': 'Egyptian Pound',
    'EUR': 'Euro',
    'GBP': 'Pound Sterling',
    'JPY': 'Japanese Yen',
    'KWD': 'Kuwaiti Dinar',
    'SAR': 'Saudi Riyal',
    'USD': 'US Dollar',
  };

  static String _language = 'en';

  /// Current display language used to select decimals/locale; set at startup.
  static String get language => _language;

  /// `en`/`ar` from an arbitrary locale string (e.g. `ar-EG`, `en_US`).
  static String normalizeLanguage(String? language) {
    final v = (language ?? 'en').trim().toLowerCase();
    return v.startsWith('ar') ? 'ar' : 'en';
  }

  static void setLanguage(String language) =>
      _language = normalizeLanguage(language);

  /// True when [isoCode] trims/normalizes to a known master 3-letter code.
  static bool isKnownCode(String? isoCode) =>
      _symbols.containsKey(_normalize(isoCode));

  /// Normalized 3-letter code, falling back to [defaultIsoCode].
  static String normalize(String? isoCode) {
    final c = isoCode?.trim().toUpperCase() ?? '';
    return (c.length == 3 && _symbols.containsKey(c)) ? c : defaultIsoCode;
  }

  /// Symbol for a code, or empty when unknown (caller should show the code).
  static String symbol(String isoCode) =>
      _symbols[isoCode.toUpperCase()] ?? '';

  /// Decimal digits for the currency, defaulting to 2.
  static int decimalDigits(String isoCode) =>
      _digits[isoCode.toUpperCase()] ?? 2;

  /// Localized currency name, falling back to the code itself.
  static String currencyName(String isoCode, {String? language}) {
    final code = normalize(isoCode);
    final map = normalizeLanguage(language ?? _language) == 'ar'
        ? _namesAr
        : _namesEn;
    return map[code] ?? code;
  }

  static int _digitsSafe(int digits) => digits.clamp(0, 6);

  /// Rounds away from zero to [digits] (matches backend AwayFromZero).
  static double _round(num value, int digits) {
    final factor = digits == 0 ? 1 : double.parse('1e$digits');
    return (value * factor).round() / factor;
  }

  /// Full localized, grouped, symbol-prefixed fiat amount.
  ///
  /// `null`/unknown code falls back to [defaultIsoCode]. Override [digits]
  /// (e.g. `0` for dashboard tiles) or [showSymbol] as needed. When the code is
  /// unknown and no valid symbol exists, renders `{number} {CODE}`.
  static String formatMoney(
    double? amount, {
    String? code,
    int? digits,
    bool showSymbol = true,
    String? language,
  }) {
    final iso = normalize(code);
    final d = _digitsSafe(digits ?? decimalDigits(iso));
    final rounded = _round(amount ?? 0, d);
    final NumberFormat nf = NumberFormat(_pattern(d), _locale(language));
    final number = nf.format(rounded);
    final sym = showSymbol ? symbol(iso) : '';
    if (sym.isEmpty) return '$number $iso';
    return '$sym\u00a0$number';
  }

  /// Compact fiat amount for list tiles (`1.2M`, `45K`), symbol-prefixed.
  static String formatCompact(
    double? amount, {
    String code = defaultIsoCode,
    String? language,
  }) {
    final v = amount ?? 0;
    final abs = v.abs();
    final iso = normalize(code);
    String number;
    if (abs >= 1000000) {
      number = '${(v / 1000000).toStringAsFixed(1)}M';
    } else if (abs >= 1000) {
      number = '${(v / 1000).toStringAsFixed(1)}K';
    } else {
      number = v.toStringAsFixed(0);
    }
    final sym = symbol(iso);
    return sym.isEmpty ? '$number $iso' : '$sym\u00a0$number';
  }

  static String _pattern(int digits) =>
      digits == 0 ? '#,##0' : '#,##0.${List.filled(digits, '0').join()}';

  static String _locale(String? language) =>
      normalizeLanguage(language ?? _language) == 'ar' ? 'ar' : 'en';
}