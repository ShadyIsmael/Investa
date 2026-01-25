import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppLocalizations {
  final Locale locale;
  late Map<String, String> _localizedStrings;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  Future<bool> load() async {
    final jsonString =
        await rootBundle.loadString('assets/lang/${locale.languageCode}.json');
    final Map<String, dynamic> jsonMap = json.decode(jsonString);
    _localizedStrings =
        jsonMap.map((key, value) => MapEntry(key, value.toString()));
    return true;
  }

  String t(String key) {
    return _localizedStrings[key] ?? key;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'ar'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    final localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(covariant LocalizationsDelegate<AppLocalizations> old) =>
      false;
}

/// Locale Provider for managing app language
class LocaleProvider extends ChangeNotifier {
  static const String _localePrefKey = 'appLocale';
  static const Locale _defaultLocale = Locale('en');

  Locale _currentLocale = _defaultLocale;
  late SharedPreferences _prefs;
  bool _isInitialized = false;

  Locale get currentLocale => _currentLocale;
  String get currentLanguageCode => _currentLocale.languageCode;
  bool get isInitialized => _isInitialized;

  bool get isArabic => _currentLocale.languageCode == 'ar';
  bool get isEnglish => _currentLocale.languageCode == 'en';

  /// Initialize the provider
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    await _loadLocalePreference();
    _isInitialized = true;
    notifyListeners();
  }

  /// Load saved locale preference
  Future<void> _loadLocalePreference() async {
    final savedLocale = _prefs.getString(_localePrefKey) ?? 'en';
    _currentLocale = Locale(savedLocale);
  }

  /// Change the app language
  Future<void> setLocale(Locale locale) async {
    if (_currentLocale != locale) {
      _currentLocale = locale;
      await _prefs.setString(_localePrefKey, locale.languageCode);
      notifyListeners();
    }
  }

  /// Switch between English and Arabic
  Future<void> toggleLanguage() async {
    final newLocale = isEnglish ? const Locale('ar') : const Locale('en');
    await setLocale(newLocale);
  }

  /// Get text direction
  TextDirection get textDirection =>
      isArabic ? TextDirection.rtl : TextDirection.ltr;
  AlignmentGeometry get alignmentStart =>
      isArabic ? Alignment.centerRight : Alignment.centerLeft;
}

// Extension for quick access to localization
extension LocalizationExtension on BuildContext {
  LocaleProvider get localeProvider => read<LocaleProvider>();

  bool get isArabic => read<LocaleProvider>().isArabic;
  bool get isEnglish => read<LocaleProvider>().isEnglish;

  TextDirection get textDirection => read<LocaleProvider>().textDirection;
  AlignmentGeometry get alignmentStart => read<LocaleProvider>().alignmentStart;
}
