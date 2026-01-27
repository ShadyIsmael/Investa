import 'package:flutter/material.dart';

/// Professional Investment Color Palette
class InvestmentColors {
  // Dark Theme Colors
  static const Color darkBg = Color(0xFF0F172A); // Deep midnight
  static const Color darkCard = Color(0xFF1E293B); // Slate
  static const Color darkSurface = Color(0xFF111827); // Lighter slate
  static const Color darkText = Color(0xFFE2E8F0); // Almost white
  static const Color darkTextSecondary = Color(0xFF94A3B8); // Light gray

  // Light Theme Colors
  static const Color lightBg = Color(0xFFF8FAFC); // Off white
  static const Color lightCard = Color(0xFFFFFFFF); // Pure white
  static const Color lightSurface = Color(0xFFF1F5F9); // Light gray
  static const Color lightText = Color(0xFF0F172A); // Deep dark
  static const Color lightTextSecondary = Color(0xFF64748B); // Slate gray

  // Professional Investment Accents
  static const Color primary = Color(0xFF0EA5E9); // Sky blue
  static const Color primaryDark = Color(0xFF0284C7); // Darker sky
  static const Color secondary = Color(0xFF8B5CF6); // Purple
  static const Color accent = Color(0xFF06B6D4); // Cyan

  // Status Colors
  static const Color success = Color(0xFF10B981); // Green
  static const Color successLight = Color(0xFFD1FAE5); // Light green
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color warningLight = Color(0xFFFEF3C7); // Light amber
  static const Color error = Color(0xFFEF4444); // Red
  static const Color errorLight = Color(0xFFFEE2E2); // Light red
  static const Color info = Color(0xFF3B82F6); // Blue

  // Gradient Accents
  static const Color gradientStart = Color(0xFF0EA5E9);
  static const Color gradientEnd = Color(0xFF8B5CF6);

  // Neutral
  static const Color divider = Color(0xFFE2E8F0);
  static const Color disabledBg = Color(0xFFF1F5F9);
  static const Color transparent = Color(0x00000000);
}

/// Theme Configuration for Light Mode
class LightTheme {
  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: InvestmentColors.lightBg,
        colorScheme: const ColorScheme.light(
          primary: InvestmentColors.primary,
          secondary: InvestmentColors.secondary,
          surface: InvestmentColors.lightCard,
          error: InvestmentColors.error,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: InvestmentColors.lightText,
          outline: InvestmentColors.divider,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: InvestmentColors.lightCard,
          foregroundColor: InvestmentColors.lightText,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: InvestmentColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardTheme: CardTheme(
          color: InvestmentColors.lightCard,
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: InvestmentColors.divider),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: InvestmentColors.lightSurface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: InvestmentColors.divider),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: InvestmentColors.divider),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide:
                const BorderSide(color: InvestmentColors.primary, width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          hintStyle:
              const TextStyle(color: InvestmentColors.lightTextSecondary),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            color: InvestmentColors.lightText,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
          displayMedium: TextStyle(
            color: InvestmentColors.lightText,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
          titleLarge: TextStyle(
            color: InvestmentColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          titleMedium: TextStyle(
            color: InvestmentColors.lightText,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          bodyLarge: TextStyle(
            color: InvestmentColors.lightText,
            fontSize: 16,
          ),
          bodyMedium: TextStyle(
            color: InvestmentColors.lightTextSecondary,
            fontSize: 14,
          ),
          bodySmall: TextStyle(
            color: InvestmentColors.lightTextSecondary,
            fontSize: 12,
          ),
        ),
      );
}

/// Theme Configuration for Dark Mode
class DarkTheme {
  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: InvestmentColors.darkBg,
        colorScheme: const ColorScheme.dark(
          primary: InvestmentColors.primary,
          secondary: InvestmentColors.secondary,
          surface: InvestmentColors.darkCard,
          error: InvestmentColors.error,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: InvestmentColors.darkText,
          outline: Color(0xFF334155),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: InvestmentColors.darkCard,
          foregroundColor: InvestmentColors.darkText,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: InvestmentColors.darkText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardTheme: CardTheme(
          color: InvestmentColors.darkCard,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFF334155)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: InvestmentColors.darkSurface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF334155)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF334155)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide:
                const BorderSide(color: InvestmentColors.primary, width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          hintStyle: const TextStyle(color: InvestmentColors.darkTextSecondary),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            color: InvestmentColors.darkText,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
          displayMedium: TextStyle(
            color: InvestmentColors.darkText,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
          titleLarge: TextStyle(
            color: InvestmentColors.darkText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          titleMedium: TextStyle(
            color: InvestmentColors.darkText,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          bodyLarge: TextStyle(
            color: InvestmentColors.darkText,
            fontSize: 16,
          ),
          bodyMedium: TextStyle(
            color: InvestmentColors.darkTextSecondary,
            fontSize: 14,
          ),
          bodySmall: TextStyle(
            color: InvestmentColors.darkTextSecondary,
            fontSize: 12,
          ),
        ),
      );
}
