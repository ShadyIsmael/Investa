import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_colors.dart';

/// Theme Provider for managing light/dark theme state
class ThemeProvider extends ChangeNotifier {
  static const String _themePrefKey = 'isDarkMode';
  bool _isDarkMode = true; // Default to dark mode

  ThemeProvider({bool isDarkMode = true}) {
    _isDarkMode = isDarkMode;
  }

  bool get isDarkMode => _isDarkMode;

  ThemeData get currentTheme =>
      _isDarkMode ? DarkTheme.theme : LightTheme.theme;

  /// Toggle theme mode
  Future<void> toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    await _saveThemePreference(_isDarkMode);
    notifyListeners();
  }

  /// Set theme mode explicitly
  Future<void> setDarkMode(bool isDark) async {
    if (_isDarkMode != isDark) {
      _isDarkMode = isDark;
      await _saveThemePreference(isDark);
      notifyListeners();
    }
  }

  /// Load theme preference from storage
  Future<void> loadThemePreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isDarkMode = prefs.getBool(_themePrefKey) ?? true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading theme preference: $e');
    }
  }

  /// Save theme preference to storage
  Future<void> _saveThemePreference(bool isDark) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_themePrefKey, isDark);
    } catch (e) {
      debugPrint('Error saving theme preference: $e');
    }
  }
}

/// Extension for easy theme access
extension ThemeContext on BuildContext {
  ThemeProvider get themeProvider => read<ThemeProvider>();

  bool get isDarkMode => read<ThemeProvider>().isDarkMode;

  InvestmentColors get colors => InvestmentColors();
}
